import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './layouts/DashboardLayout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { UploadPage } from './pages/UploadPage';
import { ReportDetailPage } from './pages/ReportDetailPage';
import { SummaryPage } from './pages/SummaryPage';
import { TimelinePage } from './pages/TimelinePage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';

// New Features Pages
import { MedicationsPage } from './pages/MedicationsPage';
import { DietPage } from './pages/DietPage';
import { EmergencyPage } from './pages/EmergencyPage';
import { AppointmentsPage } from './pages/AppointmentsPage';
import { FirstAidPage } from './pages/FirstAidPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Authenticated Dashboard Routes */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/reports/:id" element={<ReportDetailPage />} />
          <Route path="/reports/:id/summary" element={<SummaryPage />} />
          <Route path="/timeline" element={<TimelinePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />

          {/* New 6 Features */}
          <Route path="/medications" element={<MedicationsPage />} />
          <Route path="/diet" element={<DietPage />} />
          <Route path="/emergency" element={<EmergencyPage />} />
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route path="/first-aid" element={<FirstAidPage />} />
        </Route>

        {/* Fallback 404 */}
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
