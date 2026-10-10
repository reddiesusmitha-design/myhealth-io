import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../services/apiClient';
import {
  UploadCloud,
  FileCheck,
  AlertCircle,
  FileText,
  ShieldCheck,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

export const UploadPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('LAB_REPORT');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = ['application/pdf', 'image/png', 'image/jpeg'];

      if (!validTypes.includes(file.type)) {
        setError('Unsupported format. Please upload a PDF, PNG, or JPG document.');
        setSelectedFile(null);
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError('File size exceeds the 10 MB limit.');
        setSelectedFile(null);
        return;
      }

      setError(null);
      setSelectedFile(file);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(30);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('reportFile', selectedFile);
      formData.append('originalFilename', selectedFile.name);
      formData.append('documentType', documentType);
      formData.append('facility', 'Uploaded Document');

      setUploadProgress(70);

      const res = await apiRequest<{ _id?: string; id?: string }>('/reports/upload', {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(100);
      const reportId = res.data?._id || res.data?.id;
      navigate(reportId ? `/reports/${reportId}` : '/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to upload report');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Upload Medical Record</h2>
        <p className="text-sm text-slate-500 mt-1">
          Secure document ingestion with automated OCR and clinical entity extraction
        </p>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <form onSubmit={handleUploadSubmit} className="space-y-6">
          {/* Document Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Record Category
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'LAB_REPORT', label: 'Laboratory Report' },
                { id: 'PRESCRIPTION', label: 'Prescription' },
                { id: 'DISCHARGE_SUMMARY', label: 'Discharge Summary' },
              ].map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setDocumentType(type.id)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                    documentType === type.id
                      ? 'bg-teal-50 border-teal-600 text-teal-800 ring-1 ring-teal-600'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Document File (PDF, PNG, JPG up to 10MB)
            </label>
            <div className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-2xl p-8 text-center bg-slate-50/50 hover:bg-teal-50/20 transition-all cursor-pointer relative">
              <input
                type="file"
                accept=".pdf, .png, .jpg, .jpeg"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center mb-3">
                  <UploadCloud className="w-6 h-6" />
                </div>
                {selectedFile ? (
                  <div>
                    <p className="font-semibold text-sm text-slate-900">{selectedFile.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for processing
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Click to browse or drag and drop your report
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Supports high-resolution PDF lab panels, PNG and JPG scans
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Privacy & Safeguard Callout */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 leading-relaxed">
              <strong className="text-slate-800">Patient Privacy Safeguard:</strong> Uploaded documents
              are processed through isolated multi-tenant pipelines. Fictional or de-identified test
              reports are recommended for hackathon demonstration.
            </div>
          </div>

          {/* Upload Progress Bar if active */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600" />
                  Running OCR & Entity Extraction...
                </span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-teal-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!selectedFile || isUploading}
            className={`w-full py-3.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
              !selectedFile || isUploading
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-teal-600 hover:bg-teal-700 text-white'
            }`}
          >
            {isUploading ? (
              <span>Extracting & Validating Clinical Data...</span>
            ) : (
              <>
                <FileCheck className="w-4 h-4" />
                <span>Upload & Extract Structured Data</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
