import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Save,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { apiRequest } from '../services/apiClient';

export const ProfilePage: React.FC = () => {
  const { user, loginUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    mockAbhaId: user?.mockAbhaId || '',
    bloodGroup: 'O+',
    gender: 'Prefer not to say',
    emergencyContact: '',
    preferredLanguage: 'en',
    allergies: '',
    chronicConditions: '',
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        const res = await apiRequest<any>('/profile');
        if (res.data) {
          const p = res.data;
          setFormData({
            fullName: p.fullName || user?.fullName || '',
            email: p.email || user?.email || '',
            mockAbhaId: p.mockAbhaId || user?.mockAbhaId || '',
            bloodGroup: p.bloodGroup || 'O+',
            gender: p.gender || 'Prefer not to say',
            emergencyContact: p.emergencyContact || '',
            preferredLanguage: p.preferredLanguage || user?.preferredLanguage || 'en',
            allergies: Array.isArray(p.allergies) ? p.allergies.join(', ') : '',
            chronicConditions: Array.isArray(p.chronicConditions)
              ? p.chronicConditions.join(', ')
              : '',
          });
        }
      } catch (err) {
        console.warn('Profile fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        fullName: formData.fullName,
        bloodGroup: formData.bloodGroup,
        gender: formData.gender,
        emergencyContact: formData.emergencyContact,
        preferredLanguage: formData.preferredLanguage,
        allergies: formData.allergies
          .split(',')
          .map((a) => a.trim())
          .filter(Boolean),
        chronicConditions: formData.chronicConditions
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean),
      };

      const res = await apiRequest<any>('/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      if (res.data && user) {
        loginUser(localStorage.getItem('myhealthio_token') || '', {
          ...user,
          fullName: formData.fullName,
          mockAbhaId: formData.mockAbhaId,
          preferredLanguage: formData.preferredLanguage as any,
        });
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Patient Health Profile</h2>
        <p className="text-sm text-slate-500 mt-1">
          Synchronized live with your MongoDB Atlas database and ABHA registry
        </p>
      </div>

      {/* ABHA Identifier Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40">
              ABHA Digital Health ID
            </span>
          </div>
          <h3 className="text-2xl font-mono font-bold text-teal-400 tracking-wider">
            {formData.mockAbhaId || user?.mockAbhaId || 'ABHA-91-NEW-USER-INIT'}
          </h3>
          <p className="text-xs text-slate-400">
            FHIR R4 Aligned Patient Identity • Verified in MongoDB Atlas
          </p>
        </div>

        <div className="shrink-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            Active Profile
          </span>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Profile changes successfully saved to MongoDB Atlas!</span>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSave} className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-3">
          Demographic & Clinical Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name</label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address (Read Only)</label>
            <input
              type="email"
              disabled
              value={formData.email}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Blood Group</label>
            <select
              value={formData.bloodGroup}
              onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            >
              <option value="A+">A Positive (A+)</option>
              <option value="A-">A Negative (A-)</option>
              <option value="B+">B Positive (B+)</option>
              <option value="B-">B Negative (B-)</option>
              <option value="AB+">AB Positive (AB+)</option>
              <option value="AB-">AB Negative (AB-)</option>
              <option value="O+">O Positive (O+)</option>
              <option value="O-">O Negative (O-)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Primary Emergency Contact Phone
            </label>
            <input
              type="text"
              placeholder="+91 98765 43210 (Relationship)"
              value={formData.emergencyContact}
              onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Language</label>
            <select
              value={formData.preferredLanguage}
              onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            >
              <option value="en">English</option>
              <option value="te">తెలుగు (Telugu)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Known Drug / Food Allergies (Comma-separated)
          </label>
          <input
            type="text"
            placeholder="e.g. Penicillin, Sulfa drugs, Peanuts (leave empty if none)"
            value={formData.allergies}
            onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Chronic Medical Diagnoses (Comma-separated)
          </label>
          <input
            type="text"
            placeholder="e.g. Type 2 Diabetes, Hypertension, Asthma"
            value={formData.chronicConditions}
            onChange={(e) => setFormData({ ...formData, chronicConditions: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving to MongoDB...' : 'Save Profile'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
