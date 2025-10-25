/**
 * 统一错误处理工具
 * 提供用户友好的错误提示
 */

import { message } from 'antd';

/**
 * 错误类型
 */
export type ErrorType = 
  | 'NETWORK'
  | 'AUTH'
  | 'VALIDATION'
  | 'API'
  | 'MAP'
  | 'GEOCODING'
  | 'ROUTE_PLANNING'
  | 'UNKNOWN';

export const ErrorType = {
  NETWORK: 'NETWORK' as ErrorType,
  AUTH: 'AUTH' as ErrorType,
  VALIDATION: 'VALIDATION' as ErrorType,
  API: 'API' as ErrorType,
  MAP: 'MAP' as ErrorType,
  GEOCODING: 'GEOCODING' as ErrorType,
  ROUTE_PLANNING: 'ROUTE_PLANNING' as ErrorType,
  UNKNOWN: 'UNKNOWN' as ErrorType,
};

/**
 * 错误信息映射
 */
const ERROR_MESSAGES: Record<string, { title: string; description: string; solution: string }> = {
  NETWORK: {
    title: '网络连接失败',
    description: '无法连接到服务器',
    solution: '请检查网络连接后重试',
  },
  AUTH: {
    title: '身份验证失败',
    description: '您的登录状态已过期',
    solution: '请重新登录',
  },
  VALIDATION: {
    title: '输入验证失败',
    description: '提交的数据格式不正确',
    solution: '请检查输入内容后重试',
  },
  API: {
    title: '服务异常',
    description: 'API服务暂时不可用',
    solution: '请稍后重试',
  },
  MAP: {
    title: '地图加载失败',
    description: '地图服务初始化失败',
    solution: '请前往【设置 → API配置】检查高德地图密钥配置',
  },
  GEOCODING: {
    title: '地址解析失败',
    description: '无法将地址转换为坐标',
    solution: '请输入更详细的地址信息，或直接选择地图上的位置',
  },
  ROUTE_PLANNING: {
    title: '路线规划失败',
    description: '无法规划出可行路线',
    solution: '请检查起点和终点是否有效，或尝试减少途经点数量',
  },
  UNKNOWN: {
    title: '操作失败',
    description: '发生未知错误',
    solution: '请刷新页面后重试',
  },
};

/**
 * 错误详情接口
 */
export interface ErrorDetail {
  type: ErrorType;
  message: string;
  originalError?: Error | any;
  context?: Record<string, any>;
}

/**
 * 显示用户友好的错误提示
 */
export function showFriendlyError(detail: ErrorDetail): void {
  const errorInfo = ERROR_MESSAGES[detail.type] || ERROR_MESSAGES.UNKNOWN;
  
  const fullMessage = `${errorInfo.title}：${detail.message || errorInfo.description}。${errorInfo.solution}`;
  
  message.error({
    content: fullMessage,
    duration: 5,
  });

  // 在控制台输出详细错误信息（便于调试）
  console.error('[ErrorHandler]', {
    type: detail.type,
    title: errorInfo.title,
    message: detail.message,
    solution: errorInfo.solution,
    originalError: detail.originalError,
    context: detail.context,
  });
}

/**
 * 解析API错误
 */
export function parseApiError(error: any): ErrorDetail {
  // 网络错误
  if (error.message === 'Network Error' || !error.response) {
    return {
      type: ErrorType.NETWORK,
      message: '网络连接失败',
      originalError: error,
    };
  }

  const status = error.response?.status;
  const data = error.response?.data;

  // 401 未授权
  if (status === 401) {
    return {
      type: ErrorType.AUTH,
      message: '登录已过期',
      originalError: error,
    };
  }

  // 400 验证错误
  if (status === 400) {
    return {
      type: ErrorType.VALIDATION,
      message: data?.message || '输入数据格式不正确',
      originalError: error,
      context: { data },
    };
  }

  // 500 服务器错误
  if (status >= 500) {
    return {
      type: ErrorType.API,
      message: '服务器暂时不可用',
      originalError: error,
    };
  }

  // 其他错误
  return {
    type: ErrorType.UNKNOWN,
    message: data?.message || error.message || '未知错误',
    originalError: error,
  };
}

/**
 * 解析地图相关错误
 */
export function parseMapError(error: any, context?: string): ErrorDetail {
  const errorStr = String(error);

  // 地理编码失败
  if (errorStr.includes('geocode') || errorStr.includes('地址')) {
    return {
      type: ErrorType.GEOCODING,
      message: context || '地址解析失败',
      originalError: error,
    };
  }

  // 路线规划失败
  if (errorStr.includes('route') || errorStr.includes('路线')) {
    return {
      type: ErrorType.ROUTE_PLANNING,
      message: context || '路线规划失败',
      originalError: error,
    };
  }

  // 通用地图错误
  return {
    type: ErrorType.MAP,
    message: context || '地图服务异常',
    originalError: error,
  };
}

/**
 * 包装异步操作的错误处理
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  errorType?: ErrorType,
  customMessage?: string
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    let errorDetail: ErrorDetail;

    if (errorType === ErrorType.MAP || errorType === ErrorType.GEOCODING || errorType === ErrorType.ROUTE_PLANNING) {
      errorDetail = parseMapError(error, customMessage);
    } else {
      errorDetail = parseApiError(error);
      if (customMessage) {
        errorDetail.message = customMessage;
      }
    }

    showFriendlyError(errorDetail);
    return null;
  }
}

/**
 * 快捷方法：显示网络错误
 */
export function showNetworkError(customMessage?: string): void {
  showFriendlyError({
    type: ErrorType.NETWORK,
    message: customMessage || '网络连接失败',
  });
}

/**
 * 快捷方法：显示认证错误
 */
export function showAuthError(customMessage?: string): void {
  showFriendlyError({
    type: ErrorType.AUTH,
    message: customMessage || '登录已过期',
  });
}

/**
 * 快捷方法：显示验证错误
 */
export function showValidationError(field: string, reason: string): void {
  showFriendlyError({
    type: ErrorType.VALIDATION,
    message: `${field}${reason}`,
  });
}

/**
 * 快捷方法：显示地图错误
 */
export function showMapError(customMessage?: string): void {
  showFriendlyError({
    type: ErrorType.MAP,
    message: customMessage || '地图服务异常',
  });
}
