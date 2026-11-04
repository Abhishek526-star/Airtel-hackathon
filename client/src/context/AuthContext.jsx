import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('udyam_token') || null);
  const [isLoading, setIsLoading] = useState(true);

  // Verify active session on initial load
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('udyam_token');
      if (savedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.success && res.data?.user) {
            setUser(res.data.user);
          } else {
            logout();
          }
        } catch (err) {
          console.warn('[AuthContext] Session expired, logging out.');
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (identifier, password) => {
    const res = await api.post('/auth/login', { identifier, password });
    if (res.success && res.data?.token) {
      localStorage.setItem('udyam_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data.user;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    if (res.success && res.data?.token) {
      localStorage.setItem('udyam_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data.user;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('udyam_token');
    setToken(null);
    setUser(null);
  };

  // Quick switch for hackathon reviewers
  const switchDemoPersona = async (role = 'customer') => {
    let email = 'rajesh@guptasupermart.in';
    let password = 'Password@123';

    if (role === 'partner') {
      email = 'partner@accel.com';
    } else if (role === 'admin') {
      email = 'admin@accel.com';
    }

    return await login(email, password);
  };

  const updateProfileLocally = (newProfile) => {
    if (user) {
      setUser({
        ...user,
        businessProfile: {
          ...user.businessProfile,
          ...newProfile,
        },
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        register,
        logout,
        switchDemoPersona,
        updateProfileLocally,
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
