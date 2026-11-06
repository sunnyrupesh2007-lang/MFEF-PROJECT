import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  Calendar,
  Clock,
  LogOut,
  Menu,
  Shield,
  Stethoscope,
  User,
  X,
  ChevronDown,
} from 'lucide-react';

const Navbar = () => {
  const { user, isDoctor, isPatient, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
                <Activity className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl tracking-tight text-slate-900">
                    Medi<span className="text-teal-600">book</span>
                  </span>
                  <span className="bg-teal-50 text-teal-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-teal-200">
                    SMART QUEUE
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 -mt-1 hidden sm:block">
                  Hospital Outpatient Booking & Wait-Time Tracker
                </p>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                to="/doctors"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/doctors')
                    ? 'text-teal-700 bg-teal-50 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Find Doctors
              </Link>

              {user && isPatient && (
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/dashboard')
                      ? 'text-teal-700 bg-teal-50 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Calendar className="w-4 h-4 text-teal-600" />
                  My Appointments
                  <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-teal-100 text-teal-800 rounded-full font-bold">
                    Queue Live
                  </span>
                </Link>
              )}

              {user && isDoctor && (
                <Link
                  to="/doctor/dashboard"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/doctor/dashboard')
                      ? 'text-teal-700 bg-teal-50 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Stethoscope className="w-4 h-4 text-cyan-600" />
                  Doctor Dashboard
                  <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-cyan-100 text-cyan-800 rounded-full font-bold">
                    OPD Console
                  </span>
                </Link>
              )}
            </div>
          </div>

          {/* Right Section / Auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full hover:bg-slate-100 border border-slate-200 transition-colors"
                >
                  <img
                    src={user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-300 bg-teal-50"
                  />
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-800 leading-tight">
                      {user.name}
                    </p>
                    <span
                      className={`inline-block text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                        isDoctor
                          ? 'bg-blue-100 text-blue-800'
                          : user.role === 'student'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {user.email}
                      </p>
                    </div>

                    {isPatient && (
                      <Link
                        to="/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <Calendar className="w-4 h-4 text-teal-600" />
                        Patient Appointments & Queue
                      </Link>
                    )}

                    {isDoctor && (
                      <Link
                        to="/doctor/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <Stethoscope className="w-4 h-4 text-cyan-600" />
                        Doctor Queue Console
                      </Link>
                    )}

                    <Link
                      to="/doctors"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <Clock className="w-4 h-4 text-slate-400" />
                      Browse Doctors & Slots
                    </Link>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition-all shadow-teal-500/20 hover:shadow-teal-500/40"
                >
                  Patient Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/doctors"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Find Doctors
          </Link>

          {user && isPatient && (
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
            >
              My Appointments & Queue
            </Link>
          )}

          {user && isDoctor && (
            <Link
              to="/doctor/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
            >
              Doctor Queue Dashboard
            </Link>
          )}

          <div className="pt-4 border-t border-slate-100">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-3">
                  <img
                    src={user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'}
                    alt={user.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-semibold text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-rose-600 bg-rose-50"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 text-sm font-semibold border border-slate-300 rounded-lg text-slate-700"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 text-sm font-semibold bg-teal-600 text-white rounded-lg"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
