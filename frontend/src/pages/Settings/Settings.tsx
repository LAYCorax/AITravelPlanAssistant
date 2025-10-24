import React, { useState } from 'react';
import { Tabs } from 'antd';
import { UserOutlined, ApiOutlined, SettingOutlined } from '@ant-design/icons';
import APIConfig from './APIConfig.tsx';
import UserProfile from './UserProfile.tsx';
import Preferences from './Preferences.tsx';
import './Settings.css';

const { TabPane } = Tabs;

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('api');

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>设置</h1>
        <p>管理您的账户设置、API配置和个人偏好</p>
      </div>

      <div className="settings-content">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className="settings-tabs"
        >
          <TabPane
            tab={
              <span>
                <ApiOutlined />
                API配置
              </span>
            }
            key="api"
          >
            <APIConfig />
          </TabPane>

          <TabPane
            tab={
              <span>
                <UserOutlined />
                个人资料
              </span>
            }
            key="profile"
          >
            <UserProfile />
          </TabPane>

          <TabPane
            tab={
              <span>
                <SettingOutlined />
                偏好设置
              </span>
            }
            key="preferences"
          >
            <Preferences />
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
