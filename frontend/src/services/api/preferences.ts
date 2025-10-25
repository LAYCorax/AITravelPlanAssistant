/**
 * 用户偏好API服务
 */

import { supabase } from '../supabase/client';

/**
 * 用户偏好接口
 */
export interface UserPreferences {
  id?: string;
  user_id: string;
  default_departure?: string;
  favorite_categories?: string[];
  budget_range_min?: number;
  budget_range_max?: number;
  language?: string;
  theme?: string;
  enable_notifications?: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * 获取当前用户的偏好设置
 */
export async function getUserPreferences(): Promise<UserPreferences | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('用户未登录');
  }

  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) {
    // 如果记录不存在，返回null而不是抛出错误
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('获取用户偏好失败:', error);
    throw new Error('获取用户偏好失败');
  }

  return data;
}

/**
 * 保存或更新用户偏好设置
 */
export async function saveUserPreferences(
  preferences: Partial<UserPreferences>
): Promise<UserPreferences> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('用户未登录');
  }

  // 检查是否已存在偏好设置
  const existing = await getUserPreferences();

  if (existing) {
    // 更新现有记录
    const { data, error } = await supabase
      .from('user_preferences')
      .update({
        ...preferences,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('更新用户偏好失败:', error);
      throw new Error('更新用户偏好失败');
    }

    return data;
  } else {
    // 创建新记录
    const { data, error } = await supabase
      .from('user_preferences')
      .insert({
        user_id: user.id,
        ...preferences,
      })
      .select()
      .single();

    if (error) {
      console.error('创建用户偏好失败:', error);
      throw new Error('创建用户偏好失败');
    }

    return data;
  }
}

/**
 * 重置用户偏好为默认值
 */
export async function resetUserPreferences(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('用户未登录');
  }

  const { error } = await supabase
    .from('user_preferences')
    .delete()
    .eq('user_id', user.id);

  if (error) {
    console.error('重置用户偏好失败:', error);
    throw new Error('重置用户偏好失败');
  }
}
