/**
 * ExpenseCharts Component - Week 8
 * 费用可视化图表组件（饼图 + 柱状图）
 */

import { Card, Empty, Tabs } from 'antd';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import type { ExpenseSummary, Expense } from '../../types';
import { categoryOptions } from './ExpenseForm';
import './ExpenseCharts.css';

interface ExpenseChartsProps {
  summary: ExpenseSummary;
  expenses: Expense[];
}

// 饼图自定义标签
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
  const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      fontSize={12}
      fontWeight="bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// 饼图组件
function ExpensePieChart({ summary }: { summary: ExpenseSummary }) {
  // 准备饼图数据
  const pieData = categoryOptions
    .map(category => ({
      name: category.label,
      value: summary.byCategory[category.value as keyof ExpenseSummary['byCategory']],
      color: category.color,
    }))
    .filter(item => item.value > 0); // 只显示有支出的分类

  if (pieData.length === 0) {
    return <Empty description="暂无费用数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  }

  return (
    <div className="expense-pie-chart">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => `¥${value.toFixed(2)}`}
            contentStyle={{ borderRadius: 8, border: '1px solid #f0f0f0' }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value, entry: any) => `${value} (¥${entry.payload.value.toFixed(2)})`}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// 按日期统计支出
function getDailyExpenses(expenses: Expense[]): { date: string; amount: number }[] {
  const dailyMap = new Map<string, number>();

  expenses.forEach(expense => {
    const date = expense.expense_date;
    const current = dailyMap.get(date) || 0;
    dailyMap.set(date, current + Number(expense.amount));
  });

  // 转换为数组并排序
  const dailyData = Array.from(dailyMap.entries())
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return dailyData;
}

// 柱状图组件
function ExpenseBarChart({ expenses }: { expenses: Expense[] }) {
  const dailyData = getDailyExpenses(expenses);

  if (dailyData.length === 0) {
    return <Empty description="暂无费用数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  }

  return (
    <div className="expense-bar-chart">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={dailyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => {
              // 格式化日期显示为 MM-DD
              const parts = value.split('-');
              return `${parts[1]}-${parts[2]}`;
            }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `¥${value}`}
          />
          <Tooltip 
            formatter={(value: number) => [`¥${value.toFixed(2)}`, '支出']}
            labelFormatter={(label) => `日期: ${label}`}
            contentStyle={{ borderRadius: 8, border: '1px solid #f0f0f0' }}
          />
          <Bar dataKey="amount" fill="#1890ff" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// 按分类统计支出（柱状图版本）
function ExpenseCategoryBarChart({ summary }: { summary: ExpenseSummary }) {
  const categoryData = categoryOptions
    .map(category => ({
      name: category.label,
      amount: summary.byCategory[category.value as keyof ExpenseSummary['byCategory']],
      color: category.color,
    }))
    .filter(item => item.amount > 0);

  if (categoryData.length === 0) {
    return <Empty description="暂无费用数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  }

  return (
    <div className="expense-category-bar-chart">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `¥${value}`} />
          <Tooltip 
            formatter={(value: number) => [`¥${value.toFixed(2)}`, '支出']}
            contentStyle={{ borderRadius: 8, border: '1px solid #f0f0f0' }}
          />
          <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
            {categoryData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// 主组件：包含多个图表的Tab面板
export function ExpenseCharts({ summary, expenses }: ExpenseChartsProps) {
  const items = [
    {
      key: 'pie',
      label: '📊 分类占比',
      children: <ExpensePieChart summary={summary} />,
    },
    {
      key: 'categoryBar',
      label: '📈 分类支出',
      children: <ExpenseCategoryBarChart summary={summary} />,
    },
    {
      key: 'dailyBar',
      label: '📅 每日趋势',
      children: <ExpenseBarChart expenses={expenses} />,
    },
  ];

  return (
    <Card title="📊 支出统计图表" className="expense-charts-card">
      <Tabs defaultActiveKey="pie" items={items} />
    </Card>
  );
}
