/**
 * AMap (高德地图) Service
 * 地图服务集成
 */

import { getDecryptedApiKey, getApiConfig } from '../api/apiConfig';

// 高德地图JS API加载状态
let amapLoaded = false;
let amapLoadingPromise: Promise<void> | null = null;
let cachedAmapKey: string | null = null;
let cachedSecurityCode: string | null = null;

/**
 * 坐标点类型
 */
export interface Coordinate {
  latitude: number;
  longitude: number;
}

/**
 * 地点信息
 */
export interface Location {
  name: string;
  address?: string;
  coordinates: Coordinate;
  type?: 'activity' | 'accommodation' | 'meal' | 'transportation';
  description?: string;
}

/**
 * 路线规划结果
 */
export interface RouteResult {
  distance: number; // 距离（米）
  duration: number; // 时长（秒）
  steps: RouteStep[];
}

export interface RouteStep {
  instruction: string;
  distance: number;
  duration: number;
  path: Coordinate[];
}

/**
 * 加载高德地图JS API
 */
export async function loadAmapScript(): Promise<void> {
  // 如果已经加载，直接返回
  if (amapLoaded && window.AMap) {
    console.log('[AMap] 地图已加载，直接返回');
    return Promise.resolve();
  }

  // 如果正在加载，返回加载Promise
  if (amapLoadingPromise) {
    console.log('[AMap] 地图正在加载中，等待加载完成');
    return amapLoadingPromise;
  }

  // 开始加载
  amapLoadingPromise = new Promise(async (resolve, reject) => {
    console.log('[AMap] 开始加载地图API...');
    
    // 从用户配置读取API密钥和安全密钥
    let amapKey = cachedAmapKey;
    let securityCode = cachedSecurityCode;
    
    if (!amapKey || !securityCode) {
      try {
        console.log('[AMap] 从数据库读取配置...');
        
        // 读取 API Key
        amapKey = await getDecryptedApiKey('map');
        
        // 读取完整配置以获取安全密钥
        const mapConfig = await getApiConfig('map');
        if (mapConfig && mapConfig.additional_config) {
          securityCode = mapConfig.additional_config.security_code;
        }
        
        if (amapKey) {
          console.log('[AMap] API密钥读取成功:', amapKey.substring(0, 8) + '...');
          cachedAmapKey = amapKey;
        } else {
          console.warn('[AMap] 未能获取到API密钥');
        }
        
        if (securityCode) {
          console.log('[AMap] 安全密钥读取成功:', securityCode.substring(0, 8) + '...');
          cachedSecurityCode = securityCode;
        } else {
          console.warn('[AMap] 未能获取到安全密钥');
        }
      } catch (error) {
        console.error('[AMap] 读取用户配置失败:', error);
      }
    } else {
      console.log('[AMap] 使用缓存的密钥');
    }
    
    // 检查配置
    if (!amapKey) {
      const errorMsg = '地图服务未配置。请前往【设置 → API配置】页面配置高德地图的API密钥。';
      console.error('[AMap] ' + errorMsg);
      reject(new Error(errorMsg));
      return;
    }
    
    if (!securityCode) {
      const errorMsg = '地图服务安全密钥未配置。请前往【设置 → API配置】页面配置高德地图的安全密钥（Security Code）。';
      console.error('[AMap] ' + errorMsg);
      reject(new Error(errorMsg));
      return;
    }

    // 设置安全密钥（必须在加载地图JS之前设置）
    window._AMapSecurityConfig = {
      securityJsCode: securityCode,
    };
    console.log('[AMap] 安全密钥已配置');

    // 创建script标签
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${amapKey}&plugin=AMap.Scale,AMap.ToolBar,AMap.ControlBar,AMap.Driving,AMap.Geocoder,AMap.PlaceSearch`;
    
    console.log('[AMap] 开始加载地图脚本:', script.src.substring(0, 80) + '...');
    
    script.onload = () => {
      amapLoaded = true;
      console.log('[AMap] 地图脚本加载成功');
      resolve();
    };

    script.onerror = (error) => {
      amapLoadingPromise = null;
      console.error('[AMap] 地图脚本加载失败:', error);
      reject(new Error('加载高德地图失败'));
    };

    document.head.appendChild(script);
  });

  return amapLoadingPromise;
}

/**
 * 检查地图API配置
 */
export async function checkAmapConfig(): Promise<{ configured: boolean; message: string }> {
  // 检查用户配置
  try {
    const apiKey = await getDecryptedApiKey('map');
    if (apiKey) {
      console.log('[AMap] 检查配置：API密钥存在');
      return {
        configured: true,
        message: '高德地图配置正常',
      };
    }
  } catch (error) {
    console.error('[AMap] 检查地图配置失败:', error);
  }
  
  console.warn('[AMap] 检查配置：未找到API密钥');
  return {
    configured: false,
    message: '地图服务未配置。请前往【设置 → API配置】页面配置高德地图的API密钥。',
  };
}

/**
 * 清除地图缓存，强制重新加载
 * 当用户更新API密钥后需要调用此函数
 */
export function clearAmapCache(): void {
  console.log('[AMap] 清除地图缓存');
  cachedAmapKey = null;
  amapLoaded = false;
  amapLoadingPromise = null;
  
  // 移除已加载的地图脚本
  const scripts = document.querySelectorAll('script[src*="webapi.amap.com"]');
  scripts.forEach(script => {
    console.log('[AMap] 移除地图脚本:', script.getAttribute('src')?.substring(0, 50) + '...');
    script.remove();
  });
  
  // 清除全局AMap对象
  if (window.AMap) {
    console.log('[AMap] 清除全局AMap对象');
    delete window.AMap;
  }
}

/**
 * 地理编码 - 将地址转换为坐标
 */
export async function geocodeAddress(address: string): Promise<Coordinate | null> {
  try {
    await loadAmapScript();

    return new Promise((resolve) => {
      const geocoder = new window.AMap.Geocoder({
        city: '全国', // 全国范围内进行地理编码
      });

      geocoder.getLocation(address, (status: string, result: any) => {
        if (status === 'complete' && result.geocodes.length > 0) {
          const location = result.geocodes[0].location;
          resolve({
            longitude: location.lng,
            latitude: location.lat,
          });
        } else {
          resolve(null);
        }
      });
    });
  } catch (error) {
    console.error('地理编码失败:', error);
    return null;
  }
}

/**
 * 逆地理编码 - 将坐标转换为地址
 */
export async function reverseGeocode(coordinate: Coordinate): Promise<string | null> {
  try {
    await loadAmapScript();

    return new Promise((resolve) => {
      const geocoder = new window.AMap.Geocoder();
      const lnglat = [coordinate.longitude, coordinate.latitude];

      geocoder.getAddress(lnglat, (status: string, result: any) => {
        if (status === 'complete' && result.regeocode) {
          resolve(result.regeocode.formattedAddress);
        } else {
          resolve(null);
        }
      });
    });
  } catch (error) {
    console.error('逆地理编码失败:', error);
    return null;
  }
}

/**
 * 路线规划 - 驾车路线（两点）
 */
export async function planDrivingRoute(
  start: Coordinate,
  end: Coordinate
): Promise<RouteResult | null> {
  try {
    console.log('[AMap] 规划路线:', {
      start: [start.longitude, start.latitude],
      end: [end.longitude, end.latitude]
    });

    await loadAmapScript();

    // 检查Driving插件是否可用
    if (!window.AMap || !window.AMap.Driving) {
      console.error('[AMap] Driving插件未加载');
      return null;
    }

    return new Promise((resolve) => {
      const driving = new window.AMap.Driving({
        policy: window.AMap.DrivingPolicy.LEAST_TIME, // 最快捷模式
        extensions: 'base', // 返回基本信息
      });

      // 使用数组格式：[经度, 纬度]，这是官方文档推荐的格式
      const startLngLat = [start.longitude, start.latitude];
      const endLngLat = [end.longitude, end.latitude];

      console.log('[AMap] 使用数组格式坐标 - 起点:', startLngLat, '终点:', endLngLat);

      driving.search(startLngLat, endLngLat, (status: string, result: any) => {
        console.log('[AMap] 路线搜索回调 - status:', status);
        console.log('[AMap] 完整result对象:', JSON.stringify(result, null, 2));
        
        if (status === 'complete' && result.routes && result.routes.length > 0) {
          const route = result.routes[0];
          
          console.log('[AMap] 路线规划成功，距离:', route.distance, '米，时间:', route.time, '秒');
          
          resolve({
            distance: route.distance,
            duration: route.time,
            steps: route.steps.map((step: any) => ({
              instruction: step.instruction,
              distance: step.distance,
              duration: step.time,
              path: step.path.map((p: any) => ({
                longitude: p.lng,
                latitude: p.lat,
              })),
            })),
          });
        } else {
          console.error('[AMap] 路线规划失败 - status:', status);
          console.error('[AMap] 完整错误信息:', result);
          if (result && result.info) {
            console.error('[AMap] 错误描述:', result.info);
            console.error('[AMap] 错误代码:', result.infocode);
          }
          resolve(null);
        }
      });
    });
  } catch (error) {
    console.error('[AMap] 路线规划异常:', error);
    return null;
  }
}

/**
 * 多点路线规划结果
 */
export interface MultiRouteResult {
  totalDistance: number; // 总距离（米）
  totalDuration: number; // 总时长（秒）
  routes: RouteResult[]; // 每段路线
}

/**
 * 延迟函数（用于避免并发请求限制）
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 路线规划 - 多点驾车路线（使用途经点功能，一次请求完成）
 * @param waypoints 途径点数组（至少2个点，最多支持16个途经点）
 * @returns 路线规划结果
 */
export async function planMultiPointRouteWithWaypoints(
  waypoints: Coordinate[]
): Promise<MultiRouteResult | null> {
  try {
    if (waypoints.length < 2) {
      console.error('[AMap] 路径点至少需要2个，实际:', waypoints.length);
      return null;
    }

    if (waypoints.length > 18) {
      console.error('[AMap] 路径点最多支持18个（起点+16个途经点+终点），实际:', waypoints.length);
      return null;
    }

    console.log('[AMap] 开始多点路线规划（途经点模式），路径点数:', waypoints.length);

    await loadAmapScript();

    return new Promise((resolve) => {
      const driving = new window.AMap.Driving({
        policy: window.AMap.DrivingPolicy.LEAST_TIME,
        extensions: 'base',
      });

      const startLngLat = [waypoints[0].longitude, waypoints[0].latitude];
      const endLngLat = [waypoints[waypoints.length - 1].longitude, waypoints[waypoints.length - 1].latitude];
      
      // 中间点作为途经点
      const waypointsLngLat = waypoints.slice(1, -1).map(wp => [wp.longitude, wp.latitude]);

      console.log('[AMap] 起点:', startLngLat);
      console.log('[AMap] 途经点:', waypointsLngLat);
      console.log('[AMap] 终点:', endLngLat);

      const opts = {
        waypoints: waypointsLngLat,
      };

      driving.search(startLngLat, endLngLat, opts, (status: string, result: any) => {
        console.log('[AMap] 多点路线搜索回调 - status:', status);
        
        if (status === 'complete' && result.routes && result.routes.length > 0) {
          const route = result.routes[0];
          console.log('[AMap] 多点路线规划成功，总距离:', route.distance, '米，总时长:', route.time, '秒');
          
          resolve({
            totalDistance: route.distance,
            totalDuration: route.time,
            routes: [{
              distance: route.distance,
              duration: route.time,
              steps: route.steps.map((step: any) => ({
                instruction: step.instruction,
                distance: step.distance,
                duration: step.time,
                path: step.path.map((p: any) => ({
                  longitude: p.lng,
                  latitude: p.lat,
                })),
              })),
            }],
          });
        } else {
          console.error('[AMap] 多点路线规划失败 - status:', status);
          console.error('[AMap] 完整错误信息:', result);
          if (result && result.info) {
            console.error('[AMap] 错误描述:', result.info);
            console.error('[AMap] 错误代码:', result.infocode);
          }
          resolve(null);
        }
      });
    });
  } catch (error) {
    console.error('[AMap] 多点路线规划异常:', error);
    return null;
  }
}

/**
 * 路线规划 - 多点驾车路线（分段模式，适合超过16个途经点的情况）
 * @param waypoints 途径点数组（至少2个点）
 * @returns 多段路线规划结果
 */
export async function planMultiPointRoute(
  waypoints: Coordinate[]
): Promise<MultiRouteResult | null> {
  try {
    if (waypoints.length < 2) {
      console.error('[AMap] 路径点至少需要2个，实际:', waypoints.length);
      return null;
    }

    // 如果点数少于等于18个，使用途经点模式（一次请求完成）
    if (waypoints.length <= 18) {
      console.log('[AMap] 使用途经点模式规划路线');
      return await planMultiPointRouteWithWaypoints(waypoints);
    }

    // 超过18个点，使用分段模式
    console.log('[AMap] 点数超过18个，使用分段模式规划路线');
    console.log('[AMap] 开始多点路线规划（分段模式），路径点数:', waypoints.length);
    console.log('[AMap] 路径点坐标:', waypoints);

    await loadAmapScript();

    const routes: RouteResult[] = [];
    let totalDistance = 0;
    let totalDuration = 0;

    // 依次规划每两个点之间的路线（添加延迟避免并发限制）
    for (let i = 0; i < waypoints.length - 1; i++) {
      console.log(`[AMap] 规划第 ${i + 1}/${waypoints.length - 1} 段路线`);
      
      // 如果不是第一次请求，等待一段时间避免并发限制
      if (i > 0) {
        console.log('[AMap] 等待500ms避免并发请求限制...');
        await delay(500); // 等待500毫秒
      }
      
      const routeResult = await planDrivingRoute(waypoints[i], waypoints[i + 1]);
      
      if (routeResult) {
        routes.push(routeResult);
        totalDistance += routeResult.distance;
        totalDuration += routeResult.duration;
        console.log(`[AMap] 第 ${i + 1} 段路线成功，距离: ${routeResult.distance}米`);
      } else {
        console.error(`[AMap] 第 ${i + 1} 段路线规划失败，起点:`, waypoints[i], '终点:', waypoints[i + 1]);
        // 不要立即返回null，继续尝试下一段
        console.warn(`[AMap] 跳过第 ${i + 1} 段，继续规划剩余路线`);
      }
    }

    // 如果所有路线都失败了
    if (routes.length === 0) {
      console.error('[AMap] 所有路线段都规划失败');
      return null;
    }

    console.log('[AMap] 多点路线规划完成，总距离:', totalDistance, '米，总时长:', totalDuration, '秒');
    console.log('[AMap] 成功规划路线段数:', routes.length, '/', waypoints.length - 1);

    return {
      totalDistance,
      totalDuration,
      routes,
    };
  } catch (error) {
    console.error('[AMap] 多点路线规划异常:', error);
    return null;
  }
}

/**
 * 生成导航URL - 跳转到高德地图APP
 * @param destination 目的地坐标
 * @param destinationName 目的地名称
 * @param origin 起点坐标（可选）
 * @returns 高德地图导航URL
 */
export function generateNavigationUrl(
  destination: Coordinate,
  destinationName: string,
  origin?: Coordinate
): string {
  const destParam = `${destination.longitude},${destination.latitude}`;
  let url = `https://uri.amap.com/navigation?to=${destParam},${encodeURIComponent(destinationName)}`;
  
  if (origin) {
    const originParam = `${origin.longitude},${origin.latitude}`;
    url += `&from=${originParam}`;
  }
  
  // 默认驾车导航
  url += '&mode=car&policy=1&src=myapp&coordinate=gaode&callnative=1';
  
  return url;
}

/**
 * 搜索附近地点
 */
export async function searchNearby(
  coordinate: Coordinate,
  keyword: string,
  radius: number = 1000 // 默认1公里
): Promise<Location[]> {
  try {
    await loadAmapScript();

    return new Promise((resolve) => {
      const placeSearch = new window.AMap.PlaceSearch({
        type: keyword, // 兴趣点类别
        pageSize: 10,
        pageIndex: 1,
        city: '全国',
        citylimit: false,
      });

      const center = new window.AMap.LngLat(coordinate.longitude, coordinate.latitude);

      placeSearch.searchNearBy(
        '',
        center,
        radius,
        (status: string, result: any) => {
          if (status === 'complete' && result.poiList && result.poiList.pois) {
            const locations: Location[] = result.poiList.pois.map((poi: any) => ({
              name: poi.name,
              address: poi.address,
              coordinates: {
                longitude: poi.location.lng,
                latitude: poi.location.lat,
              },
              type: 'activity' as const,
              description: poi.type,
            }));
            resolve(locations);
          } else {
            resolve([]);
          }
        }
      );
    });
  } catch (error) {
    console.error('搜索附近地点失败:', error);
    return [];
  }
}

/**
 * 计算两点之间的距离（米）
 */
export function calculateDistance(point1: Coordinate, point2: Coordinate): number {
  if (window.AMap) {
    const lngLat1 = new window.AMap.LngLat(point1.longitude, point1.latitude);
    const lngLat2 = new window.AMap.LngLat(point2.longitude, point2.latitude);
    return lngLat1.distance(lngLat2);
  }
  
  // 如果AMap未加载，使用Haversine公式计算
  const R = 6371e3; // 地球半径（米）
  const φ1 = (point1.latitude * Math.PI) / 180;
  const φ2 = (point2.latitude * Math.PI) / 180;
  const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
  const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * 格式化距离显示
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}米`;
  }
  return `${(meters / 1000).toFixed(1)}公里`;
}

/**
 * 格式化时长显示
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}小时${minutes}分钟`;
  }
  return `${minutes}分钟`;
}

// 扩展Window接口以包含AMap
declare global {
  interface Window {
    AMap: any;
  }
}
