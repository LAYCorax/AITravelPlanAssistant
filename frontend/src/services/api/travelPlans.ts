/**
 * Travel Plans Database Service
 * 旅行计划数据库操作服务
 */

import { supabase } from '../supabase/client';
import type { TravelPlan, ItineraryDetail } from '../../types';

/**
 * 保存完整的旅行计划（包括行程详情）
 */
export async function saveTravelPlan(
  plan: Omit<TravelPlan, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
  itinerary: Omit<ItineraryDetail, 'id' | 'planId'>[]
): Promise<{ success: boolean; planId?: string; error?: string }> {
  try {
    // 获取当前用户
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('用户未登录');
    }

    // 1. 保存旅行计划主表
    const { data: savedPlan, error: planError } = await supabase
      .from('travel_plans')
      .insert({
        user_id: user.id,
        title: plan.title,
        destination: plan.destination,
        start_date: plan.startDate,
        end_date: plan.endDate,
        days: plan.days,
        budget: plan.budget,
        traveler_count: plan.travelerCount,
        status: plan.status || 'draft',
        description: plan.description,
      })
      .select()
      .single();

    if (planError) {
      console.error('保存旅行计划失败:', planError);
      throw new Error(planError.message);
    }

    if (!savedPlan) {
      throw new Error('保存旅行计划失败');
    }

    // 2. 保存行程详情
    const itineraryData = itinerary.map(item => ({
      plan_id: savedPlan.id,
      day: item.day,
      date: item.date,
      title: item.title,
      activities: item.activities,
      accommodation: item.accommodation,
      transportation: item.transportation,
      meals: item.meals,
      total_cost: item.totalCost,
      notes: item.notes,
    }));

    const { error: itineraryError } = await supabase
      .from('itinerary_details')
      .insert(itineraryData);

    if (itineraryError) {
      console.error('保存行程详情失败:', itineraryError);
      // 如果行程详情保存失败，删除已保存的计划
      await supabase.from('travel_plans').delete().eq('id', savedPlan.id);
      throw new Error(itineraryError.message);
    }

    return {
      success: true,
      planId: savedPlan.id,
    };

  } catch (error: any) {
    console.error('保存旅行计划失败:', error);
    return {
      success: false,
      error: error.message || '保存旅行计划时发生错误',
    };
  }
}

/**
 * 获取用户的所有旅行计划列表
 */
export async function getUserTravelPlans(): Promise<{
  success: boolean;
  plans?: TravelPlan[];
  error?: string;
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('用户未登录');
    }

    const { data, error } = await supabase
      .from('travel_plans')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    const plans: TravelPlan[] = (data || []).map(item => ({
      id: item.id,
      user_id: item.user_id,
      title: item.title,
      destination: item.destination,
      start_date: item.start_date,
      end_date: item.end_date,
      days: item.days,
      budget: item.budget,
      traveler_count: item.traveler_count,
      status: item.status,
      description: item.description,
      created_at: item.created_at,
      updated_at: item.updated_at,
      // 添加camelCase别名供前端使用
      userId: item.user_id,
      startDate: item.start_date,
      endDate: item.end_date,
      travelerCount: item.traveler_count,
    }));

    return {
      success: true,
      plans,
    };

  } catch (error: any) {
    console.error('获取旅行计划列表失败:', error);
    return {
      success: false,
      error: error.message || '获取旅行计划列表时发生错误',
    };
  }
}

/**
 * 获取单个旅行计划详情（包括行程）
 */
export async function getTravelPlanById(planId: string): Promise<{
  success: boolean;
  plan?: TravelPlan;
  itinerary?: ItineraryDetail[];
  error?: string;
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('用户未登录');
    }

    // 1. 获取旅行计划
    const { data: planData, error: planError } = await supabase
      .from('travel_plans')
      .select('*')
      .eq('id', planId)
      .eq('user_id', user.id)
      .single();

    if (planError) {
      throw new Error(planError.message);
    }

    if (!planData) {
      throw new Error('旅行计划不存在');
    }

    const plan: TravelPlan = {
      id: planData.id,
      user_id: planData.user_id,
      title: planData.title,
      destination: planData.destination,
      start_date: planData.start_date,
      end_date: planData.end_date,
      days: planData.days,
      budget: planData.budget,
      traveler_count: planData.traveler_count,
      status: planData.status,
      description: planData.description,
      created_at: planData.created_at,
      updated_at: planData.updated_at,
      // 添加camelCase别名
      userId: planData.user_id,
      startDate: planData.start_date,
      endDate: planData.end_date,
      travelerCount: planData.traveler_count,
    };

    // 2. 获取行程详情
    const { data: itineraryData, error: itineraryError } = await supabase
      .from('itinerary_details')
      .select('*')
      .eq('plan_id', planId)
      .order('day', { ascending: true });

    if (itineraryError) {
      throw new Error(itineraryError.message);
    }

    const itinerary: ItineraryDetail[] = (itineraryData || []).map(item => ({
      id: item.id,
      planId: item.plan_id,
      day: item.day,
      date: item.date,
      title: item.title,
      activities: item.activities,
      accommodation: item.accommodation,
      transportation: item.transportation,
      meals: item.meals,
      totalCost: item.total_cost,
      notes: item.notes,
    }));

    return {
      success: true,
      plan,
      itinerary,
    };

  } catch (error: any) {
    console.error('获取旅行计划详情失败:', error);
    return {
      success: false,
      error: error.message || '获取旅行计划详情时发生错误',
    };
  }
}

/**
 * 更新旅行计划状态
 */
export async function updateTravelPlanStatus(
  planId: string,
  status: 'draft' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('用户未登录');
    }

    const { error } = await supabase
      .from('travel_plans')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', planId)
      .eq('user_id', user.id);

    if (error) {
      throw new Error(error.message);
    }

    return { success: true };

  } catch (error: any) {
    console.error('更新旅行计划状态失败:', error);
    return {
      success: false,
      error: error.message || '更新旅行计划状态时发生错误',
    };
  }
}

/**
 * 删除旅行计划（包括关联的行程详情）
 */
export async function deleteTravelPlan(planId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('用户未登录');
    }

    // 1. 删除行程详情（由于外键约束，可能需要先删除）
    const { error: itineraryError } = await supabase
      .from('itinerary_details')
      .delete()
      .eq('plan_id', planId);

    if (itineraryError) {
      console.error('删除行程详情失败:', itineraryError);
    }

    // 2. 删除旅行计划
    const { error: planError } = await supabase
      .from('travel_plans')
      .delete()
      .eq('id', planId)
      .eq('user_id', user.id);

    if (planError) {
      throw new Error(planError.message);
    }

    return { success: true };

  } catch (error: any) {
    console.error('删除旅行计划失败:', error);
    return {
      success: false,
      error: error.message || '删除旅行计划时发生错误',
    };
  }
}

/**
 * 更新旅行计划和行程详情
 */
export async function updateTravelPlan(
  planId: string,
  plan: Partial<Omit<TravelPlan, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>,
  itinerary?: Omit<ItineraryDetail, 'id' | 'planId'>[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('用户未登录');
    }

    // 1. 更新旅行计划
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (plan.title) updateData.title = plan.title;
    if (plan.destination) updateData.destination = plan.destination;
    if (plan.startDate) updateData.start_date = plan.startDate;
    if (plan.endDate) updateData.end_date = plan.endDate;
    if (plan.days) updateData.days = plan.days;
    if (plan.budget !== undefined) updateData.budget = plan.budget;
    if (plan.travelerCount) updateData.traveler_count = plan.travelerCount;
    if (plan.status) updateData.status = plan.status;
    if (plan.description) updateData.description = plan.description;

    const { error: planError } = await supabase
      .from('travel_plans')
      .update(updateData)
      .eq('id', planId)
      .eq('user_id', user.id);

    if (planError) {
      throw new Error(planError.message);
    }

    // 2. 如果提供了行程详情，则更新
    if (itinerary && itinerary.length > 0) {
      // 删除旧的行程详情
      await supabase
        .from('itinerary_details')
        .delete()
        .eq('plan_id', planId);

      // 插入新的行程详情
      const itineraryData = itinerary.map(item => ({
        plan_id: planId,
        day: item.day,
        date: item.date,
        title: item.title,
        activities: item.activities,
        accommodation: item.accommodation,
        transportation: item.transportation,
        meals: item.meals,
        total_cost: item.totalCost,
        notes: item.notes,
      }));

      const { error: itineraryError } = await supabase
        .from('itinerary_details')
        .insert(itineraryData);

      if (itineraryError) {
        throw new Error(itineraryError.message);
      }
    }

    return { success: true };

  } catch (error: any) {
    console.error('更新旅行计划失败:', error);
    return {
      success: false,
      error: error.message || '更新旅行计划时发生错误',
    };
  }
}
