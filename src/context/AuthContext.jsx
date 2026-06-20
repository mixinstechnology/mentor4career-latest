import React, { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [authTab,      setAuthTab]      = useState(null);
  const [authInitRole, setAuthInitRole] = useState('student');
  const [user, setUser] = useState(() => {
    try {
      return sessionStorage.getItem('m4c_authed')
        ? {
            role: sessionStorage.getItem('m4c_role') || 'student',
            name: sessionStorage.getItem('m4c_name') || '',
          }
        : null;
    } catch {
      return null;
    }
  });

  const openAuth = useCallback((tab = 'login', role = 'student') => {
    setAuthInitRole(role);
    setAuthTab(tab);
  }, []);
  const closeAuth = useCallback(() => setAuthTab(null), []);

  const signIn = useCallback((role, name = '') => {
    try {
      sessionStorage.setItem('m4c_role', role);
      sessionStorage.setItem('m4c_authed', '1');
      if (name) sessionStorage.setItem('m4c_name', name);
    } catch {}
    setUser({ role, name });
    setAuthTab(null);
  }, []);

  const signOut = useCallback(() => {
    try {
      sessionStorage.removeItem('m4c_authed');
      sessionStorage.removeItem('m4c_role');
      sessionStorage.removeItem('m4c_name');
      Cookies.remove('token');
    } catch {}
    setUser(null);
    navigate('/');
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ authTab, authInitRole, openAuth, closeAuth, user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
