import React, { useState, useEffect, useRef } from 'react';
import {
  HeartPulse,
  PhoneCall,
  Search,
  AlertTriangle,
  Play,
  Square,
  Volume2,
  CheckCircle,
  XCircle,
  ShieldAlert,
  X,
  ChevronRight,
  Flame,
  Wind,
  Activity,
  Heart,
  Droplet,
} from 'lucide-react';
import { FirstAidGuide } from '../types';
import { fetchFirstAidGuides } from '../services/healthApi';
import { playMetronomeTick } from '../utils/audio';

export const FirstAidPage: React.FC = () => {
  const [guides, setGuides] = useState<FirstAidGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedGuide, setSelectedGuide] = useState<FirstAidGuide | null>(null);

  // CPR Metronome State
  const [metronomeRunning, setMetronomeRunning] = useState(false);
  const [metronomeBeat, setMetronomeBeat] = useState(0);
  const metronomeIntervalRef = useRef<any>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await fetchFirstAidGuides();
        setGuides(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Metronome Timer (110 BPM = ~545ms interval)
  useEffect(() => {
    if (metronomeRunning) {
      const intervalMs = Math.round(60000 / 110);
      metronomeIntervalRef.current = setInterval(() => {
        setMetronomeBeat((prev) => {
          const next = (prev % 30) + 1;
          const isAccent = next === 1 || next === 30;
          playMetronomeTick(isAccent);
          return next;
        });
      }, intervalMs);
    } else {
      if (metronomeIntervalRef.current) clearInterval(metronomeIntervalRef.current);
      setMetronomeBeat(0);
    }

    return () => {
      if (metronomeIntervalRef.current) clearInterval(metronomeIntervalRef.current);
    };
  }, [metronomeRunning]);

  const toggleMetronome = () => {
    setMetronomeRunning((prev) => !prev);
  };

  const categories = [
    { id: 'ALL', label: 'All Guides' },
    { id: 'CARDIAC', label: 'Cardiac & Stroke' },
    { id: 'RESPIRATORY', label: 'Respiratory & Choking' },
    { id: 'TRAUMA', label: 'Bleeding & Burns' },
    { id: 'POISONING', label: 'Poisoning & Bites' },
  ];

  const filteredGuides = guides.filter((g) => {
    const matchesCat = selectedCategory === 'ALL' || g.category === selectedCategory;
    const matchesQuery =
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Hero Header with CPR Metronome Highlight */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-red-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.2),transparent_70%)] pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-semibold mb-3 border border-rose-500/30">
              <HeartPulse className="w-3.5 h-3.5" />
              <span>Life-Saving First Aid Reference Manual</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Emergency Basic First Aid Guide
            </h1>
            <p className="text-rose-100 text-sm mt-1.5 leading-relaxed">
              Clinically verified, step-by-step triage actions for medical emergencies. Know what to do before the ambulance arrives.
            </p>
          </div>

          {/* Quick Direct 108 Call */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <a
              href="tel:108"
              className="w-full sm:w-auto px-6 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all animate-pulse"
            >
              <PhoneCall className="w-4 h-4" />
              <span>CALL 108 AMBULANCE NOW</span>
            </a>
          </div>
        </div>

        {/* CPR Metronome Interactive Tool Box */}
        <div className="mt-6 pt-5 border-t border-rose-800/80 bg-rose-900/30 -mx-6 -mb-6 sm:-mx-8 sm:-mb-8 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                metronomeRunning
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/50 scale-105'
                  : 'bg-slate-800 text-rose-400 border border-slate-700'
              }`}
            >
              <Heart className={`w-6 h-6 ${metronomeRunning ? 'animate-ping' : ''}`} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">Interactive CPR Metronome</span>
                <span className="text-[10px] bg-rose-500/80 text-white font-mono font-bold px-2 py-0.5 rounded-full">
                  110 BPM (AHA Standard)
                </span>
              </div>
              <p className="text-xs text-rose-200 mt-0.5">
                {metronomeRunning
                  ? `Beat: ${metronomeBeat} / 30 compressions (Push firmly in center of chest)`
                  : 'Maintain steady 100-120 BPM chest compression tempo.'}
              </p>
            </div>
          </div>

          <button
            onClick={toggleMetronome}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              metronomeRunning
                ? 'bg-slate-900 hover:bg-black text-rose-300 border border-rose-500'
                : 'bg-rose-500 hover:bg-rose-400 text-white shadow-md'
            }`}
          >
            {metronomeRunning ? (
              <>
                <Square className="w-3.5 h-3.5" />
                <span>Stop Metronome</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start CPR Tempo (110 BPM)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === c.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search symptoms or guides..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
          />
        </div>
      </div>

      {/* Guides Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-400">
          <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium">Loading first aid protocols...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredGuides.map((guide) => {
            const isCritical = guide.severity === 'CRITICAL_CALL_AMBULANCE';
            return (
              <div
                key={guide.slug}
                onClick={() => setSelectedGuide(guide)}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-rose-300 transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                        isCritical
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {isCritical ? '🚨 Critical SOS' : '⚠️ Urgent Care'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">{guide.category}</span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-rose-600 transition-colors leading-snug mb-1.5">
                    {guide.title}
                  </h3>

                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 mb-3">
                    {guide.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-rose-600 font-bold group-hover:translate-x-0.5 transition-transform">
                  <span>View Emergency Protocol</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedGuide && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 mb-4 sticky top-0 bg-white z-10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                      selectedGuide.severity === 'CRITICAL_CALL_AMBULANCE'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {selectedGuide.category}
                  </span>
                  {selectedGuide.callEmergencyImmediately && (
                    <span className="text-[10px] bg-red-600 text-white font-bold px-2 py-0.5 rounded-full animate-pulse">
                      Call 108 Immediately
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-extrabold text-slate-900">{selectedGuide.title}</h2>
              </div>
              <button
                onClick={() => setSelectedGuide(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Summary Alert */}
            <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl text-xs text-rose-950 mb-5 leading-relaxed">
              <strong>Emergency Overview:</strong> {selectedGuide.summary}
            </div>

            {/* Key Symptoms Identification */}
            {selectedGuide.symptoms?.length > 0 && (
              <div className="mb-5">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Recognize Key Symptoms
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedGuide.symptoms.map((sym, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs font-medium text-slate-800 flex items-center gap-2"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{sym}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step-by-Step Instructions */}
            <div className="mb-6">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Step-by-Step Emergency Actions
              </h4>
              <div className="space-y-3">
                {selectedGuide.steps.map((st) => (
                  <div
                    key={st.stepNumber}
                    className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs flex gap-3"
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {st.stepNumber}
                    </div>
                    <div className="flex-1">
                      <h5 className="font-bold text-xs text-slate-900 mb-0.5">{st.instruction}</h5>
                      <p className="text-xs text-slate-600 leading-relaxed">{st.detail}</p>
                      {st.warning && (
                        <p className="text-[11px] text-amber-800 font-semibold bg-amber-50 border border-amber-200 p-2 rounded-lg mt-2">
                          ⚠️ {st.warning}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dos and Don'ts Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200">
                <h5 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 mb-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>DO (Critical Best Practices)</span>
                </h5>
                <ul className="text-xs text-emerald-950 space-y-1.5">
                  {selectedGuide.dos.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-rose-50/60 rounded-xl border border-rose-200">
                <h5 className="text-xs font-bold text-rose-900 flex items-center gap-1.5 mb-2">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>DON'T (Dangerous Mistakes)</span>
                </h5>
                <ul className="text-xs text-rose-950 space-y-1.5">
                  {selectedGuide.donts.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-rose-600 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Modal Bottom CTA */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                onClick={() => setSelectedGuide(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Close Guide
              </button>
              <a
                href="tel:108"
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition-all"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call Emergency (108)</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
