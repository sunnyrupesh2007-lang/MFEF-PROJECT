import React from 'react';
import { Users, Clock, AlertCircle, CheckCircle, ArrowRight, Volume2, ShieldAlert } from 'lucide-react';

const QueueTracker = ({ queueInfo, doctorName, roomNumber, status }) => {
  if (!queueInfo && status !== 'in-consultation') return null;

  const currentToken = queueInfo?.currentCallingToken || 0;
  const yourToken = queueInfo?.yourToken || 0;
  const patientsAhead = queueInfo?.patientsAhead ?? 0;
  const waitMins = queueInfo?.estimatedWaitMinutes ?? 0;
  const isNowServing = status === 'in-consultation' || queueInfo?.isNowServing;
  const isNext = queueInfo?.isNext;

  return (
    <div className={`rounded-2xl p-4 sm:p-5 border transition-all ${
      isNowServing
        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg border-emerald-400'
        : isNext
        ? 'bg-amber-500 text-white shadow-lg border-amber-400'
        : 'bg-slate-900 text-white shadow-md border-slate-800'
    }`}>
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-3 border-b border-white/20">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
          </span>
          <span className="text-xs font-bold uppercase tracking-wider">
            {isNowServing
              ? 'CURRENTLY IN CONSULTATION'
              : isNext
              ? 'YOU ARE NEXT IN LINE'
              : 'LIVE VIRTUAL QUEUE TRACKER'}
          </span>
        </div>
        <span className="text-xs font-semibold opacity-90">
          {roomNumber || 'OPD Room'}
        </span>
      </div>

      {/* Main Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
        {/* Your Token */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center border border-white/10">
          <p className="text-[10px] uppercase tracking-wider font-semibold opacity-80">Your Token</p>
          <p className="text-2xl sm:text-3xl font-black mt-0.5">#{yourToken}</p>
        </div>

        {/* Currently Calling */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center border border-white/10">
          <p className="text-[10px] uppercase tracking-wider font-semibold opacity-80">Now Calling</p>
          <p className="text-2xl sm:text-3xl font-black mt-0.5 text-amber-200">
            {currentToken > 0 ? `#${currentToken}` : 'Starting'}
          </p>
        </div>

        {/* Patients Ahead */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center border border-white/10">
          <p className="text-[10px] uppercase tracking-wider font-semibold opacity-80">Patients Ahead</p>
          <p className="text-2xl sm:text-3xl font-black mt-0.5">
            {isNowServing ? '0' : patientsAhead}
          </p>
        </div>

        {/* Estimated Wait */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center border border-white/10">
          <p className="text-[10px] uppercase tracking-wider font-semibold opacity-80">Est. Wait</p>
          <p className="text-2xl sm:text-3xl font-black mt-0.5">
            {isNowServing ? 'Active' : `${waitMins}m`}
          </p>
        </div>
      </div>

      {/* Smart Advice Alert */}
      <div className="bg-black/20 rounded-xl p-3 text-xs flex items-center gap-2.5">
        {isNowServing ? (
          <>
            <Volume2 className="w-4 h-4 text-emerald-200 flex-shrink-0 animate-bounce" />
            <span>
              <strong>Dr. {doctorName}</strong> is consulting you now. Please step into{' '}
              <strong>{roomNumber}</strong>!
            </span>
          </>
        ) : isNext ? (
          <>
            <AlertCircle className="w-4 h-4 text-amber-200 flex-shrink-0 animate-pulse" />
            <span>
              {currentToken > 0 ? (
                <>Token #{currentToken} is concluding. Please be ready near <strong>{roomNumber}</strong>.</>
              ) : (
                <>Consultations will begin shortly. You are the <strong>first patient (Token #{yourToken})</strong>! Please be ready near <strong>{roomNumber}</strong>.</>
              )}
            </span>
          </>
        ) : (
          <>
            <Clock className="w-4 h-4 text-teal-300 flex-shrink-0" />
            <span>
              No physical hospital queue waiting needed! Relax comfortably; we estimate your turn in{' '}
              <strong>~{waitMins} minutes</strong>.
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default QueueTracker;
