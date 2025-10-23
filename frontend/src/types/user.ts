// User types
export interface User {
  id: string;
  email: string;
  username?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserProfile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  default_departure: string | null;
  travel_tags: string[];
  default_budget_min: number | null;
  default_budget_max: number | null;
  language: 'zh' | 'en';
  theme: 'light' | 'dark';
  created_at: string;
  updated_at: string;
}
