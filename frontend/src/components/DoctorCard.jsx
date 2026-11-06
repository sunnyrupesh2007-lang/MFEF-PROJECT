import React from 'react';
import { Star, MapPin, Clock, Calendar, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const DoctorCard = ({ doctor, onBook }) => {
  const getSpecialtyBadgeColor = (spec = '') => {
    switch (spec.toLowerCase()) {
      case 'cardiologist':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'pediatrician':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'dermatologist':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'orthopedic surgeon':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'neurologist':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default:
        return 'bg-teal-50 text-teal-700 border-teal-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 hover:border-teal-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group">
      <div className="p-5 sm:p-6">
        {/* Top Header: Avatar + Meta */}
        <div className="flex items-start gap-4">
          <div className="relative">
            <img
              src={doctor.user?.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200'}
              alt={doctor.user?.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-teal-100 shadow-sm group-hover:scale-105 transition-transform duration-300"
            />
            <span className="absolute -bottom-1 -right-1 bg-emerald-500 border-2 border-white w-4 h-4 rounded-full" title="Available for booking"></span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getSpecialtyBadgeColor(doctor.specialty)}`}>
                {doctor.specialty}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                <ShieldCheck className="w-3 h-3" />
                Verified MD
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-600 transition-colors mt-1 truncate">
              {doctor.user?.name || 'Doctor'}
            </h3>

            <p className="text-xs text-slate-500 truncate">{doctor.qualification}</p>

            {/* Ratings & Reviews */}
            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex items-center text-amber-500 text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-1" />
                {doctor.rating ? doctor.rating.toFixed(1) : '4.9'}
              </div>
              <span className="text-slate-300 text-xs">•</span>
              <span className="text-slate-500 text-xs">
                {doctor.reviewsCount || 40}+ patient reviews
              </span>
            </div>
          </div>
        </div>

        {/* Clinic & Experience Details */}
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
          <div className="flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
            <span className="truncate">
              <strong className="text-slate-700">{doctor.hospitalClinicName}</strong>
              {doctor.roomNumber && ` (${doctor.roomNumber})`}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-500 pt-1">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-teal-600" />
              <span>{doctor.experienceYears} yrs experience</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400">Consultation Fee:</span>{' '}
              <span className="text-sm font-bold text-slate-900">
                ${doctor.consultationFee}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
        <Link
          to={`/doctors/${doctor._id}`}
          className="flex-1 py-2 px-3 text-center text-xs font-semibold text-slate-700 hover:text-teal-700 bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 rounded-xl transition-all"
        >
          View Profile
        </Link>
        <button
          onClick={() => onBook(doctor)}
          className="flex-1 py-2 px-3 flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 active:scale-[0.98] rounded-xl shadow-sm shadow-teal-600/20 hover:shadow-teal-600/40 transition-all"
        >
          <Calendar className="w-3.5 h-3.5" />
          Book Slot
        </button>
      </div>
    </div>
  );
};

export default DoctorCard;
