/**
 * BudgetAlert Component - Week 8
 * 预算预警组件 - 提供实时预算超支预警
 */

import { Alert, Progress, Space, Typography, Tag } from 'antd';
import { 
  WarningOutlined, 
  ExclamationCircleOutlined, 
  CheckCircleOutlined 
} from '@ant-design/icons';
import type { ExpenseSummary } from '../../types';
import { categoryOptions } from './ExpenseForm';

const { Text } = Typography;

interface BudgetAlertProps {
  budget: number;
  summary: ExpenseSummary;
}

// 计算预算使用率
function calculateBudgetUsage(budget: number, spent: number): number {
  if (budget === 0) return 0;
  return (spent / budget) * 100;
}

// 获取预警级别
function getAlertLevel(percentage: number, spent: number, budget: number): {
  type: 'success' | 'info' | 'warning' | 'error';
  icon: React.ReactNode;
  title: string;
  description: string;
} {
  if (percentage < 50) {
    return {
      type: 'success',
      icon: <CheckCircleOutlined />,
      title: '预算充足',
      description: '当前支出在合理范围内，继续保持！',
    };
  } else if (percentage < 70) {
    return {
      type: 'info',
      icon: <ExclamationCircleOutlined />,
      title: '预算正常',
      description: '已使用一半以上预算，注意控制开支。',
    };
  } else if (percentage < 90) {
    return {
      type: 'warning',
      icon: <WarningOutlined />,
      title: '预算预警',
      description: '预算即将用完，请谨慎支出！',
    };
  } else if (percentage < 100) {
    return {
      type: 'error',
      icon: <WarningOutlined />,
      title: '预算告急',
      description: '预算严重不足，建议减少不必要的支出。',
    };
  } else {
    return {
      type: 'error',
      icon: <WarningOutlined />,
      title: '预算超支',
      description: `已超出预算 ¥${(spent - budget).toFixed(2)}，请立即调整！`,
    };
  }
}

// 分类预算分析
function analyzeCategoryBudget(
  budget: number,
  summary: ExpenseSummary
): { category: string; label: string; spent: number; percentage: number; warning: boolean }[] {
  // 假设理想分配比例
  const idealRatios: Record<string, number> = {
    transport: 0.20,      // 20% 交通
    accommodation: 0.30,  // 30% 住宿
    food: 0.25,           // 25% 餐饮
    attraction: 0.15,     // 15% 景点
    shopping: 0.08,       // 8% 购物
    other: 0.02,          // 2% 其他
  };

  return categoryOptions.map(cat => {
    const spent = summary.byCategory[cat.value as keyof ExpenseSummary['byCategory']];
    const idealBudget = budget * idealRatios[cat.value];
    const percentage = idealBudget > 0 ? (spent / idealBudget) * 100 : 0;
    
    return {
      category: cat.value,
      label: cat.label,
      spent,
      percentage,
      warning: percentage > 100, // 超过理想预算
    };
  }).filter(item => item.spent > 0); // 只显示有支出的分类
}

export function BudgetAlert({ budget, summary }: BudgetAlertProps) {
  const usage = calculateBudgetUsage(budget, summary.total);
  const alert = getAlertLevel(usage, summary.total, budget);
  const categoryAnalysis = analyzeCategoryBudget(budget, summary);
  const warnings = categoryAnalysis.filter(item => item.warning);

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      {/* 总体预算预警 */}
      <Alert
        message={alert.title}
        description={
          <Space direction="vertical" style={{ width: '100%' }} size="small">
            <Text>{alert.description}</Text>
            <Progress 
              percent={Math.min(usage, 100)} 
              status={usage >= 100 ? 'exception' : usage >= 90 ? 'exception' : 'normal'}
              strokeColor={
                usage < 50 ? '#52c41a' :
                usage < 70 ? '#1890ff' :
                usage < 90 ? '#faad14' :
                '#ff4d4f'
              }
            />
            <div>
              <Text type="secondary">已支出: </Text>
              <Text strong>¥{summary.total.toFixed(2)}</Text>
              <Text type="secondary"> / 预算: </Text>
              <Text>¥{budget.toFixed(2)}</Text>
            </div>
          </Space>
        }
        type={alert.type}
        icon={alert.icon}
        showIcon
      />

      {/* 分类预算预警 */}
      {warnings.length > 0 && (
        <Alert
          message="分类预算超标"
          description={
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              <Text type="secondary">以下分类支出超过了建议预算：</Text>
              {warnings.map(item => (
                <div key={item.category}>
                  <Space>
                    <Tag color="error">{item.label}</Tag>
                    <Text>已支出 ¥{item.spent.toFixed(2)}</Text>
                    <Text type="danger">({item.percentage.toFixed(0)}% 理想预算)</Text>
                  </Space>
                </div>
              ))}
            </Space>
          }
          type="warning"
          showIcon
        />
      )}

      {/* 支出建议 */}
      {usage > 70 && usage < 100 && (
        <Alert
          message="💡 省钱建议"
          description={
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>选择公共交通而非打车，可节省交通费用</li>
              <li>尝试当地特色小吃代替高档餐厅</li>
              <li>提前预订门票可享受优惠价格</li>
              <li>购买纪念品时货比三家</li>
            </ul>
          }
          type="info"
          showIcon
        />
      )}
    </Space>
  );
}
