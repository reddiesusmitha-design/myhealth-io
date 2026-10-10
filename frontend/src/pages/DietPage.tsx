import React, { useState, useEffect } from 'react';
import {
  Utensils,
  Droplets,
  Sparkles,
  Flame,
  Apple,
  Clock,
  Heart,
  ShieldCheck,
  Plus,
  Minus,
  CheckCircle,
  Info,
} from 'lucide-react';
import { DietProfile, DayMealPlan } from '../types';
import { fetchDietMenu, logWaterIntake, updateDietPlan } from '../services/healthApi';

const DIET_PRESETS = [
  { id: 'DIABETIC_SAFE', name: 'Diabetic Safe (Low GI)', badge: 'Glycemic Buffer' },
  { id: 'CARDIAC_CARE', name: 'Cardiac & Lipid Care', badge: 'Low Sodium & Omega-3' },
  { id: 'HYPERTENSION_DASH', name: 'DASH Hypertension', badge: 'High Potassium' },
  { id: 'HIGH_PROTEIN', name: 'High Clean Protein', badge: 'Renal Friendly' },
  { id: 'BALANCED_WELLNESS', name: 'Balanced Wellness', badge: 'South & Pan-Indian' },
];

export const DietPage: React.FC = () => {
  const [diet, setDiet] = useState<DietProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePreset, setActivePreset] = useState<string>('DIABETIC_SAFE');
  const [updatingWater, setUpdatingWater] = useState(false);

  const loadDiet = async () => {
    try {
      setLoading(true);
      const data = await fetchDietMenu();
      setDiet(data);
      if (data.planType) setActivePreset(data.planType);
    } catch (err) {
      console.error('Failed to load diet profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDiet();
  }, []);

  const handleWaterDelta = async (delta: number) => {
    if (!diet || updatingWater) return;
    try {
      setUpdatingWater(true);
      const updated = await logWaterIntake(delta);
      setDiet(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingWater(false);
    }
  };

  const handleSwitchPreset = async (presetId: string) => {
    setActivePreset(presetId);
    try {
      const presetName =
        DIET_PRESETS.find((p) => p.id === presetId)?.name || 'Custom Care Plan';
      const updated = await updateDietPlan({
        planType: presetId as any,
        planName: presetName,
      });
      setDiet(updated);
    } catch (err) {
      console.error(err);
    }
  };

  // Calculate total calories & macros from loaded meals
  const allMeals = diet?.meals || [];
  const totalCalories = allMeals.reduce(
    (sum, m) => sum + m.items.reduce((acc, item) => acc + (item.calories || 0), 0),
    0
  );
  const totalProtein = allMeals.reduce(
    (sum, m) => sum + m.items.reduce((acc, item) => acc + (item.proteinGrams || 0), 0),
    0
  );
  const totalCarbs = allMeals.reduce(
    (sum, m) => sum + m.items.reduce((acc, item) => acc + (item.carbsGrams || 0), 0),
    0
  );
  const totalFats = allMeals.reduce(
    (sum, m) => sum + m.items.reduce((acc, item) => acc + (item.fatsGrams || 0), 0),
    0
  );

  const waterGlasses = diet?.waterLoggedGlasses ?? 5;
  const waterTarget = diet?.dailyWaterTargetGlasses ?? 8;
  const waterPercentage = Math.min(100, Math.round((waterGlasses / waterTarget) * 100));

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.18),transparent_70%)] pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3 border border-emerald-500/30">
            <Utensils className="w-3.5 h-3.5" />
            <span>Clinical Nutrition & Meal Guidance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Personalized Health Diet Menu
          </h1>
          <p className="text-slate-300 text-sm mt-1 leading-relaxed">
            Nutritionally balanced meal schedules engineered for glycemic stability, heart wellness, and kidney protection.
          </p>
        </div>

        {/* Preset Selector Chips */}
        <div className="mt-6 pt-5 border-t border-slate-800 flex flex-wrap items-center gap-2 relative z-10">
          <span className="text-xs text-slate-400 font-semibold mr-1">Plan Profile:</span>
          {DIET_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleSwitchPreset(preset.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activePreset === preset.id
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: Nutrition Summary + Water Hydration Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hydration Tracker */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
                  <Droplets className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Daily Hydration Goal</h3>
                  <p className="text-[11px] text-slate-400">Target: {waterTarget * 250} ml (8 Glasses)</p>
                </div>
              </div>
              <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">
                {waterPercentage}%
              </span>
            </div>

            {/* Visual Glass Row */}
            <div className="grid grid-cols-4 gap-2 my-4">
              {Array.from({ length: waterTarget }).map((_, idx) => {
                const isDrank = idx < waterGlasses;
                return (
                  <div
                    key={idx}
                    className={`py-3 px-2 rounded-xl border text-center transition-all ${
                      isDrank
                        ? 'bg-sky-500 text-white border-sky-600 shadow-xs'
                        : 'bg-slate-50 text-slate-300 border-slate-200'
                    }`}
                  >
                    <Droplets className={`w-5 h-5 mx-auto ${isDrank ? 'text-white' : 'text-slate-300'}`} />
                    <span className="text-[10px] font-bold block mt-1">
                      {isDrank ? 'Drank' : `250ml`}
                    </span>
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-slate-500 leading-relaxed bg-sky-50/60 p-3 rounded-xl border border-sky-100">
              Proper kidney perfusion requires constant daylight water spacing. Avoid drinking more than 500ml in one sitting.
            </p>
          </div>

          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => handleWaterDelta(-1)}
              disabled={waterGlasses <= 0 || updatingWater}
              className="flex-1 py-2 px-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-40"
            >
              <Minus className="w-3.5 h-3.5" />
              <span>1 Glass</span>
            </button>
            <button
              onClick={() => handleWaterDelta(1)}
              disabled={updatingWater}
              className="flex-1 py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+1 Glass (250ml)</span>
            </button>
          </div>
        </div>

        {/* Nutritional Target Breakdown */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Daily Macronutrient Targets</h3>
                <p className="text-xs text-slate-500">
                  Calibrated for balanced insulin and steady glucose uptake
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Total Planned</span>
                <p className="text-xl font-extrabold text-emerald-600">{totalCalories} kcal</p>
              </div>
            </div>

            {/* Macros Bar */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200/60">
                <span className="text-[11px] font-semibold text-amber-800">Carbohydrates</span>
                <p className="text-xl font-extrabold text-amber-900 mt-0.5">{totalCarbs}g</p>
                <span className="text-[10px] text-amber-700">Complex fibers & millets</span>
              </div>
              <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200/60">
                <span className="text-[11px] font-semibold text-emerald-800">Clean Protein</span>
                <p className="text-xl font-extrabold text-emerald-900 mt-0.5">{totalProtein}g</p>
                <span className="text-[10px] text-emerald-700">Pulses, sprouts, whites</span>
              </div>
              <div className="bg-indigo-50/60 p-3.5 rounded-xl border border-indigo-200/60">
                <span className="text-[11px] font-semibold text-indigo-800">Healthy Fats</span>
                <p className="text-xl font-extrabold text-indigo-900 mt-0.5">{totalFats}g</p>
                <span className="text-[10px] text-indigo-700">Omega-3, nuts & cold oils</span>
              </div>
            </div>

            {/* Restrictions & Clinical Guidelines */}
            <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="text-[11px] uppercase font-bold text-slate-500 block">
                Active Dietary Guardrails
              </span>
              <div className="flex flex-wrap gap-2">
                {(diet?.dietaryRestrictions || [
                  'Low Glycemic',
                  'Low Sodium (< 2g/day)',
                  'Zero Refined Sugar',
                ]).map((restriction, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-white text-slate-700 rounded-lg border border-slate-200"
                  >
                    <CheckCircle className="w-3 h-3 text-emerald-500" />
                    <span>{restriction}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 mt-4 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>Consult your attending physician or certified clinical dietitian before changing medical diet.</span>
          </div>
        </div>
      </div>

      {/* 6-Meal Daily Menu Plan */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Apple className="w-5 h-5 text-emerald-600" />
            <span>Daily Meal Schedule & Diet Menu</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">6 Clinical Meal Windows</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium">Loading clinical diet menu...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allMeals.map((meal, index) => {
              const mealCal = meal.items.reduce((acc, it) => acc + it.calories, 0);
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs border border-emerald-100">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-slate-900 leading-snug">
                            {meal.mealType.replace('_', ' ')}
                          </h3>
                          <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {meal.scheduledTime}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                        {mealCal} kcal
                      </span>
                    </div>

                    {/* Meal items */}
                    <div className="space-y-2.5 mb-4">
                      {meal.items.map((item, itemIdx) => (
                        <div
                          key={itemIdx}
                          className="p-2.5 bg-slate-50/70 rounded-xl border border-slate-100 text-xs"
                        >
                          <div className="flex items-start justify-between gap-1 font-semibold text-slate-800">
                            <span>{item.name}</span>
                            <span className="text-slate-500 text-[11px] shrink-0">{item.portion}</span>
                          </div>
                          {item.notes && (
                            <p className="text-[11px] text-emerald-700 mt-1 leading-snug">
                              • {item.notes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Nutritionist tip */}
                  {meal.tips && (
                    <div className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-200/50 text-[11px] text-amber-900 leading-snug flex items-start gap-1.5 mt-auto">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>{meal.tips}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
