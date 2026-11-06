import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import DoctorProfile from '../models/DoctorProfile.js';

// Helper to generate JWT token with 7-day expiration
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'medibook_super_secure_jwt_secret_key_2026', {
    expiresIn: '7d',
  });
};

// @desc Register user
// @route POST /api/auth/register
export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      gender,
      dateOfBirth,
      specialty,
      qualification,
      consultationFee,
      hospitalClinicName,
      roomNumber,
      experienceYears,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email address is already registered. Please sign in.' });
    }

    // Role is either 'patient' or 'doctor'
    const userRole = role === 'doctor' ? 'doctor' : 'patient';

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: userRole,
      phone: phone?.trim() || '',
      gender: gender || '',
      dateOfBirth: dateOfBirth || '',
      // Doctor-specific fields under users
      specialty: userRole === 'doctor' ? specialty || 'General Physician' : '',
      qualification: userRole === 'doctor' ? qualification || 'MBBS' : '',
      experienceYears: userRole === 'doctor' ? Number(experienceYears) || 5 : 0,
      consultationFee: userRole === 'doctor' ? Number(consultationFee) || 40 : 0,
      hospitalClinicName: userRole === 'doctor' ? hospitalClinicName || 'General City Hospital' : '',
      roomNumber: userRole === 'doctor' ? roomNumber || 'OPD 101' : '',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    });

    let doctorProfile = null;
    if (userRole === 'doctor') {
      doctorProfile = await DoctorProfile.create({
        user: user._id,
        specialty: user.specialty,
        qualification: user.qualification,
        experienceYears: user.experienceYears,
        consultationFee: user.consultationFee,
        hospitalClinicName: user.hospitalClinicName,
        roomNumber: user.roomNumber,
        about: 'Dedicated medical professional with patient-first care.',
      });
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: `${userRole.toUpperCase()} registered successfully under users`,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        specialty: user.specialty,
        qualification: user.qualification,
        consultationFee: user.consultationFee,
        hospitalClinicName: user.hospitalClinicName,
        roomNumber: user.roomNumber,
        doctorProfileId: doctorProfile?._id,
      },
    });
  } catch (error) {
    console.error('Register security error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Server error during registration' });
  }
};

// @desc Login user
// @route POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail }).select('+password');

    if (!user) {
      // Avoid revealing whether the user exists or not for heightened security
      return res.status(401).json({ success: false, message: 'Invalid credentials. Please verify your email and password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Please verify your email and password.' });
    }

    let doctorProfileId = null;
    if (user.role === 'doctor') {
      const doc = await DoctorProfile.findOne({ user: user._id });
      if (doc) doctorProfileId = doc._id;
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        doctorProfileId,
      },
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ success: false, message: 'Authentication error occurred' });
  }
};

// @desc Get current authenticated user
// @route GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found or session terminated' });
    }

    let doctorProfile = null;
    if (user.role === 'doctor') {
      doctorProfile = await DoctorProfile.findOne({ user: user._id });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        avatar: user.avatar,
        address: user.address,
        studentId: user.studentId || '',
        institution: user.institution || '',
        department: user.department || '',
        yearOfStudy: user.yearOfStudy || '',
        doctorProfile,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Session validation error' });
  }
};

// @desc Get all registered patients from users collection
// @route GET /api/auth/patients
export const getAllPatients = async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient' }).select('-password');
    res.json({
      success: true,
      count: patients.length,
      role: 'patient',
      patients,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving patients' });
  }
};

// @desc Get all registered doctors from users collection
// @route GET /api/auth/doctors-list
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' }).select('-password');
    res.json({
      success: true,
      count: doctors.length,
      role: 'doctor',
      doctors,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving doctors' });
  }
};
