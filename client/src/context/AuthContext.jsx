import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize and check persistent session
  useEffect(() => {
    const token = localStorage.getItem('careermatch_token');
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get('/auth/me')
      .then((userData) => {
        setUser(userData);
      })
      .catch(() => {
        // Token expired or invalid
        localStorage.removeItem('careermatch_token');
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const signUp = async ({ email, password, fullName }) => {
    const data = await api.post('/auth/signup', {
      email,
      password,
      fullName,
    });

    if (data.token) {
      localStorage.setItem('careermatch_token', data.token);
      setUser(data.user);
    }
    return data;
  };

  const signIn = async ({ email, password }) => {
    const data = await api.post('/auth/login', {
      email,
      password,
    });

    if (data.token) {
      localStorage.setItem('careermatch_token', data.token);
      setUser(data.user);
    }
    return data;
  };

  const signOut = async () => {
    localStorage.removeItem('careermatch_token');
    setUser(null);
  };

  const updateProfile = async (fullName) => {
    const updated = await api.put('/auth/profile', { fullName });
    setUser((prev) => ({ ...prev, fullName: updated.fullName }));
    return updated;
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
