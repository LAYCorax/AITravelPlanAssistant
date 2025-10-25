import { useEffect, useRef, useState, useCallback } from 'react';
import { Spin, message, Card, Space, Button, Typography } from 'antd';
import { EnvironmentOutlined, ClockCircleOutlined, CarOutlined } from '@ant-design/icons';
import { 
  loadAmapScript, 
  checkAmapConfig, 
  planMultiPointRoute,
  generateNavigationUrl,
  formatDistance,
  formatDuration,
  type Location,
  type MultiRouteResult
} from '../../services/map/amap';
import './MapView.css';

const { Text } = Typography;

interface MapViewProps {
  locations: Location[];
  center?: { longitude: number; latitude: number };
  zoom?: number;
  showRoutes?: boolean;
  height?: string | number;
  onMarkerClick?: (location: Location) => void;
}

export function MapView({
  locations,
  center,
  zoom = 13,
  showRoutes = false,
  height = '500px',
  onMarkerClick,
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylinesRef = useRef<any[]>([]); // 单独存储折线
  const lastRouteLocationsRef = useRef<string>(''); // 存储上次路线规划的位置信息快照
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [routeInfo, setRouteInfo] = useState<MultiRouteResult | null>(null);
  const [planningRoute, setPlanningRoute] = useState(false);
  const [validLocationsCount, setValidLocationsCount] = useState(0); // 记录有效位置数

  /**
   * 生成位置数组的唯一标识（用于比较路径点是否改变）
   * 只关注坐标和顺序，忽略其他属性的变化
   */
  const getLocationsSignature = (locs: Location[]): string => {
    return locs
      .map(loc => {
        if (!loc.coordinates) return 'invalid';
        const lng = loc.coordinates.longitude;
        const lat = loc.coordinates.latitude;
        // 保留6位小数精度，足够识别位置变化
        return `${lng.toFixed(6)},${lat.toFixed(6)}`;
      })
      .join('|');
  };

  useEffect(() => {
    initMap();

    // 设置全局导航函数
    (window as any).navigateToLocation = (lng: string, lat: string, name: string) => {
      const url = generateNavigationUrl(
        { longitude: parseFloat(lng), latitude: parseFloat(lat) },
        name
      );
      window.open(url, '_blank');
    };

    return () => {
      // 清理地图实例
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
      }
      // 清理全局函数
      delete (window as any).navigateToLocation;
    };
  }, []);

  // 使用 useCallback 包装 updateMarkers，避免每次重新创建
  // 注意：不依赖 showRoutes，避免循环更新
  const updateMarkers = useCallback(() => {
    if (!mapInstanceRef.current) return;

    console.log(`[MapView] 更新标记，原始位置数量: ${locations.length}`, locations);

    // 清除旧标记（不清除折线，折线由 showRoutes 单独控制）
    markersRef.current.forEach(marker => {
      mapInstanceRef.current.remove(marker);
    });
    markersRef.current = [];

    // 检查是否有有效位置
    if (locations.length === 0) {
      console.warn('[MapView] 没有有效的位置数据');
      setValidLocationsCount(0);
      return;
    }

    // 先过滤出有效位置
    const validLocations = locations.filter(loc => {
      if (!loc.coordinates) {
        console.warn(`[MapView] 位置 "${loc.name}" 没有坐标对象`);
        return false;
      }
      if (loc.coordinates.latitude === 0 && loc.coordinates.longitude === 0) {
        console.warn(`[MapView] 位置 "${loc.name}" 坐标为 (0,0)`);
        return false;
      }
      if (!loc.coordinates.latitude || !loc.coordinates.longitude) {
        console.warn(`[MapView] 位置 "${loc.name}" 坐标不完整:`, loc.coordinates);
        return false;
      }
      return true;
    });

    console.log(`[MapView] 过滤后有效位置数: ${validLocations.length}`, validLocations);
    setValidLocationsCount(validLocations.length);

    // 添加标记
    let successCount = 0;
    validLocations.forEach((location, index) => {
      try {
        const marker = new window.AMap.Marker({
          position: [location.coordinates.longitude, location.coordinates.latitude],
          title: location.name,
          label: {
            content: `<div class="marker-label">${index + 1}. ${location.name}</div>`,
            direction: 'top',
          },
          icon: getMarkerIcon(location.type),
        });

        // 点击事件 - 异步加载信息窗口内容
        marker.on('click', async () => {
          if (onMarkerClick) {
            onMarkerClick(location);
          }

          // 创建并显示信息窗口（同步操作）
          const content = createInfoWindowContent(location);

          const infoWindow = new window.AMap.InfoWindow({
            content: content,
            offset: new window.AMap.Pixel(0, -30),
          });
          infoWindow.open(mapInstanceRef.current, marker.getPosition());
        });

        mapInstanceRef.current.add(marker);
        markersRef.current.push(marker);
        successCount++;
        
        console.log(`[MapView] 成功添加标记 ${index + 1}: ${location.name} at [${location.coordinates.longitude}, ${location.coordinates.latitude}]`);
      } catch (error) {
        console.error(`[MapView] 添加标记失败: ${location.name}`, error);
      }
    });

    console.log(`[MapView] 成功添加 ${successCount}/${validLocations.length} 个标记`);

    // 自适应显示所有标记
    if (markersRef.current.length > 0) {
      try {
        mapInstanceRef.current.setFitView(markersRef.current);
      } catch (error) {
        console.error('[MapView] setFitView 失败:', error);
      }
    }
  }, [locations, onMarkerClick]); // 移除 showRoutes 依赖

  // 监听 locations 变化，更新标记
  useEffect(() => {
    if (mapInstanceRef.current && !loading) {
      updateMarkers();
    }
  }, [locations, loading, updateMarkers]);

  // 单独监听 showRoutes 和 locations 变化，控制路线显示
  useEffect(() => {
    if (!mapInstanceRef.current || loading) return;

    // 如果不需要显示路线，清除路线并返回
    if (!showRoutes) {
      console.log('[MapView] showRoutes=false, 清除路线');
      polylinesRef.current.forEach(polyline => {
        mapInstanceRef.current.remove(polyline);
      });
      polylinesRef.current = [];
      setRouteInfo(null);
      lastRouteLocationsRef.current = ''; // 重置快照
      return;
    }

    // 需要显示路线
    if (locations.length > 1) {
      // 过滤有效位置
      const validLocations = locations.filter(loc => {
        return loc.coordinates && 
               loc.coordinates.latitude !== 0 && 
               loc.coordinates.longitude !== 0 &&
               loc.coordinates.latitude && 
               loc.coordinates.longitude;
      });

      if (validLocations.length > 1) {
        // 生成当前位置签名
        const currentSignature = getLocationsSignature(validLocations);
        
        // 比较是否与上次相同
        if (currentSignature === lastRouteLocationsRef.current) {
          console.log('[MapView] 路径点未改变，跳过路线规划');
          return;
        }

        console.log('[MapView] 路径点已改变，重新规划路线');
        console.log('[MapView] 旧签名:', lastRouteLocationsRef.current);
        console.log('[MapView] 新签名:', currentSignature);

        // 清除旧路线
        polylinesRef.current.forEach(polyline => {
          mapInstanceRef.current.remove(polyline);
        });
        polylinesRef.current = [];
        setRouteInfo(null);

        // 保存当前签名
        lastRouteLocationsRef.current = currentSignature;

        // 规划新路线
        drawRoutes(validLocations);
      }
    }
  }, [showRoutes, locations, loading]); // 单独的 effect 处理路线

  const initMap = async () => {
    try {
      console.log('[MapView] 开始初始化地图');
      
      // 检查配置
      const config = await checkAmapConfig();
      console.log('[MapView] 配置检查结果:', config);
      
      if (!config.configured) {
        console.warn('[MapView] 地图配置未完成');
        setError(config.message);
        setLoading(false);
        return;
      }

      console.log('[MapView] 开始加载地图API');
      // 加载地图API
      await loadAmapScript();
      console.log('[MapView] 地图API加载成功');

      if (!mapContainerRef.current) {
        throw new Error('地图容器未找到');
      }

      // 计算中心点
      const mapCenter = center || calculateCenter(locations);
      console.log('[MapView] 地图中心点:', mapCenter);

      // 创建地图实例
      console.log('[MapView] 创建地图实例');
      const map = new window.AMap.Map(mapContainerRef.current, {
        zoom: zoom,
        center: [mapCenter.longitude, mapCenter.latitude],
        viewMode: '3D', // 3D视图
        pitch: 50, // 俯仰角度
        rotation: 0, // 旋转角度
      });

      mapInstanceRef.current = map;
      console.log('[MapView] 地图实例创建成功');

      // 添加控件（使用插件方式）
      window.AMap.plugin(['AMap.Scale', 'AMap.ToolBar', 'AMap.ControlBar'], () => {
        map.addControl(new window.AMap.Scale()); // 比例尺
        map.addControl(new window.AMap.ToolBar()); // 工具条
        map.addControl(new window.AMap.ControlBar()); // 3D控制器
        console.log('[MapView] 地图控件添加成功');
      });

      setLoading(false);
      updateMarkers();

    } catch (err: any) {
      console.error('[MapView] 地图初始化失败:', err);
      setError(err.message || '地图加载失败');
      setLoading(false);
      message.error('地图加载失败: ' + (err.message || '未知错误'));
    }
  };

  // updateMarkers 函数已移至上方使用 useCallback 定义

  const drawRoutes = async (validLocations: Location[]) => {
    if (!mapInstanceRef.current || validLocations.length < 2) {
      if (validLocations.length < 2) {
        console.warn('[MapView] 路线规划需要至少2个有效位置');
      }
      return;
    }

    // 防止重复规划
    if (planningRoute) {
      console.log('[MapView] 路线规划进行中，跳过重复请求');
      return;
    }

    setPlanningRoute(true);

    try {
      // 再次验证坐标有效性，确保没有无效数据
      const validatedLocations = validLocations.filter(loc => {
        const lng = loc.coordinates.longitude;
        const lat = loc.coordinates.latitude;
        const isValid = typeof lng === 'number' && typeof lat === 'number' &&
                       !isNaN(lng) && !isNaN(lat) &&
                       lng !== 0 && lat !== 0 &&
                       lng >= -180 && lng <= 180 &&
                       lat >= -90 && lat <= 90;
        
        if (!isValid) {
          console.error(`[MapView] 无效坐标: ${loc.name} [${lng}, ${lat}]`);
        }
        return isValid;
      });

      if (validatedLocations.length < 2) {
        console.error('[MapView] 验证后有效位置不足2个');
        message.error('有效位置不足，无法规划路线');
        setPlanningRoute(false);
        return;
      }

      console.log(`[MapView] 开始规划路线，有效位置数: ${validatedLocations.length}`);
      console.log('[MapView] 路径点:', validatedLocations.map(loc => ({
        name: loc.name,
        coords: [loc.coordinates.longitude, loc.coordinates.latitude]
      })));

      // 规划多点路线
      const waypoints = validatedLocations.map(loc => loc.coordinates);
      const result = await planMultiPointRoute(waypoints);

      if (result) {
        setRouteInfo(result);
        console.log('[MapView] 路线规划成功:', result);

        // 绘制所有路径
        result.routes.forEach((route, routeIndex) => {
          route.steps.forEach((step, stepIndex) => {
            try {
              const polyline = new window.AMap.Polyline({
                path: step.path.map(p => [p.longitude, p.latitude]),
                strokeColor: '#3b82f6', // 蓝色
                strokeWeight: 4,
                strokeOpacity: 0.8,
                lineJoin: 'round',
                lineCap: 'round',
                showDir: true, // 显示方向箭头
              });

              mapInstanceRef.current.add(polyline);
              polylinesRef.current.push(polyline);
              
              console.log(`[MapView] 添加路线段 ${routeIndex}-${stepIndex}, 路径点数: ${step.path.length}`);
            } catch (error) {
              console.error(`[MapView] 绘制路线段失败 ${routeIndex}-${stepIndex}:`, error);
            }
          });
        });

        console.log(`[MapView] 成功绘制 ${polylinesRef.current.length} 条路线段`);
        message.success('路线规划成功');
      } else {
        console.warn('[MapView] 路线规划返回空结果，使用简单连线');
        console.warn('[MapView] 可能原因：1) API密钥权限不足 2) 坐标超出服务范围 3) 网络问题');
        // 降级：简单连线
        drawSimpleRoute(validLocations);
        message.warning('路线规划失败（可能需要在高德开放平台为API密钥开通"路线规划"服务），当前显示简单连线', 5);
      }
    } catch (error) {
      console.error('[MapView] 路线规划失败:', error);
      // 降级：简单连线
      drawSimpleRoute(validLocations);
      message.error('路线规划出错，显示简单连线');
    } finally {
      setPlanningRoute(false);
    }
  };

  const drawSimpleRoute = (validLocations: Location[]) => {
    if (validLocations.length < 2) return;

    console.log('[MapView] 绘制简单连线');

    try {
      // 验证并创建路径点
      const path = validLocations
        .filter(loc => {
          const lng = loc.coordinates.longitude;
          const lat = loc.coordinates.latitude;
          return typeof lng === 'number' && typeof lat === 'number' &&
                 !isNaN(lng) && !isNaN(lat) &&
                 lng !== 0 && lat !== 0;
        })
        .map(loc => {
          const lng = Number(loc.coordinates.longitude);
          const lat = Number(loc.coordinates.latitude);
          console.log(`[MapView] 简单连线点: ${loc.name} [${lng}, ${lat}]`);
          return [lng, lat];
        });

      if (path.length < 2) {
        console.error('[MapView] 有效坐标不足，无法绘制简单连线');
        return;
      }

      // 绘制折线
      const polyline = new window.AMap.Polyline({
        path: path,
        strokeColor: '#3b82f6', // 蓝色
        strokeWeight: 4,
        strokeOpacity: 0.8,
        lineJoin: 'round',
        lineCap: 'round',
        showDir: true, // 显示方向箭头
      });

      mapInstanceRef.current.add(polyline);
      polylinesRef.current.push(polyline);
      
      console.log('[MapView] 简单连线绘制成功，路径点数:', path.length);
    } catch (error) {
      console.error('[MapView] 简单连线绘制失败:', error);
    }
  };

  const handleNavigate = (location: Location) => {
    const url = generateNavigationUrl(location.coordinates, location.name);
    window.open(url, '_blank');
    message.info('正在跳转到高德地图导航...');
  };

  const getMarkerIcon = (type?: string) => {
    const iconMap: Record<string, string> = {
      activity: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
      accommodation: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_r.png',
      meal: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_g.png',
      transportation: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_o.png',
    };

    return iconMap[type || 'activity'];
  };

  const createInfoWindowContent = (location: Location) => {
    // 获取地点类型的中文名称
    const getTypeName = (type?: string): string => {
      const typeMap: Record<string, string> = {
        activity: '景点',
        sightseeing: '景点',
        dining: '餐饮',
        meal: '餐饮',
        accommodation: '住宿',
        transportation: '交通',
      };
      return typeMap[type || ''] || '地点';
    };

    // 从location数据中读取图片URL（由AI在行程规划时生成）
    const imageUrl = (location as any).image_url || '';

    // 创建完整的HTML
    const finalHtml = `
      <div class="map-info-window">
        ${imageUrl ? `
          <img 
            src="${imageUrl}" 
            alt="${location.name}" 
            class="info-image"
            onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
          />
          <div class="info-image-placeholder" style="display: none;">
            ${getTypeEmoji(location.type)}
          </div>
        ` : `
          <div class="info-image-placeholder">
            ${getTypeEmoji(location.type)}
          </div>
        `}
        <div class="info-content">
          <div class="info-header">
            <h4>${location.name}</h4>
            <span class="type-badge">${getTypeName(location.type)}</span>
          </div>
          ${location.address ? `
            <div class="address">
              <span class="address-icon">📍</span>
              <span>${location.address}</span>
            </div>
          ` : ''}
          ${location.description ? `
            <div class="description">${location.description}</div>
          ` : ''}
        </div>
        <div class="info-footer">
          <button 
            class="navigate-btn" 
            onclick="window.navigateToLocation('${location.coordinates.longitude}', '${location.coordinates.latitude}', '${location.name}')"
          >
            🧭 导航到这里
          </button>
        </div>
      </div>
    `;

    return finalHtml;
  };

  // 获取类型对应的emoji
  const getTypeEmoji = (type?: string): string => {
    const emojiMap: Record<string, string> = {
      activity: '🏛️',
      sightseeing: '🏛️',
      dining: '🍽️',
      meal: '🍽️',
      accommodation: '🏨',
      transportation: '🚗',
    };
    return emojiMap[type || ''] || '📍';
  };

  const calculateCenter = (locations: Location[]) => {
    if (locations.length === 0) {
      // 默认中心点（北京）
      return { longitude: 116.397428, latitude: 39.90923 };
    }

    const sum = locations.reduce(
      (acc, loc) => ({
        longitude: acc.longitude + loc.coordinates.longitude,
        latitude: acc.latitude + loc.coordinates.latitude,
      }),
      { longitude: 0, latitude: 0 }
    );

    return {
      longitude: sum.longitude / locations.length,
      latitude: sum.latitude / locations.length,
    };
  };

  if (error) {
    return (
      <div className="map-error" style={{ height }}>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="map-view-container" style={{ height }}>
      {loading && (
        <div className="map-loading">
          <Spin size="large" tip="加载地图中..." />
        </div>
      )}
      <div
        ref={mapContainerRef}
        className="map-container"
        style={{ width: '100%', height: '100%' }}
      />
      
      {/* 地图统计信息 */}
      {!loading && validLocationsCount > 0 && (
        <div className="map-stats-badge">
          <Text type="secondary" style={{ fontSize: 12 }}>
            {validLocationsCount} 个位置点
          </Text>
        </div>
      )}
      
      {/* 路线信息卡片 */}
      {routeInfo && showRoutes && (
        <Card className="route-info-card">
          <div style={{ padding: '5%' }}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Space style={{ width: '100%' }}>
                <CarOutlined style={{ color: '#1890ff' }} />
                <Text strong>路线信息</Text>
              </Space>
              <Space style={{ width: '100%' }}>
                <EnvironmentOutlined />
                <Text>总距离：{formatDistance(routeInfo.totalDistance)}</Text>
              </Space>
              <Space style={{ width: '100%' }}>
                <ClockCircleOutlined />
                <Text>预计时间：{formatDuration(routeInfo.totalDuration)}</Text>
              </Space>
              <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <Button 
                  type="primary" 
                  size="middle" 
                  icon={<EnvironmentOutlined />}
                  onClick={() => locations.length > 0 && handleNavigate(locations[0])}
                  style={{ width: '90%' }}
                >
                  开始导航
                </Button>
              </div>
            </Space>
          </div>
        </Card>
      )}
      
      {/* 路线规划加载提示 */}
      {planningRoute && (
        <div className="route-planning-overlay">
          <Spin tip="规划路线中..." />
        </div>
      )}
    </div>
  );
}
