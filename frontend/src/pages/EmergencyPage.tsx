import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  PhoneCall,
  MapPin,
  Clock,
  ShieldAlert,
  Navigation,
  CheckCircle2,
  Share2,
  FileText,
  User,
  Heart,
  ExternalLink,
  ChevronRight,
  Radio,
} from 'lucide-react';
import { AmbulanceDispatch } from '../types';
import {
  fetchActiveEmergency,
  triggerEmergencySos,
  updateEmergencyStatus,
  fetchEmergencyDirectory,
} from '../services/healthApi';

export const EmergencyPage: React.FC = () => {
  const [dispatch, setDispatch] = useState<AmbulanceDispatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [sosTriggering, setSosTriggering] = useState(false);
  const [directory, setDirectory] = useState<any[]>([]);
  const [currentAddress, setCurrentAddress] = useState(
    'Flat 402, Green Meadows Residency, Jubilee Hills, Hyderabad (Opp. KBR Park)'
  );
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: 17.385,
    lng: 78.4867,
  });

  // Attempt HTML5 Geolocation on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => console.log('Geolocation permission skipped or unavailable, using fallback coordinates.')
      );
    }
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [active, dir] = await Promise.all([
        fetchActiveEmergency(),
        fetchEmergencyDirectory(),
      ]);
      setDispatch(active);
      setDirectory(dir);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTriggerSOS = async () => {
    try {
      setSosTriggering(true);
      const newDispatch = await triggerEmergencySos({
        address: currentAddress,
        landmark: 'Opposite KBR Park Gate',
        latitude: coords.lat,
        longitude: coords.lng,
        severity: 'CRITICAL',
        ambulanceType: 'ADVANCED_CARDIAC_ICU',
      });
      setDispatch(newDispatch);
    } catch (err) {
      console.error(err);
    } finally {
      setSosTriggering(false);
    }
  };

  const handleAdvanceStatus = async (nextStatus: string, nextEta: number) => {
    if (!dispatch) return;
    try {
      const updated = await updateEmergencyStatus(
        dispatch.id || dispatch._id || '',
        nextStatus,
        nextEta
      );
      setDispatch(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusStepIndex = (status: string) => {
    switch (status) {
      case 'REQUESTED':
        return 0;
      case 'DISPATCHED':
        return 1;
      case 'EN_ROUTE':
        return 2;
      case 'ARRIVED':
        return 3;
      default:
        return 1;
    }
  };

  return (
    <div className="space-y-6">
      {/* Critical Emergency Red Banner */}
      <div className="bg-gradient-to-r from-red-700 via-rose-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.25),transparent_70%)] pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/30 text-amber-200 text-xs font-bold mb-3 border border-red-400/40 animate-pulse">
              <Radio className="w-3.5 h-3.5" />
              <span>EMERGENCY ASSISTANCE DESK • 24x7 PRIORITY</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Instant Ambulance Dispatch & SOS
            </h1>
            <p className="text-rose-100 text-sm mt-1.5 leading-relaxed">
              One-touch emergency dispatch broadcasts your GPS coordinates, blood group, and medical history directly to 108 paramedics and private ICU response fleets.
            </p>
          </div>

          {/* Big Red SOS Button */}
          <div className="flex flex-col items-center sm:items-end gap-2 shrink-0">
            <button
              onClick={handleTriggerSOS}
              disabled={sosTriggering}
              className="w-full sm:w-auto px-8 py-5 rounded-2xl bg-gradient-to-r from-red-500 via-rose-600 to-red-600 hover:from-red-600 hover:to-rose-700 text-white font-extrabold text-base tracking-wide flex items-center justify-center gap-3 shadow-2xl hover:shadow-red-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all border-2 border-red-300 animate-bounce hover:animate-none"
            >
              <AlertTriangle className="w-6 h-6 text-yellow-300" />
              <span>
                {sosTriggering ? 'DISPATCHING AMBULANCE...' : 'REQUEST EMERGENCY AMBULANCE (SOS)'}
              </span>
            </button>
            <span className="text-[11px] text-rose-200">
              ⚡ Connects directly to EMRI 108 & nearest hospital fleet
            </span>
          </div>
        </div>

        {/* Current Location Bar */}
        <div className="mt-6 pt-5 border-t border-rose-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-rose-100">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-300 shrink-0" />
            <span className="font-semibold text-white">Current Dispatch Location:</span>
            <span className="truncate max-w-md">{currentAddress}</span>
          </div>
          <span className="font-mono text-[11px] text-rose-200 bg-black/20 px-2.5 py-1 rounded-md">
            GPS: {coords.lat.toFixed(4)}°N, {coords.lng.toFixed(4)}°E
          </span>
        </div>
      </div>

      {/* Active Ambulance Tracking Card */}
      {dispatch && (
        <div className="bg-white rounded-2xl border-2 border-red-200 p-6 shadow-lg space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping" />
                <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
                  LIVE AMBULANCE TRACKING IN PROGRESS
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                {dispatch.ambulanceDetails.providerName}
              </h2>
              <p className="text-xs text-slate-500">
                Destination:{' '}
                <strong className="text-slate-800">{dispatch.hospitalDestination}</strong>
              </p>
            </div>

            {/* ETA Counter */}
            <div className="bg-rose-50 border border-rose-200 rounded-xl px-5 py-3 text-center sm:text-right shrink-0">
              <span className="text-[10px] uppercase font-bold text-rose-700 block">
                ESTIMATED ARRIVAL
              </span>
              <p className="text-2xl font-black text-rose-700">
                {dispatch.ambulanceDetails.etaMinutes} MINS
              </p>
              <span className="text-[10px] text-rose-600 font-medium">Siren & Beacon Active</span>
            </div>
          </div>

          {/* Stepper Status Progression */}
          <div className="relative py-2">
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { title: 'Requested', desc: 'Call logged' },
                { title: 'Dispatched', desc: 'Unit allocated' },
                { title: 'En Route', desc: 'Traffic cleared' },
                { title: 'Arrived', desc: 'Paramedics on scene' },
              ].map((step, idx) => {
                const currentIdx = getStatusStepIndex(dispatch.status);
                const isPassed = idx <= currentIdx;
                const isCurrent = idx === currentIdx;
                return (
                  <div key={idx} className="flex flex-col items-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs mb-2 transition-all ${
                        isPassed
                          ? 'bg-rose-600 text-white shadow-md'
                          : 'bg-slate-100 text-slate-400 border border-slate-200'
                      } ${isCurrent ? 'ring-4 ring-rose-200' : ''}`}
                    >
                      {isPassed ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                    </div>
                    <span
                      className={`text-xs font-bold leading-tight ${
                        isPassed ? 'text-slate-900' : 'text-slate-400'
                      }`}
                    >
                      {step.title}
                    </span>
                    <span className="text-[10px] text-slate-400 hidden sm:block mt-0.5">
                      {step.desc}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Driver & Vehicle Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">
                Ambulance Vehicle ID
              </span>
              <p className="text-sm font-mono font-bold text-slate-900 mt-0.5">
                {dispatch.ambulanceDetails.vehicleNumber}
              </p>
              <span className="text-[11px] text-teal-700 font-medium">
                ICU Life Support Equipped
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">
                Paramedic & Driver
              </span>
              <p className="text-sm font-bold text-slate-900 mt-0.5">
                {dispatch.ambulanceDetails.driverName}
              </p>
              <span className="text-[11px] text-slate-500">Certified Trauma Specialist</span>
            </div>

            <div className="flex items-center sm:justify-end">
              <a
                href={`tel:${dispatch.ambulanceDetails.driverPhone}`}
                className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call Driver ({dispatch.ambulanceDetails.driverPhone})</span>
              </a>
            </div>
          </div>

          {/* Simulation Stepper Controls (To test live status updates!) */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
            <span>Simulation controls (Test status changes):</span>
            <div className="flex gap-2">
              <button
                onClick={() => handleAdvanceStatus('EN_ROUTE', 3)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
              >
                Simulate: En Route (3 mins)
              </button>
              <button
                onClick={() => handleAdvanceStatus('ARRIVED', 0)}
                className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 font-semibold rounded-lg"
              >
                Simulate: Arrived On Scene
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Two-Column Grid: Paramedic Medical Card + 24/7 Helplines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Paramedic Critical Medical Sheet */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-base text-slate-900">
                  Paramedic Emergency Data Sheet
                </h3>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 bg-rose-50 text-rose-700 rounded-md border border-rose-200">
                Critical Info
              </span>
            </div>

            <div className="space-y-3.5">
              <div className="flex items-center justify-between p-3 bg-red-50/60 rounded-xl border border-red-100">
                <span className="text-xs font-semibold text-red-900">Patient Blood Group:</span>
                <span className="text-base font-black text-red-700 px-3 py-0.5 bg-white rounded-lg border border-red-200 shadow-2xs">
                  O Positive (O+)
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                  Chronic Diagnoses & Risk Factors
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-xs font-semibold px-2.5 py-1 bg-white text-slate-800 rounded-md border border-slate-200">
                    Type 2 Diabetes Mellitus
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-white text-slate-800 rounded-md border border-slate-200">
                    Essential Hypertension
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-white text-slate-800 rounded-md border border-slate-200">
                    Borderline Hyperlipidemia
                  </span>
                </div>
              </div>

              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200">
                <span className="text-[11px] font-bold text-amber-900 uppercase block mb-1">
                  Severe Drug Allergies
                </span>
                <p className="text-xs font-bold text-amber-800">
                  ⚠️ Penicillin, Sulfa Antibiotics (Severe Anaphylaxis Risk)
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">
                    Primary Emergency Contact
                  </span>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">
                    S. Ramanathan (Spouse)
                  </p>
                </div>
                <a
                  href="tel:+919849012345"
                  className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 flex items-center gap-1.5"
                >
                  <PhoneCall className="w-3 h-3 text-teal-400" />
                  <span>Call +91 98490 12345</span>
                </a>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>ABHA Linked Profile: ABHA-91-8842-1092-4412</span>
            <span>Digital Paramedic Ready</span>
          </div>
        </div>

        {/* 24/7 National Emergency Helplines Directory */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-base text-slate-900">
                  National Emergency Helplines (Direct Dial)
                </h3>
              </div>
              <span className="text-[11px] font-medium text-slate-400">Toll-Free 24x7</span>
            </div>

            <div className="space-y-2.5">
              {directory.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50/50 transition-all flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs text-slate-900">{item.name}</h4>
                      {item.tollFree && (
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.2 rounded">
                          Toll-Free
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {item.description}
                    </p>
                  </div>

                  <a
                    href={`tel:${item.number}`}
                    className="px-3.5 py-2 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white font-mono font-bold text-xs rounded-xl border border-rose-200 shrink-0 flex items-center gap-1.5 transition-colors"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Dial {item.number}</span>
                  </a>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            <span>In severe unconsciousness or cardiac distress, dial 108 or 112 immediately.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
