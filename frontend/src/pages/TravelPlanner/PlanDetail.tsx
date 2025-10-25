import { useState, useEffect } from 'react';
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
  AccountBookOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import type { TravelPlan, ItineraryDetail, Expense, ExpenseSummary } from '../../types';
import { getTravelPlanById, updateTravelPlan } from '../../services/api/travelPlans';
import { 
  getExpensesByPlanId, 
  createExpense, 
  deleteExpense,
  getExpenseSummary 
} from '../../services/api/expenses';
import { MapView } from '../../components/map/MapView';
import { checkAmapConfig, type Location } from '../../services/map/amap';
import { ExpenseForm } from '../../components/expense/ExpenseForm';
import { ExpenseList } from '../../components/expense/ExpenseList';
import { ExpenseSummaryCard } from '../../components/expense/ExpenseSummary';
import { VoiceExpenseRecorder } from '../../components/expense/VoiceExpenseRecorder';
import { ExpenseCharts } from '../../components/expense/ExpenseCharts';
import { BudgetAlert } from '../../components/expense/BudgetAlert';
import { ExpenseReport } from '../../components/expense/ExpenseReport';
import { ItineraryEditor } from '../../components/itinerary/ItineraryEditor';
import dayjs from 'dayjs';
import './PlanDetail.css';

const { Title, Text, Paragraph } = Typography;

export function PlanDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<TravelPlan | null>(null);
  const [itinerary, setItinerary] = useState<ItineraryDetail[]>([]);
  const [activeTab, setActiveTab] = useState<'itinerary' | 'expenses'>('itinerary');
  const [mapConfigured, setMapConfigured] = useState(false);
  const [mapConfigMessage, setMapConfigMessage] = useState('');
  
  // 费用管理相关状态 - Week 7
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseSummary, setExpenseSummary] = useState<ExpenseSummary>({
    total: 0,
    byCategory: {
      transport: 0,
      accommodation: 0,
      food: 0,
      attraction: 0,
      shopping: 0,
      other: 0,
    },
  });
  const [expenseLoading, setExpenseLoading] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  
  // 行程编辑相关状态 - Week 8
  const [isEditingItinerary, setIsEditingItinerary] = useState(false);

  useEffect(() => {
    if (id) {
      loadPlanDetail(id);
      checkMapConfiguration();
    }
  }, [id]);

  // 检查地图API配置
  const checkMapConfiguration = async () => {
    const config = await checkAmapConfig();
    setMapConfigured(config.configured);
    setMapConfigMessage(config.message);
    return config.configured;
  };

  // 保存行程编辑 - Week 8
  const handleSaveItinerary = async (updatedItinerary: ItineraryDetail[]) => {
    if (!id) return;
    
    try {
      // 调用API保存行程到数据库
      const result = await updateTravelPlan(id, {}, updatedItinerary.map(item => ({
        day: item.day,
        date: item.date,
        title: item.title,
        activities: item.activities,
        accommodation: item.accommodation,
        transportation: item.transportation,
        meals: item.meals,
        totalCost: item.totalCost,
        notes: item.notes,
      })));
      
      if (result.success) {
        setItinerary(updatedItinerary);
        setIsEditingItinerary(false);
        message.success('行程保存成功');
      } else {
        message.error('行程保存失败: ' + result.error);
      }
    } catch (error) {
      console.error('保存行程失败:', error);
      message.error('行程保存失败，请稍后重试');
    }
  };

  // 处理标签页切换
  const handleTabChange = async (key: string) => {
    if (key === 'expenses' && id) {
      // 切换到费用管理时，加载费用数据
      await loadExpenses(id);
    }
    setActiveTab(key as 'itinerary' | 'expenses');
  };

  // 加载费用数据 - Week 7
  const loadExpenses = async (planId: string) => {
    try {
      setExpenseLoading(true);
      const [expensesResult, summaryResult] = await Promise.all([
        getExpensesByPlanId(planId),
        getExpenseSummary(planId),
      ]);

      if (expensesResult.success && expensesResult.expenses) {
        setExpenses(expensesResult.expenses);
      }

      if (summaryResult.success && summaryResult.summary) {
        setExpenseSummary(summaryResult.summary);
      }
    } catch (error) {
      console.error('加载费用数据失败:', error);
    } finally {
      setExpenseLoading(false);
    }
  };

  // 添加费用记录 - Week 7
  const handleAddExpense = async (expense: any) => {
    if (!id) return;
    
    setExpenseLoading(true);
    const result = await createExpense(expense);
    
    if (result.success) {
      message.success('费用记录添加成功');
      setShowExpenseForm(false);
      await loadExpenses(id);
    } else {
      message.error(result.error || '添加费用记录失败');
    }
    setExpenseLoading(false);
  };

  // 删除费用记录 - Week 7
  const handleDeleteExpense = async (expenseId: string) => {
    if (!id) return;
    
    const result = await deleteExpense(expenseId);
    
    if (result.success) {
      await loadExpenses(id);
    } else {
      throw new Error(result.error || '删除失败');
    }
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

  // 将行程详情转换为地图位置
  const getMapLocations = (): Location[] => {
    const locations: Location[] = [];
    
    itinerary.forEach(day => {
      // 添加活动地点
      if (day.activities && Array.isArray(day.activities)) {
        day.activities.forEach((activity: any) => {
          // 验证坐标有效性：必须存在且不为 (0, 0)
          if (activity.coordinates && 
              activity.coordinates.latitude && 
              activity.coordinates.longitude &&
              (activity.coordinates.latitude !== 0 || activity.coordinates.longitude !== 0)) {
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
          } else {
            console.warn(`[PlanDetail] 活动 "${activity.name}" 坐标无效，已跳过:`, activity.coordinates);
          }
        });
      }

      // 添加住宿地点
      if (day.accommodation && day.accommodation.coordinates) {
        // 验证坐标有效性
        if ((day.accommodation.coordinates.latitude !== 0 || day.accommodation.coordinates.longitude !== 0)) {
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
      }
    });

    console.log(`[PlanDetail] 有效地图位置: ${locations.length}个`, locations);
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
          </Space>

          <div>
            <Title level={2} style={{ margin: 0 }}>
              {plan.title}
            </Title>
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

      {/* Two-Column Layout: Map + Content */}
      {itinerary.length === 0 ? (
        <Card>
          <Empty description="暂无行程安排" />
        </Card>
      ) : (
        <div className="plan-detail-content">
          {/* Left Column: Map (Fixed) */}
          <div className="map-column">
            <Card 
              className="map-card"
              title={
                <Space>
                  <EnvironmentFilled />
                  <span>地图展示</span>
                </Space>
              }
              extra={
                !mapConfigured && (
                  <Button
                    size="small"
                    icon={<SettingOutlined />}
                    onClick={() => navigate('/settings?tab=api')}
                  >
                    配置地图
                  </Button>
                )
              }
            >
              {!mapConfigured && (
                <Alert
                  message="地图服务未配置"
                  description={mapConfigMessage}
                  type="warning"
                  showIcon
                  closable
                  style={{ marginBottom: 16 }}
                />
              )}
              <MapView
                locations={getMapLocations()}
                showRoutes={true}
                height="calc(100vh - 320px)"
              />
            </Card>
          </div>

          {/* Right Column: Tabs for Itinerary and Expenses */}
          <div className="content-column">
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
                    children: (
                      <div style={{ marginTop: 16 }}>
                        <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
                          <Button
                            type={isEditingItinerary ? 'default' : 'primary'}
                            icon={<EditOutlined />}
                            onClick={() => setIsEditingItinerary(!isEditingItinerary)}
                          >
                            {isEditingItinerary ? '取消编辑' : '编辑行程'}
                          </Button>
                        </Space>
                        
                        {isEditingItinerary ? (
                          <ItineraryEditor
                            itinerary={itinerary}
                            onSave={handleSaveItinerary}
                            onCancel={() => setIsEditingItinerary(false)}
                          />
                        ) : (
                          <ItineraryView itinerary={itinerary} />
                        )}
                      </div>
                    ),
                  },
                  {
                    key: 'expenses',
                    label: (
                      <span>
                        <AccountBookOutlined /> 费用管理
                      </span>
                    ),
                    children: (
                      <div style={{ marginTop: 16 }}>
                        <Space direction="vertical" style={{ width: '100%' }} size="large">
                          {/* 预算预警 - Week 8 */}
                          {expenseSummary.total > 0 && (
                            <BudgetAlert 
                              budget={plan?.budget || 0} 
                              summary={expenseSummary}
                            />
                          )}
                          
                          {/* 费用统计 */}
                          <ExpenseSummaryCard 
                            budget={plan?.budget || 0} 
                            summary={expenseSummary} 
                          />
                          
                          {/* 费用图表可视化 - Week 8 */}
                          {expenses.length > 0 && (
                            <ExpenseCharts 
                              summary={expenseSummary} 
                              expenses={expenses}
                            />
                          )}
                          
                          {/* 添加费用按钮和方式切换 */}
                          <div>
                            <Space style={{ marginBottom: 16 }}>
                              <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => setShowExpenseForm(!showExpenseForm)}
                              >
                                {showExpenseForm ? '取消' : '手动添加费用'}
                              </Button>
                              
                              {/* 语音录入按钮 */}
                              {id && (
                                <VoiceExpenseRecorder
                                  planId={id}
                                  onExpenseCreated={handleAddExpense}
                                />
                              )}
                            </Space>

                            {/* 费用录入表单 */}
                            {showExpenseForm && id && (
                              <Card style={{ marginBottom: 16 }} title="手动添加费用">
                                <ExpenseForm
                                  planId={id}
                                  onSubmit={handleAddExpense}
                                  onCancel={() => setShowExpenseForm(false)}
                                  loading={expenseLoading}
                                />
                              </Card>
                            )}
                          </div>

                          {/* 费用列表 */}
                          <Card title="费用记录">
                            <ExpenseList
                              expenses={expenses}
                              loading={expenseLoading}
                              onDelete={handleDeleteExpense}
                            />
                          </Card>

                          {/* 支出分析报告 - Week 8 */}
                          {plan && expenses.length > 0 && (
                            <ExpenseReport
                              plan={plan}
                              summary={expenseSummary}
                              expenses={expenses}
                            />
                          )}
                        </Space>
                      </div>
                    ),
                  },
                ]}
              />
            </Card>
          </div>
        </div>
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
                                <Text strong>
                                  {activity.time || '未设置时间'}
                                </Text>
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
