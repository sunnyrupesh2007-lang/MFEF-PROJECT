import mongoose from 'mongoose';

const doctorProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    specialty: {
      type: String,
      required: [true, 'Please specify a medical specialty'],
      trim: true,
    },
    qualification: {
      type: String,
      required: [true, 'Please provide doctor qualification'],
      trim: true,
    },
    experienceYears: {
      type: Number,
      required: true,
      min: 0,
    },
    consultationFee: {
      type: Number,
      required: true,
      min: 0,
    },
    hospitalClinicName: {
      type: String,
      required: true,
      trim: true,
    },
    hospitalAddress: {
      type: String,
      default: '',
    },
    roomNumber: {
      type: String,
      default: 'OPD 101',
    },
    about: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 1,
      max: 5,
    },
    reviewsCount: {
      type: Number,
      default: 24,
    },
    slotDurationMinutes: {
      type: Number,
      default: 20,
    },
    availableDays: {
      type: [String],
      default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    },
    workingHours: {
      start: {
        type: String,
        default: '09:00',
      },
      end: {
        type: String,
        default: '17:00',
      },
    },
    currentCallingToken: {
      type: Number,
      default: 0,
    },
    queueStatus: {
      type: String,
      enum: ['Active', 'On Break', 'Closed'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('DoctorProfile', doctorProfileSchema);
