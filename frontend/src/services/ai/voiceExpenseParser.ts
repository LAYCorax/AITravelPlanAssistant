/**
 * Voice Expense Parser - Week 7
 * 使用LLM解析语音输入的费用信息
 */

import { getDecryptedApiKey } from '../api/apiConfig';

const LLM_BASE_URL = import.meta.env.VITE_LLM_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1';

export interface ParsedExpense {
  category: 'transport' | 'accommodation' | 'food' | 'attraction' | 'shopping' | 'other';
  amount: number;
  description: string;
  date?: string; // YYYY-MM-DD格式
}

export interface ParseExpenseResult {
  success: boolean;
  expense?: ParsedExpense;
  error?: string;
}

/**
 * 构建费用解析的Prompt
 */
function buildExpenseParsingPrompt(voiceText: string): string {
  const today = new Date().toISOString().split('T')[0];
  
  return `你是一个费用记录助手，需要从用户的口述中提取费用信息。

## 用户口述内容
"${voiceText}"

## 提取要求

### 1. 费用分类（category）
必须从以下6个分类中选择一个：
- transport: 交通费用（如：打车、地铁、公交、机票、火车票、油费等）
- accommodation: 住宿费用（如：酒店、民宿、旅馆等）
- food: 餐饮费用（如：早餐、午餐、晚餐、零食、饮料等）
- attraction: 景点门票费用（如：景区门票、博物馆、游乐园等）
- shopping: 购物费用（如：纪念品、特产、衣服、礼物等）
- other: 其他费用（无法归入上述分类的费用）

### 2. 金额（amount）
- 提取具体的数字金额
- 如果没有明确金额，估计一个合理的金额
- 单位统一为人民币（元）

### 3. 描述（description）
- 简洁清晰的描述这笔费用
- 包含关键信息：在哪里、买了什么、做了什么
- 长度控制在50字以内

### 4. 日期（date）
- 格式：YYYY-MM-DD
- 如果用户说"今天"，使用：${today}
- 如果用户说"昨天"，计算昨天的日期
- 如果没有明确日期，默认使用今天：${today}

## 输出格式

**必须严格按照以下JSON格式输出，不要添加任何额外的文字说明**：

\`\`\`json
{
  "category": "food",
  "amount": 85.50,
  "description": "午餐 - 全聚德烤鸭",
  "date": "${today}"
}
\`\`\`

## 示例

### 示例1
输入："记录今天午餐花了85块5，在全聚德吃的烤鸭"
输出：
\`\`\`json
{
  "category": "food",
  "amount": 85.50,
  "description": "午餐 - 全聚德烤鸭",
  "date": "${today}"
}
\`\`\`

### 示例2
输入："打车去故宫花了30元"
输出：
\`\`\`json
{
  "category": "transport",
  "amount": 30.00,
  "description": "打车到故宫",
  "date": "${today}"
}
\`\`\`

### 示例3
输入："昨天住宿费用350"
输出：
\`\`\`json
{
  "category": "accommodation",
  "amount": 350.00,
  "description": "住宿费用",
  "date": "计算昨天的日期"
}
\`\`\`

### 示例4
输入："买了些特产，花了120"
输出：
\`\`\`json
{
  "category": "shopping",
  "amount": 120.00,
  "description": "购买特产",
  "date": "${today}"
}
\`\`\`

## 重要提示
1. 输出必须是合法的JSON格式
2. category必须是6个预定义值之一
3. amount必须是数字，可以有小数
4. description要简洁明了
5. date必须是YYYY-MM-DD格式
6. 如果无法提取完整信息，请根据上下文合理推断

请开始解析：`;
}

/**
 * 解析语音输入的费用信息
 */
export async function parseVoiceExpense(voiceText: string): Promise<ParseExpenseResult> {
  try {
    // 获取LLM API密钥
    const apiKey = await getDecryptedApiKey('llm');
    
    if (!apiKey) {
      throw new Error('AI服务未配置。请前往【设置 → API配置】页面配置大语言模型服务的API密钥。');
    }

    const prompt = buildExpenseParsingPrompt(voiceText);

    // 调用LLM API
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
            content: '你是一个专业的费用记录助手，擅长从用户的口述中准确提取费用信息。',
          },
          {
            role: 'user',
            content: prompt,
          }
        ],
        temperature: 0.3, // 降低温度以获得更确定的结果
        max_tokens: 500,
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

    // 解析JSON响应
    const expense = parseExpenseResponse(content);

    return {
      success: true,
      expense,
    };

  } catch (error: any) {
    console.error('解析语音费用失败:', error);
    return {
      success: false,
      error: error.message || '解析语音费用时发生错误',
    };
  }
}

/**
 * 解析LLM返回的JSON响应
 */
function parseExpenseResponse(content: string): ParsedExpense {
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

    // 验证必需字段
    if (!parsed.category || !parsed.amount || !parsed.description) {
      throw new Error('缺少必需的费用信息字段');
    }

    // 验证分类是否有效
    const validCategories = ['transport', 'accommodation', 'food', 'attraction', 'shopping', 'other'];
    if (!validCategories.includes(parsed.category)) {
      throw new Error(`无效的费用分类: ${parsed.category}`);
    }

    // 验证金额
    const amount = parseFloat(parsed.amount);
    if (isNaN(amount) || amount < 0) {
      throw new Error('无效的金额');
    }

    // 如果没有日期，使用今天
    const date = parsed.date || new Date().toISOString().split('T')[0];

    return {
      category: parsed.category,
      amount: amount,
      description: parsed.description.substring(0, 200), // 限制长度
      date: date,
    };

  } catch (error: any) {
    console.error('解析费用响应失败:', error);
    throw new Error('无法解析AI返回的费用信息，请重试或手动输入');
  }
}

/**
 * 验证解析结果
 */
export function validateParsedExpense(expense: ParsedExpense): { valid: boolean; error?: string } {
  // 验证分类
  const validCategories = ['transport', 'accommodation', 'food', 'attraction', 'shopping', 'other'];
  if (!validCategories.includes(expense.category)) {
    return { valid: false, error: '无效的费用分类' };
  }

  // 验证金额
  if (isNaN(expense.amount) || expense.amount < 0) {
    return { valid: false, error: '金额必须大于等于0' };
  }

  // 验证描述
  if (!expense.description || expense.description.trim().length === 0) {
    return { valid: false, error: '描述不能为空' };
  }

  // 验证日期格式
  if (expense.date) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(expense.date)) {
      return { valid: false, error: '日期格式无效，应为YYYY-MM-DD' };
    }
  }

  return { valid: true };
}
