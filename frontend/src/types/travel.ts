// Travel Plan types
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
}

export interface ItineraryDetail {
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
