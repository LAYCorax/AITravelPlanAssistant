// Travel Plan types - 数据库字段（snake_case）
export interface TravelPlan {
  id: string;
  user_id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  days: number;
  budget: number;
  traveler_count: number;
  status: 'draft' | 'confirmed' | 'completed' | 'cancelled';
  input_method?: 'voice' | 'text';
  original_input?: string;
  ai_generated_content?: Record<string, any>;
  created_at: string;
  updated_at: string;
  // 前端使用的camelCase别名（为了兼容AI生成的数据）
  userId?: string;
  startDate?: string;
  endDate?: string;
  travelerCount?: number;
  description?: string;
}

// AI生成的行程详情 - 嵌套结构（用于前端显示）
export interface Activity {
  time: string;
  type: 'sightseeing' | 'dining' | 'activity' | 'transport';
  name: string;
  location: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  description: string;
  cost: number;
  tips?: string;
}

export interface Accommodation {
  name: string;
  address: string;
  cost: number;
  tips?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface Transportation {
  method: string;
  cost: number;
  tips?: string;
}

export interface Meal {
  location: string;
  cost: number;
  recommendation?: string;
}

export interface Meals {
  breakfast?: Meal;
  lunch?: Meal;
  dinner?: Meal;
}

// AI生成的每日行程详情（前端使用）
export interface ItineraryDetail {
  id: string;
  planId: string;
  day: number;
  date: string;
  title: string;
  activities: Activity[];
  accommodation?: Accommodation;
  transportation?: Transportation;
  meals?: Meals;
  totalCost: number;
  notes?: string;
}

// 数据库存储的行程详情（扁平化结构） - 保留用于数据库操作
export interface ItineraryDetailDB {
  id: string;
  plan_id: string;
  day_number: number;
  time_slot: 'morning' | 'afternoon' | 'evening' | 'night';
  activity_type: 'attraction' | 'meal' | 'transport' | 'hotel';
  title: string;
  description?: string;
  location_name?: string;
  location_address?: string;
  location_lat?: number;
  location_lng?: number;
  estimated_duration?: number;
  estimated_cost?: number;
  order_index: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTravelPlanInput {
  destination: string;
  start_date: string;
  end_date: string;
  budget: number;
  traveler_count: number;
  input_method?: 'voice' | 'text';
  original_input?: string;
}

// 费用记录相关类型 - Week 7
export interface Expense {
  id: string;
  plan_id: string;
  user_id: string;
  category: 'transport' | 'accommodation' | 'food' | 'attraction' | 'shopping' | 'other';
  amount: number;
  description: string;
  expense_date: string;
  created_at: string;
  updated_at: string;
  image_url?: string;
}

export interface CreateExpenseInput {
  plan_id: string;
  category: 'transport' | 'accommodation' | 'food' | 'attraction' | 'shopping' | 'other';
  amount: number;
  description: string;
  expense_date: string;
  image_url?: string;
}

export interface ExpenseSummary {
  total: number;
  byCategory: {
    transport: number;
    accommodation: number;
    food: number;
    attraction: number;
    shopping: number;
    other: number;
  };
}

export interface BudgetComparison {
  budgeted: number;
  spent: number;
  remaining: number;
  percentage: number;
}
