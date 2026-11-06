import dns from "node:dns";
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dns.setServers(["8.8.8.8", "8.8.4.4"]);
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import User from '../models/User.js';
import DoctorProfile from '../models/DoctorProfile.js';
import Appointment from '../models/Appointment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend folder
dotenv.config({
    path: path.resolve(__dirname, '../.env')
});

const seed = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
        throw new Error("MONGODB_URI is missing from .env file");
    }

    console.log("[Seeder]: Connecting to MongoDB Atlas...");

    await mongoose.connect(mongoUri);

    console.log('[Seeder]: Clearing existing collections...');
    await User.deleteMany({});
    await DoctorProfile.deleteMany({});
    await Appointment.deleteMany({});

    console.log('[Seeder]: Creating demo users and doctors...');

    // Demo Patient
    const demoPatient = await User.create({
      name: 'Alex Johnson',
      email: 'patient@example.com',
      password: 'password123',
      role: 'patient',
      phone: '+1 (555) 234-8712',
      gender: 'Male',
      dateOfBirth: '1994-06-15',
      address: '742 Evergreen Terrace, Springfield',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
    });

    // Secondary Patient for queue simulation
    const patient2 = await User.create({
      name: 'Sophia Martinez',
      email: 'sophia@example.com',
      password: 'password123',
      role: 'patient',
      phone: '+1 (555) 456-7890',
      gender: 'Female',
      dateOfBirth: '1998-03-22',
      address: '120 Oak Street, Metro City',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    });

    const patient3 = await User.create({
      name: 'James Wilson',
      email: 'james@example.com',
      password: 'password123',
      role: 'patient',
      phone: '+1 (555) 987-6543',
      gender: 'Male',
      dateOfBirth: '1985-11-09',
      address: '45 Pine Ave, Springfield',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=200',
    });

    // Doctors definition
    const doctorData = [
      {
        user: {
          name: 'Dr. Sarah Jenkins',
          email: 'dr.sarah@example.com',
          password: 'password123',
          role: 'doctor',
          phone: '+1 (555) 101-2020',
          gender: 'Female',
          avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
        },
        profile: {
          specialty: 'Cardiologist',
          qualification: 'MD, FACC - Harvard Medical School',
          experienceYears: 14,
          consultationFee: 75,
          hospitalClinicName: 'City Heart & Vascular Center',
          hospitalAddress: '500 Health Blvd, Suite 300, New York',
          roomNumber: 'OPD 304 (Cardio Wing)',
          about:
            'Dr. Sarah Jenkins is an award-winning cardiologist specializing in preventative cardiology, hypertension management, and echocardiography with over 14 years of clinical excellence.',
          rating: 4.9,
          reviewsCount: 142,
          slotDurationMinutes: 20,
          currentCallingToken: 1, // Currently serving token 1
        },
      },
      {
        user: {
          name: 'Dr. Robert Chen',
          email: 'dr.robert@example.com',
          password: 'password123',
          role: 'doctor',
          phone: '+1 (555) 303-4040',
          gender: 'Male',
          avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300',
        },
        profile: {
          specialty: 'Pediatrician',
          qualification: 'MD, FAAP - Johns Hopkins University',
          experienceYears: 10,
          consultationFee: 60,
          hospitalClinicName: "Sunshine Children's Hospital",
          hospitalAddress: '12 Blossom Way, New York',
          roomNumber: 'Pediatrics Room 102',
          about:
            'Passionate pediatrician focused on gentle child care, newborn wellness, developmental assessments, and childhood immunizations.',
          rating: 4.8,
          reviewsCount: 98,
          slotDurationMinutes: 20,
          currentCallingToken: 0,
        },
      },
      {
        user: {
          name: 'Dr. Emily Watson',
          email: 'dr.emily@example.com',
          password: 'password123',
          role: 'doctor',
          phone: '+1 (555) 505-6060',
          gender: 'Female',
          avatar: 'https://images.unsplash.com/photo-1594824813515-993d0d62a345?auto=format&fit=crop&q=80&w=300',
        },
        profile: {
          specialty: 'General Physician',
          qualification: 'MBBS, MRCGP - Oxford University',
          experienceYears: 8,
          consultationFee: 45,
          hospitalClinicName: 'Downtown Family Wellness Clinic',
          hospitalAddress: '240 Broadway Ave, New York',
          roomNumber: 'OPD Room 201',
          about:
            'Comprehensive primary care, seasonal illness diagnosis, preventive health check-ups, and holistic family wellness.',
          rating: 4.9,
          reviewsCount: 210,
          slotDurationMinutes: 15,
          currentCallingToken: 0,
        },
      },
      {
        user: {
          name: 'Dr. Michael Rivera',
          email: 'dr.michael@example.com',
          password: 'password123',
          role: 'doctor',
          phone: '+1 (555) 707-8080',
          gender: 'Male',
          avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300',
        },
        profile: {
          specialty: 'Dermatologist',
          qualification: 'MD, FAAD - Stanford Medicine',
          experienceYears: 12,
          consultationFee: 85,
          hospitalClinicName: 'Rivera Skin & Laser Institute',
          hospitalAddress: '88 Lexington Avenue, New York',
          roomNumber: 'Derm Suite 405',
          about:
            'Expert in clinical dermatology, acne treatments, eczema, mole screening, and non-invasive cosmetic skin restoration.',
          rating: 4.7,
          reviewsCount: 86,
          slotDurationMinutes: 20,
          currentCallingToken: 0,
        },
      },
      {
        user: {
          name: 'Dr. Priya Patel',
          email: 'dr.priya@example.com',
          password: 'password123',
          role: 'doctor',
          phone: '+1 (555) 909-1111',
          gender: 'Female',
          avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
        },
        profile: {
          specialty: 'Orthopedic Surgeon',
          qualification: 'MS Ortho, MCh - Columbia University',
          experienceYears: 16,
          consultationFee: 95,
          hospitalClinicName: 'Apex Bone & Joint Specialty Hospital',
          hospitalAddress: '770 Park Avenue, New York',
          roomNumber: 'Orthopedics Clinic 512',
          about:
            'Specialist in joint preservation, sports injury rehabilitation, arthritis management, and spine consultation.',
          rating: 4.9,
          reviewsCount: 164,
          slotDurationMinutes: 25,
          currentCallingToken: 0,
        },
      },
      {
        user: {
          name: 'Dr. David Kim',
          email: 'dr.david@example.com',
          password: 'password123',
          role: 'doctor',
          phone: '+1 (555) 321-4321',
          gender: 'Male',
          avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300',
        },
        profile: {
          specialty: 'Neurologist',
          qualification: 'MD, PhD - Yale School of Medicine',
          experienceYears: 18,
          consultationFee: 110,
          hospitalClinicName: 'Metropolitan Neuro & Brain Center',
          hospitalAddress: '100 Madison Avenue, New York',
          roomNumber: 'Neurology Suite 608',
          about:
            'Consultant neurologist dealing with migraines, neuropathies, vertigo, sleep disturbances, and cognitive health.',
          rating: 4.8,
          reviewsCount: 120,
          slotDurationMinutes: 30,
          currentCallingToken: 0,
        },
      },
    ];

    const createdDoctorProfiles = [];

    for (const d of doctorData) {
      const docUser = await User.create(d.user);
      const docProfile = await DoctorProfile.create({
        user: docUser._id,
        ...d.profile,
      });
      createdDoctorProfiles.push(docProfile);
    }

    console.log(`[Seeder]: Created ${createdDoctorProfiles.length} doctors.`);

    // Create Initial Appointments for Today for Dr. Sarah Jenkins to test queue management
    const todayStr = new Date().toISOString().split('T')[0];
    const drSarah = createdDoctorProfiles[0];

    // Token #1: In Consultation
    await Appointment.create({
      patient: patient2._id,
      doctor: drSarah._id,
      appointmentDate: todayStr,
      timeSlot: '09:00 - 09:20',
      tokenNumber: 1,
      reason: 'Heart palpitation follow-up',
      symptoms: ['Chest tightness', 'Shortness of breath'],
      patientNotes: 'Experiencing rapid heart rate after morning coffee.',
      status: 'in-consultation',
    });

    // Token #2: Booked (Next in line)
    await Appointment.create({
      patient: patient3._id,
      doctor: drSarah._id,
      appointmentDate: todayStr,
      timeSlot: '09:20 - 09:40',
      tokenNumber: 2,
      reason: 'Annual cardiovascular checkup',
      symptoms: ['High blood pressure history'],
      patientNotes: 'Routine BP checkup requested by physician.',
      status: 'booked',
    });

    // Token #3: Booked for Alex Johnson (Our Demo Patient!)
    await Appointment.create({
      patient: demoPatient._id,
      doctor: drSarah._id,
      appointmentDate: todayStr,
      timeSlot: '09:40 - 10:00',
      tokenNumber: 3,
      reason: 'Mild chest discomfort during workouts',
      symptoms: ['Fatigue', 'Mild discomfort'],
      patientNotes: 'Would like an ECG review if necessary.',
      status: 'booked',
    });

    // Token #4: Booked
    await Appointment.create({
      patient: patient2._id,
      doctor: createdDoctorProfiles[1]._id, // Dr. Robert Chen
      appointmentDate: todayStr,
      timeSlot: '10:00 - 10:20',
      tokenNumber: 1,
      reason: 'Child seasonal allergy checkup',
      symptoms: ['Runny nose', 'Sneezing'],
      status: 'booked',
    });

    console.log('[Seeder]: Successfully created test appointments and virtual queue tokens!');
    console.log('----------------------------------------------------');
    console.log('Demo Patient: patient@example.com / password123');
    console.log('Demo Doctor (Cardiology): dr.sarah@example.com / password123');
    console.log('Demo Doctor (Pediatrics): dr.robert@example.com / password123');
    console.log('----------------------------------------------------');

    await mongoose.disconnect();
    console.log('[Seeder]: Finished successfully.');
    process.exit(0);
  } catch (error) {
    console.error('[Seeder Error]:', error);
    process.exit(1);
  }
};

seed();
