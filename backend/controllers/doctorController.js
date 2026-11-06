import DoctorProfile from '../models/DoctorProfile.js';
import Appointment from '../models/Appointment.js';

// Helper to generate time slots between start and end
const generateSlots = (startTime = '09:00', endTime = '17:00', intervalMinutes = 20) => {
  const slots = [];
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  let current = new Date();
  current.setHours(startHour, startMin, 0, 0);

  const end = new Date();
  end.setHours(endHour, endMin, 0, 0);

  while (current < end) {
    const slotStartStr = current.toTimeString().substring(0, 5);
    const next = new Date(current.getTime() + intervalMinutes * 60000);
    if (next > end) break;
    const slotEndStr = next.toTimeString().substring(0, 5);

    // Skip lunch hour 13:00 - 14:00
    if (slotStartStr < '13:00' || slotStartStr >= '14:00') {
      slots.push(`${slotStartStr} - ${slotEndStr}`);
    }
    current = next;
  }
  return slots;
};

// @desc Get all doctors with filters
// @route GET /api/doctors
export const getDoctors = async (req, res) => {
  try {
    const { specialty, search, maxFee, minRating } = req.query;

    const query = {};

    if (specialty && specialty !== 'All') {
      query.specialty = { $regex: new RegExp(`^${specialty}$`, 'i') };
    }

    if (maxFee) {
      query.consultationFee = { $lte: Number(maxFee) };
    }

    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    let doctors = await DoctorProfile.find(query).populate('user', 'name email avatar phone address');

    // Search query filtering doctor name, clinic name, or specialty
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      doctors = doctors.filter(
        (doc) =>
          (doc.user && searchRegex.test(doc.user.name)) ||
          searchRegex.test(doc.specialty) ||
          searchRegex.test(doc.hospitalClinicName)
      );
    }

    res.json({
      success: true,
      count: doctors.length,
      doctors,
    });
  } catch (error) {
    console.error('getDoctors error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving doctors' });
  }
};

// @desc Get doctor by ID
// @route GET /api/doctors/:id
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await DoctorProfile.findById(req.params.id).populate('user', 'name email avatar phone address');
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    res.json({
      success: true,
      doctor,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving doctor details' });
  }
};

// @desc Get available slots for doctor on a specific date
// @route GET /api/doctors/:id/slots
export const getDoctorSlots = async (req, res) => {
  try {
    const { date } = req.query; // YYYY-MM-DD
    if (!date) {
      return res.status(400).json({ success: false, message: 'Date query parameter is required (YYYY-MM-DD)' });
    }

    const doctor = await DoctorProfile.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Generate base daily slots
    const allSlots = generateSlots(
      doctor.workingHours?.start || '09:00',
      doctor.workingHours?.end || '17:00',
      doctor.slotDurationMinutes || 20
    );

    // Fetch existing active appointments for this doctor on this date
    const bookedAppointments = await Appointment.find({
      doctor: doctor._id,
      appointmentDate: date,
      status: { $ne: 'cancelled' },
    }).select('timeSlot tokenNumber status');

    const bookedSlotMap = new Map();
    bookedAppointments.forEach((apt) => {
      bookedSlotMap.set(apt.timeSlot, apt);
    });

    // Structure slots into morning, afternoon, evening, excluding past slots if date is today
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const slotsWithStatus = allSlots
      .map((slot, index) => {
        const isBooked = bookedSlotMap.has(slot);
        const [h, m] = slot.split(' - ')[0].split(':').map(Number);
        const slotMinutes = h * 60 + m;
        const isPast = date === todayStr && slotMinutes <= currentMinutes;

        const startHour = parseInt(slot.split(':')[0], 10);
        let period = 'morning';
        if (startHour >= 12 && startHour < 16) {
          period = 'afternoon';
        } else if (startHour >= 16) {
          period = 'evening';
        }

        return {
          timeSlot: slot,
          period,
          isBooked,
          isPast,
          tokenEstimate: index + 1,
        };
      })
      .filter((s) => !s.isPast); // Do not show time slots after the time has passed

    const activeBookingsCount = bookedAppointments.length;

    res.json({
      success: true,
      date,
      isToday: date === todayStr,
      totalSlots: slotsWithStatus.length,
      availableCount: slotsWithStatus.filter((s) => !s.isBooked).length,
      activeBookingsCount,
      currentCallingToken: doctor.currentCallingToken || 0,
      slots: slotsWithStatus,
    });
  } catch (error) {
    console.error('getDoctorSlots error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving slots' });
  }
};
