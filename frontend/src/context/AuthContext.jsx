import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('medibook_token') || null);
  const [loading, setLoading] = useState(true);

  // Fetch current user if token exists
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await authService.getMe();
          setUser(res.user);
        } catch (error) {
          console.error('Session expired or invalid:', error.message);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email, password) => {
    const data = await authService.login({ email, password });
    localStorage.setItem('medibook_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    localStorage.setItem('medibook_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('medibook_token');
    setToken(null);
    setUser(null);
  };

  const isDoctor = user?.role === 'doctor';
  const isStudent = user?.role === 'student';
  const isPatient = user?.role === 'patient' || user?.role === 'student';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isDoctor,
        isStudent,
        isPatient,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
