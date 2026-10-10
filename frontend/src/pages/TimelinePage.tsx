import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  Clock,
  Plus,
  FileText,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../services/apiClient';

export const TimelinePage: React.FC = () => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);
        const res = await apiRequest<any[]>('/timeline');
        setTimelineEvents(res.data || []);
      } catch (err) {
        console.error('Failed to load timeline:', err);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  const filteredEvents =
    filterType === 'ALL'
      ? timelineEvents
      : timelineEvents.filter((e) => e.eventType === filterType);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Health Timeline</h2>
          <p className="text-sm text-slate-500 mt-1">
            Chronological aggregation of real lab tests, prescriptions, and clinical events in MongoDB Atlas
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
          {['ALL', 'LAB_REPORT', 'PRESCRIPTION', 'CLINICAL_VISIT'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterType === type
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {type === 'ALL'
                ? 'All Events'
                : type === 'LAB_REPORT'
                ? 'Labs'
                : type === 'PRESCRIPTION'
                ? 'Meds'
                : 'Visits'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium">Loading timeline events from MongoDB...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700 text-base">No timeline events recorded yet</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
            Your longitudinal timeline is automatically populated when you upload medical reports or schedule doctor visits.
          </p>
          <Link
            to="/upload"
            className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload Your First Report</span>
          </Link>
        </div>
      ) : (
        /* Timeline Stream */
        <div className="relative pl-6 border-l-2 border-slate-200 space-y-8 my-6">
          {filteredEvents.map((event) => (
            <div key={event._id || event.id} className="relative group">
              {/* Timeline Dot */}
              <div
                className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                  event.severityLevel === 'ATTENTION'
                    ? 'bg-amber-500'
                    : event.severityLevel === 'NORMAL'
                    ? 'bg-emerald-500'
                    : 'bg-teal-500'
                }`}
              />

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(event.eventDate || event.createdAt).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <span className="text-xs text-slate-500">{event.eventType}</span>
                  </div>
                  <span
                    className={`self-start sm:self-auto px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      event.severityLevel === 'ATTENTION'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : event.severityLevel === 'NORMAL'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {event.severityLevel || 'NORMAL'}
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-bold text-slate-900">{event.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {event.summaryPreview || 'Document recorded in health timeline.'}
                  </p>
                </div>

                {event.reportId && (
                  <div className="pt-2 flex items-center justify-end">
                    <Link
                      to={`/reports/${event.reportId}`}
                      className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                    >
                      <span>View Grounded Report</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
