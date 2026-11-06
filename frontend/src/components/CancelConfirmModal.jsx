import React, { useState } from 'react';
import { AlertTriangle, X, Check, Calendar, Clock, User } from 'lucide-react';

const CancelConfirmModal = ({ appointment, isOpen, onClose, onConfirm }) => {
  const [reason, setReason] = useState('Schedule Conflict / Emergency');
  const [customReason, setCustomReason] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !appointment) return null;

  const reasons = [
    'Schedule Conflict / Emergency',
    'Feeling Better / Recovered',
    'Found earlier slot / different doctor',
    'Travel / Commute issues',
    'Other reason',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const finalReason = customReason.trim() ? customReason.trim() : reason;
    await onConfirm(appointment._id, finalReason);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 text-rose-600 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-rose-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Cancel Appointment?</h3>
            <p className="text-xs text-slate-500">
              Token #{appointment.tokenNumber} • {appointment.appointmentDate}
            </p>
          </div>
        </div>

        {/* Appointment details preview */}
        <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 mb-4 text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-slate-500">Doctor:</span>
            <span className="font-semibold text-slate-900">
              {appointment.doctor?.user?.name || 'Doctor'} ({appointment.doctor?.specialty})
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Slot & Token:</span>
            <span className="font-semibold text-slate-900">
              {appointment.timeSlot} • Token #{appointment.tokenNumber}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Hospital:</span>
            <span className="font-semibold text-slate-900">
              {appointment.doctor?.hospitalClinicName}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Reason for Cancellation
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              {reasons.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {reason === 'Other reason' && (
            <input
              type="text"
              placeholder="Specify cancellation details..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              required
              className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          )}

          <p className="text-[11px] text-slate-500 leading-relaxed bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-amber-800">
            ℹ️ Cancelling frees up your time slot and token immediately for other patients waiting in the queue.
          </p>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl"
            >
              Keep Appointment
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-600/20 flex items-center gap-1.5"
            >
              {loading ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Cancelling...
                </>
              ) : (
                'Confirm Cancellation'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CancelConfirmModal;
