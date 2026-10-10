import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Sparkles, Activity, FileText, ArrowRight, CheckCircle2, Globe2 } from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between">
      {/* Top Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center font-bold text-slate-900 text-lg">
              +
            </div>
            <span className="text-xl font-bold tracking-tight text-white">MyHealthIO</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-sm font-medium px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold rounded-lg transition-colors shadow-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-20 text-center flex-1 flex flex-col justify-center items-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800 border border-slate-700/80 text-teal-400 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI-Powered Personal Health Copilot</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-tight sm:leading-none mb-6">
          Understand Your Medical Reports in <span className="text-teal-400">Plain English</span> & <span className="text-teal-400">Telugu</span>
        </h1>

        <p className="text-lg text-slate-400 max-w-2xl mb-10 leading-relaxed">
          Transform complex lab results, discharge summaries, and prescriptions into clear, evidence-grounded insights with verbatim source traceability and zero medical hallucinations.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/register"
            className="flex items-center gap-2 px-6 py-3.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl shadow-lg transition-all"
          >
            <span>Start Free Health Copilot</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-700 transition-all"
          >
            Demo Sign In
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 text-left w-full">
          <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-4">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">100% Traceable Extraction</h3>
            <p className="text-sm text-slate-400">
              Every lab value, unit, and metric links directly back to the exact source text snippet in your original document.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-4">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Clinical Guardrails & Safety</h3>
            <p className="text-sm text-slate-400">
              Strict rules against hallucinated diagnoses or prescribing changes. Uncertainty is openly acknowledged.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-4">
              <Globe2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Telugu & Vernacular Reach</h3>
            <p className="text-sm text-slate-400">
              Medical summaries translated into accurate, culturally-aware Telugu, bridging the linguistic healthcare divide.
            </p>
          </div>
        </div>
      </main>

      {/* Footer Disclaimer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        <p>MyHealthIO Hackathon Prototype. Informational use only. Not a medical diagnostic tool.</p>
      </footer>
    </div>
  );
};
