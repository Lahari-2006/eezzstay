import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('easystay_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(localStorage.getItem('ezeestayy_token') || null);
  const [loading, setLoading] = useState(true);
  const [demoModeEnabled, setDemoModeEnabled] = useState(true);

  // Check demo mode status on backend
  useEffect(() => {
    const checkDemoStatus = async () => {
      try {
        const res = await authApi.getDemoStatus();
        setDemoModeEnabled(res.data.demo_mode_enabled ?? true);
      } catch (err) {
        setDemoModeEnabled(true);
      }
    };
    checkDemoStatus();
  }, []);

  // Fetch current user if token exists
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('ezeestayy_token');
      if (savedToken) {
        try {
          const res = await authApi.getMe();
          if (res.data) {
            setUser(res.data);
            localStorage.setItem('easystay_user', JSON.stringify(res.data));
          }
        } catch (err) {
          console.warn("Session check note:", err?.message);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await authApi.login(email, password);
    const { access_token, user: userData } = res.data;
    localStorage.setItem('ezeestayy_token', access_token);
    localStorage.setItem('easystay_user', JSON.stringify(userData));
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const register = async (userData) => {
    const res = await authApi.register(userData);
    const { access_token, user: newUser } = res.data;
    localStorage.setItem('ezeestayy_token', access_token);
    localStorage.setItem('easystay_user', JSON.stringify(newUser));
    setToken(access_token);
    setUser(newUser);
    return newUser;
  };

  const demoLogin = async (role) => {
    try {
      const res = await authApi.demoLogin(role);
      const { access_token, user: userData } = res.data;
      localStorage.setItem('ezeestayy_token', access_token);
      localStorage.setItem('easystay_user', JSON.stringify(userData));
      setToken(access_token);
      setUser(userData);
      return userData;
    } catch (err) {
      console.warn("Backend demoLogin fallback used:", err?.message);
      // Fallback local session if backend is restarting or unavailable
      const fallbackUser = {
        id: `local-${role}-1`,
        role: role,
        full_name: role === 'admin' ? 'Administrator' : (role === 'hostel_owner' ? 'Hostel Manager' : 'Student'),
        email: `${role}@easystay.com`,
        target_university: 'KL University, Hyderabad',
        target_city: 'Hyderabad',
      };
      localStorage.setItem('easystay_user', JSON.stringify(fallbackUser));
      setUser(fallbackUser);
      return fallbackUser;
    }
  };

  const loginWithRole = async (role, customData = {}) => {
    try {
      const res = await authApi.demoLogin(role);
      const { access_token, user: userData } = res.data;
      const mergedUser = { ...userData, ...customData };
      localStorage.setItem('ezeestayy_token', access_token);
      localStorage.setItem('easystay_user', JSON.stringify(mergedUser));
      setToken(access_token);
      setUser(mergedUser);
      return mergedUser;
    } catch (err) {
      const fallbackUser = {
        id: `usr-${role}-001`,
        role: role,
        full_name: role === 'admin' ? 'Administrator' : (role === 'hostel_owner' ? 'Hostel Manager' : 'Student User'),
        email: `${role}@easystay.com`,
        target_university: 'KL University, Hyderabad',
        target_city: 'Hyderabad',
        ...customData,
      };
      localStorage.setItem('easystay_user', JSON.stringify(fallbackUser));
      setUser(fallbackUser);
      return fallbackUser;
    }
  };

  const logout = () => {
    localStorage.removeItem('ezeestayy_token');
    localStorage.removeItem('easystay_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        demoModeEnabled,
        login,
        register,
        demoLogin,
        loginWithRole,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
