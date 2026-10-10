import { useState, useEffect } from 'react';
import { User } from '../types';
import { getAuthToken, setAuthToken, clearAuthToken } from '../utils/api';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    const storedUser = localStorage.getItem('myhealthio_user');
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        clearAuthToken();
      }
    }
    setLoading(false);
  }, []);

  const loginUser = (token: string, userData: User) => {
    setAuthToken(token);
    localStorage.setItem('myhealthio_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logoutUser = () => {
    clearAuthToken();
    localStorage.removeItem('myhealthio_user');
    setUser(null);
  };

  return { user, loading, loginUser, logoutUser, isAuthenticated: !!user };
}
