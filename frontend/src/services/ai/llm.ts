/**
 * LLM Service - 大语言模型服务
 * 使用阿里云百炼平台进行AI行程规划生成
 */

import type { TravelPlan, ItineraryDetail } from '../../types';
import { getDecryptedApiKey } from '../api/apiConfig';

const LLM_BASE_URL = import.meta.env.VITE_LLM_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1';

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
 * 构建基于用户口述需求的Prompt模板
 */
function buildVoiceTripPlanningPrompt(voiceInput: string): string {
  return `你是一位经验丰富的专业旅行规划师，精通全国各地的旅游资源、交通路线和当地美食。请根据以下用户口述的需求，为他们量身定制一份详细、实用、可执行的旅行计划：

## 用户口述需求
"${voiceInput}"

## 规划要求

### 1. 信息提取
首先从用户的口述中提取以下关键信息：
- 目的地
- 旅行天数（如未明确说明，建议3-5天）
- 预算（如未明确说明，建议中等预算）
- 人数（如未明确说明，默认1人）
- 特殊偏好或要求

### 2. 行程安排原则
- 合理安排每日游览时间，避免过度疲劳（建议每天3-5个景点）
- 景点之间距离要合理，考虑实际交通时间
- 每天安排的活动要主题明确，路线顺畅不走回头路
- 为突发情况预留机动时间
- 考虑季节和天气因素，给出相应建议

### 3. 预算分配建议
- 总预算的30-40%用于交通（含往返机票/车票）
- 总预算的25-35%用于住宿
- 总预算的20-30%用于餐饮
- 总预算的15-20%用于门票和其他费用
- 预留10%作为应急备用金
- **重要**: 确保所有费用总和不超过预算的90%

### 4. 景点选择标准
- 选择当地最具代表性和特色的景点
- 兼顾人文历史、自然风光、美食体验
- 考虑游客评价和口碑
- 避开过度商业化的景点
- 标注每个景点的游览时长和最佳游览时间

### 5. 餐饮推荐要求
- 推荐当地特色美食和老字号餐厅
- 提供具体的餐厅名称和招牌菜
- 标注人均消费价格
- 考虑就餐环境和用餐高峰期

### 6. 住宿建议标准
- 选择交通便利、安全舒适的住宿区域
- 提供具体的酒店类型和价格区间
- 考虑距离景点的便利性

### 7. 交通规划细节
- 详细说明每段行程的交通方式
- 提供预估的交通时间和费用
- 推荐使用的交通卡或优惠方式
- 标注地铁/公交线路

## 输出格式要求

**必须严格按照以下JSON格式输出，不要添加任何额外的文字说明或markdown标记**：

\`\`\`json
{
  "plan": {
    "title": "根据用户需求生成的标题（如：北京5日深度游）",
    "destination": "目的地",
    "startDate": "建议的开始日期（格式：YYYY-MM-DD，可以是明天或近期合适的日期）",
    "endDate": "建议的结束日期（格式：YYYY-MM-DD）",
    "days": 天数,
    "budget": 预算金额,
    "travelerCount": 人数,
    "status": "draft",
    "description": "简要描述本次旅行的特色和亮点（50-100字）"
  },
  "itinerary": [
    {
      "day": 1,
      "date": "对应的日期",
      "title": "第一天的主题（如：初探古都，品味历史）",
      "activities": [
        {
          "time": "09:00-11:00",
          "type": "sightseeing",
          "name": "景点名称",
          "location": "景点所在区域",
          "address": "详细地址",
          "coordinates": {
            "latitude": 39.9042,
            "longitude": 116.4074
          },
          "description": "景点详细介绍、特色看点、游览建议（100-200字）",
          "cost": 60,
          "tips": "游览建议：最佳拍照位置、避开人流时间、注意事项等"
        },
        {
          "time": "11:30-13:00",
          "type": "dining",
          "name": "餐厅名称",
          "location": "餐厅位置",
          "address": "详细地址",
          "coordinates": {
            "latitude": 39.9042,
            "longitude": 116.4074
          },
          "description": "餐厅特色、招牌菜推荐",
          "cost": 80,
          "tips": "人均消费、推荐菜品、就餐建议"
        }
      ],
      "accommodation": {
        "name": "推荐住宿区域或具体酒店名称",
        "address": "酒店地址",
        "cost": 300,
        "tips": "住宿建议：周边设施、交通便利性、性价比分析"
      },
      "transportation": {
        "method": "主要交通方式（地铁2号线、公交、步行等）",
        "cost": 50,
        "tips": "交通攻略：推荐路线、交通卡使用、打车建议等"
      },
      "meals": {
        "breakfast": {
          "location": "早餐地点/餐厅名称",
          "cost": 25,
          "recommendation": "推荐菜品或套餐"
        },
        "lunch": {
          "location": "午餐地点/餐厅名称",
          "cost": 80,
          "recommendation": "推荐菜品"
        },
        "dinner": {
          "location": "晚餐地点/餐厅名称",
          "cost": 100,
          "recommendation": "推荐菜品"
        }
      },
      "totalCost": 695,
      "notes": "当日特别提醒：天气建议、体力安排、购物提示、安全注意事项等"
    }
  ]
}
\`\`\`

## 重要提示
1. **坐标准确性**: 所有景点和餐厅必须提供真实准确的经纬度坐标
2. **时间合理性**: 考虑实际交通时间、排队时间、用餐时间
3. **预算控制**: 严格控制每日费用，确保总费用不超预算
4. **实用性**: 提供的信息要详实可操作，避免空洞的描述
5. **个性化**: 根据用户口述的需求提供定制化建议
6. **季节适配**: 考虑当前季节的特点，推荐应季景点和活动
7. **JSON格式**: 输出必须是标准的JSON格式，可以被程序直接解析

请开始生成旅行计划：`;
}

/**
 * 构建行程规划的Prompt模板（结构化数据）
 */
function buildTripPlanningPrompt(request: TripRequest): string {
  const days = Math.ceil(
    (new Date(request.endDate).getTime() - new Date(request.startDate).getTime()) / 
    (1000 * 60 * 60 * 24)
  ) + 1;

  return `你是一位经验丰富的专业旅行规划师，精通全国各地的旅游资源、交通路线和当地美食。请根据以下用户需求，为他们量身定制一份详细、实用、可执行的旅行计划。

## 用户旅行需求
- **目的地**: ${request.destination}
- **出发日期**: ${request.startDate}
- **结束日期**: ${request.endDate}
- **旅行天数**: ${days}天
- **旅行人数**: ${request.travelerCount}人
- **总预算**: ¥${request.budget}元
${request.preferences && request.preferences.length > 0 ? `- **旅行偏好**: ${request.preferences.join('、')}` : ''}
${request.additionalRequirements ? `- **特殊要求**: ${request.additionalRequirements}` : ''}

## 规划要求

### 1. 行程安排原则
- 合理安排每日游览时间，避免过度疲劳（建议每天3-5个景点）
- 景点之间距离要合理，考虑实际交通时间
- 每天安排的活动要主题明确，路线顺畅不走回头路
- 为突发情况预留机动时间
- 考虑季节和天气因素，给出相应建议

### 2. 预算分配建议
- 总预算的30-40%用于交通（含往返机票/车票）
- 总预算的25-35%用于住宿
- 总预算的20-30%用于餐饮
- 总预算的15-20%用于门票和其他费用
- 预留10%作为应急备用金
- **重要**: 确保所有费用总和不超过预算的90%

### 3. 景点选择标准
- 选择当地最具代表性和特色的景点
- 兼顾人文历史、自然风光、美食体验
- 考虑游客评价和口碑
- 避开过度商业化的景点
- 标注每个景点的游览时长和最佳游览时间

### 4. 餐饮推荐要求
- 推荐当地特色美食和老字号餐厅
- 提供具体的餐厅名称和招牌菜
- 标注人均消费价格
- 考虑就餐环境和用餐高峰期

### 5. 住宿建议标准
- 选择交通便利、安全舒适的住宿区域
- 提供具体的酒店类型和价格区间
- 考虑距离景点的便利性

### 6. 交通规划细节
- 详细说明每段行程的交通方式
- 提供预估的交通时间和费用
- 推荐使用的交通卡或优惠方式
- 标注地铁/公交线路

## 输出格式要求

**必须严格按照以下JSON格式输出，不要添加任何额外的文字说明或markdown标记**：

\`\`\`json
{
  "plan": {
    "title": "${request.destination}${days}日深度游",
    "destination": "${request.destination}",
    "startDate": "${request.startDate}",
    "endDate": "${request.endDate}",
    "days": ${days},
    "budget": ${request.budget},
    "travelerCount": ${request.travelerCount},
    "status": "draft",
    "description": "简要描述本次旅行的特色和亮点（50-100字）"
  },
  "itinerary": [
    {
      "day": 1,
      "date": "${request.startDate}",
      "title": "第一天的主题（如：初探古都，品味历史）",
      "activities": [
        {
          "time": "09:00-11:00",
          "type": "sightseeing",
          "name": "景点名称",
          "location": "景点所在区域",
          "address": "详细地址",
          "coordinates": {
            "latitude": 39.9042,
            "longitude": 116.4074
          },
          "description": "景点详细介绍、特色看点、游览建议（100-200字）",
          "cost": 60,
          "tips": "游览建议：最佳拍照位置、避开人流时间、注意事项等"
        },
        {
          "time": "11:30-13:00",
          "type": "dining",
          "name": "餐厅名称",
          "location": "餐厅位置",
          "address": "详细地址",
          "coordinates": {
            "latitude": 39.9042,
            "longitude": 116.4074
          },
          "description": "餐厅特色、招牌菜推荐",
          "cost": 80,
          "tips": "人均消费、推荐菜品、就餐建议"
        }
      ],
      "accommodation": {
        "name": "推荐住宿区域或具体酒店名称",
        "address": "酒店地址",
        "cost": 300,
        "tips": "住宿建议：周边设施、交通便利性、性价比分析"
      },
      "transportation": {
        "method": "主要交通方式（地铁2号线、公交、步行等）",
        "cost": 50,
        "tips": "交通攻略：推荐路线、交通卡使用、打车建议等"
      },
      "meals": {
        "breakfast": {
          "location": "早餐地点/餐厅名称",
          "cost": 25,
          "recommendation": "推荐菜品或套餐"
        },
        "lunch": {
          "location": "午餐地点/餐厅名称",
          "cost": 80,
          "recommendation": "推荐菜品"
        },
        "dinner": {
          "location": "晚餐地点/餐厅名称",
          "cost": 100,
          "recommendation": "推荐菜品"
        }
      },
      "totalCost": 695,
      "notes": "当日特别提醒：天气建议、体力安排、购物提示、安全注意事项等"
    }
  ]
}
\`\`\`

## 重要提示
1. **坐标准确性**: 所有景点和餐厅必须提供真实准确的经纬度坐标
2. **时间合理性**: 考虑实际交通时间、排队时间、用餐时间
3. **预算控制**: 严格控制每日费用，确保总费用不超预算
4. **实用性**: 提供的信息要详实可操作，避免空洞的描述
5. **个性化**: 根据人数、预算、偏好提供差异化建议
6. **季节适配**: 考虑当前季节的特点，推荐应季景点和活动
7. **JSON格式**: 输出必须是标准的JSON格式，可以被程序直接解析

请开始生成旅行计划：`;
}

/**
 * 检查LLM API配置是否完整
 * 在生成旅行计划前调用此方法
 */
export async function checkLLMConfig(): Promise<{ configured: boolean; message: string }> {
  try {
    const apiKey = await getDecryptedApiKey('llm');
    
    if (apiKey) {
      return {
        configured: true,
        message: 'AI服务配置正常',
      };
    }
  } catch (error) {
    console.error('检查AI配置失败:', error);
  }
  
  return {
    configured: false,
    message: 'AI服务未配置。请前往【设置 → API配置】页面配置大语言模型服务（如：阿里云通义千问）的API密钥。',
  };
}

/**
 * 调用阿里云百炼API生成旅行计划
 */
export async function generateTripPlan(
  request: TripRequest,
  onProgress?: (text: string) => void
): Promise<TripGenerationResponse> {
  try {
    // 从用户配置读取API密钥
    const apiKey = await getDecryptedApiKey('llm');
    
    // 检查配置
    if (!apiKey) {
      throw new Error('AI服务未配置。请前往【设置 → API配置】页面配置大语言模型服务（如：阿里云通义千问）的API密钥。');
    }

    const prompt = buildTripPlanningPrompt(request);

    // 调用阿里云百炼API
    const response = await fetch(`${LLM_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
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
      user_id: '', // 从当前用户获取
      userId: '', // camelCase别名
      title: parsed.plan.title,
      destination: parsed.plan.destination,
      start_date: parsed.plan.startDate,
      end_date: parsed.plan.endDate,
      startDate: parsed.plan.startDate,
      endDate: parsed.plan.endDate,
      days: parsed.plan.days,
      budget: parsed.plan.budget,
      traveler_count: parsed.plan.travelerCount,
      travelerCount: parsed.plan.travelerCount,
      description: parsed.plan.description,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
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
    // 从用户配置读取API密钥
    const apiKey = await getDecryptedApiKey('llm');
    
    // 检查配置
    if (!apiKey) {
      throw new Error('AI服务未配置。请前往【设置 → API配置】页面配置大语言模型服务（如：阿里云通义千问）的API密钥。');
    }

    const prompt = buildTripPlanningPrompt(request);
    const feedbackPrompt = `\n\n## 用户反馈\n用户对上一次生成的计划有以下意见：\n${feedback}\n\n请根据用户反馈重新生成更符合要求的旅行计划。`;

    const response = await fetch(`${LLM_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
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
 * 基于语音输入生成旅行计划
 * 直接将用户的口述需求发送给大语言模型，由AI自行理解和规划
 */
export async function generateTripPlanFromVoice(
  voiceInput: string,
  onProgress?: (text: string) => void
): Promise<TripGenerationResponse> {
  try {
    // 从用户配置读取API密钥
    const apiKey = await getDecryptedApiKey('llm');
    
    // 检查配置
    if (!apiKey) {
      throw new Error('AI服务未配置。请前往【设置 → API配置】页面配置大语言模型服务（如：阿里云通义千问）的API密钥。');
    }

    const prompt = buildVoiceTripPlanningPrompt(voiceInput);

    // 调用阿里云百炼API
    const response = await fetch(`${LLM_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'qwen-turbo',
        messages: [
          {
            role: 'system',
            content: '你是一位专业的旅行规划师，擅长理解用户的口述需求并制定详细的旅行计划。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
        stream: false,
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
