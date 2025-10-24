import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Select, Switch, InputNumber } from 'antd';
import { SaveOutlined } from '@ant-design/icons';

const { Option } = Select;

const Preferences: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // TODO: 从数据库加载用户偏好
    form.setFieldsValue({
      default_departure: '',
      budget_range_min: 1000,
      budget_range_max: 10000,
      language: 'zh-CN',
      enable_notifications: true,
    });
  }, [form]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      // TODO: 保存用户偏好到数据库
      console.log('保存偏好设置:', values);
      message.success('偏好设置已保存');
    } catch (error: any) {
      message.error(error.message || '保存失败');
    } finally {
      setLoading(false);
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
            <Input placeholder="例如：北京" />
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
            >
              <Option value="美食">美食</Option>
              <Option value="历史文化">历史文化</Option>
              <Option value="自然风光">自然风光</Option>
              <Option value="购物">购物</Option>
              <Option value="摄影">摄影</Option>
              <Option value="亲子">亲子</Option>
              <Option value="冒险">冒险</Option>
            </Select>
          </Form.Item>

          <Form.Item label="预算范围">
            <Input.Group compact>
              <Form.Item
                name="budget_range_min"
                noStyle
              >
                <InputNumber
                  style={{ width: '45%' }}
                  placeholder="最低预算"
                  min={0}
                  formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>
              <span style={{ display: 'inline-block', width: '10%', textAlign: 'center' }}>-</span>
              <Form.Item
                name="budget_range_max"
                noStyle
              >
                <InputNumber
                  style={{ width: '45%' }}
                  placeholder="最高预算"
                  min={0}
                  formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
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
            <Select>
              <Option value="zh-CN">简体中文</Option>
              <Option value="en-US">English</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="enable_notifications"
            label="通知"
            valuePropName="checked"
          >
            <Switch checkedChildren="开启" unCheckedChildren="关闭" />
          </Form.Item>
        </div>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            icon={<SaveOutlined />}
            loading={loading}
          >
            保存设置
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Preferences;
