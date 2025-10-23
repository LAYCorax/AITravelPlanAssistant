import React from 'react';
import { Card, Button, Typography } from 'antd';
import { CompassOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/auth/AuthContext';
import './Home.css';

const { Title, Paragraph } = Typography;

export function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="home-page">
      <div className="welcome-section">
        <Title level={2}>欢迎回来！👋</Title>
        <Paragraph>开始规划您的下一次精彩旅程</Paragraph>
      </div>

      <Card className="quick-action-card">
        <div className="quick-action-content">
          <CompassOutlined className="quick-action-icon" />
          <Title level={3}>创建新的旅行计划</Title>
          <Paragraph>
            使用AI助手快速生成个性化的旅行行程，
            让每一次出行都充满期待！
          </Paragraph>
          <Button
            type="primary"
            size="large"
            icon={<CompassOutlined />}
            onClick={() => navigate('/planner')}
          >
            开始规划
          </Button>
        </div>
      </Card>

      <div className="features-section">
        <Card className="feature-card">
          <Title level={4}>🎤 语音输入</Title>
          <Paragraph>
            说出你的想法，AI为你生成完整行程
          </Paragraph>
        </Card>

        <Card className="feature-card">
          <Title level={4}>🗺️ 智能地图</Title>
          <Paragraph>
            可视化展示景点位置和最优路线
          </Paragraph>
        </Card>

        <Card className="feature-card">
          <Title level={4}>💰 费用管理</Title>
          <Paragraph>
            智能预算分配，实时追踪支出
          </Paragraph>
        </Card>
      </div>
    </div>
  );
}
