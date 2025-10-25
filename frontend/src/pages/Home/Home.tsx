import { Card, Button, Typography, Row, Col } from 'antd';
import { 
  CompassOutlined, 
  FileTextOutlined, 
  SettingOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const { Title, Paragraph } = Typography;

export function Home() {
  const navigate = useNavigate();

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
            支持语音输入和智能地图展示！
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
        <Title level={3} style={{ marginBottom: 24, textAlign: 'center' }}>
          已实现的功能
        </Title>
        
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} lg={8}>
            <Card 
              className="feature-card clickable"
              hoverable
              onClick={() => navigate('/plans')}
            >
              <UnorderedListOutlined className="feature-icon" />
              <Title level={4}>我的计划</Title>
              <Paragraph>
                查看和管理所有旅行计划，支持筛选和搜索
              </Paragraph>
              <Button type="link" icon={<FileTextOutlined />}>
                查看计划 →
              </Button>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Card 
              className="feature-card clickable"
              hoverable
              onClick={() => navigate('/planner')}
            >
              <CompassOutlined className="feature-icon" />
              <Title level={4}>智能规划</Title>
              <Paragraph>
                AI生成行程、语音输入、地图展示、费用管理
              </Paragraph>
              <Button type="link" icon={<CompassOutlined />}>
                开始规划 →
              </Button>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Card 
              className="feature-card clickable"
              hoverable
              onClick={() => navigate('/settings')}
            >
              <SettingOutlined className="feature-icon" />
              <Title level={4}>系统设置</Title>
              <Paragraph>
                配置API密钥、用户偏好、个人资料等
              </Paragraph>
              <Button type="link" icon={<SettingOutlined />}>
                前往设置 →
              </Button>
            </Card>
          </Col>
        </Row>
      </div>

      <Card className="info-card" style={{ marginTop: 24 }}>
        <Title level={4}>✨ 核心特性</Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <div className="feature-item">
              <span className="feature-bullet">🎤</span>
              <div>
                <strong>语音输入</strong>
                <Paragraph type="secondary">
                  讯飞语音识别，说出想法自动生成行程
                </Paragraph>
              </div>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div className="feature-item">
              <span className="feature-bullet">🗺️</span>
              <div>
                <strong>智能地图</strong>
                <Paragraph type="secondary">
                  高德地图集成，可视化展示景点和路线
                </Paragraph>
              </div>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div className="feature-item">
              <span className="feature-bullet">💰</span>
              <div>
                <strong>费用管理</strong>
                <Paragraph type="secondary">
                  智能预算分配、实时追踪、图表分析
                </Paragraph>
              </div>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div className="feature-item">
              <span className="feature-bullet">✏️</span>
              <div>
                <strong>行程编辑</strong>
                <Paragraph type="secondary">
                  可视化编辑器，支持拖拽调整行程顺序
                </Paragraph>
              </div>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
}
