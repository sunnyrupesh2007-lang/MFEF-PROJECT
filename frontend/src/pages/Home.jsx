import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { doctorService } from '../services/api';
import DoctorCard from '../components/DoctorCard';
import BookingModal from '../components/BookingModal';
import {
  Search,
  Clock,
  ShieldCheck,
  CalendarCheck,
  Users,
  ChevronRight,
  Sparkles,
  Heart,
  Activity,
  Award,
  Zap,
  MapPin,
  Stethoscope,
} from 'lucide-react';

const Home = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopDoctors = async () => {
      try {
        const res = await doctorService.getDoctors();
        setDoctors(res.doctors || []);
      } catch (err) {
        console.error('Failed to load featured doctors:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTopDoctors();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedSpecialty) params.set('specialty', selectedSpecialty);
    navigate(`/doctors?${params.toString()}`);
  };

  const specialties = [
    { name: 'Cardiologist', label: 'Cardiology', icon: '❤️', count: '12 Doctors', color: 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200' },
    { name: 'Pediatrician', label: 'Pediatrics', icon: '👶', count: '18 Doctors', color: 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200' },
    { name: 'General Physician', label: 'General Medicine', icon: '🩺', count: '24 Doctors', color: 'bg-teal-50 hover:bg-teal-100 text-teal-700 border-teal-200' },
    { name: 'Dermatologist', label: 'Dermatology', icon: '✨', count: '9 Doctors', color: 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200' },
    { name: 'Orthopedic Surgeon', label: 'Orthopedics', icon: '🦴', count: '14 Doctors', color: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200' },
    { name: 'Neurologist', label: 'Neurology', icon: '🧠', count: '7 Doctors', color: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-50/80 via-white to-slate-50 pt-12 pb-20 border-b border-slate-200">
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-teal-200/40 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-cyan-200/40 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-5">
            {/* Real-life problem callout badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold tracking-wide shadow-sm animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              Say Goodbye to Long Hospital Queues
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Book Doctor Visits.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600">
                Track Live Queue.
              </span>{' '}
              Skip the Waiting Room.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              No more arriving hours early or standing in exhausting OPD corridors. Choose your
              specialist, secure an instant token, and track doctor consultation progress in
              real-time from your phone.
            </p>

            {/* Quick Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="mt-8 bg-white p-2.5 sm:p-3 rounded-2xl sm:rounded-full shadow-xl shadow-slate-200/60 border border-slate-200 flex flex-col sm:flex-row items-center gap-2 max-w-2xl mx-auto"
            >
              <div className="flex items-center gap-2 px-3 flex-1 w-full">
                <Search className="w-5 h-5 text-teal-600 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Doctor name, clinic, or condition..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-sm text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
                />
              </div>

              <div className="hidden sm:block h-6 w-px bg-slate-200"></div>

              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="text-xs sm:text-sm text-slate-700 bg-transparent px-3 py-2 focus:outline-none w-full sm:w-auto"
              >
                <option value="">All Specialties</option>
                {specialties.map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.label}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl sm:rounded-full shadow-md shadow-teal-500/25 transition-all flex items-center justify-center gap-1.5"
              >
                <span>Find Doctors</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>

            {/* Live Queue Impact Highlights */}
            <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
              <div className="bg-white/80 backdrop-blur-sm p-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
                <p className="text-2xl font-black text-teal-600">75%</p>
                <p className="text-xs text-slate-500 font-medium">Wait Time Saved</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
                <p className="text-2xl font-black text-cyan-600">Zero</p>
                <p className="text-xs text-slate-500 font-medium">Physical Queuing</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
                <p className="text-2xl font-black text-emerald-600">100%</p>
                <p className="text-xs text-slate-500 font-medium">Verified Doctors</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
                <p className="text-2xl font-black text-amber-500">Live</p>
                <p className="text-xs text-slate-500 font-medium">Token Updates</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specialties Directory Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-xs font-bold text-teal-700 uppercase tracking-wider">
              Explore Medical Departments
            </h2>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              Find Doctors by Specialty
            </p>
          </div>
          <Link
            to="/doctors"
            className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 group"
          >
            <span>View All Specialists</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {specialties.map((spec) => (
            <Link
              key={spec.name}
              to={`/doctors?specialty=${encodeURIComponent(spec.name)}`}
              className={`p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-lg flex flex-col items-center text-center ${spec.color}`}
            >
              <span className="text-3xl mb-2">{spec.icon}</span>
              <h3 className="text-xs font-bold">{spec.label}</h3>
              <span className="text-[10px] opacity-80 mt-1 font-medium">{spec.count}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* How It Eliminates Hospital Queues */}
      <section className="py-16 bg-white border-y border-slate-200 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
              Smart Outpatient System
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              How Medibook Eliminates Queue Fatigue
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Transforming traditional crowded hospital waiting halls into a calm, virtual queue.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 relative group hover:border-teal-300 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-black text-lg mb-4">
                01
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Book Slot & Instant Token
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Select your preferred doctor, time interval (e.g. 09:40 AM), and get an automated OPD
                Token Number without visiting the hospital ticket desk.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 relative group hover:border-teal-300 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-black text-lg mb-4">
                02
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Live Virtual Queue Tracking
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Monitor the doctor's live calling token and patients ahead of you from home or a nearby
                café. Get alerts when it's almost your turn.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 relative group hover:border-teal-300 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-lg mb-4">
                03
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Direct Chamber Walk-In
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Arrive 10 minutes before your token is called and walk straight into the consultation
                room. Zero waiting hall distress.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Doctors Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
              Top Medical Staff
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              Featured Available Doctors
            </h2>
          </div>
          <Link
            to="/doctors"
            className="text-xs font-bold text-teal-600 hover:text-teal-700 hidden sm:flex items-center gap-1"
          >
            <span>See All Doctors</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading available specialists...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.slice(0, 6).map((doc) => (
              <DoctorCard
                key={doc._id}
                doctor={doc}
                onBook={(doctor) => setSelectedDoctorForBooking(doctor)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Booking Modal */}
      <BookingModal
        doctor={selectedDoctorForBooking}
        isOpen={Boolean(selectedDoctorForBooking)}
        onClose={() => setSelectedDoctorForBooking(null)}
      />
    </div>
  );
};

export default Home;
