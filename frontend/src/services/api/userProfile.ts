/**
 * 用户个人资料API服务
 */

import { supabase } from '../supabase/client';

/**
 * 用户个人资料接口
 */
export interface UserProfile {
  id?: string;
  user_id: string;
  username?: string;
  avatar_url?: string;
  phone?: string;
  bio?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * 更新用户元数据（用户名等）
 */
export async function updateUserMetadata(metadata: {
  username?: string;
}): Promise<void> {
  const { error } = await supabase.auth.updateUser({
    data: metadata
  });

  if (error) {
    console.error('更新用户元数据失败:', error);
    throw new Error('更新用户信息失败');
  }
}

/**
 * 获取当前用户的个人资料
 */
export async function getUserProfile(): Promise<UserProfile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('用户未登录');
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) {
    // 如果记录不存在，返回null而不是抛出错误
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('获取用户资料失败:', error);
    throw new Error('获取用户资料失败');
  }

  return data;
}

/**
 * 保存或更新用户个人资料
 */
export async function saveUserProfile(
  profile: Partial<UserProfile>
): Promise<UserProfile> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('用户未登录');
  }

  // 如果包含用户名，先更新用户元数据
  if (profile.username !== undefined) {
    await updateUserMetadata({ username: profile.username });
  }

  // 检查是否已存在个人资料
  const existing = await getUserProfile();

  if (existing) {
    // 更新现有记录
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...profile,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('更新用户资料失败:', error);
      throw new Error('更新用户资料失败');
    }

    return data;
  } else {
    // 创建新记录
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        user_id: user.id,
        ...profile,
      })
      .select()
      .single();

    if (error) {
      console.error('创建用户资料失败:', error);
      throw new Error('创建用户资料失败');
    }

    return data;
  }
}

/**
 * 上传用户头像
 */
export async function uploadAvatar(file: File): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('用户未登录');
  }

  // 生成唯一文件名
  const fileExt = file.name.split('.').pop();
  const fileName = `${user.id}-${Date.now()}.${fileExt}`;
  const filePath = `avatars/${fileName}`;

  // 上传文件到 Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('user-uploads')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (uploadError) {
    console.error('上传头像失败:', uploadError);
    throw new Error('上传头像失败');
  }

  // 获取公开URL
  const { data } = supabase.storage
    .from('user-uploads')
    .getPublicUrl(filePath);

  return data.publicUrl;
}
