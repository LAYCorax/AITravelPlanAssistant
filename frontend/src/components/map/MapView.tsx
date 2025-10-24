import { useEffect, useRef, useState } from 'react';
import { Spin, message } from 'antd';
import { loadAmapScript, checkAmapConfig, type Location } from '../../services/map/amap';
import './MapView.css';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initMap();

    return () => {
      // 清理地图实例
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    // 当locations变化时更新标记
    if (mapInstanceRef.current && !loading) {
      updateMarkers();
    }
  }, [locations, loading]);

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

  const updateMarkers = () => {
    if (!mapInstanceRef.current) return;

    // 清除旧标记
    markersRef.current.forEach(marker => {
      mapInstanceRef.current.remove(marker);
    });
    markersRef.current = [];

    // 添加新标记
    locations.forEach((location, index) => {
      const marker = new window.AMap.Marker({
        position: [location.coordinates.longitude, location.coordinates.latitude],
        title: location.name,
        label: {
          content: `<div class="marker-label">${index + 1}. ${location.name}</div>`,
          direction: 'top',
        },
        icon: getMarkerIcon(location.type),
      });

      // 点击事件
      marker.on('click', () => {
        if (onMarkerClick) {
          onMarkerClick(location);
        }

        // 显示信息窗口
        const infoWindow = new window.AMap.InfoWindow({
          content: createInfoWindowContent(location),
          offset: new window.AMap.Pixel(0, -30),
        });
        infoWindow.open(mapInstanceRef.current, marker.getPosition());
      });

      mapInstanceRef.current.add(marker);
      markersRef.current.push(marker);
    });

    // 绘制路线
    if (showRoutes && locations.length > 1) {
      drawRoutes();
    }

    // 自适应显示所有标记
    if (locations.length > 0) {
      mapInstanceRef.current.setFitView();
    }
  };

  const drawRoutes = () => {
    if (!mapInstanceRef.current || locations.length < 2) return;

    // 创建路径点
    const path = locations.map(loc => [
      loc.coordinates.longitude,
      loc.coordinates.latitude,
    ]);

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
    markersRef.current.push(polyline);
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
    return `
      <div class="map-info-window">
        <h4>${location.name}</h4>
        ${location.address ? `<p class="address">${location.address}</p>` : ''}
        ${location.description ? `<p class="description">${location.description}</p>` : ''}
      </div>
    `;
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
    </div>
  );
}
