// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  username?: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: any;
}

// API Configuration types
export type ServiceType = 'llm' | 'voice' | 'map';

export interface ApiConfig {
  id?: string;
  user_id?: string;
  service_type: ServiceType;
  service_name?: string;
  api_key_encrypted: string;
  api_secret_encrypted?: string;
  additional_config?: Record<string, any>;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ApiConfigInput {
  service_type: ServiceType;
  service_name?: string;
  api_key: string; // 明文密钥，前端输入
  api_secret?: string; // 明文密钥，前端输入
  additional_config?: Record<string, any>;
  is_active?: boolean;
}

export interface ApiConfigStatus {
  service_type: ServiceType;
  is_configured: boolean;
  service_name?: string;
}
