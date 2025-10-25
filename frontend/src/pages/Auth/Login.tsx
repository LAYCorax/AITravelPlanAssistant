import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Alert, Divider } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../../store/auth/AuthContext';
import type { LoginCredentials } from '../../types';
import './Login.css';

export function Login() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { login, error, isLoading, clearError } = useAuth();
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (values: LoginCredentials) => {
    try {
      setLocalError(null);
      clearError();
      await login(values);
      navigate('/');
    } catch (err: any) {
      setLocalError(err.message || '登录失败，请重试');
    }
  };

  const displayError = error || localError;

  return (
    <div className="login-page">
      <h2 className="login-title">登录</h2>
      <p className="login-subtitle">欢迎回来！请登录您的账号</p>

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
        name="login"
        onFinish={handleSubmit}
        autoComplete="off"
        layout="vertical"
        size="large"
      >
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
            autoComplete="current-password"
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
            登录
          </Button>
        </Form.Item>
      </Form>

      <Divider plain>还没有账号？</Divider>

      <div style={{ textAlign: 'center' }}>
        <Link to="/auth/register">
          <Button type="link" size="large">
            立即注册
          </Button>
        </Link>
      </div>
    </div>
  );
}
