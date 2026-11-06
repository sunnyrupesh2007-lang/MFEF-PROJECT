import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doctorService } from '../services/api';
import BookingModal from '../components/BookingModal';
import {
  Star,
  MapPin,
  Clock,
  Calendar,
  ShieldCheck,
  Award,
  Building,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

const DoctorDetails = () => {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await doctorService.getDoctorById(id);
        setDoctor(res.doctor);
      } catch (err) {
        console.error('Error fetching doctor details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-400">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mr-2"></div>
        Loading doctor profile...
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Doctor Not Found</h2>
        <Link to="/doctors" className="mt-4 inline-block text-xs text-teal-600 font-semibold underline">
          Back to Doctors Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/doctors"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-teal-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Doctor Directory
        </Link>

        {/* Doctor Header Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-5">
              <img
                src={
                  doctor.user?.avatar ||
                  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300'
                }
                alt={doctor.user?.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-teal-50 shadow-md"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold px-3 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                    {doctor.specialty}
                  </span>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Board Certified
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {doctor.user?.name}
                </h1>
                <p className="text-xs sm:text-sm text-slate-600">{doctor.qualification}</p>

                <div className="flex items-center gap-3 text-xs pt-1">
                  <div className="flex items-center text-amber-500 font-bold">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400 mr-1" />
                    {doctor.rating ? doctor.rating.toFixed(1) : '4.9'}
                  </div>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500">{doctor.reviewsCount || 40}+ Verified Patient Reviews</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-600 font-medium">{doctor.experienceYears} Years Practice</span>
                </div>
              </div>
            </div>

            {/* Quick Action Box */}
            <div className="w-full md:w-auto bg-slate-50 rounded-2xl p-5 border border-slate-200 text-center space-y-3">
              <div>
                <span className="text-xs text-slate-400 block font-medium">Consultation Fee</span>
                <span className="text-3xl font-black text-slate-900">${doctor.consultationFee}</span>
                <span className="text-[11px] text-slate-500 block">per OPD consultation</span>
              </div>
              <button
                onClick={() => setBookingModalOpen(true)}
                className="w-full px-6 py-3 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md shadow-teal-500/25 flex items-center justify-center gap-2 transition-all"
              >
                <Calendar className="w-4 h-4" />
                Book Appointment & Token
              </button>
            </div>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            {/* Biography */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                About the Doctor
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {doctor.about ||
                  'Experienced medical specialist dedicated to patient-centered clinical care, evidence-based treatments, and comprehensive health counseling.'}
              </p>
            </div>

            {/* Hospital & OPD Location */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Clinic & Hospital Location
              </h3>
              <div className="space-y-2 text-xs sm:text-sm text-slate-600">
                <div className="flex items-start gap-2.5">
                  <Building className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="text-slate-800">{doctor.hospitalClinicName}</strong>
                    <p className="text-xs text-slate-500 mt-0.5">{doctor.roomNumber}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-600">{doctor.hospitalAddress || 'Health Blvd, OPD Block'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule & Queue Details */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-600" />
                Consultation Schedule
              </h3>

              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Working Hours:</span>
                  <span className="font-semibold text-slate-800">
                    {doctor.workingHours?.start || '09:00'} - {doctor.workingHours?.end || '17:00'}
                  </span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Slot Interval:</span>
                  <span className="font-semibold text-slate-800">
                    {doctor.slotDurationMinutes || 20} Minutes
                  </span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">OPD Days:</span>
                  <span className="font-semibold text-slate-800">Mon - Sat</span>
                </div>

                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Current Calling Token:</span>
                  <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
                    #{doctor.currentCallingToken || 0}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setBookingModalOpen(true)}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md shadow-teal-500/20"
              >
                Select Date & Slot
              </button>
            </div>
          </div>
        </div>
      </div>

      <BookingModal
        doctor={doctor}
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
      />
    </div>
  );
};

export default DoctorDetails;
