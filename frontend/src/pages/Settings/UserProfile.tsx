import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Avatar, Upload } from 'antd';
import { UserOutlined, MailOutlined, SaveOutlined, UploadOutlined } from '@ant-design/icons';
import { useAuth } from '../../store/auth/AuthContext';

const UserProfile: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const [avatarUrl] = useState<string>('');

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        email: user.email,
        username: user.user_metadata?.username || '',
      });
    }
  }, [user, form]);

  const handleSubmit = async (_values: any) => {
    setLoading(true);
    try {
      // TODO: 实现用户资料更新API
      message.success('个人资料更新成功');
    } catch (error: any) {
      message.error(error.message || '更新失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (info: any) => {
    // TODO: 实现头像上传
    if (info.file.status === 'done') {
      message.success('头像上传成功');
    }
  };

  return (
    <div className="user-profile-section">
      <div className="profile-avatar">
        <div className="avatar-upload">
          <Avatar size={100} icon={<UserOutlined />} src={avatarUrl} />
          <Upload
            showUploadList={false}
            beforeUpload={() => false}
            onChange={handleAvatarChange}
          >
            <Button icon={<UploadOutlined />} style={{ marginTop: 12 }}>
              更换头像
            </Button>
          </Upload>
        </div>
        
        <div>
          <h3 style={{ marginBottom: 8 }}>{user?.user_metadata?.username || '用户'}</h3>
          <p style={{ color: '#8c8c8c', margin: 0 }}>{user?.email}</p>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="profile-form"
      >
        <Form.Item
          name="username"
          label="用户名"
          rules={[{ required: true, message: '请输入用户名' }]}
        >
          <Input prefix={<UserOutlined />} placeholder="请输入用户名" />
        </Form.Item>

        <Form.Item
          name="email"
          label="邮箱"
        >
          <Input prefix={<MailOutlined />} disabled />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            icon={<SaveOutlined />}
            loading={loading}
          >
            保存更改
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default UserProfile;
