import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Spin,
  Button,
  Space,
  Tag,
  Timeline,
  Descriptions,
  Typography,
  message,
  Divider,
  Empty,
  Tabs,
  Alert,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  ShareAltOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  HomeOutlined,
  CarOutlined,
  CoffeeOutlined,
  EnvironmentFilled,
  UnorderedListOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { TravelPlan, ItineraryDetail } from '../../types';
import { getTravelPlanById } from '../../services/api/travelPlans';
import { MapView } from '../../components/map/MapView';
import { checkAmapConfig, type Location } from '../../services/map/amap';
import dayjs from 'dayjs';
import './PlanDetail.css';

const { Title, Text, Paragraph } = Typography;

export function PlanDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<TravelPlan | null>(null);
  const [itinerary, setItinerary] = useState<ItineraryDetail[]>([]);
  const [activeTab, setActiveTab] = useState<'itinerary' | 'map'>('itinerary');
  const [mapConfigured, setMapConfigured] = useState(false);
  const [mapConfigMessage, setMapConfigMessage] = useState('');

  useEffect(() => {
    if (id) {
      loadPlanDetail(id);
    }
  }, [id]);

  // 检查地图API配置
  const checkMapConfiguration = async () => {
    const config = await checkAmapConfig();
    setMapConfigured(config.configured);
    setMapConfigMessage(config.message);
    return config.configured;
  };

  // 处理标签页切换
  const handleTabChange = async (key: string) => {
    if (key === 'map') {
      // 切换到地图展示时，检查地图API配置
      const isConfigured = await checkMapConfiguration();
      if (!isConfigured) {
        message.warning({
          content: '地图服务未配置。请前往【设置 → API配置】页面配置高德地图的API密钥。',
          duration: 5,
        });
      }
    }
    setActiveTab(key as 'itinerary' | 'map');
  };

  const loadPlanDetail = async (planId: string) => {
    try {
      setLoading(true);
      const result = await getTravelPlanById(planId);

      if (result.success && result.plan) {
        setPlan(result.plan);
        setItinerary(result.itinerary || []);
      } else {
        message.error(result.error || '加载计划详情失败');
        navigate('/plans');
      }
    } catch (error) {
      console.error('Failed to load plan detail:', error);
      message.error('加载计划详情失败');
      navigate('/plans');
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      draft: { color: 'default', text: '草稿' },
      confirmed: { color: 'processing', text: '已确认' },
      in_progress: { color: 'blue', text: '进行中' },
      completed: { color: 'success', text: '已完成' },
      cancelled: { color: 'error', text: '已取消' },
    };
    const { color, text } = statusMap[status] || statusMap.draft;
    return <Tag color={color}>{text}</Tag>;
  };

  // 将行程详情转换为地图位置
  const getMapLocations = (): Location[] => {
    const locations: Location[] = [];
    
    itinerary.forEach(day => {
      // 添加活动地点
      if (day.activities && Array.isArray(day.activities)) {
        day.activities.forEach((activity: any) => {
          if (activity.coordinates && activity.coordinates.latitude && activity.coordinates.longitude) {
            locations.push({
              name: activity.name || '活动',
              address: activity.address || activity.location,
              coordinates: {
                latitude: activity.coordinates.latitude,
                longitude: activity.coordinates.longitude,
              },
              type: 'activity',
              description: activity.description,
            });
          }
        });
      }

      // 添加住宿地点
      if (day.accommodation && day.accommodation.coordinates) {
        locations.push({
          name: day.accommodation.name || '住宿',
          address: day.accommodation.address,
          coordinates: {
            latitude: day.accommodation.coordinates.latitude,
            longitude: day.accommodation.coordinates.longitude,
          },
          type: 'accommodation',
        });
      }
    });

    return locations;
  };

  if (loading) {
    return (
      <div className="plan-detail-loading">
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  if (!plan) {
    return (
      <Card>
        <Empty description="未找到计划详情" />
      </Card>
    );
  }

  return (
    <div className="plan-detail-page">
      {/* Header Section */}
      <Card className="plan-header-card">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/plans')}
            >
              返回
            </Button>
            <Button
              icon={<EditOutlined />}
              onClick={() => navigate(`/plans/${id}/edit`)}
            >
              编辑
            </Button>
            <Button icon={<ShareAltOutlined />}>分享</Button>
          </Space>

          <div>
            <Space align="start">
              <Title level={2} style={{ margin: 0 }}>
                {plan.title}
              </Title>
              {getStatusTag(plan.status)}
            </Space>
            {plan.description && (
              <Paragraph style={{ marginTop: 16, color: '#666' }}>
                {plan.description}
              </Paragraph>
            )}
          </div>

          <Descriptions column={2}>
            <Descriptions.Item
              label={
                <>
                  <EnvironmentOutlined /> 目的地
                </>
              }
            >
              {plan.destination}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <>
                  <CalendarOutlined /> 出行日期
                </>
              }
            >
              {dayjs(plan.startDate).format('YYYY年MM月DD日')} 至{' '}
              {dayjs(plan.endDate).format('YYYY年MM月DD日')} ({plan.days}天)
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <>
                  <DollarOutlined /> 预算
                </>
              }
            >
              ¥{plan.budget.toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="旅行人数">
              {plan.travelerCount}人
            </Descriptions.Item>
          </Descriptions>
        </Space>
      </Card>

      {/* Tabs for Itinerary and Map */}
      {itinerary.length === 0 ? (
        <Card>
          <Empty description="暂无行程安排" />
        </Card>
      ) : (
        <Card>
          <Tabs
            activeKey={activeTab}
            onChange={handleTabChange}
            items={[
              {
                key: 'itinerary',
                label: (
                  <span>
                    <UnorderedListOutlined /> 行程详情
                  </span>
                ),
                children: <ItineraryView itinerary={itinerary} />,
              },
              {
                key: 'map',
                label: (
                  <span>
                    <EnvironmentFilled /> 地图展示
                  </span>
                ),
                children: (
                  <div style={{ marginTop: 16 }}>
                    {!mapConfigured && activeTab === 'map' && (
                      <Alert
                        message="地图服务未配置"
                        description={
                          <div>
                            {mapConfigMessage}
                            <br />
                            <Button
                              type="link"
                              icon={<SettingOutlined />}
                              onClick={() => navigate('/settings?tab=api')}
                              style={{ paddingLeft: 0, marginTop: 8 }}
                            >
                              前往配置
                            </Button>
                          </div>
                        }
                        type="warning"
                        showIcon
                        closable
                        style={{ marginBottom: 16 }}
                      />
                    )}
                    <MapView
                      locations={getMapLocations()}
                      showRoutes={true}
                      height="600px"
                    />
                  </div>
                ),
              },
            ]}
          />
        </Card>
      )}
    </div>
  );
}

// 行程详情展示组件
function ItineraryView({ itinerary }: { itinerary: ItineraryDetail[] }) {
  return (
    <div className="itinerary-section">
      {itinerary.map((day) => (
        <Card key={day.id} className="day-card" title={`第${day.day}天 - ${day.title}`}>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {/* Day Header */}
                <div className="day-header">
                  <Text strong>
                    <CalendarOutlined /> {dayjs(day.date).format('YYYY年MM月DD日 dddd')}
                  </Text>
                  <Text type="secondary">
                    <DollarOutlined /> 预计费用: ¥{day.totalCost.toLocaleString()}
                  </Text>
                </div>

                {/* Activities Timeline */}
                {day.activities && day.activities.length > 0 && (
                  <div>
                    <Title level={5}>活动安排</Title>
                    <Timeline>
                      {day.activities.map((activity: any, idx: number) => (
                        <Timeline.Item
                          key={idx}
                          dot={<ClockCircleOutlined />}
                          color="blue"
                        >
                          <div className="activity-item">
                            <Space direction="vertical" size="small" style={{ width: '100%' }}>
                              <Space>
                                <Text strong>{activity.time}</Text>
                                <Tag>{activity.type === 'activity' ? '景点' : '活动'}</Tag>
                              </Space>
                              <Title level={5} style={{ margin: 0 }}>
                                {activity.name}
                              </Title>
                              {activity.location && (
                                <Text type="secondary">
                                  <EnvironmentOutlined /> {activity.location}
                                </Text>
                              )}
                              {activity.description && (
                                <Paragraph>{activity.description}</Paragraph>
                              )}
                              {activity.cost > 0 && (
                                <Text>
                                  <DollarOutlined /> 费用: ¥{activity.cost}
                                </Text>
                              )}
                              {activity.tips && (
                                <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                                  💡 {activity.tips}
                                </Paragraph>
                              )}
                            </Space>
                          </div>
                        </Timeline.Item>
                      ))}
                    </Timeline>
                  </div>
                )}

                <Divider />

                {/* Accommodation */}
                {day.accommodation && (
                  <div>
                    <Title level={5}>
                      <HomeOutlined /> 住宿
                    </Title>
                    <Card size="small">
                      <Space direction="vertical">
                        <Text strong>{day.accommodation.name}</Text>
                        {day.accommodation.address && (
                          <Text type="secondary">
                            <EnvironmentOutlined /> {day.accommodation.address}
                          </Text>
                        )}
                        {day.accommodation.cost && (
                          <Text>
                            <DollarOutlined /> ¥{day.accommodation.cost}
                          </Text>
                        )}
                        {day.accommodation.tips && (
                          <Text type="secondary">💡 {day.accommodation.tips}</Text>
                        )}
                      </Space>
                    </Card>
                  </div>
                )}

                {/* Transportation */}
                {day.transportation && (
                  <div>
                    <Title level={5}>
                      <CarOutlined /> 交通
                    </Title>
                    <Card size="small">
                      <Space direction="vertical">
                        <Text strong>{day.transportation.method}</Text>
                        {day.transportation.cost && (
                          <Text>
                            <DollarOutlined /> ¥{day.transportation.cost}
                          </Text>
                        )}
                        {day.transportation.tips && (
                          <Text type="secondary">💡 {day.transportation.tips}</Text>
                        )}
                      </Space>
                    </Card>
                  </div>
                )}

                {/* Meals */}
                {day.meals && (
                  <div>
                    <Title level={5}>
                      <CoffeeOutlined /> 餐饮
                    </Title>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      {day.meals.breakfast && (
                        <Card size="small" title="早餐">
                          <Space direction="vertical">
                            <Text>{day.meals.breakfast.location}</Text>
                            <Text>¥{day.meals.breakfast.cost}</Text>
                            {day.meals.breakfast.recommendation && (
                              <Text type="secondary">
                                推荐: {day.meals.breakfast.recommendation}
                              </Text>
                            )}
                          </Space>
                        </Card>
                      )}
                      {day.meals.lunch && (
                        <Card size="small" title="午餐">
                          <Space direction="vertical">
                            <Text>{day.meals.lunch.location}</Text>
                            <Text>¥{day.meals.lunch.cost}</Text>
                            {day.meals.lunch.recommendation && (
                              <Text type="secondary">
                                推荐: {day.meals.lunch.recommendation}
                              </Text>
                            )}
                          </Space>
                        </Card>
                      )}
                      {day.meals.dinner && (
                        <Card size="small" title="晚餐">
                          <Space direction="vertical">
                            <Text>{day.meals.dinner.location}</Text>
                            <Text>¥{day.meals.dinner.cost}</Text>
                            {day.meals.dinner.recommendation && (
                              <Text type="secondary">
                                推荐: {day.meals.dinner.recommendation}
                              </Text>
                            )}
                          </Space>
                        </Card>
                      )}
                    </Space>
                  </div>
                )}

                {/* Notes */}
                {day.notes && (
                  <div>
                    <Title level={5}>备注</Title>
                    <Paragraph>{day.notes}</Paragraph>
                  </div>
                )}
              </Space>
            </Card>
          ))}
        </div>
  );
}
