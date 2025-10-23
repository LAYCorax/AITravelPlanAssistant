/**
 * LLM Service - 大语言模型服务
 * 使用阿里云百炼平台进行AI行程规划生成
 */

import { TravelPlan, ItineraryDetail } from '@/types';

const LLM_API_KEY = import.meta.env.VITE_LLM_API_KEY;
const LLM_BASE_URL = import.meta.env.VITE_LLM_BASE_URL;

/**
 * 用户输入的旅行需求
 */
export interface TripRequest {
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  travelerCount: number;
  preferences?: string[];
  additionalRequirements?: string;
}

/**
 * AI生成的行程响应
 */
export interface TripGenerationResponse {
  success: boolean;
  plan?: TravelPlan;
  itinerary?: ItineraryDetail[];
  error?: string;
}

/**
 * 构建行程规划的Prompt模板
 */
function buildTripPlanningPrompt(request: TripRequest): string {
  const days = Math.ceil(
    (new Date(request.endDate).getTime() - new Date(request.startDate).getTime()) / 
    (1000 * 60 * 60 * 24)
  ) + 1;

  return `你是一位专业的旅行规划师。请根据以下信息，为用户生成一份详细的旅行计划。

## 旅行需求
- 目的地：${request.destination}
- 开始日期：${request.startDate}
- 结束日期：${request.endDate}
- 旅行天数：${days}天
- 旅行人数：${request.travelerCount}人
- 总预算：¥${request.budget}元
${request.preferences && request.preferences.length > 0 ? `- 旅行偏好：${request.preferences.join('、')}` : ''}
${request.additionalRequirements ? `- 其他要求：${request.additionalRequirements}` : ''}

## 输出要求
请严格按照以下JSON格式输出旅行计划，不要包含任何其他文字说明：

\`\`\`json
{
  "plan": {
    "title": "旅行计划标题（如：北京5日游）",
    "destination": "${request.destination}",
    "startDate": "${request.startDate}",
    "endDate": "${request.endDate}",
    "days": ${days},
    "budget": ${request.budget},
    "travelerCount": ${request.travelerCount},
    "status": "draft",
    "description": "简短的旅行计划描述（2-3句话）"
  },
  "itinerary": [
    {
      "day": 1,
      "date": "日期（YYYY-MM-DD格式）",
      "title": "当日主题（如：初识北京 - 探索古都魅力）",
      "activities": [
        {
          "time": "时间范围（如：09:00-11:00）",
          "type": "activity",
          "name": "活动名称",
          "location": "地点名称",
          "address": "详细地址",
          "coordinates": {
            "latitude": 纬度数字,
            "longitude": 经度数字
          },
          "description": "活动详细描述",
          "cost": 预计费用（数字）,
          "tips": "游玩建议和注意事项"
        }
      ],
      "accommodation": {
        "name": "酒店名称",
        "address": "酒店地址",
        "cost": 住宿费用（数字）,
        "tips": "住宿建议"
      },
      "transportation": {
        "method": "交通方式（如：地铁、出租车、步行）",
        "cost": 交通费用（数字）,
        "tips": "交通建议"
      },
      "meals": {
        "breakfast": { "location": "地点", "cost": 费用, "recommendation": "推荐菜品" },
        "lunch": { "location": "地点", "cost": 费用, "recommendation": "推荐菜品" },
        "dinner": { "location": "地点", "cost": 费用, "recommendation": "推荐菜品" }
      },
      "totalCost": 当日总费用（数字）,
      "notes": "当日备注和提醒事项"
    }
  ]
}
\`\`\`

## 重要提示
1. 每天安排3-5个景点或活动
2. 考虑景点之间的距离和交通时间
3. 合理安排餐饮，推荐当地特色美食
4. 预算分配要合理，确保总费用不超过预算的90%
5. 提供实用的游玩建议和注意事项
6. 所有地点需要提供真实的坐标（经纬度）
7. 必须严格按照JSON格式输出，不要有任何额外文字`;
}

/**
 * 调用阿里云百炼API生成旅行计划
 */
export async function generateTripPlan(
  request: TripRequest,
  onProgress?: (text: string) => void
): Promise<TripGenerationResponse> {
  try {
    // 检查API Key
    if (!LLM_API_KEY || LLM_API_KEY === 'your_alibaba_bailian_api_key_here') {
      throw new Error('请先配置阿里云百炼API密钥');
    }

    const prompt = buildTripPlanningPrompt(request);

    // 调用阿里云百炼API
    const response = await fetch(`${LLM_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LLM_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'qwen-turbo', // 使用通义千问模型
        messages: [
          {
            role: 'system',
            content: '你是一位专业的旅行规划师，擅长根据用户需求制定详细的旅行计划。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
        stream: false, // 暂时不使用流式输出
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'API调用失败');
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('AI未返回有效内容');
    }

    // 解析AI返回的JSON
    const result = parseAIResponse(content);
    
    if (onProgress) {
      onProgress(content);
    }

    return {
      success: true,
      plan: result.plan,
      itinerary: result.itinerary,
    };

  } catch (error: any) {
    console.error('生成旅行计划失败:', error);
    return {
      success: false,
      error: error.message || '生成旅行计划时发生错误',
    };
  }
}

/**
 * 解析AI返回的JSON响应
 */
function parseAIResponse(content: string): {
  plan: TravelPlan;
  itinerary: ItineraryDetail[];
} {
  try {
    // 提取JSON内容（可能被```json包裹）
    let jsonStr = content.trim();
    
    // 移除markdown代码块标记
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/```\s*$/, '');
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```\s*/, '').replace(/```\s*$/, '');
    }

    const parsed = JSON.parse(jsonStr);

    if (!parsed.plan || !parsed.itinerary) {
      throw new Error('AI返回的数据格式不正确');
    }

    // 验证并转换数据格式
    const plan: TravelPlan = {
      id: '', // 保存到数据库时会生成
      userId: '', // 从当前用户获取
      title: parsed.plan.title,
      destination: parsed.plan.destination,
      startDate: parsed.plan.startDate,
      endDate: parsed.plan.endDate,
      days: parsed.plan.days,
      budget: parsed.plan.budget,
      travelerCount: parsed.plan.travelerCount,
      status: 'draft',
      description: parsed.plan.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const itinerary: ItineraryDetail[] = parsed.itinerary.map((day: any) => ({
      id: '', // 保存到数据库时会生成
      planId: '', // 保存到数据库时关联
      day: day.day,
      date: day.date,
      title: day.title,
      activities: day.activities,
      accommodation: day.accommodation,
      transportation: day.transportation,
      meals: day.meals,
      totalCost: day.totalCost,
      notes: day.notes,
    }));

    return { plan, itinerary };

  } catch (error: any) {
    console.error('解析AI响应失败:', error);
    throw new Error('无法解析AI返回的旅行计划，请重试');
  }
}

/**
 * 重新生成旅行计划（当用户不满意时）
 */
export async function regenerateTripPlan(
  request: TripRequest,
  feedback: string
): Promise<TripGenerationResponse> {
  try {
    if (!LLM_API_KEY || LLM_API_KEY === 'your_alibaba_bailian_api_key_here') {
      throw new Error('请先配置阿里云百炼API密钥');
    }

    const prompt = buildTripPlanningPrompt(request);
    const feedbackPrompt = `\n\n## 用户反馈\n用户对上一次生成的计划有以下意见：\n${feedback}\n\n请根据用户反馈重新生成更符合要求的旅行计划。`;

    const response = await fetch(`${LLM_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LLM_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'qwen-turbo',
        messages: [
          {
            role: 'system',
            content: '你是一位专业的旅行规划师，擅长根据用户需求和反馈制定详细的旅行计划。'
          },
          {
            role: 'user',
            content: prompt + feedbackPrompt
          }
        ],
        temperature: 0.8, // 提高温度以获得更多样化的结果
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'API调用失败');
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('AI未返回有效内容');
    }

    const result = parseAIResponse(content);

    return {
      success: true,
      plan: result.plan,
      itinerary: result.itinerary,
    };

  } catch (error: any) {
    console.error('重新生成旅行计划失败:', error);
    return {
      success: false,
      error: error.message || '重新生成旅行计划时发生错误',
    };
  }
}

/**
 * 检查LLM API配置是否正确
 */
export function checkLLMConfig(): { configured: boolean; message: string } {
  if (!LLM_API_KEY || LLM_API_KEY === 'your_alibaba_bailian_api_key_here') {
    return {
      configured: false,
      message: '请在设置中配置阿里云百炼API密钥',
    };
  }

  if (!LLM_BASE_URL) {
    return {
      configured: false,
      message: 'LLM API地址未配置',
    };
  }

  return {
    configured: true,
    message: 'LLM配置正常',
  };
}
