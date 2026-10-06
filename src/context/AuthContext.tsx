// ============================================================
// SoloBuildAI — Auth Context
// Provides: user, isAuthenticated, isLoading, login, register, logout
// Wraps authService calls and keeps user state in memory.
// ============================================================

import React, {
  createContext, useContext, useState, useEffect, useCallback,
} from 'react';
import {
  login as apiLogin,
  register as apiRegister,
  getMe,
  logout as apiLogout,
} from '../services/authService';
import { tokenStorage } from '../services/api';
import type { AuthUser, LoginPayload, RegisterPayload } from '../services/authService';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** True while the initial session check is running on mount */
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: if we have a stored token, rehydrate the user
  useEffect(() => {
    const token = tokenStorage.getAccess();
    if (!token) {
      setIsLoading(false);
      return;
    }
    getMe()
      .then(setUser)
      .catch(() => {
        // Token invalid / expired and refresh also failed
        tokenStorage.clear();
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    await apiLogin(payload);
    const me = await getMe();
    setUser(me);
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const data = await apiRegister(payload);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    apiLogout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
