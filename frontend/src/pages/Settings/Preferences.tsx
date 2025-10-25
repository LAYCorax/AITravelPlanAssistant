import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Select, Switch, InputNumber, Popconfirm } from 'antd';
import { SaveOutlined, ReloadOutlined } from '@ant-design/icons';
import { getUserPreferences, saveUserPreferences, resetUserPreferences } from '../../services/api/preferences';

const { Option } = Select;

// 默认预算范围
const DEFAULT_BUDGET_MIN = 1000;
const DEFAULT_BUDGET_MAX = 10000;

const Preferences: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [resetting, setResetting] = useState(false);

  // 加载用户偏好
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    setLoadingData(true);
    try {
      const preferences = await getUserPreferences();
      
      if (preferences) {
        form.setFieldsValue({
          default_departure: preferences.default_departure || '',
          favorite_categories: preferences.favorite_categories || [],
          budget_range_min: preferences.budget_range_min || DEFAULT_BUDGET_MIN,
          budget_range_max: preferences.budget_range_max || DEFAULT_BUDGET_MAX,
          language: preferences.language || 'zh-CN',
          theme: preferences.theme || 'light',
          enable_notifications: preferences.enable_notifications !== false,
        });
      } else {
        // 没有保存的偏好，使用默认值
        form.setFieldsValue({
          default_departure: '',
          favorite_categories: [],
          budget_range_min: DEFAULT_BUDGET_MIN,
          budget_range_max: DEFAULT_BUDGET_MAX,
          language: 'zh-CN',
          theme: 'light',
          enable_notifications: true,
        });
      }
    } catch (error: any) {
      console.error('加载偏好失败:', error);
      message.error(error.message || '加载偏好设置失败');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      await saveUserPreferences(values);
      message.success('偏好设置已保存');
    } catch (error: any) {
      message.error(error.message || '保存失败');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setResetting(true);
    try {
      await resetUserPreferences();
      message.success('偏好设置已重置');
      // 重新加载默认值
      await loadPreferences();
    } catch (error: any) {
      message.error(error.message || '重置失败');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="preferences-section">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <div className="preference-group">
          <h3>旅行偏好</h3>
          
          <Form.Item
            name="default_departure"
            label="默认出发地"
            help="设置您常用的出发地点，可以加快行程规划"
          >
            <Input placeholder="例如：北京" disabled={loadingData} />
          </Form.Item>

          <Form.Item
            name="favorite_categories"
            label="兴趣标签"
            help="选择您感兴趣的旅行类型，帮助AI更好地为您规划"
          >
            <Select
              mode="tags"
              placeholder="选择或输入标签"
              style={{ width: '100%' }}
              disabled={loadingData}
            >
              <Option value="美食">美食</Option>
              <Option value="历史文化">历史文化</Option>
              <Option value="自然风光">自然风光</Option>
              <Option value="购物">购物</Option>
              <Option value="摄影">摄影</Option>
              <Option value="亲子">亲子</Option>
              <Option value="冒险">冒险</Option>
              <Option value="休闲度假">休闲度假</Option>
              <Option value="徒步登山">徒步登山</Option>
            </Select>
          </Form.Item>

          <Form.Item label="预算范围">
            <Input.Group compact>
              <Form.Item
                name="budget_range_min"
                noStyle
                rules={[
                  { required: true, message: '请输入最低预算' },
                  { type: 'number', min: 0, message: '预算不能为负数' }
                ]}
              >
                <InputNumber
                  style={{ width: '45%' }}
                  placeholder="最低预算"
                  min={0}
                  disabled={loadingData}
                  formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/¥\s?|(,*)/g, '') as any}
                />
              </Form.Item>
              <span style={{ display: 'inline-block', width: '10%', textAlign: 'center' }}>-</span>
              <Form.Item
                name="budget_range_max"
                noStyle
                rules={[
                  { required: true, message: '请输入最高预算' },
                  { type: 'number', min: 0, message: '预算不能为负数' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const min = getFieldValue('budget_range_min');
                      if (!value || !min || value >= min) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('最高预算必须大于等于最低预算'));
                    },
                  }),
                ]}
              >
                <InputNumber
                  style={{ width: '45%' }}
                  placeholder="最高预算"
                  min={0}
                  disabled={loadingData}
                  formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/¥\s?|(,*)/g, '') as any}
                />
              </Form.Item>
            </Input.Group>
          </Form.Item>
        </div>

        <div className="preference-group">
          <h3>系统设置</h3>
          
          <Form.Item
            name="language"
            label="语言"
          >
            <Select disabled={loadingData}>
              <Option value="zh-CN">简体中文</Option>
              <Option value="en-US">English</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="theme"
            label="主题"
            help="切换应用的视觉主题"
          >
            <Select disabled={loadingData}>
              <Option value="light">浅色</Option>
              <Option value="dark">深色</Option>
              <Option value="auto">跟随系统</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="enable_notifications"
            label="通知"
            valuePropName="checked"
          >
            <Switch 
              checkedChildren="开启" 
              unCheckedChildren="关闭"
              disabled={loadingData}
            />
          </Form.Item>
        </div>

        <Form.Item>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={loading}
              disabled={loadingData}
            >
              保存设置
            </Button>
            <Popconfirm
              title="确定要重置所有偏好设置吗？"
              description="这将清除您所有的自定义设置，恢复为默认值。"
              onConfirm={handleReset}
              okText="确定"
              cancelText="取消"
            >
              <Button
                icon={<ReloadOutlined />}
                loading={resetting}
                disabled={loadingData}
              >
                重置为默认值
              </Button>
            </Popconfirm>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Preferences;
