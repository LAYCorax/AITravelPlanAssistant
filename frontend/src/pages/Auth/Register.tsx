import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Alert, Divider } from 'antd';
import { MailOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import { useAuth } from '../../store/auth/AuthContext';
import type { RegisterCredentials } from '../../types';
import './Register.css';

export function Register() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { register, error, isLoading, clearError } = useAuth();
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (values: RegisterCredentials) => {
    try {
      setLocalError(null);
      clearError();
      await register(values);
      
      // 如果注册成功且不需要邮箱确认，导航到首页
      // 否则错误会被捕获并显示
      navigate('/');
    } catch (err: any) {
      const errorMessage = err.message || '注册失败，请重试';
      
      // 如果是邮箱确认提示，使用成功样式显示
      if (errorMessage.includes('请检查您的邮箱')) {
        setLocalError(null);
        // 显示成功消息并停留在注册页面
        form.setFields([
          {
            name: 'email',
            errors: [],
            warnings: [errorMessage],
          },
        ]);
        return;
      }
      
      setLocalError(errorMessage);
    }
  };

  const displayError = error || localError;

  return (
    <div className="register-page">
      <h2 className="register-title">注册账号</h2>
      <p className="register-subtitle">创建您的旅行规划账号</p>

      {displayError && (
        <Alert
          message={displayError}
          type="error"
          closable
          onClose={() => {
            setLocalError(null);
            clearError();
          }}
          style={{ marginBottom: 16 }}
        />
      )}

      <Form
        form={form}
        name="register"
        onFinish={handleSubmit}
        autoComplete="off"
        layout="vertical"
        size="large"
      >
        <Form.Item
          name="username"
          rules={[
            { required: true, message: '请输入用户名' },
            { min: 2, message: '用户名至少2个字符' },
            { max: 20, message: '用户名最多20个字符' },
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="用户名"
            autoComplete="username"
          />
        </Form.Item>

        <Form.Item
          name="email"
          rules={[
            { required: true, message: '请输入邮箱' },
            { type: 'email', message: '请输入有效的邮箱地址' },
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="邮箱地址"
            autoComplete="email"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            { required: true, message: '请输入密码' },
            { min: 6, message: '密码至少6个字符' },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="密码"
            autoComplete="new-password"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          dependencies={['password']}
          rules={[
            { required: true, message: '请确认密码' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('两次输入的密码不一致'));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="确认密码"
            autoComplete="new-password"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={isLoading}
            size="large"
          >
            注册
          </Button>
        </Form.Item>
      </Form>

      <Divider plain>已有账号？</Divider>

      <div style={{ textAlign: 'center' }}>
        <Link to="/auth/login">
          <Button type="link" size="large">
            立即登录
          </Button>
        </Link>
      </div>
    </div>
  );
}
