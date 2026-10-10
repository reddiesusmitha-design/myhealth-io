const rawUrl =
  (import.meta as any).env?.VITE_API_URL || 'https://myhealthio-backend.onrender.com/api';
export const API_BASE_URL = rawUrl.replace(/\/+$/, '');

export function getAuthToken(): string | null {
  return localStorage.getItem('myhealthio_token');
}

export function setAuthToken(token: string): void {
  localStorage.setItem('myhealthio_token', token);
}

export function clearAuthToken(): void {
  localStorage.removeItem('myhealthio_token');
}
