import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UploadCloud,
  Activity,
  Clock,
  Utensils,
  CalendarCheck,
  AlertTriangle,
  HeartPulse,
  User,
  Settings,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const Sidebar: React.FC = () => {
  const { logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const navSections = [
    {
      title: 'OVERVIEW',
      items: [
        { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
        { name: 'Upload Report', to: '/upload', icon: UploadCloud },
        { name: 'Health Timeline', to: '/timeline', icon: Activity },
      ],
    },
    {
      title: 'DAILY CARE & TRACKING',
      items: [
        { name: 'Tablet Timings & Alarms', to: '/medications', icon: Clock },
        { name: 'Diet Menu & Hydration', to: '/diet', icon: Utensils },
        { name: 'Follow-ups & Appointments', to: '/appointments', icon: CalendarCheck },
      ],
    },
    {
      title: 'EMERGENCY & SAFETY',
      items: [
        { name: 'Ambulance Assistance (SOS)', to: '/emergency', icon: AlertTriangle, highlight: true },
        { name: 'Basic First Aid Guide', to: '/first-aid', icon: HeartPulse },
      ],
    },
    {
      title: 'PREFERENCES',
      items: [
        { name: 'Health Profile', to: '/profile', icon: User },
        { name: 'Settings', to: '/settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col justify-between border-r border-slate-800 shrink-0 select-none">
      <div className="overflow-y-auto max-h-[calc(100vh-140px)]">
        {/* Brand */}
        <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
          <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center font-bold text-slate-900 text-lg shadow-sm">
            +
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-white leading-none">MyHealthIO</h1>
            <p className="text-[11px] text-teal-400 font-medium">Health Copilot</p>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="p-3 space-y-4">
          {navSections.map((section) => (
            <div key={section.title}>
              <div className="px-3 pb-1 text-[10px] font-bold text-slate-400 tracking-wider">
                {section.title}
              </div>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          isActive
                            ? item.highlight
                              ? 'bg-rose-600 text-white shadow-sm'
                              : 'bg-teal-600 text-white shadow-sm'
                            : item.highlight
                            ? 'text-rose-300 hover:bg-rose-950/40 hover:text-white'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.name}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info & Logout */}
      <div className="p-4 border-t border-slate-800 space-y-3">
        <div className="bg-slate-800/80 rounded-lg p-3 text-xs text-slate-300 border border-slate-700/60">
          <div className="flex items-center gap-1.5 text-teal-400 font-medium mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Copilot Active</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Clinical guardrails enabled. Grounded interpretation.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-400 hover:text-red-400 hover:bg-slate-800/50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
