import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Sparkles,
  Languages,
  ShieldAlert,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Copy,
  Download,
  Share2,
} from 'lucide-react';

export const SummaryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [language, setLanguage] = useState<'en' | 'te'>('en');
  const [copied, setCopied] = useState(false);

  const mockSummary = {
    reportTitle: 'Comprehensive Metabolic & Lipid Panel',
    date: 'May 18, 2024',
    provider: 'Template Grounded Engine (No External LLM Required)',
    disclaimer:
      'Disclaimer: MyHealthIO provides plain-language explanations strictly based on parsed report text. This summary does not provide medical diagnoses, and never advises changing, stopping, or beginning medications. Consult your physician.',
    english: {
      overview:
        'This laboratory report measures blood sugar regulation, cholesterol levels, and kidney function. While your kidney markers are healthy, your blood sugar and total cholesterol levels are elevated above standard reference ranges.',
      findings: [
        {
          title: 'Fasting Blood Sugar (118 mg/dL) & HbA1c (6.4%)',
          status: 'ATTENTION',
          explanation:
            'Both markers indicate blood glucose levels higher than normal (reference is under 99 mg/dL for fasting sugar). An HbA1c of 6.4% falls within the pre-diabetes clinical category.',
          source: 'Fasting Blood Sugar 118 mg/dL | HbA1c 6.4%',
        },
        {
          title: 'Lipid Profile (Total Cholesterol 224 mg/dL, LDL 148 mg/dL)',
          status: 'ATTENTION',
          explanation:
            'Your total cholesterol and LDL ("bad cholesterol") are higher than desirable targets (under 200 mg/dL and under 100 mg/dL respectively). Triglycerides are also slightly borderline high at 170 mg/dL.',
          source: 'Total Cholesterol 224 mg/dL | LDL 148 mg/dL',
        },
        {
          title: 'Kidney Function (Creatinine 0.95 mg/dL & eGFR 98 mL/min)',
          status: 'NORMAL',
          explanation:
            'Both your creatinine level and filtration rate (eGFR) are well within healthy normal benchmarks, indicating proper renal function.',
          source: 'Serum Creatinine 0.95 mg/dL | eGFR 98 mL/min',
        },
      ],
      suggestedQuestions: [
        'What dietary or lifestyle adjustments should I make to manage my blood sugar?',
        'Do I need a repeat HbA1c test in 3 months?',
        'Should we discuss lipid-lowering therapies or continue with diet modifications?',
      ],
    },
    telugu: {
      overview:
        'ఈ ప్రయోగశాల పరీక్ష రక్తంలో చక్కెర నియంత్రణ, కొలెస్ట్రాల్ స్థాయిలు మరియు మూత్రపిండాల పనితీరును విశ్లేషిస్తుంది. మీ మూత్రపిండాల గుర్తులు సాధారణంగా ఉన్నప్పటికీ, రక్తంలో చక్కెర మరియు కొలెస్ట్రాల్ సాధారణ పరిమితుల కంటే ఎక్కువగా ఉన్నాయి.',
      findings: [
        {
          title: 'ఉపవాస రక్త చక్కెర (118 mg/dL) మరియు HbA1c (6.4%)',
          status: 'ATTENTION',
          explanation:
            'రెండు సూచికలు సాధారణం కంటే ఎక్కువ రక్త చక్కెరను సూచిస్తున్నాయి (సాధారణం 99 mg/dL కంటే తక్కువ). 6.4% HbA1c ప్రీ-డయాబెటిస్ శ్రేణిలోకి వస్తుంది.',
          source: 'Fasting Blood Sugar 118 mg/dL | HbA1c 6.4%',
        },
        {
          title: 'కొలెస్ట్రాల్ ప్రొఫైల్ (మొత్తం కొలెస్ట్రాల్ 224 mg/dL, LDL 148 mg/dL)',
          status: 'ATTENTION',
          explanation:
            'మీ మొత్తం కొలెస్ట్రాల్ మరియు LDL ("చెడు కొలెస్ట్రాల్") లక్ష్యం కంటే ఎక్కువగా ఉన్నాయి. ట్రైగ్లిజరైడ్స్ కూడా 170 mg/dL వద్ద కొద్దిగా ఎక్కువగా ఉన్నాయి.',
          source: 'Total Cholesterol 224 mg/dL | LDL 148 mg/dL',
        },
        {
          title: 'మూత్రపిండాల పనితీరు (క్రియాటినిన్ 0.95 mg/dL & eGFR 98 mL/min)',
          status: 'NORMAL',
          explanation:
            'మీ క్రియాటినిన్ స్థాయి మరియు వడపోత రేటు (eGFR) ఆరోగ్యకరమైన పరిమితుల్లో ఉన్నాయి.',
          source: 'Serum Creatinine 0.95 mg/dL | eGFR 98 mL/min',
        },
      ],
      suggestedQuestions: [
        'రక్తంలో చక్కెరను నియంత్రించడానికి నేను ఎటువంటి ఆహార మార్పులు చేసుకోవాలి?',
        '3 నెలల తర్వాత మళ్లీ HbA1c పరీక్ష చేయించుకోవాలా?',
      ],
    },
  };

  const currentContent = language === 'en' ? mockSummary.english : mockSummary.telugu;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent.overview);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to={`/reports/${id || 'rep-01'}`}
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900">AI Health Summary</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-teal-600" />
                Grounded Copilot
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Based on {mockSummary.reportTitle} • {mockSummary.date}
            </p>
          </div>
        </div>

        {/* Language Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setLanguage('en')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              language === 'en'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLanguage('te')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              language === 'te'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Languages className="w-3.5 h-3.5" />
            <span>తెలుగు (Telugu)</span>
          </button>
        </div>
      </div>

      {/* Overview Card */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-teal-700 mb-2">
            Plain-Language Overview
          </h3>
          <p className="text-base text-slate-800 leading-relaxed font-normal">
            {currentContent.overview}
          </p>
        </div>

        {/* Key Findings with Status */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Key Findings & Explanations
          </h3>

          <div className="space-y-3">
            {currentContent.findings.map((item, index) => (
              <div
                key={index}
                className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 space-y-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      item.status === 'ATTENTION'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{item.explanation}</p>
                <p className="text-[11px] font-mono text-slate-400 bg-white px-2 py-1 rounded border border-slate-200 inline-block">
                  Verified Source: {item.source}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested Questions for Doctor */}
        <div className="p-5 rounded-xl bg-teal-50/50 border border-teal-100 space-y-2">
          <h4 className="text-xs font-bold text-teal-900 uppercase tracking-wider">
            Questions You Can Ask Your Doctor
          </h4>
          <ul className="list-disc pl-5 space-y-1 text-xs text-teal-950">
            {currentContent.suggestedQuestions.map((q, idx) => (
              <li key={idx}>{q}</li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <span className="text-xs text-slate-400">Engine: {mockSummary.provider}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Safety Disclaimer Banner */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-900 leading-relaxed">{mockSummary.disclaimer}</p>
      </div>
    </div>
  );
};
