// ============================================================
// AUTH CONTEXT
// ============================================================
// Manages who is logged in across the whole app.
// Components can call useAuth() to get the current user
// or to log in / log out.
// ============================================================

import React, { createContext, useContext, useState } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;           // null = not logged in
  isLoggedIn: boolean;
  isAdmin: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Try to restore user from localStorage so they stay logged in
  // after a page refresh
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('qenvaro_user');
    return stored ? (JSON.parse(stored) as User) : null;
  });

  function login(loggedInUser: User) {
    setUser(loggedInUser);
    // Save to localStorage so the session survives a page refresh
    localStorage.setItem('qenvaro_user', JSON.stringify(loggedInUser));
  }

  function logout() {
    setUser(null);
    localStorage.removeItem('qenvaro_user');
  }

  const value: AuthContextType = {
    user,
    isLoggedIn: user !== null,
    isAdmin: user?.role === 'admin',
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Usage: const { user, isLoggedIn, login, logout } = useAuth();
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
}
