import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { doctorService } from '../services/api';
import DoctorCard from '../components/DoctorCard';
import BookingModal from '../components/BookingModal';
import { Search, Filter, Stethoscope, SlidersHorizontal, RotateCcw } from 'lucide-react';

const DoctorsList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSpecialty = searchParams.get('specialty') || 'All';
  const initialSearch = searchParams.get('search') || '';

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [specialty, setSpecialty] = useState(initialSpecialty);
  const [maxFee, setMaxFee] = useState(150);
  const [minRating, setMinRating] = useState(0);

  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState(null);

  const specialtiesList = [
    'All',
    'Cardiologist',
    'Pediatrician',
    'General Physician',
    'Dermatologist',
    'Orthopedic Surgeon',
    'Neurologist',
  ];

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = {};
      if (specialty && specialty !== 'All') params.specialty = specialty;
      if (search) params.search = search;
      if (maxFee < 150) params.maxFee = maxFee;
      if (minRating > 0) params.minRating = minRating;

      const res = await doctorService.getDoctors(params);
      setDoctors(res.doctors || []);
    } catch (err) {
      console.error('Error fetching doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [specialty, maxFee, minRating]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDoctors();
  };

  const handleResetFilters = () => {
    setSearch('');
    setSpecialty('All');
    setMaxFee(150);
    setMinRating(0);
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-500"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
              Verified Medical Directory
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 mt-1">
            Find & Book Specialist Doctors
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Compare outpatient consultation fees, clinic locations, and reserve your virtual queue token.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm mb-8 space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search by doctor name, clinic, or keywords..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-sm"
            >
              Search
            </button>
          </form>

          {/* Specialty Filter Chips */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Specialty:
              </span>
              <button
                onClick={handleResetFilters}
                className="text-xs text-slate-400 hover:text-teal-600 flex items-center gap-1 font-medium"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Filters
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {specialtiesList.map((item) => (
                <button
                  key={item}
                  onClick={() => setSpecialty(item)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    specialty === item
                      ? 'bg-teal-600 text-white shadow-sm ring-2 ring-teal-200'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Additional Filter Sliders (Fee & Rating) */}
          <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
            <div className="flex items-center justify-between gap-4">
              <span className="font-semibold text-slate-700">Max Fee: ${maxFee}</span>
              <input
                type="range"
                min="30"
                max="150"
                step="5"
                value={maxFee}
                onChange={(e) => setMaxFee(Number(e.target.value))}
                className="w-48 accent-teal-600"
              />
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3">
              <span className="font-semibold text-slate-700">Min Rating:</span>
              <div className="flex gap-1.5">
                {[0, 4.5, 4.8].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setMinRating(rating)}
                    className={`px-2.5 py-1 rounded-lg font-bold ${
                      minRating === rating
                        ? 'bg-amber-400 text-slate-900 shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {rating === 0 ? 'Any' : `${rating}★`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Doctor Results Section */}
        <div className="mb-4 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-800">{doctors.length}</strong> available doctor
            {doctors.length === 1 ? '' : 's'}
          </span>
          {specialty !== 'All' && (
            <span className="text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded-md">
              Filtered by: {specialty}
            </span>
          )}
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400 text-xs">
            <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            Searching available doctors and schedules...
          </div>
        ) : doctors.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
              <Stethoscope className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No doctors match your criteria</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting your specialty filter, search keyword, or maximum fee range.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-4 px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doc) => (
              <DoctorCard
                key={doc._id}
                doctor={doc}
                onBook={(doctor) => setSelectedDoctorForBooking(doctor)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <BookingModal
        doctor={selectedDoctorForBooking}
        isOpen={Boolean(selectedDoctorForBooking)}
        onClose={() => setSelectedDoctorForBooking(null)}
      />
    </div>
  );
};

export default DoctorsList;
