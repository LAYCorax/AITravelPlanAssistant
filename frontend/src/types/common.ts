// Common types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface FormErrors {
  [key: string]: string | undefined;
}
