import React from 'react';
import { Activity, Heart, Shield, Clock, PhoneCall } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-white">
                <Activity className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                Medi<span className="text-teal-400">book</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Eliminating physical hospital queues with smart outpatient appointment scheduling,
              live token broadcasting, and real-time wait-time tracking for doctors and patients.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                <Clock className="w-4 h-4 text-teal-400" />
                <span>Zero Physical Queue Waiting</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Verified Medical Specialists</span>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/doctors" className="hover:text-teal-400 transition-colors">
                  Find Specialists
                </Link>
              </li>
              <li>
                <Link to="/doctors?specialty=Cardiologist" className="hover:text-teal-400 transition-colors">
                  Cardiology Clinic
                </Link>
              </li>
              <li>
                <Link to="/doctors?specialty=Pediatrician" className="hover:text-teal-400 transition-colors">
                  Pediatric Care
                </Link>
              </li>
              <li>
                <Link to="/doctors?specialty=General Physician" className="hover:text-teal-400 transition-colors">
                  General Medicine OPD
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-teal-400 transition-colors">
                  Doctor & Clinic Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Emergency & Support */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Hospital Support
            </h4>
            <div className="space-y-3 text-sm">
              <p className="text-slate-400 text-xs">
                For life-threatening medical emergencies, please dial your local emergency services immediately.
              </p>
              <div className="flex items-center gap-2.5 text-emerald-400 font-semibold bg-emerald-950/40 border border-emerald-900/50 p-2.5 rounded-lg">
                <PhoneCall className="w-4 h-4" />
                <span>24/7 Helpline: 1-800-MEDIBOOK</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Medibook Health Systems. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for modern healthcare
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
