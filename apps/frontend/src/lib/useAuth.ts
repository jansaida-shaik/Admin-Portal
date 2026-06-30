'use client';
import { useState, useEffect } from 'react';

export function useAuth() {
  const [session, setSession] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setSession({ user: JSON.parse(user) });
      setStatus('authenticated');
    } else {
      setStatus('unauthenticated');
    }
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    setSession({ user: userData });
    setStatus('authenticated');
    window.location.href = '/';
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setSession(null);
    setStatus('unauthenticated');
    window.location.href = '/login';
  };

  return { data: session, status, login, logout };
}
