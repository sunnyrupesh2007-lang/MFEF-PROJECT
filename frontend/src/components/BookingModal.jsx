import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { doctorService, appointmentService } from '../services/api';
import {
  X,
  Calendar,
  Clock,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Ticket,
  ChevronRight,
  ShieldCheck,
  Stethoscope,
  HeartPulse,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BookingModal = ({ doctor, isOpen, onClose, onBookingSuccess }) => {
  const { user, isPatient } = useAuth();
  const navigate = useNavigate();

  // Next 7 days list with local timezone formatting
  const getNext7Days = () => {
    const days = [];
    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const date = String(d.getDate()).padStart(2, '0');
      const iso = `${year}-${month}-${date}`;
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const monthDay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      days.push({
        iso,
        dayName: i === 0 ? 'Today' : i === 1 ? 'Tmrw' : dayName,
        monthDay,
      });
    }
    return days;
  };

  const daysList = getNext7Days();
  const nowForInit = new Date();
  const initialDate =
    nowForInit.getHours() >= 17 && daysList[1] ? daysList[1].iso : daysList[0].iso;
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slotsData, setSlotsData] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [reason, setReason] = useState('Routine Checkup');
  const [customReason, setCustomReason] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successBooking, setSuccessBooking] = useState(null);

  // Common quick symptom tags
  const presetReasons = [
    'Routine Checkup',
    'Follow-up Visit',
    'Chest Discomfort',
    'Fever / Cold',
    'Joint / Muscle Pain',
    'Skin Consultation',
  ];

  // Fetch slots whenever selected doctor or date changes
  useEffect(() => {
    if (!doctor?._id || !isOpen) return;

    const fetchSlots = async () => {
      setLoadingSlots(true);
      setError('');
      setSelectedSlot(null);
      try {
        const res = await doctorService.getDoctorSlots(doctor._id, selectedDate);
        setSlotsData(res.slots || []);
      } catch (err) {
        setError(err.message || 'Failed to load doctor slots');
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [doctor?._id, selectedDate, isOpen]);

  // Current time calculations to filter out past slots for today
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
  const currentDate = String(now.getDate()).padStart(2, '0');
  const todayIso = `${currentYear}-${currentMonth}-${currentDate}`;
  const isSelectedDateToday = selectedDate === todayIso;

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Filter out any slot whose time has already passed
  const activeDisplaySlots = slotsData.filter((slot) => {
    if (!isSelectedDateToday) return true;
    const [h, m] = slot.timeSlot.split(' - ')[0].split(':').map(Number);
    const slotMinutes = h * 60 + m;
    return slotMinutes > currentMinutes; // Don't show time slots after the time has passed
  });

  // Handle booking form submission
  const handleBook = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login?redirect=book');
      return;
    }

    if (!selectedSlot) {
      setError('Please select an available time slot.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        doctorId: doctor._id,
        appointmentDate: selectedDate,
        timeSlot: selectedSlot.timeSlot,
        reason: customReason.trim() ? customReason.trim() : reason,
        symptoms: symptoms
          ? symptoms.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        patientNotes: notes,
      };

      const res = await appointmentService.bookAppointment(payload);
      setSuccessBooking(res.appointment);
      if (onBookingSuccess) onBookingSuccess(res.appointment);
    } catch (err) {
      setError(err.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !doctor) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 relative">
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-teal-50/70 to-cyan-50/70">
          <div className="flex items-center gap-3">
            <img
              src={doctor.user?.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200'}
              alt={doctor.user?.name}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800">
                  {doctor.specialty}
                </span>
                <span className="text-xs text-slate-500">{doctor.hospitalClinicName}</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                Book with {doctor.user?.name}
              </h2>
              <p className="text-xs text-slate-500">
                {doctor.roomNumber} • Fee: <strong className="text-slate-800">${doctor.consultationFee}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Booking Form Content or Success Screen */}
        {successBooking ? (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="inline-block px-3 py-1 bg-teal-100 text-teal-800 text-xs font-bold rounded-full mb-2 uppercase tracking-wider">
                Virtual Queue Ticket Issued
              </span>
              <h3 className="text-2xl font-black text-slate-900">
                Appointment Confirmed!
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Your outpatient slot has been reserved. You do not need to stand in physical hospital queues!
              </p>
            </div>

            {/* Token Ticket Card */}
            <div className="bg-gradient-to-br from-teal-500 to-teal-700 text-white rounded-2xl p-6 shadow-xl max-w-md mx-auto relative overflow-hidden text-left">
              <div className="flex justify-between items-start border-b border-teal-400/50 pb-4">
                <div>
                  <p className="text-[11px] text-teal-100 uppercase tracking-wider font-semibold">
                    Live Token Number
                  </p>
                  <p className="text-4xl font-extrabold tracking-tight mt-0.5">
                    #{successBooking.tokenNumber}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-teal-100">{successBooking.appointmentDate}</p>
                  <p className="text-sm font-bold">{successBooking.timeSlot}</p>
                </div>
              </div>

              <div className="mt-4 space-y-1 text-xs">
                <p className="text-teal-100">
                  Doctor: <span className="font-semibold text-white">{doctor.user?.name}</span>
                </p>
                <p className="text-teal-100">
                  Room: <span className="font-semibold text-white">{doctor.roomNumber}</span>
                </p>
                <p className="text-teal-100">
                  Patient: <span className="font-semibold text-white">{user?.name}</span>
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-teal-400/40 text-[11px] text-teal-100 flex items-center gap-1.5">
                <Ticket className="w-4 h-4 text-amber-300" />
                Track live OPD calling status in your patient dashboard.
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={() => {
                  onClose();
                  navigate('/dashboard');
                }}
                className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold rounded-xl shadow-md shadow-teal-500/20 transition-all flex items-center justify-center gap-2"
              >
                Go to My Appointments & Live Queue
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleBook} className="p-6 space-y-6">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Step 1: Date Selector */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2.5">
                1. Select Consultation Date
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {daysList.map((day) => {
                  const isSelected = selectedDate === day.iso;
                  return (
                    <button
                      type="button"
                      key={day.iso}
                      onClick={() => setSelectedDate(day.iso)}
                      className={`p-2.5 rounded-xl text-center border transition-all ${
                        isSelected
                          ? 'border-teal-600 bg-teal-600 text-white shadow-md shadow-teal-500/20'
                          : 'border-slate-200 hover:border-teal-300 bg-white text-slate-700'
                      }`}
                    >
                      <div className="text-[11px] font-bold uppercase">{day.dayName}</div>
                      <div className="text-xs font-extrabold mt-0.5">{day.monthDay}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Time Slots */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  2. Select Available Time Slot
                </label>
                <div className="flex items-center gap-3 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                    Available
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                    Booked
                  </span>
                </div>
              </div>

              {loadingSlots ? (
                <div className="py-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                  Loading schedule & slots for {selectedDate}...
                </div>
              ) : activeDisplaySlots.length === 0 ? (
                isSelectedDateToday ? (
                  <div className="py-8 px-4 text-center bg-amber-50/80 rounded-2xl border border-amber-200 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        Consultation Slots for Today Have Ended
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                        All scheduled consultation times for today have already passed. Please select tomorrow or an upcoming date to reserve a slot.
                      </p>
                    </div>
                    {daysList[1] && (
                      <button
                        type="button"
                        onClick={() => setSelectedDate(daysList[1].iso)}
                        className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-500/20 inline-flex items-center gap-1.5 transition-all"
                      >
                        <span>Book for Tomorrow ({daysList[1].monthDay})</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="py-6 text-center text-slate-500 text-xs bg-slate-50 rounded-xl border border-slate-200">
                    No slots available on this date. Please choose another date.
                  </div>
                )
              ) : (
                <div className="space-y-4">
                  {['morning', 'afternoon', 'evening'].map((period) => {
                    const periodSlots = activeDisplaySlots.filter((s) => s.period === period);
                    if (periodSlots.length === 0) return null;

                    return (
                      <div key={period}>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                          {period} Slots
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {periodSlots.map((slot) => {
                            const isSelected = selectedSlot?.timeSlot === slot.timeSlot;
                            return (
                              <button
                                type="button"
                                key={slot.timeSlot}
                                disabled={slot.isBooked}
                                onClick={() => setSelectedSlot(slot)}
                                className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all text-center flex items-center justify-between ${
                                  slot.isBooked
                                    ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                                    : isSelected
                                    ? 'bg-teal-500 text-white border-teal-600 shadow-md ring-2 ring-teal-200'
                                    : 'bg-white hover:bg-teal-50 text-slate-700 border-slate-200 hover:border-teal-400'
                                }`}
                              >
                                <span>{slot.timeSlot.split(' - ')[0]}</span>
                                {slot.isBooked ? (
                                  <span className="text-[9px] bg-slate-200 px-1 py-0.2 rounded font-normal no-underline">
                                    Full
                                  </span>
                                ) : isSelected ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                ) : (
                                  <span className="text-[9px] text-teal-600 font-bold">
                                    Open
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Selected Slot Queue Preview */}
            {selectedSlot && (
              <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-sm">
                    #{selectedSlot.tokenEstimate}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-teal-900">
                      Estimated Day Token: #{selectedSlot.tokenEstimate}
                    </p>
                    <p className="text-[11px] text-teal-700">
                      OPD slot: {selectedSlot.timeSlot} ({doctor.roomNumber})
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-900">
                    ${doctor.consultationFee}
                  </span>
                  <p className="text-[10px] text-slate-500">Pay at clinic</p>
                </div>
              </div>
            )}

            {/* Step 3: Reason & Symptoms */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                3. Reason for Visit & Symptoms
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {presetReasons.map((pReason) => (
                  <button
                    type="button"
                    key={pReason}
                    onClick={() => {
                      setReason(pReason);
                      setCustomReason('');
                    }}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      reason === pReason && !customReason
                        ? 'bg-slate-800 text-white border-slate-800 font-semibold'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                    }`}
                  >
                    {pReason}
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="Or specify custom reason..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 mb-2"
              />

              <input
                type="text"
                placeholder="Symptoms (e.g. Chest pain, palpitations, dizziness)"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 mb-2"
              />

              <textarea
                placeholder="Any additional notes for the doctor or medical history..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              ></textarea>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !selectedSlot}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-md shadow-teal-500/20 flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Confirming Reservation...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Confirm Appointment & Generate Token
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default BookingModal;
