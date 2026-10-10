import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  UploadCloud,
  ChevronRight,
  Calendar,
  Clock,
  Utensils,
  Droplets,
  HeartPulse,
  Sparkles,
  Plus,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import {
  fetchMedicationAlarms,
  fetchDietMenu,
  logWaterIntake,
  fetchAppointments,
  recordDoseTake,
} from '../services/healthApi';
import { apiRequest } from '../services/apiClient';
import { playAlarmChime } from '../utils/audio';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [alarms, setAlarms] = useState<any[]>([]);
  const [diet, setDiet] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [al, dt, ap, rep] = await Promise.all([
          fetchMedicationAlarms().catch(() => []),
          fetchDietMenu().catch(() => null),
          fetchAppointments().catch(() => []),
          apiRequest<any[]>('/reports').then((r) => r.data || []).catch(() => []),
        ]);
        setAlarms(al);
        setDiet(dt);
        setAppointments(ap);
        setReports(rep);
      } catch (err) {
        console.warn('Dashboard widgets error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const handleQuickTake = async (alarm: any) => {
    try {
      playAlarmChime();
      await recordDoseTake(alarm.id || alarm._id, 'TAKEN');
      setActionNotice(`Dose taken for ${alarm.medicineName}! Pill count updated.`);
      setAlarms((prev) =>
        prev.map((a) =>
          (a.id === alarm.id || a._id === alarm._id)
            ? { ...a, pillStock: Math.max(0, (a.pillStock || 1) - 1) }
            : a
        )
      );
      setTimeout(() => setActionNotice(null), 3500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickWater = async () => {
    try {
      const updated = await logWaterIntake(1);
      setDiet(updated);
      setActionNotice('+1 Glass logged! Stay hydrated.');
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const upcomingAppointments = appointments.filter((a) => a.status === 'UPCOMING');

  const stats = [
    { label: 'Total Medical Reports', value: `${reports.length}`, icon: FileText, change: reports.length === 0 ? 'Upload your first report' : 'Saved in MongoDB' },
    { label: 'Active Tablet Alarms', value: `${alarms.length}`, icon: Clock, change: alarms.length === 0 ? 'No active alarms' : 'Live audio chimes active' },
    { label: 'Upcoming Consultations', value: `${upcomingAppointments.length}`, icon: Calendar, change: upcomingAppointments.length === 0 ? 'No visits scheduled' : 'Tracked in schedule' },
    { label: 'Hydration Goal', value: `${diet?.waterLoggedGlasses ?? 0}/${diet?.dailyWaterTargetGlasses ?? 8}`, icon: Droplets, change: 'Glasses logged today' },
  ];

  const nextAlarm = alarms[0] || null;
  const nextAppointment = upcomingAppointments[0] || null;

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {actionNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Sparkles className="w-5 h-5 text-teal-400" />
          <span className="text-sm font-semibold">{actionNotice}</span>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 p-6 md:p-8 rounded-2xl text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md border border-slate-700/50">
        <div>
          <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome back</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {user?.fullName || 'Patient'}
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            {user?.email ? `Logged in as ${user.email}.` : ''} Your health records, alarms, and clinical trackers are synchronized in real-time with MongoDB Atlas.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/emergency"
            className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-all shadow-md"
          >
            <span>Emergency SOS</span>
          </Link>
          <Link
            to="/upload"
            className="flex items-center gap-2 px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shrink-0"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload New Report</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {stat.label}
                </span>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-teal-50 text-teal-700">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {stat.value}
                </span>
                <p className="text-xs mt-1 font-medium text-slate-500">{stat.change}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature Action Command Cards (4-Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tablet Alarm */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                Tablet Alarms
              </span>
              <Clock className="w-4 h-4 text-teal-600" />
            </div>

            {nextAlarm ? (
              <>
                <h3 className="font-bold text-sm text-slate-900 leading-snug line-clamp-1">
                  {nextAlarm.medicineName}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {nextAlarm.timings?.[0] || '08:00 AM'} • {nextAlarm.mealRelation?.replace('_', ' ') || 'After Meal'}
                </p>
                <p className="text-[11px] text-teal-800 font-semibold mt-2">
                  Stock: {nextAlarm.pillStock} pills remaining
                </p>
              </>
            ) : (
              <div className="py-2">
                <p className="text-xs text-slate-600 font-medium">No active tablet alarms</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Set timings to receive audio reminders.</p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <Link to="/medications" className="text-xs font-bold text-teal-600 hover:text-teal-700">
              {nextAlarm ? 'All Alarms →' : '+ Add Alarm →'}
            </Link>
            {nextAlarm && (
              <button
                onClick={() => handleQuickTake(nextAlarm)}
                className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow-2xs"
              >
                Take Now
              </button>
            )}
          </div>
        </div>

        {/* Card 2: Diet & Hydration */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Diet & Hydration
              </span>
              <Utensils className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 leading-snug">
              {diet?.planName || 'Clinical Diet Menu'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Target: {diet?.targetDailyCalories || 1750} kcal • Hydration Plan
            </p>
            <p className="text-[11px] text-sky-700 font-semibold mt-2">
              Water: {diet?.waterLoggedGlasses ?? 0} of {diet?.dailyWaterTargetGlasses ?? 8} glasses logged
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <Link to="/diet" className="text-xs font-bold text-emerald-600 hover:text-emerald-700">
              Diet Menu →
            </Link>
            <button
              onClick={handleQuickWater}
              className="px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold shadow-2xs"
            >
              +1 Glass
            </button>
          </div>
        </div>

        {/* Card 3: Doctor Appointment */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                Follow-up Tracker
              </span>
              <Calendar className="w-4 h-4 text-indigo-600" />
            </div>

            {nextAppointment ? (
              <>
                <h3 className="font-bold text-sm text-slate-900 leading-snug line-clamp-1">
                  {nextAppointment.doctorName}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {nextAppointment.date} at {nextAppointment.time}
                </p>
                <p className="text-[11px] text-slate-600 truncate mt-2">
                  {nextAppointment.reasonForVisit}
                </p>
              </>
            ) : (
              <div className="py-2">
                <p className="text-xs text-slate-600 font-medium">No upcoming consultations</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Schedule clinic visits & sync calendar.</p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <Link to="/appointments" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">
              {nextAppointment ? 'View Schedule →' : '+ Schedule Visit →'}
            </Link>
            {nextAppointment && (
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                Upcoming
              </span>
            )}
          </div>
        </div>

        {/* Card 4: Basic First Aid Guide */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                First Aid & SOS
              </span>
              <HeartPulse className="w-4 h-4 text-rose-600" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 leading-snug">
              Adult CPR & Choking Guide
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              110 BPM Metronome • Heimlich Maneuver
            </p>
            <p className="text-[11px] text-rose-600 font-semibold mt-2">
              8 Life-Saving protocols ready
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <Link to="/first-aid" className="text-xs font-bold text-rose-600 hover:text-rose-700">
              Open Manual →
            </Link>
            <Link
              to="/emergency"
              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-2xs"
            >
              Ambulance
            </Link>
          </div>
        </div>
      </div>

      {/* Real Reports Section */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Your Health Records</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Extracted medical documents stored in MongoDB Atlas
            </p>
          </div>
          <Link
            to="/timeline"
            className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
          >
            <span>View Timeline</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {reports.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <h4 className="font-bold text-sm text-slate-700">No medical reports uploaded yet</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Upload your lab test results, doctor prescriptions, or discharge summaries to see them organized here.
            </p>
            <Link
              to="/upload"
              className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Upload First Report</span>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {reports.map((report) => (
              <div
                key={report.id || report._id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">{report.originalFilename}</h4>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />{' '}
                        {new Date(report.createdAt || report.documentDate).toLocaleDateString()}
                      </span>
                      <span>•</span>
                      <span>{report.facility || 'Clinical Lab'}</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {report.processingStatus || 'COMPLETED'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <Link
                    to={`/reports/${report.id || report._id}`}
                    className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
