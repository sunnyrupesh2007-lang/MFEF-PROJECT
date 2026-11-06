import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { doctorDashboardService } from '../services/api';
import DoctorQueueDesk from '../components/DoctorQueueDesk';
import {
  Users,
  Clock,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  Calendar,
  Search,
  Filter,
  RefreshCw,
  FileText,
  Stethoscope,
  XCircle,
} from 'lucide-react';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState('');

  const loadDashboardData = async () => {
    try {
      const [overviewData, aptsData] = await Promise.all([
        doctorDashboardService.getOverview(),
        doctorDashboardService.getAppointments({ status: filterStatus, search: searchQuery }),
      ]);
      setOverview(overviewData);
      setAppointments(aptsData.appointments || []);
    } catch (err) {
      console.error('Error loading doctor dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    // Auto-refresh every 12 seconds for real-time queue synchronization
    const timer = setInterval(() => {
      loadDashboardData();
    }, 12000);
    return () => clearInterval(timer);
  }, [filterStatus, searchQuery]);

  const handleCallNext = async () => {
    try {
      const res = await doctorDashboardService.callNextPatient();
      setNotification(res.message);
      loadDashboardData();
      setTimeout(() => setNotification(''), 4000);
    } catch (err) {
      alert(err.message || 'Could not advance queue');
    }
  };

  const handleUpdateStatus = async (id, statusData) => {
    try {
      const res = await doctorDashboardService.updateAppointmentStatus(id, statusData);
      setNotification(res.message);
      loadDashboardData();
      setTimeout(() => setNotification(''), 4000);
    } catch (err) {
      alert(err.message || 'Error updating status');
    }
  };

  const stats = overview?.stats || {
    todayTotal: 0,
    todayWaiting: 0,
    todayInConsultation: 0,
    todayCompleted: 0,
    todayRevenue: 0,
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Notification Alert */}
        {notification && (
          <div className="p-4 rounded-2xl bg-teal-600 text-white font-semibold text-xs flex items-center justify-between shadow-lg shadow-teal-600/20 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{notification}</span>
            </div>
            <button onClick={() => setNotification('')} className="opacity-80 hover:opacity-100">
              ✕
            </button>
          </div>
        )}

        {/* Dashboard Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={
                user?.avatar ||
                'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200'
              }
              alt={user?.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-cyan-100 shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 uppercase tracking-wider">
                  Doctor OPD Station
                </span>
                <span className="text-xs text-slate-500">
                  Room: {overview?.doctor?.roomNumber || 'Chamber 101'}
                </span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 mt-0.5">
                {user?.name}
              </h1>
              <p className="text-xs text-slate-500">
                {overview?.doctor?.specialty} • {overview?.doctor?.hospitalClinicName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadDashboardData}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="Refresh Queue"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Sync Queue</span>
            </button>
          </div>
        </div>

        {/* Stat Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Today's Visits</span>
              <Calendar className="w-4 h-4 text-teal-600" />
            </div>
            <p className="text-2xl font-black text-slate-900 mt-2">{stats.todayTotal}</p>
            <span className="text-[11px] text-slate-400">Total appointments booked</span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-amber-500">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Waiting in Queue
              </span>
              <Clock className="w-4 h-4" />
            </div>
            <p className="text-2xl font-black text-amber-600 mt-2">{stats.todayWaiting}</p>
            <span className="text-[11px] text-slate-400">Patients in virtual line</span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-teal-500">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                In Chamber
              </span>
              <Users className="w-4 h-4" />
            </div>
            <p className="text-2xl font-black text-teal-600 mt-2">{stats.todayInConsultation}</p>
            <span className="text-[11px] text-slate-400">Current consultation</span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-emerald-500">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Completed
              </span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <p className="text-2xl font-black text-emerald-600 mt-2">{stats.todayCompleted}</p>
            <span className="text-[11px] text-slate-400">Patients treated today</span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between text-blue-500">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Est. Revenue
              </span>
              <DollarSign className="w-4 h-4" />
            </div>
            <p className="text-2xl font-black text-slate-900 mt-2">${stats.todayRevenue}</p>
            <span className="text-[11px] text-slate-400">From completed OPD visits</span>
          </div>
        </div>

        {/* Live Queue Controller Desk */}
        <DoctorQueueDesk
          doctor={overview?.doctor}
          activeAppointment={overview?.activeAppointment}
          todayWaitingCount={stats.todayWaiting}
          onCallNext={handleCallNext}
          onUpdateStatus={handleUpdateStatus}
        />

        {/* Appointment Roster & Search Table */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Patient Roster & Appointment Records</h2>
              <p className="text-xs text-slate-500">Manage statuses, review patient symptoms, and issue advice.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Patient name or Token #..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="booked">Waiting (Booked)</option>
                <option value="in-consultation">In Consultation</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              Loading patient appointments...
            </div>
          ) : appointments.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No appointments found matching this filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3">Token</th>
                    <th className="py-3 px-3">Patient</th>
                    <th className="py-3 px-3">Date & Slot</th>
                    <th className="py-3 px-3">Chief Complaint</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {appointments.map((apt) => (
                    <tr key={apt._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3">
                        <span className="font-extrabold text-teal-700 bg-teal-50 px-2 py-1 rounded-lg border border-teal-200">
                          #{apt.tokenNumber}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={
                              apt.patient?.avatar ||
                              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'
                            }
                            alt={apt.patient?.name}
                            className="w-7 h-7 rounded-full object-cover"
                          />
                          <div>
                            <span className="font-bold text-slate-800 block">
                              {apt.patient?.name || 'Walk-in'}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {apt.patient?.phone || 'No phone'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-700 block">{apt.appointmentDate}</span>
                        <span className="text-slate-400 text-[11px]">{apt.timeSlot}</span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-medium text-slate-800 block truncate max-w-xs">
                          {apt.reason}
                        </span>
                        {apt.symptoms?.length > 0 && (
                          <span className="text-[10px] text-slate-400 truncate block">
                            {apt.symptoms.join(', ')}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full font-bold uppercase text-[9px] ${
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
                      </td>

                      <td className="py-3 px-3 text-right">
                        {apt.status === 'booked' && (
                          <button
                            onClick={() => handleUpdateStatus(apt._id, { status: 'in-consultation' })}
                            className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg text-[11px]"
                          >
                            Call Inside
                          </button>
                        )}
                        {apt.status === 'in-consultation' && (
                          <button
                            onClick={() => handleUpdateStatus(apt._id, { status: 'completed' })}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px]"
                          >
                            Mark Done
                          </button>
                        )}
                        {apt.status === 'completed' && (
                          <span className="text-emerald-600 text-[11px] font-semibold">
                            ✓ Done
                          </span>
                        )}
                        {apt.status === 'cancelled' && (
                          <span className="text-rose-500 text-[11px] font-semibold">
                            Cancelled
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
