import React, { useState } from 'react';
import {
  Volume2,
  CheckCircle2,
  UserCheck,
  UserX,
  FileText,
  Clock,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Stethoscope,
} from 'lucide-react';

const DoctorQueueDesk = ({
  doctor,
  activeAppointment,
  todayWaitingCount,
  onCallNext,
  onUpdateStatus,
}) => {
  const [prescriptionNotes, setPrescriptionNotes] = useState(
    activeAppointment?.prescriptionNotes || ''
  );
  const [diagnosis, setDiagnosis] = useState(activeAppointment?.diagnosis || '');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [notesSuccess, setNotesSuccess] = useState(false);

  // Sync state if activeAppointment changes
  React.useEffect(() => {
    if (activeAppointment) {
      setPrescriptionNotes(activeAppointment.prescriptionNotes || '');
      setDiagnosis(activeAppointment.diagnosis || '');
    } else {
      setPrescriptionNotes('');
      setDiagnosis('');
    }
  }, [activeAppointment?._id]);

  const handleSaveNotes = async () => {
    if (!activeAppointment) return;
    setIsSavingNotes(true);
    await onUpdateStatus(activeAppointment._id, {
      prescriptionNotes,
      diagnosis,
    });
    setIsSavingNotes(false);
    setNotesSuccess(true);
    setTimeout(() => setNotesSuccess(false), 2500);
  };

  const handleComplete = async () => {
    if (!activeAppointment) return;
    await onUpdateStatus(activeAppointment._id, {
      status: 'completed',
      prescriptionNotes,
      diagnosis,
    });
  };

  const handleNoShow = async () => {
    if (!activeAppointment) return;
    await onUpdateStatus(activeAppointment._id, {
      status: 'no-show',
    });
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 shadow-xl border border-slate-700">
      {/* Console Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-700/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
            </span>
            <h2 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-teal-400" />
              Live OPD Consultation Desk
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {doctor?.hospitalClinicName} • {doctor?.roomNumber || 'Room 101'}
          </p>
        </div>

        {/* Quick Call Next Button */}
        <button
          onClick={onCallNext}
          disabled={todayWaitingCount === 0}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-teal-500/25 active:scale-95 transition-all"
        >
          <Volume2 className="w-4 h-4 animate-bounce" />
          <span>Call Next Token ({todayWaitingCount} Waiting)</span>
        </button>
      </div>

      {/* Active Consultation Body */}
      {activeAppointment ? (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Patient Profile & Token Highlight */}
          <div className="lg:col-span-5 bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={
                    activeAppointment.patient?.avatar ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'
                  }
                  alt={activeAppointment.patient?.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-teal-400 shadow-md"
                />
                <div>
                  <h3 className="text-base font-bold text-white">
                    {activeAppointment.patient?.name || 'Walk-in Patient'}
                  </h3>
                  <p className="text-xs text-slate-300">
                    {activeAppointment.patient?.gender || 'Patient'} • Phone:{' '}
                    {activeAppointment.patient?.phone || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Big Token Badge */}
              <div className="bg-teal-500/20 border border-teal-400/40 px-3 py-1.5 rounded-xl text-center">
                <span className="text-[10px] text-teal-300 uppercase tracking-wider font-bold block">
                  Token
                </span>
                <span className="text-2xl font-black text-teal-300 leading-none">
                  #{activeAppointment.tokenNumber}
                </span>
              </div>
            </div>

            {/* Symptoms & Reason */}
            <div className="space-y-2 pt-2 border-t border-white/10 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px] font-semibold">Chief Complaint / Reason:</span>
                <p className="font-semibold text-teal-200 mt-0.5">
                  {activeAppointment.reason || 'General checkup'}
                </p>
              </div>

              {activeAppointment.symptoms?.length > 0 && (
                <div>
                  <span className="text-slate-400 block text-[11px] font-semibold mb-1">
                    Reported Symptoms:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {activeAppointment.symptoms.map((s, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-800 text-teal-300 text-[10px] px-2 py-0.5 rounded-md border border-slate-700"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {activeAppointment.patientNotes && (
                <div>
                  <span className="text-slate-400 block text-[11px] font-semibold">Patient Note:</span>
                  <p className="text-slate-300 italic bg-black/20 p-2 rounded-lg text-[11px]">
                    "{activeAppointment.patientNotes}"
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between text-slate-400 text-[11px] pt-1">
                <span>Time Slot: {activeAppointment.timeSlot}</span>
                <span className="capitalize px-2 py-0.5 rounded-full bg-teal-900/60 text-teal-300 font-bold">
                  {activeAppointment.status}
                </span>
              </div>
            </div>

            {/* Quick Actions for this patient */}
            <div className="grid grid-cols-2 gap-2 pt-3">
              <button
                onClick={handleComplete}
                className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                Finish Consultation
              </button>
              <button
                onClick={handleNoShow}
                className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 hover:text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                <UserX className="w-4 h-4 text-rose-400" />
                Mark No-Show
              </button>
            </div>
          </div>

          {/* Clinical & Prescription Desk */}
          <div className="lg:col-span-7 bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  Clinical Notes & Rx Prescription
                </span>
                {notesSuccess && (
                  <span className="text-xs text-emerald-400 font-semibold animate-pulse">
                    ✓ Saved to Patient Record
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Diagnosis / Findings:
                  </label>
                  <input
                    type="text"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder="e.g. Mild Hypertension, Stage 1"
                    className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Rx Medication & Advice:
                  </label>
                  <textarea
                    rows={4}
                    value={prescriptionNotes}
                    onChange={(e) => setPrescriptionNotes(e.target.value)}
                    placeholder="Enter prescribed medications, dosage (e.g., Tab Lisinopril 10mg once daily), and follow-up advice..."
                    className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none font-mono"
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-700">
              <span className="text-[11px] text-slate-400">
                Prescription updates appear instantly on the patient's portal.
              </span>
              <button
                onClick={handleSaveNotes}
                disabled={isSavingNotes}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-xl transition-all"
              >
                {isSavingNotes ? 'Saving...' : 'Save Prescription'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State / Ready for Next */
        <div className="py-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-teal-400 shadow-inner">
            <Volume2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Chamber is Ready for Next Patient</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              {todayWaitingCount > 0
                ? `There are ${todayWaitingCount} patients waiting in today's virtual OPD queue. Click 'Call Next Token' to begin consultation.`
                : "No patients currently waiting in today's queue. New bookings will automatically appear here."}
            </p>
          </div>
          {todayWaitingCount > 0 && (
            <button
              onClick={onCallNext}
              className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-teal-500/25 transition-all inline-flex items-center gap-2"
            >
              <Volume2 className="w-4 h-4" />
              Call Next Patient (Token #{doctor?.currentCallingToken ? doctor.currentCallingToken + 1 : 1})
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default DoctorQueueDesk;
