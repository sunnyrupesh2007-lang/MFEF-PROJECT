import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DoctorProfile',
      required: true,
    },
    appointmentDate: {
      type: String, // 'YYYY-MM-DD'
      required: [true, 'Please provide appointment date'],
    },
    timeSlot: {
      type: String, // e.g. '09:00 - 09:20'
      required: [true, 'Please provide time slot'],
    },
    tokenNumber: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      default: 'General Consultation',
      trim: true,
    },
    symptoms: {
      type: [String],
      default: [],
    },
    patientNotes: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['booked', 'in-consultation', 'completed', 'cancelled', 'no-show'],
      default: 'booked',
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    cancelledBy: {
      type: String,
      enum: ['patient', 'doctor', 'system', ''],
      default: '',
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    prescriptionNotes: {
      type: String,
      default: '',
    },
    diagnosis: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to quickly find conflicts or list appointments for doctor & date
appointmentSchema.index({ doctor: 1, appointmentDate: 1, timeSlot: 1 });

export default mongoose.model('Appointment', appointmentSchema);
