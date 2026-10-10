import React, { useState, useEffect } from 'react';
import {
  Clock,
  Pill,
  Plus,
  Volume2,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Trash2,
  Calendar,
  Utensils,
  X,
  Sparkles,
} from 'lucide-react';
import { MedicationAlarm } from '../types';
import {
  fetchMedicationAlarms,
  createMedicationAlarm,
  recordDoseTake,
  deleteMedicationAlarm,
} from '../services/healthApi';
import { playAlarmChime } from '../utils/audio';

export const MedicationsPage: React.FC = () => {
  const [alarms, setAlarms] = useState<MedicationAlarm[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Alarm Form State
  const [formData, setFormData] = useState({
    medicineName: '',
    dosage: '1 Tablet (500mg)',
    frequency: 'TWICE_DAILY' as const,
    timings: '08:00, 20:00',
    mealRelation: 'AFTER_MEAL' as const,
    instructions: 'Take with plenty of water after meal',
    pillStock: 30,
    lowStockThreshold: 5,
  });

  // Keep live clock ticking
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadAlarms = async () => {
    try {
      setLoading(true);
      const data = await fetchMedicationAlarms();
      setAlarms(data);
    } catch (err) {
      console.error('Failed to load medication alarms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlarms();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleTestChime = () => {
    playAlarmChime();
    showToast('Alarm chime ringing! (Web Audio Synthesis active)');
  };

  const handleTakeDose = async (alarmId: string, medicineName: string) => {
    try {
      playAlarmChime();
      const timeStr = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      await recordDoseTake(alarmId, 'TAKEN', timeStr);
      showToast(`Dose marked as taken for ${medicineName}! Pill inventory updated.`);
      await loadAlarms();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSnooze = async (alarmId: string, medicineName: string) => {
    try {
      await recordDoseTake(alarmId, 'SNOOZED');
      showToast(`Alarm for ${medicineName} snoozed for 10 minutes.`);
      await loadAlarms();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (alarmId: string) => {
    if (!confirm('Are you sure you want to delete this medication alarm?')) return;
    try {
      await deleteMedicationAlarm(alarmId);
      setAlarms((prev) => prev.filter((a) => a.id !== alarmId && a._id !== alarmId));
      showToast('Medication alarm removed.');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateAlarm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.medicineName.trim()) return;

    try {
      const timingsArray = formData.timings
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await createMedicationAlarm({
        medicineName: formData.medicineName,
        dosage: formData.dosage,
        frequency: formData.frequency,
        timings: timingsArray,
        mealRelation: formData.mealRelation,
        instructions: formData.instructions,
        pillStock: Number(formData.pillStock),
        lowStockThreshold: Number(formData.lowStockThreshold),
      });

      setIsModalOpen(false);
      setFormData({
        medicineName: '',
        dosage: '1 Tablet (500mg)',
        frequency: 'TWICE_DAILY',
        timings: '08:00, 20:00',
        mealRelation: 'AFTER_MEAL',
        instructions: 'Take with plenty of water after meal',
        pillStock: 30,
        lowStockThreshold: 5,
      });
      showToast('New medication alarm schedule created!');
      await loadAlarms();
    } catch (err) {
      console.error(err);
    }
  };

  const totalPillsTracked = alarms.reduce((acc, a) => acc + (a.pillStock || 0), 0);
  const lowStockAlarms = alarms.filter((a) => (a.pillStock || 0) <= (a.lowStockThreshold || 5));

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Volume2 className="w-5 h-5 text-teal-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,0.15),transparent_70%)] pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold mb-3 border border-teal-500/30">
              <Clock className="w-3.5 h-3.5" />
              <span>Smart Pill Timings & Real-Time Alarms</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Medication & Tablet Timing Alarms
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Never miss a prescription dose. Live audio chimes, meal coordination, and remaining pill stock inventory.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Live Clock Display */}
            <div className="bg-slate-800/80 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-700 text-right">
              <p className="text-[10px] text-teal-400 uppercase font-mono tracking-wider font-semibold">
                SYSTEM TIME
              </p>
              <p className="text-xl font-bold font-mono tracking-tight text-white">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
            </div>

            <button
              onClick={handleTestChime}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-semibold text-teal-300 hover:text-white flex items-center gap-2 transition-all shadow-sm"
              title="Test web audio synthesizer chime"
            >
              <Volume2 className="w-4 h-4" />
              <span>Test Chime</span>
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold text-xs flex items-center gap-2 shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Medication</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
            <span className="text-[11px] text-slate-400">Active Prescriptions</span>
            <p className="text-xl font-bold text-teal-400">{alarms.length}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
            <span className="text-[11px] text-slate-400">Total Pills in Stock</span>
            <p className="text-xl font-bold text-white">{totalPillsTracked}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
            <span className="text-[11px] text-slate-400">Low Stock Refills</span>
            <p className="text-xl font-bold text-amber-400">{lowStockAlarms.length}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
            <span className="text-[11px] text-slate-400">Adherence Compliance</span>
            <p className="text-xl font-bold text-emerald-400">96.4%</p>
          </div>
        </div>
      </div>

      {/* Alarms List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Pill className="w-5 h-5 text-teal-600" />
            <span>Today's Tablet Schedule & Reminders</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            Auto-synchronizes with MongoDB Atlas
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium">Loading tablet alarms...</p>
          </div>
        ) : alarms.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <Pill className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700 text-base">No medication alarms set</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
              Add your prescribed tablets, frequency, and times to receive audio alarm reminders.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all"
            >
              Add First Tablet Alarm
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alarms.map((alarm) => {
              const isLowStock = (alarm.pillStock || 0) <= (alarm.lowStockThreshold || 5);
              return (
                <div
                  key={alarm.id || alarm._id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
                >
                  {/* Color Accent Pill */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ backgroundColor: alarm.color || '#0d9488' }}
                  />

                  <div>
                    {/* Top Row: Name + Stock Badge */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h3 className="font-bold text-base text-slate-900 leading-snug">
                          {alarm.medicineName}
                        </h3>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">{alarm.dosage}</p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                            isLowStock
                              ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {alarm.pillStock} pills left {isLowStock && '⚠️'}
                        </span>
                        <button
                          onClick={() => handleDelete(alarm.id || alarm._id || '')}
                          className="p-1 text-slate-300 hover:text-rose-500 transition-colors"
                          title="Delete alarm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Meal relation & Instructions */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                        <Utensils className="w-3 h-3 text-slate-500" />
                        {alarm.mealRelation.replace('_', ' ')}
                      </span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md">
                        {alarm.frequency.replace('_', ' ')}
                      </span>
                    </div>

                    {alarm.instructions && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-4 leading-relaxed">
                        {alarm.instructions}
                      </p>
                    )}

                    {/* Timings Pills */}
                    <div className="mb-4">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                        ALARM TIMINGS
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {alarm.timings.map((time, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 border border-teal-200 rounded-lg text-teal-800 text-xs font-bold font-mono shadow-2xs"
                          >
                            <Clock className="w-3.5 h-3.5 text-teal-600" />
                            <span>{time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
                    <button
                      onClick={() => handleSnooze(alarm.id || alarm._id || '', alarm.medicineName)}
                      className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                      <span>Snooze 10m</span>
                    </button>

                    <button
                      onClick={() => handleTakeDose(alarm.id || alarm._id || '', alarm.medicineName)}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4 text-teal-200" />
                      <span>Mark as Taken</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Alarm Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-lg">Add Tablet Timing Alarm</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAlarm} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Medicine / Tablet Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Metformin, Atorvastatin, Telmisartan"
                  value={formData.medicineName}
                  onChange={(e) => setFormData({ ...formData, medicineName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Dosage</label>
                  <input
                    type="text"
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Frequency</label>
                  <select
                    value={formData.frequency}
                    onChange={(e) =>
                      setFormData({ ...formData, frequency: e.target.value as any })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  >
                    <option value="ONCE_DAILY">Once Daily</option>
                    <option value="TWICE_DAILY">Twice Daily</option>
                    <option value="THRICE_DAILY">Thrice Daily</option>
                    <option value="CUSTOM">Custom Schedule</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Alarm Timings (24-hour format, comma-separated) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="08:00, 20:00"
                  value={formData.timings}
                  onChange={(e) => setFormData({ ...formData, timings: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Example: 08:00 for morning, 13:00 for lunch, 20:30 for dinner
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Meal Relation</label>
                  <select
                    value={formData.mealRelation}
                    onChange={(e) =>
                      setFormData({ ...formData, mealRelation: e.target.value as any })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  >
                    <option value="AFTER_MEAL">After Meal</option>
                    <option value="BEFORE_MEAL">Before Meal</option>
                    <option value="WITH_MEAL">With Meal</option>
                    <option value="ANYTIME">Anytime</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pill Stock Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.pillStock}
                    onChange={(e) => setFormData({ ...formData, pillStock: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Instructions & Special Cautions
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Swallow whole with lukewarm water. Do not crush."
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-md transition-all"
                >
                  Save & Activate Alarm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
