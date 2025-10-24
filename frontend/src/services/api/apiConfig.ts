/**
 * API配置服务
 * 用于管理用户的第三方服务API密钥配置
 */

import { supabase } from '../supabase/client';
import type { ApiConfig, ApiConfigInput, ApiConfigStatus, ServiceType } from '../../types/api';

// 简单的加密/解密实现（前端临时方案，实际应使用后端加密）
// 注意：这只是基础的编码，不是真正的加密！生产环境应该使用后端加密
const encryptKey = (key: string): string => {
  return btoa(key); // Base64编码
};

const decryptKey = (encryptedKey: string): string => {
  try {
    return atob(encryptedKey); // Base64解码
  } catch {
    return '';
  }
};

/**
 * 保存或更新API配置
 */
export const saveApiConfig = async (config: ApiConfigInput): Promise<ApiConfig> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('用户未登录');
  }

  // 加密密钥
  const encryptedConfig = {
    user_id: user.id,
    service_type: config.service_type,
    service_name: config.service_name,
    api_key_encrypted: encryptKey(config.api_key),
    api_secret_encrypted: config.api_secret ? encryptKey(config.api_secret) : null,
    additional_config: config.additional_config || {},
    is_active: config.is_active !== undefined ? config.is_active : true,
  };

  // 检查是否已存在配置
  const { data: existing } = await supabase
    .from('api_configs')
    .select('id')
    .eq('user_id', user.id)
    .eq('service_type', config.service_type)
    .single();

  if (existing) {
    // 更新现有配置
    const { data, error } = await supabase
      .from('api_configs')
      .update(encryptedConfig)
      .eq('id', existing.id)
      .select()
      .single();

    if (error) {
      throw new Error(`更新API配置失败: ${error.message}`);
    }

    return data;
  } else {
    // 创建新配置
    const { data, error } = await supabase
      .from('api_configs')
      .insert(encryptedConfig)
      .select()
      .single();

    if (error) {
      throw new Error(`保存API配置失败: ${error.message}`);
    }

    return data;
  }
};

/**
 * 获取指定类型的API配置
 */
export const getApiConfig = async (serviceType: ServiceType): Promise<ApiConfig | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('用户未登录');
  }

  const { data, error } = await supabase
    .from('api_configs')
    .select('*')
    .eq('user_id', user.id)
    .eq('service_type', serviceType)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // 未找到记录
      return null;
    }
    throw new Error(`获取API配置失败: ${error.message}`);
  }

  return data;
};

/**
 * 获取解密后的API密钥（用于实际调用API）
 */
export const getDecryptedApiKey = async (serviceType: ServiceType): Promise<string | null> => {
  const config = await getApiConfig(serviceType);
  
  if (!config || !config.api_key_encrypted) {
    return null;
  }

  return decryptKey(config.api_key_encrypted);
};

/**
 * 获取解密后的API Secret（用于实际调用API）
 */
export const getDecryptedApiSecret = async (serviceType: ServiceType): Promise<string | null> => {
  const config = await getApiConfig(serviceType);
  
  if (!config || !config.api_secret_encrypted) {
    return null;
  }

  return decryptKey(config.api_secret_encrypted);
};

/**
 * 获取所有API配置的状态（不包含实际密钥）
 */
export const getAllApiConfigStatus = async (): Promise<ApiConfigStatus[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('用户未登录');
  }

  const { data, error } = await supabase
    .from('api_configs')
    .select('service_type, service_name, is_active')
    .eq('user_id', user.id);

  if (error) {
    throw new Error(`获取API配置状态失败: ${error.message}`);
  }

  const serviceTypes: ServiceType[] = ['llm', 'voice', 'map'];
  
  return serviceTypes.map(serviceType => {
    const config = data?.find(c => c.service_type === serviceType);
    return {
      service_type: serviceType,
      is_configured: !!config && config.is_active,
      service_name: config?.service_name,
    };
  });
};

/**
 * 删除API配置
 */
export const deleteApiConfig = async (serviceType: ServiceType): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('用户未登录');
  }

  const { error } = await supabase
    .from('api_configs')
    .delete()
    .eq('user_id', user.id)
    .eq('service_type', serviceType);

  if (error) {
    throw new Error(`删除API配置失败: ${error.message}`);
  }
};

/**
 * 验证API密钥格式（基础验证）
 */
export const validateApiKey = (serviceType: ServiceType, apiKey: string): { valid: boolean; message?: string } => {
  if (!apiKey || apiKey.trim().length === 0) {
    return { valid: false, message: 'API密钥不能为空' };
  }

  // 根据不同服务类型进行简单验证
  switch (serviceType) {
    case 'llm':
      if (apiKey.length < 20) {
        return { valid: false, message: 'LLM API密钥长度不足' };
      }
      break;
    case 'voice':
      if (apiKey.length < 10) {
        return { valid: false, message: '语音识别API密钥长度不足' };
      }
      break;
    case 'map':
      if (apiKey.length < 10) {
        return { valid: false, message: '地图服务API密钥长度不足' };
      }
      break;
  }

  return { valid: true };
};

/**
 * 测试API配置是否有效（可选功能，需要实际调用API验证）
 */
export const testApiConfig = async (serviceType: ServiceType): Promise<boolean> => {
  // TODO: 实现实际的API调用测试
  // 这里只是简单检查是否配置了密钥
  const config = await getApiConfig(serviceType);
  return !!config && !!config.api_key_encrypted;
};
