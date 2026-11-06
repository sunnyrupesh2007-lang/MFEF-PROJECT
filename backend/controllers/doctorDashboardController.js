import DoctorProfile from '../models/DoctorProfile.js';
import Appointment from '../models/Appointment.js';

// Helper to get doctor profile for logged-in doctor
const getDoctorForUser = async (userId) => {
  return await DoctorProfile.findOne({ user: userId });
};

// @desc Get overview metrics for doctor dashboard
// @route GET /api/doctor-dashboard/overview
export const getDashboardOverview = async (req, res) => {
  try {
    const doctor = await getDoctorForUser(req.user._id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found for this user' });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const todayAppointments = await Appointment.find({
      doctor: doctor._id,
      appointmentDate: todayStr,
    }).populate('patient', 'name email phone avatar');

    const totalAllTime = await Appointment.countDocuments({ doctor: doctor._id });

    const stats = {
      todayTotal: todayAppointments.length,
      todayWaiting: todayAppointments.filter((a) => a.status === 'booked').length,
      todayInConsultation: todayAppointments.filter((a) => a.status === 'in-consultation').length,
      todayCompleted: todayAppointments.filter((a) => a.status === 'completed').length,
      todayCancelled: todayAppointments.filter((a) => a.status === 'cancelled').length,
      todayRevenue: todayAppointments.filter((a) => a.status === 'completed').length * doctor.consultationFee,
      totalAllTime,
      currentCallingToken: doctor.currentCallingToken,
      queueStatus: doctor.queueStatus,
    };

    // Find currently active patient (token == currentCallingToken or status == 'in-consultation')
    const activeAppointment =
      todayAppointments.find((a) => a.status === 'in-consultation') ||
      todayAppointments.find((a) => a.tokenNumber === doctor.currentCallingToken && a.status === 'booked');

    res.json({
      success: true,
      doctor,
      stats,
      activeAppointment: activeAppointment || null,
      todayAppointments,
    });
  } catch (error) {
    console.error('getDashboardOverview error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving doctor overview' });
  }
};

// @desc Get doctor appointments with date & status filters
// @route GET /api/doctor-dashboard/appointments
export const getDoctorAppointments = async (req, res) => {
  try {
    const doctor = await getDoctorForUser(req.user._id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    const { date, status, search } = req.query;
    const query = { doctor: doctor._id };

    if (date) {
      query.appointmentDate = date;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    let appointments = await Appointment.find(query)
      .populate('patient', 'name email phone avatar gender dateOfBirth')
      .sort({ appointmentDate: -1, tokenNumber: 1 });

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      appointments = appointments.filter(
        (apt) =>
          (apt.patient && searchRegex.test(apt.patient.name)) ||
          searchRegex.test(apt.patient?.phone) ||
          apt.tokenNumber.toString() === search ||
          searchRegex.test(apt.reason)
      );
    }

    res.json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving appointments' });
  }
};

// @desc Update appointment status (in-consultation, completed, no-show, etc.) and write prescription notes
// @route PATCH /api/doctor-dashboard/appointments/:id/status
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status, prescriptionNotes, diagnosis } = req.body;
    const doctor = await getDoctorForUser(req.user._id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      doctor: doctor._id,
    }).populate('patient', 'name email phone avatar');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (status) {
      appointment.status = status;
    }

    if (prescriptionNotes !== undefined) {
      appointment.prescriptionNotes = prescriptionNotes;
    }

    if (diagnosis !== undefined) {
      appointment.diagnosis = diagnosis;
    }

    await appointment.save();

    res.json({
      success: true,
      message: `Appointment status updated to ${appointment.status}`,
      appointment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating appointment status' });
  }
};

// @desc Advance queue by calling next token or specific token
// @route POST /api/doctor-dashboard/queue/call-next
export const callNextPatient = async (req, res) => {
  try {
    const doctor = await getDoctorForUser(req.user._id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // Find all today's booked/waiting appointments
    const todayWaiting = await Appointment.find({
      doctor: doctor._id,
      appointmentDate: todayStr,
      status: 'booked',
    }).sort({ tokenNumber: 1 });

    if (todayWaiting.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No waiting appointments found in the queue for today.',
      });
    }

    // Call the first waiting appointment in the sequence
    const nextAppointment = todayWaiting[0];
    nextAppointment.status = 'in-consultation';
    await nextAppointment.save();

    // Update doctor's currentCallingToken
    doctor.currentCallingToken = nextAppointment.tokenNumber;
    await doctor.save();

    const populatedAppointment = await Appointment.findById(nextAppointment._id).populate(
      'patient',
      'name email phone avatar gender dateOfBirth'
    );

    res.json({
      success: true,
      message: `Now calling Token #${nextAppointment.tokenNumber}`,
      currentCallingToken: doctor.currentCallingToken,
      activeAppointment: populatedAppointment,
    });
  } catch (error) {
    console.error('callNextPatient error:', error);
    res.status(500).json({ success: false, message: 'Server error advancing queue' });
  }
};

// @desc Update doctor profile settings (fee, hours, status)
// @route PATCH /api/doctor-dashboard/settings
export const updateDoctorSettings = async (req, res) => {
  try {
    const { consultationFee, workingHours, slotDurationMinutes, hospitalClinicName, roomNumber, queueStatus } = req.body;
    const doctor = await getDoctorForUser(req.user._id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    if (consultationFee !== undefined) doctor.consultationFee = consultationFee;
    if (workingHours) doctor.workingHours = workingHours;
    if (slotDurationMinutes) doctor.slotDurationMinutes = slotDurationMinutes;
    if (hospitalClinicName) doctor.hospitalClinicName = hospitalClinicName;
    if (roomNumber) doctor.roomNumber = roomNumber;
    if (queueStatus) doctor.queueStatus = queueStatus;

    await doctor.save();

    res.json({
      success: true,
      message: 'Doctor settings updated successfully',
      doctor,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating settings' });
  }
};
