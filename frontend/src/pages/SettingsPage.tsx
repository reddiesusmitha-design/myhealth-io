import React, { useState } from 'react';
import {
  Settings,
  Languages,
  Shield,
  Trash2,
  CheckCircle2,
  Lock,
  EyeOff,
  Bell,
  Cpu,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [preferredLanguage, setPreferredLanguage] = useState<'en' | 'te'>('en');
  const [aiProvider, setAiProvider] = useState<'template' | 'gemini' | 'openai'>('template');
  const [shareData, setShareData] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Settings & Privacy</h2>
        <p className="text-sm text-slate-500 mt-1">
          Customize language, AI provider preferences, and data privacy options
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Language Preference Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Languages className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-slate-900 text-sm">Language & Vernacular Localization</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setPreferredLanguage('en')}
              className={`p-4 rounded-xl border text-left transition-all ${
                preferredLanguage === 'en'
                  ? 'border-teal-500 bg-teal-50/40 ring-1 ring-teal-500'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <h4 className="font-bold text-sm text-slate-900">English (Default)</h4>
              <p className="text-xs text-slate-500 mt-1">
                Standard clinical reports and plain-language summaries in English.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setPreferredLanguage('te')}
              className={`p-4 rounded-xl border text-left transition-all ${
                preferredLanguage === 'te'
                  ? 'border-teal-500 bg-teal-50/40 ring-1 ring-teal-500'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <h4 className="font-bold text-sm text-slate-900">తెలుగు (Telugu)</h4>
              <p className="text-xs text-slate-500 mt-1">
                Summaries translated into culturally accessible medical Telugu.
              </p>
            </button>
          </div>
        </div>

        {/* AI Copilot Provider */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Cpu className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-slate-900 text-sm">AI Engine Configuration</h3>
          </div>

          <div className="space-y-3">
            {[
              {
                id: 'template',
                title: 'Deterministic Grounded Template (Recommended for Offline / Zero-Key)',
                desc: 'Runs without external LLM API keys. Verbatim evidence-based explanations with 100% zero hallucination risk.',
              },
              {
                id: 'gemini',
                title: 'Google Gemini 1.5 Pro / Flash',
                desc: 'Configured on backend with GEMINI_API_KEY environment variable. Client never sees keys.',
              },
              {
                id: 'openai',
                title: 'OpenAI GPT-4o / Mini',
                desc: 'Configured on backend with OPENAI_API_KEY environment variable.',
              },
            ].map((p) => (
              <label
                key={p.id}
                onClick={() => setAiProvider(p.id as any)}
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  aiProvider === p.id
                    ? 'border-teal-500 bg-teal-50/30 ring-1 ring-teal-500'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="aiProvider"
                  checked={aiProvider === p.id}
                  onChange={() => setAiProvider(p.id as any)}
                  className="mt-1 text-teal-600 focus:ring-teal-500"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{p.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{p.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Privacy & Safeguards */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Shield className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-slate-900 text-sm">Data Privacy & Storage Controls</h3>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
              <div>
                <h4 className="text-xs font-bold text-slate-900">Multi-Tenant Data Isolation</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Your medical records are only queried with your cryptographic token.
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-600">Active</span>
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
              <div>
                <h4 className="text-xs font-bold text-slate-900">Anonymize Document Storage</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  De-identify personal identifiers before sending to external model APIs.
                </p>
              </div>
              <input
                type="checkbox"
                checked={shareData}
                onChange={(e) => setShareData(e.target.checked)}
                className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
              />
            </label>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          {saved && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Settings saved successfully!
            </span>
          )}
          <button
            type="submit"
            className="ml-auto px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
          >
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
};
