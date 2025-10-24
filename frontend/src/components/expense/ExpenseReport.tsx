/**
 * ExpenseReport Component - Week 8
 * 支出分析报告组件
 */

import { Card, Button, Space, Typography, Divider, Tag, Modal } from 'antd';
import { FileTextOutlined, DownloadOutlined } from '@ant-design/icons';
import { useState } from 'react';
import type { ExpenseSummary, Expense, TravelPlan } from '../../types';
import { categoryOptions } from './ExpenseForm';
import dayjs from 'dayjs';

const { Title, Paragraph, Text } = Typography;

interface ExpenseReportProps {
  plan: TravelPlan;
  summary: ExpenseSummary;
  expenses: Expense[];
}

// 生成报告内容
function generateReportContent(plan: TravelPlan, summary: ExpenseSummary, expenses: Expense[]): {
  overview: string;
  categoryAnalysis: string[];
  trends: string[];
  recommendations: string[];
} {
  const budget = plan.budget || 0;
  const spent = summary.total;
  const remaining = budget - spent;
  const usage = budget > 0 ? (spent / budget) * 100 : 0;
  const days = plan.days || 1;
  const avgDaily = spent / days;

  // 总览
  const overview = `
本次 ${plan.destination} 之旅计划 ${days} 天，预算 ¥${budget.toFixed(2)}，
实际支出 ¥${spent.toFixed(2)}，${remaining >= 0 ? `剩余 ¥${remaining.toFixed(2)}` : `超支 ¥${Math.abs(remaining).toFixed(2)}`}，
预算使用率 ${usage.toFixed(1)}%。日均支出 ¥${avgDaily.toFixed(2)}。
  `.trim();

  // 分类分析
  const categoryAnalysis: string[] = [];
  const sortedCategories = Object.entries(summary.byCategory)
    .filter(([_, amount]) => amount > 0)
    .sort(([_, a], [__, b]) => b - a);

  sortedCategories.forEach(([category, amount]) => {
    const percentage = (amount / spent) * 100;
    const categoryInfo = categoryOptions.find(c => c.value === category);
    categoryAnalysis.push(
      `${categoryInfo?.label || category}：¥${amount.toFixed(2)} (${percentage.toFixed(1)}%)`
    );
  });

  // 支出趋势
  const trends: string[] = [];
  
  // 按日期分组
  const dailyExpenses = new Map<string, number>();
  expenses.forEach(exp => {
    const date = exp.expense_date;
    dailyExpenses.set(date, (dailyExpenses.get(date) || 0) + Number(exp.amount));
  });

  const sortedDays = Array.from(dailyExpenses.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  
  if (sortedDays.length > 0) {
    const maxDay = sortedDays.reduce((max, day) => day[1] > max[1] ? day : max);
    const minDay = sortedDays.reduce((min, day) => day[1] < min[1] ? day : min);
    
    trends.push(`支出最高日：${dayjs(maxDay[0]).format('MM月DD日')}，支出 ¥${maxDay[1].toFixed(2)}`);
    trends.push(`支出最低日：${dayjs(minDay[0]).format('MM月DD日')}，支出 ¥${minDay[1].toFixed(2)}`);
    
    // 判断趋势
    if (sortedDays.length >= 3) {
      const firstThird = sortedDays.slice(0, Math.floor(sortedDays.length / 3));
      const lastThird = sortedDays.slice(-Math.floor(sortedDays.length / 3));
      
      const avgFirst = firstThird.reduce((sum, day) => sum + day[1], 0) / firstThird.length;
      const avgLast = lastThird.reduce((sum, day) => sum + day[1], 0) / lastThird.length;
      
      if (avgLast > avgFirst * 1.2) {
        trends.push('支出呈上升趋势，后期消费明显增加');
      } else if (avgLast < avgFirst * 0.8) {
        trends.push('支出呈下降趋势，后期消费更加节制');
      } else {
        trends.push('支出较为平稳，消费节奏控制得当');
      }
    }
  }

  // 建议
  const recommendations: string[] = [];
  
  if (usage > 100) {
    recommendations.push('预算已超支，建议减少不必要开支，优先保证基本需求');
  } else if (usage > 90) {
    recommendations.push('预算接近用完，建议谨慎控制后续支出');
  } else if (usage < 50) {
    recommendations.push('预算充足，可适当增加旅行体验项目');
  }

  // 分类建议
  const transportPercent = (summary.byCategory.transport / spent) * 100;
  const foodPercent = (summary.byCategory.food / spent) * 100;
  const accommodationPercent = (summary.byCategory.accommodation / spent) * 100;

  if (transportPercent > 30) {
    recommendations.push('交通费用占比较高，建议多使用公共交通工具');
  }
  
  if (foodPercent > 35) {
    recommendations.push('餐饮费用占比较高，可尝试当地特色小吃，性价比更高');
  }
  
  if (accommodationPercent > 40) {
    recommendations.push('住宿费用占比较高，可考虑民宿或提前预订享受优惠');
  }

  if (summary.byCategory.shopping > spent * 0.15) {
    recommendations.push('购物支出较多，建议理性消费，避免冲动购物');
  }

  return {
    overview,
    categoryAnalysis,
    trends,
    recommendations,
  };
}

export function ExpenseReport({ plan, summary, expenses }: ExpenseReportProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  if (expenses.length === 0) {
    return null;
  }

  const report = generateReportContent(plan, summary, expenses);

  const handleViewReport = () => {
    setIsModalVisible(true);
  };

  const handleDownload = () => {
    const reportText = `
【${plan.title} - 支出分析报告】

📊 支出总览
${report.overview}

💰 分类支出
${report.categoryAnalysis.join('\n')}

📈 支出趋势
${report.trends.join('\n')}

💡 优化建议
${report.recommendations.map((rec, idx) => `${idx + 1}. ${rec}`).join('\n')}

---
报告生成时间：${dayjs().format('YYYY年MM月DD日 HH:mm')}
    `.trim();

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${plan.destination}_支出报告_${dayjs().format('YYYYMMDD')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Card className="expense-report-card">
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space>
              <FileTextOutlined style={{ fontSize: 24, color: '#1890ff' }} />
              <Title level={4} style={{ margin: 0 }}>支出分析报告</Title>
            </Space>
            <Space>
              <Button type="primary" icon={<FileTextOutlined />} onClick={handleViewReport}>
                查看报告
              </Button>
              <Button icon={<DownloadOutlined />} onClick={handleDownload}>
                下载报告
              </Button>
            </Space>
          </div>
          
          <Paragraph type="secondary">
            基于您的 {expenses.length} 条费用记录，生成详细的支出分析和优化建议
          </Paragraph>
        </Space>
      </Card>

      {/* 报告查看模态框 */}
      <Modal
        title={`📊 ${plan.destination} - 支出分析报告`}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="download" icon={<DownloadOutlined />} onClick={handleDownload}>
            下载报告
          </Button>,
          <Button key="close" type="primary" onClick={() => setIsModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={700}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {/* 总览 */}
          <div>
            <Title level={5}>📊 支出总览</Title>
            <Paragraph>{report.overview}</Paragraph>
          </div>

          <Divider />

          {/* 分类支出 */}
          <div>
            <Title level={5}>💰 分类支出</Title>
            <Space direction="vertical" size="small">
              {report.categoryAnalysis.map((text, idx) => (
                <Text key={idx}>• {text}</Text>
              ))}
            </Space>
          </div>

          <Divider />

          {/* 支出趋势 */}
          {report.trends.length > 0 && (
            <>
              <div>
                <Title level={5}>📈 支出趋势</Title>
                <Space direction="vertical" size="small">
                  {report.trends.map((text, idx) => (
                    <Text key={idx}>• {text}</Text>
                  ))}
                </Space>
              </div>
              <Divider />
            </>
          )}

          {/* 优化建议 */}
          <div>
            <Title level={5}>💡 优化建议</Title>
            <Space direction="vertical" size="small">
              {report.recommendations.map((text, idx) => (
                <div key={idx}>
                  <Tag color="blue">{idx + 1}</Tag>
                  <Text>{text}</Text>
                </div>
              ))}
            </Space>
          </div>

          {/* 生成时间 */}
          <Divider />
          <Text type="secondary" style={{ fontSize: 12 }}>
            报告生成时间：{dayjs().format('YYYY年MM月DD日 HH:mm')}
          </Text>
        </Space>
      </Modal>
    </>
  );
}
