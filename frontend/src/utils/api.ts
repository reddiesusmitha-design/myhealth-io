export const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('myhealthio_token');
}

export function setAuthToken(token: string): void {
  localStorage.setItem('myhealthio_token', token);
}

export function clearAuthToken(): void {
  localStorage.removeItem('myhealthio_token');
}
