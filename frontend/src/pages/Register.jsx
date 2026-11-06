import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, User, Stethoscope, Mail, Lock, Phone, AlertCircle, ArrowRight, CheckCircle2, GraduationCap } from 'lucide-react';

const Register = () => {
  const [role, setRole] = useState('patient'); // 'patient' | 'student' | 'doctor'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('Male');
  const [dateOfBirth, setDateOfBirth] = useState('');

  // Student-specific fields
  const [studentId, setStudentId] = useState('');
  const [institution, setInstitution] = useState('');
  const [department, setDepartment] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('1st Year');

  // Doctor-specific fields
  const [specialty, setSpecialty] = useState('Cardiologist');
  const [qualification, setQualification] = useState('');
  const [consultationFee, setConsultationFee] = useState(50);
  const [hospitalClinicName, setHospitalClinicName] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const specialtiesList = [
    'Cardiologist',
    'Pediatrician',
    'General Physician',
    'Dermatologist',
    'Orthopedic Surgeon',
    'Neurologist',
    'Dentist',
    'ENT Specialist',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name,
        email,
        password,
        role,
        phone,
        gender,
        dateOfBirth,
        ...(role === 'student' && {
          studentId: studentId.trim(),
          institution: institution.trim(),
          department: department.trim(),
          yearOfStudy,
        }),
        ...(role === 'doctor' && {
          specialty,
          qualification: qualification || 'MD / MBBS',
          consultationFee: Number(consultationFee),
          hospitalClinicName: hospitalClinicName || 'General City Hospital',
        }),
      };

      const newUser = await register(payload);
      if (newUser.role === 'doctor') {
        navigate('/doctor/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12">
      <div className="max-w-lg w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <Activity className="w-6 h-6" />
            </div>
            <span className="font-extrabold text-2xl text-slate-900 tracking-tight">
              Medi<span className="text-teal-600">book</span>
            </span>
          </Link>
          <h1 className="text-xl font-bold text-slate-900">Create an Account</h1>
          <p className="text-xs text-slate-500">
            Join thousands of patients, students & doctors ending hospital queue congestion.
          </p>
        </div>

        {/* Role Picker (Patient vs Doctor) */}
        <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => setRole('patient')}
            className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              role === 'patient'
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Patient Registration</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('doctor')}
            className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              role === 'doctor'
                ? 'bg-white text-cyan-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>Doctor Registration</span>
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={role === 'doctor' ? 'Dr. John Doe' : 'Jane Doe'}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 chars"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555-019-2834"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Doctor-Specific Details */}
          {role === 'doctor' && (
            <div className="p-4 bg-cyan-50/60 border border-cyan-100 rounded-2xl space-y-3">
              <span className="font-bold text-cyan-900 uppercase tracking-wider block">
                Clinical Credentials
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Specialty</label>
                  <select
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none"
                  >
                    {specialtiesList.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Fee ($ USD)</label>
                  <input
                    type="number"
                    min="10"
                    value={consultationFee}
                    onChange={(e) => setConsultationFee(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">
                  Qualifications (Degree / College)
                </label>
                <input
                  type="text"
                  placeholder="e.g. MBBS, MD (Cardiology)"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">
                  Hospital / Clinic Name & Room #
                </label>
                <input
                  type="text"
                  placeholder="e.g. City Central Hospital - OPD Room 302"
                  value={hospitalClinicName}
                  onChange={(e) => setHospitalClinicName(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-bold rounded-xl shadow-md shadow-teal-500/25 flex items-center justify-center gap-2 transition-all"
          >
            {loading ? 'Creating Account...' : `Register as ${role === 'doctor' ? 'Doctor' : 'Patient'}`}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-teal-600 hover:underline">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
