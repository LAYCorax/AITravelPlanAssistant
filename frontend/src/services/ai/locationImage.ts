/**
 * 地点图片服务
 * 使用LLM推荐符合地点特色的图片URL
 */

import { getDecryptedApiKey } from '../api/apiConfig';

const LLM_BASE_URL = import.meta.env.VITE_LLM_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1';

// 图片缓存
const imageCache = new Map<string, string>();

/**
 * 为地点获取特色图片URL
 * @param locationName 地点名称
 * @param locationType 地点类型 (activity/dining/accommodation/transportation)
 * @param address 地址（可选，用于更精确的匹配）
 * @returns 图片URL
 */
export async function getLocationImageUrl(
  locationName: string,
  locationType?: string,
  address?: string
): Promise<string> {
  // 生成缓存key
  const cacheKey = `${locationName}-${locationType || 'default'}`;
  
  // 检查缓存
  if (imageCache.has(cacheKey)) {
    console.log('[LocationImage] 使用缓存的图片:', cacheKey);
    return imageCache.get(cacheKey)!;
  }

  try {
    const apiKey = await getDecryptedApiKey('llm');
    
    if (!apiKey) {
      console.warn('[LocationImage] LLM API未配置，使用默认图片');
      return getDefaultImageByType(locationType);
    }

    const prompt = buildImagePrompt(locationName, locationType, address);

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
            content: '你是一位图片推荐专家，擅长为不同类型的地点推荐合适的图片URL。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3, // 较低温度以获得稳定结果
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      console.error('[LocationImage] API调用失败');
      return getDefaultImageByType(locationType);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      console.error('[LocationImage] AI未返回有效内容');
      return getDefaultImageByType(locationType);
    }

    // 解析返回的图片URL
    const imageUrl = parseImageUrl(content, locationType);
    
    // 缓存结果
    imageCache.set(cacheKey, imageUrl);
    
    console.log('[LocationImage] 获取图片成功:', locationName, '→', imageUrl);
    return imageUrl;

  } catch (error) {
    console.error('[LocationImage] 获取图片失败:', error);
    return getDefaultImageByType(locationType);
  }
}

/**
 * 构建获取图片的提示词
 */
function buildImagePrompt(
  locationName: string,
  locationType?: string,
  address?: string
): string {
  const typeDesc = getTypeDescription(locationType);
  
  return `请为以下地点推荐一张合适的图片URL：

地点名称: ${locationName}
地点类型: ${typeDesc}
${address ? `地址: ${address}` : ''}

要求：
1. 推荐一张高质量、符合地点特色的图片URL
2. 图片应该是真实的、专业的风景/建筑/美食摄影
3. 优先使用国内可访问的图片服务（如阿里云OSS、腾讯云COS、unsplash等）
4. 图片尺寸建议：800x600或更大
5. 图片格式：jpg或png

请直接返回一个有效的图片URL，不要添加任何解释。
如果无法确定具体图片，请根据地点类型返回通用的风景图片：
- 景点/观光：城市风景或自然风光
- 餐饮：美食照片或餐厅环境
- 住宿：酒店房间或外观
- 交通：交通工具或车站

直接输出URL：`;
}

/**
 * 获取类型描述
 */
function getTypeDescription(type?: string): string {
  const typeMap: Record<string, string> = {
    activity: '景点/观光/活动',
    sightseeing: '景点/观光',
    dining: '餐饮/美食',
    meal: '餐饮/美食',
    accommodation: '住宿/酒店',
    transportation: '交通',
  };
  return typeMap[type || ''] || '旅游地点';
}

/**
 * 解析LLM返回的图片URL
 */
function parseImageUrl(content: string, locationType?: string): string {
  // 清理内容
  let url = content.trim();
  
  // 移除可能的markdown格式
  url = url.replace(/```.*?```/gs, '');
  url = url.replace(/`/g, '');
  
  // 提取URL（可能在文本中）
  const urlMatch = url.match(/https?:\/\/[^\s<>"{}|\\^`\[\]]+/);
  if (urlMatch) {
    url = urlMatch[0];
  }
  
  // 验证URL格式
  if (isValidImageUrl(url)) {
    return url;
  }
  
  // 如果无效，返回默认图片
  console.warn('[LocationImage] 无效的URL，使用默认图片:', url);
  return getDefaultImageByType(locationType);
}

/**
 * 验证是否为有效的图片URL
 */
function isValidImageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    // 检查是否为http/https协议
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return false;
    }
    // 检查是否有常见的图片扩展名或图片服务域名
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const imageServices = ['unsplash', 'pexels', 'pixabay', 'aliyun', 'qcloud', 'cloudinary'];
    
    const hasImageExt = imageExtensions.some(ext => url.toLowerCase().includes(ext));
    const isImageService = imageServices.some(service => url.toLowerCase().includes(service));
    
    return hasImageExt || isImageService || url.includes('image') || url.includes('photo');
  } catch {
    return false;
  }
}

/**
 * 根据类型获取默认图片
 */
function getDefaultImageByType(type?: string): string {
  // 使用unsplash的高质量免费图片
  const defaultImages: Record<string, string> = {
    activity: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80', // 城市风景
    sightseeing: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80', // 城市风景
    dining: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80', // 美食
    meal: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80', // 美食
    accommodation: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80', // 酒店
    transportation: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80', // 交通
  };
  
  return defaultImages[type || 'activity'] || defaultImages.activity;
}

/**
 * 清除图片缓存
 */
export function clearImageCache(): void {
  imageCache.clear();
  console.log('[LocationImage] 图片缓存已清除');
}

/**
 * 预加载地点图片（可选优化）
 */
export async function preloadLocationImages(
  locations: Array<{ name: string; type?: string; address?: string }>
): Promise<void> {
  console.log('[LocationImage] 开始预加载图片，数量:', locations.length);
  
  const promises = locations.map(loc => 
    getLocationImageUrl(loc.name, loc.type, loc.address)
      .catch(err => {
        console.error('[LocationImage] 预加载失败:', loc.name, err);
        return getDefaultImageByType(loc.type);
      })
  );
  
  await Promise.allSettled(promises);
  console.log('[LocationImage] 图片预加载完成');
}
