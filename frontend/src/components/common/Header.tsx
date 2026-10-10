import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, AlertTriangle, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { NotificationDropdown } from './NotificationDropdown';

export const Header: React.FC = () => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold px-2.5 py-1 bg-teal-50 text-teal-700 border border-teal-200 rounded-full flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-teal-600" />
          FHIR Aligned Sandbox
        </span>
        {user?.mockAbhaId && (
          <span className="text-xs text-slate-500 font-mono hidden sm:inline-block">
            ABHA: <strong className="text-slate-700">{user.mockAbhaId}</strong>
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Emergency SOS button */}
        <Link
          to="/emergency"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all animate-pulse hover:animate-none"
          title="Emergency Ambulance & SOS"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-200" />
          <span className="hidden sm:inline">SOS</span> Ambulance
        </Link>

        {/* Live Notifications Dropdown */}
        <NotificationDropdown />

        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-medium text-sm">
            {user?.fullName ? user.fullName[0].toUpperCase() : <UserIcon className="w-4 h-4" />}
          </div>
          <div className="text-left hidden md:block">
            <p className="text-sm font-medium text-slate-800 leading-tight">{user?.fullName || 'Demo Patient'}</p>
            <p className="text-xs text-slate-500">{user?.email || 'patient@myhealthio.dev'}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
