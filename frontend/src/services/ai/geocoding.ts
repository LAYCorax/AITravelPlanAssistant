/**
 * 地理编码服务 - 为AI生成的行程补充准确的经纬度
 */

import type { ItineraryDetail } from '../../types';
import { geocodeAddress } from '../map/amap';

/**
 * 使用高德地图API为活动补充准确的经纬度坐标
 * @param itinerary 行程详情数组
 * @param destination 目的地（用于提高定位准确性）
 * @returns 补充了坐标的行程详情
 */
export async function enrichActivitiesWithCoordinates(
  itinerary: ItineraryDetail[],
  destination: string
): Promise<ItineraryDetail[]> {
  console.log('[Geocoding] 开始为活动补充经纬度坐标...');
  
  // 为每一天的行程处理
  const enrichedItinerary = await Promise.all(
    itinerary.map(async (day) => {
      // 为每个活动补充坐标
      const enrichedActivities = await Promise.all(
        day.activities.map(async (activity) => {
          // 如果已经有有效坐标，跳过
          if (activity.coordinates && 
              activity.coordinates.latitude && 
              activity.coordinates.longitude &&
              activity.coordinates.latitude !== 0 &&
              activity.coordinates.longitude !== 0) {
            console.log(`[Geocoding] ${activity.name} 已有坐标，跳过`);
            return activity;
          }
          
          // 尝试使用高德地图API获取坐标
          try {
            let searchAddress = activity.address;
            
            // 如果地址不包含城市名，尝试添加目的地
            if (searchAddress && !searchAddress.includes('市') && !searchAddress.includes('省')) {
              searchAddress = `${destination}${searchAddress}`;
            }
            
            // 如果没有地址，使用名称+目的地
            if (!searchAddress) {
              searchAddress = `${destination}${activity.name}`;
            }
            
            console.log(`[Geocoding] 正在为 "${activity.name}" 获取坐标，地址: ${searchAddress}`);
            
            const coordinate = await geocodeAddress(searchAddress);
            
            if (coordinate) {
              console.log(`[Geocoding] ✓ ${activity.name} 坐标获取成功: ${coordinate.latitude}, ${coordinate.longitude}`);
              return {
                ...activity,
                coordinates: coordinate,
              };
            } else {
              console.warn(`[Geocoding] ✗ ${activity.name} 坐标获取失败，使用默认值`);
              return {
                ...activity,
                coordinates: {
                  latitude: 0,
                  longitude: 0,
                },
              };
            }
          } catch (error) {
            console.error(`[Geocoding] ${activity.name} 获取坐标异常:`, error);
            return {
              ...activity,
              coordinates: {
                latitude: 0,
                longitude: 0,
              },
            };
          }
        })
      );
      
      return {
        ...day,
        activities: enrichedActivities,
      };
    })
  );
  
  console.log('[Geocoding] 坐标补充完成');
  return enrichedItinerary;
}
