import React, { useState, useEffect } from 'react';
import {
  Calendar,
  CalendarCheck,
  Plus,
  Clock,
  MapPin,
  Phone,
  FileText,
  User,
  CheckCircle2,
  AlertCircle,
  Download,
  Trash2,
  X,
  Stethoscope,
} from 'lucide-react';
import { Appointment } from '../types';
import {
  fetchAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from '../services/healthApi';

export const AppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'UPCOMING' | 'COMPLETED'>('UPCOMING');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    doctorName: '',
    specialty: 'Cardiology',
    clinicName: 'Apollo Health City',
    date: '2026-10-25',
    time: '11:00 AM',
    type: 'FOLLOW_UP' as const,
    reasonForVisit: 'Quarterly clinical consultation and lab review',
    doctorNotes: 'Bring latest prescription and fasting blood report',
    nextFollowUpDays: 90,
    location: 'Consultation Block, Room 204',
    contactPhone: '+91 40 2360 7777',
  });

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const data = await fetchAppointments();
      setAppointments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.doctorName.trim() || !formData.date) return;

    try {
      await createAppointment(formData);
      setIsModalOpen(false);
      setFormData({
        doctorName: '',
        specialty: 'Cardiology',
        clinicName: 'Apollo Health City',
        date: '2026-10-25',
        time: '11:00 AM',
        type: 'FOLLOW_UP',
        reasonForVisit: 'Quarterly clinical consultation and lab review',
        doctorNotes: 'Bring latest prescription and fasting blood report',
        nextFollowUpDays: 90,
        location: 'Consultation Block, Room 204',
        contactPhone: '+91 40 2360 7777',
      });
      showToast('Doctor appointment & follow-up tracker scheduled!');
      await loadAppointments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (id: string, status: 'COMPLETED' | 'CANCELLED') => {
    try {
      await updateAppointment(id, { status });
      showToast(`Appointment status updated to ${status}.`);
      await loadAppointments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this appointment?')) return;
    try {
      await deleteAppointment(id);
      setAppointments((prev) => prev.filter((a) => a.id !== id && a._id !== id));
      showToast('Appointment removed.');
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * Generates and downloads a standard RFC-5545 iCalendar (.ics) file
   */
  const handleDownloadCalendarIcs = (appt: Appointment) => {
    const startIso = appt.date ? appt.date.replace(/-/g, '') + 'T090000Z' : '20261014T090000Z';
    const endIso = appt.date ? appt.date.replace(/-/g, '') + 'T100000Z' : '20261014T100000Z';

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//MyHealthIO//Appointment Tracker//EN',
      'BEGIN:VEVENT',
      `SUMMARY:Medical Follow-up with ${appt.doctorName}`,
      `DESCRIPTION:${appt.reasonForVisit} - Notes: ${appt.doctorNotes || 'None'}`,
      `LOCATION:${appt.clinicName}, ${appt.location}`,
      `DTSTART:${startIso}`,
      `DTEND:${endIso}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `consultation_${appt.date}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Downloaded .ics calendar file! Open to add to Google/Apple Calendar.');
  };

  const filteredAppointments = appointments.filter((a) => {
    if (filter === 'UPCOMING') return a.status === 'UPCOMING';
    if (filter === 'COMPLETED') return a.status === 'COMPLETED';
    return true;
  });

  const upcomingCount = appointments.filter((a) => a.status === 'UPCOMING').length;

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CalendarCheck className="w-5 h-5 text-teal-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-teal-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.2),transparent_70%)] pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3 border border-indigo-500/30">
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>Doctor Follow-up & Clinic Tracker</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Consultations & Follow-up Tracker
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Track clinical review cycles, follow-up intervals, pre-consultation fasting requirements, and calendar sync.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Follow-up</span>
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
            <span className="text-[11px] text-slate-400">Upcoming Visits</span>
            <p className="text-xl font-bold text-indigo-400">{upcomingCount}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
            <span className="text-[11px] text-slate-400">Total Consultations</span>
            <p className="text-xl font-bold text-white">{appointments.length}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
            <span className="text-[11px] text-slate-400">Review Care Cycle</span>
            <p className="text-xl font-bold text-teal-400">90 Days</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
            <span className="text-[11px] text-slate-400">Calendar Sync</span>
            <p className="text-xl font-bold text-emerald-400">RFC-5545 .ICS</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('UPCOMING')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'UPCOMING'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Upcoming Consultations ({upcomingCount})
          </button>
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'ALL'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            All History ({appointments.length})
          </button>
          <button
            onClick={() => setFilter('COMPLETED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'COMPLETED'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Completed
          </button>
        </div>

        <span className="text-xs text-slate-400 font-medium hidden sm:inline">
          Connected to MongoDB Atlas appointment ledger
        </span>
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="py-16 text-center text-slate-400">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium">Loading appointments...</p>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700 text-base">No appointments in this category</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
            Schedule your next follow-up with your physician to track lab tests and recovery milestones.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all"
          >
            Schedule Consultation
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAppointments.map((appt) => {
            const isCompleted = appt.status === 'COMPLETED';
            return (
              <div
                key={appt.id || appt._id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  {/* Top Doctor & Badge Row */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold border border-indigo-100 shrink-0">
                        <Stethoscope className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-slate-900 leading-snug">
                          {appt.doctorName}
                        </h3>
                        <p className="text-xs font-medium text-indigo-600">{appt.specialty}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                          isCompleted
                            ? 'bg-slate-100 text-slate-600 border-slate-200'
                            : 'bg-teal-50 text-teal-700 border-teal-200'
                        }`}
                      >
                        {appt.status}
                      </span>
                      <button
                        onClick={() => handleDelete(appt.id || appt._id || '')}
                        className="p-1 text-slate-300 hover:text-rose-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Date, Time, and Clinic */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 mb-3 text-xs">
                    <div className="flex items-center justify-between font-medium text-slate-800">
                      <span className="flex items-center gap-1.5 font-bold text-slate-900">
                        <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                        {appt.date}
                      </span>
                      <span className="flex items-center gap-1.5 text-slate-600 font-mono">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {appt.time}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">
                        {appt.clinicName} • {appt.location}
                      </span>
                    </div>
                  </div>

                  {/* Reason for visit */}
                  <div className="mb-3">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                      PURPOSE OF VISIT
                    </span>
                    <p className="text-xs text-slate-700 font-medium">{appt.reasonForVisit}</p>
                  </div>

                  {/* Pre-visit instructions / Doctor notes */}
                  {appt.doctorNotes && (
                    <div className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-200/50 text-[11px] text-amber-900 leading-snug flex items-start gap-1.5 mb-4">
                      <FileText className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>{appt.doctorNotes}</span>
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
                  <button
                    onClick={() => handleDownloadCalendarIcs(appt)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5"
                    title="Export .ics file for Google / Apple Calendar"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Sync Calendar (.ics)</span>
                  </button>

                  {!isCompleted ? (
                    <button
                      onClick={() =>
                        handleStatusChange(appt.id || appt._id || '', 'COMPLETED')
                      }
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                      <span>Mark Done</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-medium">
                      Consultation Finished
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Appointment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-lg">Schedule Doctor Follow-up</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Doctor Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Sneha Reddy, MD (Cardiology)"
                  value={formData.doctorName}
                  onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Specialty</label>
                  <select
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="Cardiology">Cardiology</option>
                    <option value="Endocrinology">Endocrinology & Diabetes</option>
                    <option value="General Medicine">General Medicine</option>
                    <option value="Nephrology">Nephrology</option>
                    <option value="Ophthalmology">Ophthalmology</option>
                    <option value="Neurology">Neurology</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Hospital / Clinic
                  </label>
                  <input
                    type="text"
                    value={formData.clinicName}
                    onChange={(e) => setFormData({ ...formData, clinicName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Appointment Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Time *</label>
                  <input
                    type="text"
                    required
                    placeholder="10:30 AM"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reason for Consultation *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 3-month lipid panel review & prescription refill"
                  value={formData.reasonForVisit}
                  onChange={(e) => setFormData({ ...formData, reasonForVisit: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pre-Consultation Instructions & Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Fasting 10 hours required for fasting blood glucose test."
                  value={formData.doctorNotes}
                  onChange={(e) => setFormData({ ...formData, doctorNotes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition-all"
                >
                  Confirm & Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
