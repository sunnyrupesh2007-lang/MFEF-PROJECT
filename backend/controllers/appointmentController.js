import Appointment from '../models/Appointment.js';
import DoctorProfile from '../models/DoctorProfile.js';

// @desc Book new appointment
// @route POST /api/appointments
export const bookAppointment = async (req, res) => {
  try {
    const { doctorId, appointmentDate, timeSlot, reason, symptoms, patientNotes } = req.body;
    const patientId = req.user._id;

    if (!doctorId || !appointmentDate || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: 'Doctor, appointment date, and time slot are required',
      });
    }

    // Verify doctor exists
    const doctor = await DoctorProfile.findById(doctorId).populate('user', 'name');
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Prevent doctor from booking with themselves if they are also a user
    if (doctor.user._id.toString() === patientId.toString()) {
      return res.status(400).json({ success: false, message: 'Doctors cannot book appointments with themselves' });
    }

    // Check if appointment date or time slot is already in the past
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    if (appointmentDate < todayStr) {
      return res.status(400).json({ success: false, message: 'Cannot book appointments for past dates.' });
    }

    if (appointmentDate === todayStr) {
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const [slotH, slotM] = timeSlot.split(' - ')[0].split(':').map(Number);
      const slotMinutes = slotH * 60 + slotM;

      if (slotMinutes <= currentMinutes) {
        return res.status(400).json({
          success: false,
          message: 'This time slot has already passed for today. Please select an upcoming slot.',
        });
      }
    }

    // Check if slot is already booked by another active appointment
    const existingSlot = await Appointment.findOne({
      doctor: doctorId,
      appointmentDate,
      timeSlot,
      status: { $ne: 'cancelled' },
    });

    if (existingSlot) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked. Please select another time slot.',
      });
    }

    // Check if this patient already has an active appointment with the same doctor on the same day
    const existingPatientBooking = await Appointment.findOne({
      doctor: doctorId,
      patient: patientId,
      appointmentDate,
      status: { $in: ['booked', 'in-consultation'] },
    });

    if (existingPatientBooking) {
      return res.status(400).json({
        success: false,
        message: `You already have an appointment booked with Dr. ${doctor.user.name} on ${appointmentDate} (Token #${existingPatientBooking.tokenNumber}).`,
      });
    }

    // Calculate sequential token number for this doctor on this day
    const lastAppointmentOfDay = await Appointment.findOne({
      doctor: doctorId,
      appointmentDate,
    }).sort({ tokenNumber: -1 });

    const tokenNumber = lastAppointmentOfDay ? lastAppointmentOfDay.tokenNumber + 1 : 1;

    // Create appointment
    const appointment = await Appointment.create({
      patient: patientId,
      doctor: doctorId,
      appointmentDate,
      timeSlot,
      tokenNumber,
      reason: reason || 'Routine Consultation',
      symptoms: Array.isArray(symptoms) ? symptoms : symptoms ? [symptoms] : [],
      patientNotes: patientNotes || '',
      status: 'booked',
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'name email phone avatar')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name email avatar phone' },
      });

    res.status(201).json({
      success: true,
      message: 'Appointment successfully booked! Token generated.',
      appointment: populatedAppointment,
    });
  } catch (error) {
    console.error('bookAppointment error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error while booking appointment' });
  }
};

// @desc Get logged in patient's appointments
// @route GET /api/appointments/my
export const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user._id })
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name email avatar phone' },
      })
      .sort({ appointmentDate: -1, tokenNumber: -1 });

    const todayStr = new Date().toISOString().split('T')[0];

    // Enrich appointments with live queue calculations
    const enriched = appointments.map((apt) => {
      const aptObj = apt.toObject();
      const doc = aptObj.doctor;

      if (apt.appointmentDate === todayStr && apt.status === 'booked') {
        const currentToken = doc?.currentCallingToken || 0;
        const patientsAhead = Math.max(0, apt.tokenNumber - currentToken - 1);
        const estimatedWaitMinutes = patientsAhead * (doc?.slotDurationMinutes || 20);

        aptObj.queueInfo = {
          currentCallingToken: currentToken,
          yourToken: apt.tokenNumber,
          patientsAhead,
          estimatedWaitMinutes,
          isNext: patientsAhead === 0 && currentToken < apt.tokenNumber,
          isNowServing: currentToken === apt.tokenNumber,
        };
      }
      return aptObj;
    });

    res.json({
      success: true,
      count: enriched.length,
      appointments: enriched,
    });
  } catch (error) {
    console.error('getMyAppointments error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving appointments' });
  }
};

// @desc Cancel appointment
// @route PATCH /api/appointments/:id/cancel
export const cancelAppointment = async (req, res) => {
  try {
    const { reason } = req.body;
    const appointment = await Appointment.findById(req.params.id)
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name' },
      });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Check ownership (patient or doctor)
    const isPatient = appointment.patient.toString() === req.user._id.toString();
    const isDoctor = appointment.doctor?.user?._id?.toString() === req.user._id.toString();

    if (!isPatient && !isDoctor && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this appointment' });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Appointment is already cancelled' });
    }

    if (appointment.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Cannot cancel an already completed appointment' });
    }

    appointment.status = 'cancelled';
    appointment.cancellationReason = reason || (isPatient ? 'Cancelled by patient' : 'Cancelled by doctor');
    appointment.cancelledBy = isPatient ? 'patient' : 'doctor';
    appointment.cancelledAt = new Date();

    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment has been successfully cancelled. Slot released.',
      appointment,
    });
  } catch (error) {
    console.error('cancelAppointment error:', error);
    res.status(500).json({ success: false, message: 'Server error cancelling appointment' });
  }
};

// @desc Get single appointment by ID
// @route GET /api/appointments/:id
export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name email phone avatar')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name email avatar phone' },
      });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    res.json({
      success: true,
      appointment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving appointment' });
  }
};
