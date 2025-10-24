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
        options: {
          data: {
            username: credentials.username,
          },
          // 如果Supabase配置了邮箱确认，这里可以设置不需要确认（开发环境）
          // emailRedirectTo: window.location.origin,
        },
      });

      if (error) throw error;

      // 检查用户是否需要确认邮箱
      if (data.user && !data.user.confirmed_at) {
        console.log('请检查邮箱确认链接');
      }

      // Create user profile (如果用户已确认或不需要确认)
      if (data.user) {
        try {
          await databaseService.createUserProfile(data.user.id, credentials.username);
        } catch (profileError) {
          console.error('创建用户配置失败:', profileError);
          // 不抛出错误，因为主要的注册已经成功
        }
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
