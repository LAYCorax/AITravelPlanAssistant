import { useState, useEffect } from 'react';
import { Card, Button, Input, message, Modal } from 'antd';
import {
  PlusOutlined,
  CalendarOutlined,
  DollarOutlined,
  UserOutlined,
  EyeOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { TravelPlan } from '../../types';
import { getUserTravelPlans, deleteTravelPlan } from '../../services/api/travelPlans';
import { DataLoading } from '../../components/common/LoadingState';
import { NoPlansState, NoSearchResultsState } from '../../components/common/EmptyState';
import { showFriendlyError, parseApiError } from '../../utils/errorHandler';
import './MyPlans.css';

const { Search } = Input;

export function MyPlans() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<TravelPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const result = await getUserTravelPlans();
      
      if (result.success && result.plans) {
        setPlans(result.plans);
      } else {
        showFriendlyError(parseApiError(new Error(result.error || '加载失败')));
      }
    } catch (error) {
      console.error('Failed to load plans:', error);
      showFriendlyError(parseApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (planId: string, title: string) => {
    Modal.confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除计划"${title}"吗？此操作不可恢复。`,
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          const result = await deleteTravelPlan(planId);
          if (result.success) {
            message.success('删除成功');
            loadPlans(); // 重新加载列表
          } else {
            message.error(result.error || '删除失败');
          }
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  const filteredPlans = plans.filter((plan) => {
    const matchesSearch =
      searchText === '' ||
      plan.title.toLowerCase().includes(searchText.toLowerCase()) ||
      plan.destination.toLowerCase().includes(searchText.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="my-plans-page">
      <div className="plans-header">
        <h2>我的旅行计划</h2>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={() => navigate('/planner')}
        >
          创建新计划
        </Button>
      </div>

      <div className="plans-filters">
        <Search
          placeholder="搜索计划或目的地"
          allowClear
          style={{ width: 300 }}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      {loading ? (
        <DataLoading tip="加载计划列表中..." />
      ) : filteredPlans.length === 0 ? (
        plans.length === 0 ? (
          <NoPlansState onCreatePlan={() => navigate('/planner')} />
        ) : (
          <NoSearchResultsState />
        )
      ) : (
        <div className="plans-grid">
          {filteredPlans.map((plan) => (
            <Card
              key={plan.id}
              className="plan-card"
              hoverable
              actions={[
                <Button
                  type="text"
                  icon={<EyeOutlined />}
                  onClick={() => navigate(`/plans/${plan.id}`)}
                >
                  查看
                </Button>,
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(plan.id, plan.title)}
                >
                  删除
                </Button>,
              ]}
            >
              <div className="plan-card-header">
                <h3>{plan.title}</h3>
              </div>

              <div className="plan-card-info">
                <div className="plan-info-item">
                  <CalendarOutlined />
                  <span>
                    {(plan as any).startDate || plan.start_date} 至 {(plan as any).endDate || plan.end_date} ({plan.days}天)
                  </span>
                </div>
                <div className="plan-info-item">
                  <DollarOutlined />
                  <span>预算: ¥{plan.budget.toLocaleString()}</span>
                </div>
                <div className="plan-info-item">
                  <UserOutlined />
                  <span>{(plan as any).travelerCount || plan.traveler_count}人</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
