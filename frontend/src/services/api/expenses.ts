/**
 * Expense API Service - Week 7
 * 费用记录相关API
 */

import { supabase } from '../supabase/client';
import type { Expense, CreateExpenseInput, ExpenseSummary } from '../../types';

/**
 * 添加费用记录
 */
export async function createExpense(input: CreateExpenseInput): Promise<{
  success: boolean;
  expense?: Expense;
  error?: string;
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: '未登录' };
    }

    const { data, error } = await supabase
      .from('expenses')
      .insert([
        {
          plan_id: input.plan_id,
          user_id: user.id,
          category: input.category,
          amount: input.amount,
          description: input.description,
          expense_date: input.expense_date,
          image_url: input.image_url,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Create expense error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, expense: data };
  } catch (error: any) {
    console.error('Create expense exception:', error);
    return { success: false, error: error.message || '添加费用记录失败' };
  }
}

/**
 * 获取指定计划的所有费用记录
 */
export async function getExpensesByPlanId(planId: string): Promise<{
  success: boolean;
  expenses?: Expense[];
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('plan_id', planId)
      .order('expense_date', { ascending: false });

    if (error) {
      console.error('Get expenses error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, expenses: data || [] };
  } catch (error: any) {
    console.error('Get expenses exception:', error);
    return { success: false, error: error.message || '获取费用记录失败' };
  }
}

/**
 * 更新费用记录
 */
export async function updateExpense(
  expenseId: string,
  updates: Partial<CreateExpenseInput>
): Promise<{
  success: boolean;
  expense?: Expense;
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .update(updates)
      .eq('id', expenseId)
      .select()
      .single();

    if (error) {
      console.error('Update expense error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, expense: data };
  } catch (error: any) {
    console.error('Update expense exception:', error);
    return { success: false, error: error.message || '更新费用记录失败' };
  }
}

/**
 * 删除费用记录
 */
export async function deleteExpense(expenseId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId);

    if (error) {
      console.error('Delete expense error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Delete expense exception:', error);
    return { success: false, error: error.message || '删除费用记录失败' };
  }
}

/**
 * 获取费用统计汇总
 */
export async function getExpenseSummary(planId: string): Promise<{
  success: boolean;
  summary?: ExpenseSummary;
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('category, amount')
      .eq('plan_id', planId);

    if (error) {
      console.error('Get expense summary error:', error);
      return { success: false, error: error.message };
    }

    // 计算各分类费用总和
    const summary: ExpenseSummary = {
      total: 0,
      byCategory: {
        transport: 0,
        accommodation: 0,
        food: 0,
        attraction: 0,
        shopping: 0,
        other: 0,
      },
    };

    data?.forEach((expense) => {
      const amount = Number(expense.amount);
      summary.total += amount;
      summary.byCategory[expense.category as keyof ExpenseSummary['byCategory']] += amount;
    });

    return { success: true, summary };
  } catch (error: any) {
    console.error('Get expense summary exception:', error);
    return { success: false, error: error.message || '获取费用统计失败' };
  }
}

/**
 * 批量导入费用记录（可选功能）
 */
export async function batchCreateExpenses(
  planId: string,
  expenses: Omit<CreateExpenseInput, 'plan_id'>[]
): Promise<{
  success: boolean;
  count?: number;
  error?: string;
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: '未登录' };
    }

    const expensesData = expenses.map(exp => ({
      plan_id: planId,
      user_id: user.id,
      ...exp,
    }));

    const { data, error } = await supabase
      .from('expenses')
      .insert(expensesData)
      .select();

    if (error) {
      console.error('Batch create expenses error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, count: data?.length || 0 };
  } catch (error: any) {
    console.error('Batch create expenses exception:', error);
    return { success: false, error: error.message || '批量添加费用记录失败' };
  }
}
