import { supabase } from '../supabase/client';
import { databaseService } from '../supabase/database';
import type { LoginCredentials, RegisterCredentials, User } from '../../types';

export const authService = {
  /**
   * Register a new user
   */
  async register(credentials: RegisterCredentials) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw error;

      // Create user profile
      if (data.user) {
        await databaseService.createUserProfile(data.user.id, credentials.username);
      }

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Logout current user
   */
  async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  },

  /**
   * Get current session
   */
  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Get current user
   */
  async getCurrentUser() {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return { data: data.user, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Reset password
   */
  async resetPassword(email: string) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Update password
   */
  async updatePassword(newPassword: string) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },
};
