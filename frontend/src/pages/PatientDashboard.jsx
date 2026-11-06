import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { appointmentService } from '../services/api';
import QueueTracker from '../components/QueueTracker';
import CancelConfirmModal from '../components/CancelConfirmModal';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  FileText,
  AlertCircle,
  User,
  PlusCircle,
  Stethoscope,
  RefreshCw,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'completed' | 'cancelled'
  const [cancelModalAppointment, setCancelModalAppointment] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await appointmentService.getMyAppointments();
      setAppointments(res.appointments || []);
    } catch (err) {
      console.error('Error loading appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    // Auto-refresh queue every 15 seconds
    const interval = setInterval(() => {
      fetchAppointments();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleCancelConfirm = async (id, reason) => {
    try {
      await appointmentService.cancelAppointment(id, reason);
      setToastMessage('Appointment cancelled successfully. Slot freed.');
      setCancelModalAppointment(null);
      fetchAppointments();
      setTimeout(() => setToastMessage(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to cancel appointment');
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    if (activeTab === 'active') {
      return apt.status === 'booked' || apt.status === 'in-consultation';
    }
    if (activeTab === 'completed') {
      return apt.status === 'completed';
    }
    if (activeTab === 'cancelled') {
      return apt.status === 'cancelled' || apt.status === 'no-show';
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-teal-600 text-white font-semibold text-xs flex items-center justify-between shadow-lg shadow-teal-600/20 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage('')} className="opacity-80 hover:opacity-100">
              ✕
            </button>
          </div>
        )}

        {/* Dashboard Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'}
              alt={user?.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-teal-100 shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    user?.role === 'student'
                      ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {user?.role === 'student' ? 'Student Health Portal' : 'Patient Portal'}
                </span>
                {user?.role === 'student' && user?.studentId && (
                  <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    Student ID: {user.studentId}
                  </span>
                )}
                <span className="text-xs text-slate-400">UID: {user?.id?.substring(0, 8)}</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 mt-0.5">
                Welcome, {user?.name}
              </h1>
              <p className="text-xs text-slate-500">
                Track your OPD queue status in real-time, view prescriptions, or manage bookings.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchAppointments}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
              title="Refresh queue"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <Link
              to="/doctors"
              className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md shadow-teal-500/20 flex items-center gap-2 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              Book New Appointment
            </Link>
          </div>
        </div>

        {/* Tabs Filter */}
        <div className="flex border-b border-slate-200 mb-6 gap-6 text-xs font-bold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('active')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'active'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Active & Live Queue (
            {appointments.filter((a) => a.status === 'booked' || a.status === 'in-consultation').length}
            )
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'completed'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Past Consultations & Rx (
            {appointments.filter((a) => a.status === 'completed').length}
            )
          </button>

          <button
            onClick={() => setActiveTab('cancelled')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'cancelled'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <XCircle className="w-4 h-4" />
            Cancelled & No-Show (
            {appointments.filter((a) => a.status === 'cancelled' || a.status === 'no-show').length}
            )
          </button>
        </div>

        {/* Appointments List */}
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-xs">
            <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading your appointments and queue status...
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              No {activeTab} appointments found
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {activeTab === 'active'
                ? "You don't have any upcoming doctor appointments. Ready to schedule a consultation?"
                : 'Your history will appear here once appointments are completed.'}
            </p>
            {activeTab === 'active' && (
              <Link
                to="/doctors"
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                Browse Available Doctors
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredAppointments.map((apt) => {
              const isToday = apt.appointmentDate === new Date().toISOString().split('T')[0];

              return (
                <div
                  key={apt._id}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:border-slate-300 transition-all space-y-5"
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div className="flex items-start gap-4">
                      <img
                        src={
                          apt.doctor?.user?.avatar ||
                          'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200'
                        }
                        alt={apt.doctor?.user?.name}
                        className="w-14 h-14 rounded-2xl object-cover border border-slate-200"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                            {apt.doctor?.specialty}
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                              apt.status === 'booked'
                                ? 'bg-amber-100 text-amber-800'
                                : apt.status === 'in-consultation'
                                ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                                : apt.status === 'completed'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {apt.status}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-slate-900 mt-1">
                          {apt.doctor?.user?.name}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {apt.doctor?.hospitalClinicName} • {apt.doctor?.roomNumber}
                        </p>
                      </div>
                    </div>

                    {/* Slot & Token details */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                        <Calendar className="w-4 h-4 text-teal-600" />
                        <span>{apt.appointmentDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 sm:mt-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{apt.timeSlot}</span>
                      </div>
                      <div className="text-xs font-black text-teal-700 bg-teal-50 px-2.5 py-1 rounded-xl mt-1.5 border border-teal-200">
                        Token #{apt.tokenNumber}
                      </div>
                    </div>
                  </div>

                  {/* Real-life Queue Tracker for Active / Today's Bookings */}
                  {apt.queueInfo && (
                    <QueueTracker
                      queueInfo={apt.queueInfo}
                      doctorName={apt.doctor?.user?.name}
                      roomNumber={apt.doctor?.roomNumber}
                      status={apt.status}
                    />
                  )}

                  {/* Reason & Reported Symptoms */}
                  <div className="bg-slate-50 rounded-2xl p-4 text-xs text-slate-600 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <strong className="text-slate-800">Chief Reason:</strong> {apt.reason}
                      </div>
                      {apt.symptoms?.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <strong className="text-slate-700">Symptoms:</strong>
                          {apt.symptoms.map((s, idx) => (
                            <span
                              key={idx}
                              className="bg-white border border-slate-200 px-2 py-0.5 rounded text-[11px]"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {apt.patientNotes && (
                      <div className="text-slate-500 italic pt-1 border-t border-slate-200/60">
                        Notes: "{apt.patientNotes}"
                      </div>
                    )}
                  </div>

                  {/* Doctor's Prescription & Clinical Notes (if completed) */}
                  {apt.status === 'completed' && (apt.prescriptionNotes || apt.diagnosis) && (
                    <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 text-xs space-y-2">
                      <div className="flex items-center gap-1.5 text-blue-900 font-bold uppercase tracking-wider text-[11px]">
                        <FileText className="w-4 h-4 text-blue-600" />
                        Doctor's Clinical Notes & Prescription
                      </div>
                      {apt.diagnosis && (
                        <p className="text-slate-800">
                          <strong>Diagnosis:</strong> {apt.diagnosis}
                        </p>
                      )}
                      {apt.prescriptionNotes && (
                        <div className="bg-white p-3 rounded-xl border border-blue-100 font-mono text-slate-700 whitespace-pre-line text-xs">
                          {apt.prescriptionNotes}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Cancellation Reason note */}
                  {apt.status === 'cancelled' && apt.cancellationReason && (
                    <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-3 rounded-xl">
                      <strong>Cancellation Note:</strong> {apt.cancellationReason} (by {apt.cancelledBy})
                    </div>
                  )}

                  {/* Action Bar */}
                  {(apt.status === 'booked' || apt.status === 'in-consultation') && (
                    <div className="flex items-center justify-end pt-2">
                      <button
                        onClick={() => setCancelModalAppointment(apt)}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-4 py-2 rounded-xl transition-colors border border-rose-200"
                      >
                        Cancel Appointment
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      <CancelConfirmModal
        appointment={cancelModalAppointment}
        isOpen={Boolean(cancelModalAppointment)}
        onClose={() => setCancelModalAppointment(null)}
        onConfirm={handleCancelConfirm}
      />
    </div>
  );
};

export default PatientDashboard;
