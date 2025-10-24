/**
 * ExpenseSummary Component - Week 7
 * 费用统计和预算对比组件
 */

import { Card, Row, Col, Statistic, Progress, Space, Typography, Divider } from 'antd';
import { 
  CarOutlined,
  HomeOutlined,
  CoffeeOutlined,
  EnvironmentOutlined,
  ShoppingOutlined,
  EllipsisOutlined,
} from '@ant-design/icons';
import type { ExpenseSummary } from '../../types';
import { categoryOptions } from './ExpenseForm';
import './ExpenseSummaryCard.css';

const { Text } = Typography;

interface ExpenseSummaryProps {
  budget: number;
  summary: ExpenseSummary;
}

const categoryIcons: Record<string, React.ReactNode> = {
  transport: <CarOutlined />,
  accommodation: <HomeOutlined />,
  food: <CoffeeOutlined />,
  attraction: <EnvironmentOutlined />,
  shopping: <ShoppingOutlined />,
  other: <EllipsisOutlined />,
};

export function ExpenseSummaryCard({ budget, summary }: ExpenseSummaryProps) {
  const spent = summary.total;
  const remaining = budget - spent;
  const percentage = budget > 0 ? (spent / budget) * 100 : 0;

  const getStatusColor = (percent: number) => {
    if (percent < 70) return '#52c41a'; // 绿色：良好
    if (percent < 90) return '#faad14'; // 橙色：警告
    return '#f5222d'; // 红色：超支或接近超支
  };

  return (
    <div className="expense-summary-container">
      {/* 总览卡片 */}
      <Card className="summary-overview-card">
        <Row gutter={24}>
          <Col span={8}>
            <Statistic
              title="总预算"
              value={budget}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="已花费"
              value={spent}
              precision={2}
              prefix="¥"
              valueStyle={{ color: getStatusColor(percentage) }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="剩余预算"
              value={remaining}
              precision={2}
              prefix="¥"
              valueStyle={{ color: remaining >= 0 ? '#52c41a' : '#f5222d' }}
            />
          </Col>
        </Row>

        <Divider />

        <div style={{ marginBottom: 16 }}>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Text>预算使用率</Text>
            <Text strong>{percentage.toFixed(1)}%</Text>
          </Space>
          <Progress
            percent={percentage}
            strokeColor={getStatusColor(percentage)}
            showInfo={false}
            style={{ marginTop: 8 }}
          />
          {percentage > 100 && (
            <Text type="danger" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>
              ⚠️ 已超出预算 ¥{(spent - budget).toFixed(2)}
            </Text>
          )}
        </div>
      </Card>

      {/* 分类支出卡片 */}
      <Card title="分类支出明细" className="category-breakdown-card">
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          {categoryOptions.map((category) => {
            const categorySpent = summary.byCategory[category.value as keyof ExpenseSummary['byCategory']];
            const categoryPercent = spent > 0 ? (categorySpent / spent) * 100 : 0;
            
            if (categorySpent === 0) return null;

            return (
              <div key={category.value} className="category-item">
                <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Space>
                    <span style={{ fontSize: 18 }}>
                      {categoryIcons[category.value]}
                    </span>
                    <Text>{category.label}</Text>
                  </Space>
                  <Space>
                    <Text strong>¥{categorySpent.toFixed(2)}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      ({categoryPercent.toFixed(1)}%)
                    </Text>
                  </Space>
                </Space>
                <Progress
                  percent={categoryPercent}
                  strokeColor={category.color}
                  showInfo={false}
                  size="small"
                />
              </div>
            );
          })}
        </Space>
      </Card>
    </div>
  );
}
