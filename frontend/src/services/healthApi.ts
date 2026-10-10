import { apiRequest } from './apiClient';
import {
  UserNotification,
  MedicationAlarm,
  DietProfile,
  AmbulanceDispatch,
  Appointment,
  FirstAidGuide,
} from '../types';

// ================= Notifications =================
export async function fetchNotifications(): Promise<UserNotification[]> {
  const res = await apiRequest<UserNotification[]>('/notifications');
  return res.data || [];
}

export async function markNotificationAsRead(id: string): Promise<void> {
  await apiRequest(`/notifications/${id}/read`, { method: 'PATCH' });
}

export async function markAllNotificationsAsRead(): Promise<void> {
  await apiRequest('/notifications/mark-all-read', { method: 'PATCH' });
}

export async function removeNotification(id: string): Promise<void> {
  await apiRequest(`/notifications/${id}`, { method: 'DELETE' });
}

// ================= Medication Alarms =================
export async function fetchMedicationAlarms(): Promise<MedicationAlarm[]> {
  const res = await apiRequest<MedicationAlarm[]>('/medications/alarms');
  return res.data || [];
}

export async function createMedicationAlarm(
  alarmData: Partial<MedicationAlarm>
): Promise<MedicationAlarm> {
  const res = await apiRequest<MedicationAlarm>('/medications/alarms', {
    method: 'POST',
    body: JSON.stringify(alarmData),
  });
  return res.data;
}

export async function recordDoseTake(
  alarmId: string,
  status: 'TAKEN' | 'SKIPPED' | 'SNOOZED',
  time?: string
): Promise<MedicationAlarm> {
  const res = await apiRequest<MedicationAlarm>(`/medications/alarms/${alarmId}/take`, {
    method: 'PATCH',
    body: JSON.stringify({ status, time }),
  });
  return res.data;
}

export async function deleteMedicationAlarm(alarmId: string): Promise<void> {
  await apiRequest(`/medications/alarms/${alarmId}`, { method: 'DELETE' });
}

// ================= Diet Menu =================
export async function fetchDietMenu(): Promise<DietProfile> {
  const res = await apiRequest<DietProfile>('/diet');
  return res.data;
}

export async function logWaterIntake(amountDelta?: number, glasses?: number): Promise<DietProfile> {
  const res = await apiRequest<DietProfile>('/diet/water', {
    method: 'POST',
    body: JSON.stringify({ amountDelta, glasses }),
  });
  return res.data;
}

export async function updateDietPlan(planData: Partial<DietProfile>): Promise<DietProfile> {
  const res = await apiRequest<DietProfile>('/diet/plan', {
    method: 'PUT',
    body: JSON.stringify(planData),
  });
  return res.data;
}

// ================= Ambulance Assistance & SOS =================
export async function triggerEmergencySos(data: {
  address?: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  severity?: string;
  ambulanceType?: string;
}): Promise<AmbulanceDispatch> {
  const res = await apiRequest<AmbulanceDispatch>('/emergency/sos', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function fetchActiveEmergency(): Promise<AmbulanceDispatch | null> {
  const res = await apiRequest<AmbulanceDispatch | null>('/emergency/latest');
  return res.data;
}

export async function updateEmergencyStatus(
  id: string,
  status: string,
  etaMinutes?: number
): Promise<AmbulanceDispatch> {
  const res = await apiRequest<AmbulanceDispatch>(`/emergency/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, etaMinutes }),
  });
  return res.data;
}

export async function fetchEmergencyDirectory(): Promise<any[]> {
  const res = await apiRequest<any[]>('/emergency/directory');
  return res.data || [];
}

// ================= Appointments & Follow-up Tracker =================
export async function fetchAppointments(): Promise<Appointment[]> {
  const res = await apiRequest<Appointment[]>('/appointments');
  return res.data || [];
}

export async function createAppointment(data: Partial<Appointment>): Promise<Appointment> {
  const res = await apiRequest<Appointment>('/appointments', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function updateAppointment(
  id: string,
  data: Partial<Appointment>
): Promise<Appointment> {
  const res = await apiRequest<Appointment>(`/appointments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function deleteAppointment(id: string): Promise<void> {
  await apiRequest(`/appointments/${id}`, { method: 'DELETE' });
}

// ================= Basic First Aid Guide =================
export async function fetchFirstAidGuides(): Promise<FirstAidGuide[]> {
  const res = await apiRequest<FirstAidGuide[]>('/firstaid');
  return res.data || [];
}

export async function fetchFirstAidGuideBySlug(slug: string): Promise<FirstAidGuide> {
  const res = await apiRequest<FirstAidGuide>(`/firstaid/${slug}`);
  return res.data;
}
