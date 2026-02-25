import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../lib/api';

/**
 * Auth Context for managing user authentication state
 */
const AuthContext = createContext(undefined);

// ✅ Decode JWT and check if it's expired
const isTokenExpired = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    const currentTime = Date.now() / 1000;
    return payload.exp && payload.exp < currentTime;
  } catch {
    return true; // Treat invalid tokens as expired
  }
};

/**
 * AuthProvider component - wraps app to provide auth state
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Clear expired session
  const clearSession = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  // Initialize user from localStorage on mount - with token expiry check
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const storedUser = authApi.getStoredUser();

    if (!token || !storedUser) {
      // No token or user stored - not logged in
      clearSession();
      setLoading(false);
      return;
    }

    if (isTokenExpired(token)) {
      // ✅ Token is expired - clear everything and show login
      console.log('Token expired on load, clearing session');
      clearSession();
      setLoading(false);
      return;
    }

    // ✅ Token is valid - restore user
    setUser(storedUser);
    setLoading(false);
  }, [clearSession]);

  // ✅ Check token expiry every 60 seconds while app is open
  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem('access_token');
      if (token && isTokenExpired(token)) {
        console.log('Token expired during session, logging out');
        clearSession();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [clearSession]);

  // Listen for auth expiration events (fired by api.js on 401)
  useEffect(() => {
    const handleAuthExpired = () => {
      clearSession();
    };

    window.addEventListener('auth-expired', handleAuthExpired);
    return () => window.removeEventListener('auth-expired', handleAuthExpired);
  }, [clearSession]);

  /**
   * Login user
   */
  const login = useCallback(async (email, password) => {
    const response = await authApi.login(email, password);
    setUser(response.user);
    return response;
  }, []);

  /**
   * Register new user
   */
  const signup = useCallback(async (userData) => {
    const response = await authApi.signup(userData);
    return response;
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  /**
   * Update user in state (for profile updates)
   */
  const updateUser = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {/* ✅ Don't render until auth state is known */}
      {!loading && children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;