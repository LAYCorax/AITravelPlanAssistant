import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown } from 'antd';
import {
  HomeOutlined,
  CompassOutlined,
  UnorderedListOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useAuth } from '../store/auth/AuthContext';
import { getUserProfile } from '../services/api/userProfile';
import './MainLayout.css';

const { Header, Content, Sider } = Layout;

export function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  // 加载用户头像
  useEffect(() => {
    const loadUserAvatar = async () => {
      try {
        const profile = await getUserProfile();
        if (profile?.avatar_url) {
          setAvatarUrl(profile.avatar_url);
        }
      } catch (error) {
        console.error('加载用户头像失败:', error);
      }
    };

    if (user) {
      loadUserAvatar();
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人信息',
      onClick: () => navigate('/settings'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  const sidebarMenuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <Link to="/">首页</Link>,
    },
    {
      key: '/planner',
      icon: <CompassOutlined />,
      label: <Link to="/planner">规划旅程</Link>,
    },
    {
      key: '/plans',
      icon: <UnorderedListOutlined />,
      label: <Link to="/plans">我的计划</Link>,
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: <Link to="/settings">设置</Link>,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header className="main-header">
        <div className="logo">
          <span>🌍 AI Travel Planner</span>
        </div>
        <div className="header-right">
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Avatar
              size="large"
              src={avatarUrl || undefined}
              icon={!avatarUrl ? <UserOutlined /> : undefined}
              style={{ cursor: 'pointer', backgroundColor: avatarUrl ? 'transparent' : '#1890ff' }}
            />
          </Dropdown>
        </div>
      </Header>
      <Layout>
        <Sider
          width={200}
          className="main-sider"
          breakpoint="lg"
          collapsedWidth="0"
        >
          <Menu
            mode="inline"
            defaultSelectedKeys={['/']}
            style={{ height: '100%', borderRight: 0 }}
            items={sidebarMenuItems}
          />
        </Sider>
        <Layout style={{ padding: '24px' }}>
          <Content className="main-content">
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}
