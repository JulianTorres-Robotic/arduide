/**
 * Authentication Hook for ArduIDE
 * Works with the custom Node.js/MariaDB backend
 */

import { useState, useEffect, useCallback } from 'react';
import { authApi, getStoredUser, clearToken, type User } from '@/lib/api-client';

export interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(getStoredUser);
  const [loading, setLoading] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await authApi.getCurrentUser();
        setUser(currentUser);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName?: string) => {
    try {
      const result = await authApi.signup(email, password, displayName);
      setUser(result.user);
      return { data: result, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error : new Error('Signup failed') };
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const result = await authApi.login(email, password);
      setUser(result.user);
      return { data: result, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error : new Error('Login failed') };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authApi.logout();
      setUser(null);
      clearToken();
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Logout failed') };
    }
  }, []);

  const updateProfile = useCallback(async (displayName: string) => {
    try {
      const updatedUser = await authApi.updateProfile(displayName);
      setUser(updatedUser);
      return { data: updatedUser, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error : new Error('Profile update failed') };
    }
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    try {
      await authApi.changePassword(currentPassword, newPassword);
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Password change failed') };
    }
  }, []);

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    changePassword,
    isAuthenticated: !!user,
  };
};
