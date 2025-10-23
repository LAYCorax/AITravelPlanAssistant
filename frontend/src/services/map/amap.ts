/**
 * AMap (高德地图) Service
 * 地图服务集成
 */

const AMAP_KEY = import.meta.env.VITE_AMAP_KEY;
const AMAP_SECRET = import.meta.env.VITE_AMAP_SECRET;

// 高德地图JS API加载状态
let amapLoaded = false;
let amapLoadingPromise: Promise<void> | null = null;

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
    return Promise.resolve();
  }

  // 如果正在加载，返回加载Promise
  if (amapLoadingPromise) {
    return amapLoadingPromise;
  }

  // 开始加载
  amapLoadingPromise = new Promise((resolve, reject) => {
    if (!AMAP_KEY || AMAP_KEY === 'your_amap_api_key_here') {
      reject(new Error('请先配置高德地图API密钥'));
      return;
    }

    // 创建script标签
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${AMAP_KEY}&plugin=AMap.Driving,AMap.Geocoder,AMap.PlaceSearch`;
    
    script.onload = () => {
      amapLoaded = true;
      resolve();
    };

    script.onerror = () => {
      amapLoadingPromise = null;
      reject(new Error('加载高德地图失败'));
    };

    document.head.appendChild(script);
  });

  return amapLoadingPromise;
}

/**
 * 检查地图API配置
 */
export function checkAmapConfig(): { configured: boolean; message: string } {
  if (!AMAP_KEY || AMAP_KEY === 'your_amap_api_key_here') {
    return {
      configured: false,
      message: '请在设置中配置高德地图API密钥',
    };
  }

  return {
    configured: true,
    message: '高德地图配置正常',
  };
}

/**
 * 地理编码 - 将地址转换为坐标
 */
export async function geocodeAddress(address: string): Promise<Coordinate | null> {
  try {
    await loadAmapScript();

    return new Promise((resolve, reject) => {
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

    return new Promise((resolve, reject) => {
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
 * 路线规划 - 驾车路线
 */
export async function planDrivingRoute(
  start: Coordinate,
  end: Coordinate
): Promise<RouteResult | null> {
  try {
    await loadAmapScript();

    return new Promise((resolve, reject) => {
      const driving = new window.AMap.Driving({
        policy: window.AMap.DrivingPolicy.LEAST_TIME, // 最快捷模式
      });

      const startLngLat = new window.AMap.LngLat(start.longitude, start.latitude);
      const endLngLat = new window.AMap.LngLat(end.longitude, end.latitude);

      driving.search(startLngLat, endLngLat, (status: string, result: any) => {
        if (status === 'complete' && result.routes && result.routes.length > 0) {
          const route = result.routes[0];
          
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
          resolve(null);
        }
      });
    });
  } catch (error) {
    console.error('路线规划失败:', error);
    return null;
  }
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

    return new Promise((resolve, reject) => {
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
