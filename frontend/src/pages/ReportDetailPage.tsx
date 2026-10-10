import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Edit2,
  Trash2,
  ChevronLeft,
  Search,
} from 'lucide-react';

export const ReportDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // Interactive review state for a field
  const [activeTab, setActiveTab] = useState<'structured' | 'raw'>('structured');
  const [highlightedSnippet, setHighlightedSnippet] = useState<string | null>(null);

  const mockReport = {
    id: id || 'rep-01',
    title: 'Comprehensive Metabolic & Lipid Panel',
    date: '2024-05-18',
    facility: 'Metropolis Clinical Labs',
    confidence: 96.4,
    status: 'COMPLETED',
    rawText: `METROPOLIS CLINICAL LABS
Patient Name: Kiran Varma | Age/Gender: 36/M | Ref By: Dr. A. Sharma
Sample Date: 18-May-2024 | Report Status: Final

BIOCHEMISTRY & LIPID PROFILE
----------------------------------------------------------------------
Test Name                  Result    Units      Reference Range
----------------------------------------------------------------------
Fasting Blood Sugar (FBS)   118       mg/dL      70 - 99 (High)
HbA1c                      6.4       %          4.0 - 5.6 (Pre-diabetic)
Total Cholesterol          224       mg/dL      125 - 200 (High)
HDL Cholesterol            42        mg/dL      40 - 60 (Normal)
LDL Cholesterol            148       mg/dL      < 100 (High)
Triglycerides              170       mg/dL      < 150 (Borderline)
Serum Creatinine           0.95      mg/dL      0.70 - 1.30 (Normal)
eGFR                       98        mL/min     > 90 (Normal)
----------------------------------------------------------------------
IMPRESSION: Impaired Fasting Glucose, Dyslipidemia.
Advised: Lifestyle modification, cardiology consult.`,
    extractedFields: [
      {
        id: 'f-1',
        category: 'LAB_RESULT',
        key: 'Fasting Blood Sugar (FBS)',
        value: '118',
        unit: 'mg/dL',
        refRange: '70 - 99',
        status: 'HIGH',
        confidence: 98,
        isUncertain: false,
        sourceSnippet: 'Fasting Blood Sugar (FBS)   118       mg/dL      70 - 99 (High)',
      },
      {
        id: 'f-2',
        category: 'LAB_RESULT',
        key: 'HbA1c (Glycated Hemoglobin)',
        value: '6.4',
        unit: '%',
        refRange: '4.0 - 5.6',
        status: 'HIGH',
        confidence: 97,
        isUncertain: false,
        sourceSnippet: 'HbA1c                      6.4       %          4.0 - 5.6 (Pre-diabetic)',
      },
      {
        id: 'f-3',
        category: 'LAB_RESULT',
        key: 'Total Cholesterol',
        value: '224',
        unit: 'mg/dL',
        refRange: '125 - 200',
        status: 'HIGH',
        confidence: 95,
        isUncertain: false,
        sourceSnippet: 'Total Cholesterol          224       mg/dL      125 - 200 (High)',
      },
      {
        id: 'f-4',
        category: 'LAB_RESULT',
        key: 'HDL Cholesterol (Good)',
        value: '42',
        unit: 'mg/dL',
        refRange: '40 - 60',
        status: 'NORMAL',
        confidence: 94,
        isUncertain: false,
        sourceSnippet: 'HDL Cholesterol            42        mg/dL      40 - 60 (Normal)',
      },
      {
        id: 'f-5',
        category: 'LAB_RESULT',
        key: 'Serum Creatinine',
        value: '0.95',
        unit: 'mg/dL',
        refRange: '0.70 - 1.30',
        status: 'NORMAL',
        confidence: 96,
        isUncertain: false,
        sourceSnippet: 'Serum Creatinine           0.95      mg/dL      0.70 - 1.30 (Normal)',
      },
      {
        id: 'f-6',
        category: 'DIAGNOSIS',
        key: 'Clinical Impression',
        value: 'Impaired Fasting Glucose, Dyslipidemia',
        status: 'ATTENTION',
        confidence: 88,
        isUncertain: true,
        uncertaintyReason: 'Handwritten or scanned doctor annotation flagged for review',
        sourceSnippet: 'IMPRESSION: Impaired Fasting Glucose, Dyslipidemia.',
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header & Back Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900">{mockReport.title}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                OCR {mockReport.confidence}%
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {mockReport.facility} • Collected {mockReport.date}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/reports/${mockReport.id}/summary`}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Health Summary</span>
          </Link>
          <button className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 border border-slate-200 bg-white transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('structured')}
          className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'structured'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Structured Fields ({mockReport.extractedFields.length})
        </button>
        <button
          onClick={() => setActiveTab('raw')}
          className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'raw'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Original Extracted Text
        </button>
      </div>

      {activeTab === 'structured' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Structured Fields List (2 columns on lg) */}
          <div className="lg:col-span-2 space-y-3">
            {mockReport.extractedFields.map((field) => (
              <div
                key={field.id}
                onClick={() => setHighlightedSnippet(field.sourceSnippet)}
                className={`p-4 rounded-xl bg-white border cursor-pointer transition-all ${
                  highlightedSnippet === field.sourceSnippet
                    ? 'border-teal-500 ring-2 ring-teal-500/20 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-500 tracking-wider">
                        {field.category}
                      </span>
                      {field.isUncertain && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <AlertTriangle className="w-3 h-3" />
                          Needs Review
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">{field.key}</h4>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-xl font-extrabold text-slate-900">{field.value}</span>
                      {field.unit && <span className="text-xs text-slate-500">{field.unit}</span>}
                      {field.refRange && (
                        <span className="text-xs text-slate-400">
                          (Ref: {field.refRange} {field.unit})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        field.status === 'HIGH'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : field.status === 'NORMAL'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {field.status}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Confidence {field.confidence}%
                    </span>
                  </div>
                </div>

                {/* Source Snippet preview on card */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="truncate max-w-md font-mono text-[11px] bg-slate-50 px-2 py-1 rounded border border-slate-200">
                    Source: "{field.sourceSnippet}"
                  </span>
                  <button className="text-teal-600 hover:text-teal-700 font-semibold text-xs flex items-center gap-1">
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Source Snippet Inspector (1 column on lg) */}
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm sticky top-24">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 mb-2">
                <Search className="w-4 h-4 text-teal-600" />
                <span>Traceable Evidence Inspector</span>
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Click any field on the left to verify the verbatim line extracted from the original
                document.
              </p>

              {highlightedSnippet ? (
                <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-xl">
                  <p className="text-xs font-semibold text-teal-800 uppercase tracking-wider mb-1">
                    Anchored Verbatim Line
                  </p>
                  <p className="font-mono text-xs text-teal-950 font-medium bg-white p-2.5 rounded border border-teal-200">
                    {highlightedSnippet}
                  </p>
                  <p className="text-[11px] text-teal-700 mt-2 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 100% Match Grounded in Document
                  </p>
                </div>
              ) : (
                <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl text-xs text-slate-400">
                  Select a clinical field to inspect its original document source line.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Raw OCR text view */
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <pre className="font-mono text-xs text-slate-800 bg-slate-900 text-slate-200 p-5 rounded-xl overflow-x-auto leading-relaxed">
            {mockReport.rawText}
          </pre>
        </div>
      )}
    </div>
  );
};
