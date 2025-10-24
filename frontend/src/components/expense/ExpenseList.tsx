/**
 * ExpenseList Component - Week 7
 * 费用记录列表展示组件
 */

import { List, Space, Tag, Typography, Button, Popconfirm, message, Empty } from 'antd';
import { 
  DeleteOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Expense } from '../../types';
import { categoryOptions } from './ExpenseForm';
import './ExpenseList.css';

const { Text } = Typography;

interface ExpenseListProps {
  expenses: Expense[];
  loading?: boolean;
  onDelete: (expenseId: string) => Promise<void>;
}

export function ExpenseList({ expenses, loading = false, onDelete }: ExpenseListProps) {
  
  const handleDelete = async (expenseId: string) => {
    try {
      await onDelete(expenseId);
      message.success('删除成功');
    } catch (error: any) {
      message.error(error.message || '删除失败');
    }
  };

  const getCategoryInfo = (category: string) => {
    return categoryOptions.find(opt => opt.value === category) || 
           { label: category, color: '#8c8c8c' };
  };

  if (!expenses || expenses.length === 0) {
    return (
      <Empty 
        description="暂无费用记录"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  return (
    <List
      className="expense-list"
      loading={loading}
      dataSource={expenses}
      renderItem={(expense) => {
        const categoryInfo = getCategoryInfo(expense.category);
        return (
          <List.Item
            key={expense.id}
            actions={[
              <Popconfirm
                key="delete"
                title="确定要删除这条费用记录吗？"
                onConfirm={() => handleDelete(expense.id)}
                okText="确定"
                cancelText="取消"
              >
                <Button 
                  type="text" 
                  danger 
                  icon={<DeleteOutlined />}
                  size="small"
                >
                  删除
                </Button>
              </Popconfirm>
            ]}
          >
            <List.Item.Meta
              title={
                <Space>
                  <Tag color={categoryInfo.color}>
                    {categoryInfo.label}
                  </Tag>
                  <Text strong>¥{Number(expense.amount).toFixed(2)}</Text>
                </Space>
              }
              description={
                <Space direction="vertical" size="small">
                  <Text>{expense.description}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    <CalendarOutlined /> {dayjs(expense.expense_date).format('YYYY年MM月DD日')}
                  </Text>
                </Space>
              }
            />
          </List.Item>
        );
      }}
    />
  );
}
