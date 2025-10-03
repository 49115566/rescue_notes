import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, RegisterRequest, LoginRequest } from '../types/api';
import { apiClient } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  verifyEmail: (code: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        apiClient.setToken(token);
        try {
          const { user } = await apiClient.getCurrentUser();
          setUser(user);
        } catch (error) {
          console.error('Failed to get current user:', error);
          localStorage.removeItem('auth_token');
          apiClient.setToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (data: LoginRequest) => {
    try {
      const response = await apiClient.login(data);
      apiClient.setToken(response.token);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      const response = await apiClient.register(data);
      apiClient.setToken(response.token);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    apiClient.setToken(null);
    setUser(null);
  };

  const verifyEmail = async (code: string) => {
    try {
      await apiClient.verifyEmail(code);
      // Refresh user data to get updated email_verified status
      await refreshUser();
    } catch (error) {
      throw error;
    }
  };

  const resendVerification = async () => {
    try {
      await apiClient.resendVerification();
    } catch (error) {
      throw error;
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      await apiClient.forgotPassword(email);
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async (token: string, password: string) => {
    try {
      const response = await apiClient.resetPassword(token, password);
      apiClient.setToken(response.token);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const { user } = await apiClient.getCurrentUser();
      setUser(user);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}