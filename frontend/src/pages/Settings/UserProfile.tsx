import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Avatar, Upload, Spin } from 'antd';
import { UserOutlined, MailOutlined, SaveOutlined, UploadOutlined, LoadingOutlined } from '@ant-design/icons';
import { useAuth } from '../../store/auth/AuthContext';
import { getUserProfile, saveUserProfile, uploadAvatar } from '../../services/api/userProfile';
import type { UploadChangeParam } from 'antd/es/upload';
import type { RcFile } from 'antd/es/upload/interface';

const UserProfile: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const { user, refreshUser } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  // 加载用户资料
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      
      setLoadingData(true);
      try {
        const profile = await getUserProfile();
        
        // 设置表单值
        form.setFieldsValue({
          email: user.email,
          username: user.user_metadata?.username || profile?.username || '',
          phone: profile?.phone || '',
          bio: profile?.bio || '',
        });

        // 设置头像
        if (profile?.avatar_url) {
          setAvatarUrl(profile.avatar_url);
        }
      } catch (error: any) {
        console.error('加载用户资料失败:', error);
        // 即使加载失败，也显示基本信息
        form.setFieldsValue({
          email: user.email,
          username: user.user_metadata?.username || '',
        });
      } finally {
        setLoadingData(false);
      }
    };

    loadProfile();
  }, [user, form]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      // 保存用户资料
      await saveUserProfile({
        username: values.username,
        phone: values.phone,
        bio: values.bio,
        avatar_url: avatarUrl,
      });

      // 刷新用户信息
      await refreshUser();
      
      message.success('个人资料更新成功');
    } catch (error: any) {
      message.error(error.message || '更新失败');
    } finally {
      setLoading(false);
    }
  };

  const beforeUpload = (file: RcFile) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件！');
      return false;
    }
    
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('图片大小不能超过 2MB！');
      return false;
    }
    
    return true;
  };

  const handleAvatarChange = async (info: UploadChangeParam) => {
    if (info.file.status === 'uploading') {
      setUploadingAvatar(true);
      return;
    }
    
    if (info.file.status === 'error') {
      setUploadingAvatar(false);
      message.error('上传失败');
      return;
    }

    // 手动上传
    if (info.file.originFileObj) {
      setUploadingAvatar(true);
      try {
        const url = await uploadAvatar(info.file.originFileObj as File);
        setAvatarUrl(url);
        message.success('头像上传成功');
      } catch (error: any) {
        message.error(error.message || '上传失败');
      } finally {
        setUploadingAvatar(false);
      }
    }
  };

  return (
    <div className="user-profile-section">
      <Spin spinning={loadingData}>
        <div className="profile-avatar">
          <div className="avatar-upload">
            <Spin spinning={uploadingAvatar} indicator={<LoadingOutlined />}>
              <Avatar size={100} icon={<UserOutlined />} src={avatarUrl} />
            </Spin>
            <Upload
              showUploadList={false}
              beforeUpload={beforeUpload}
              customRequest={({ onSuccess }) => {
                // 自定义上传，阻止默认行为
                setTimeout(() => {
                  onSuccess?.('ok');
                }, 0);
              }}
              onChange={handleAvatarChange}
              disabled={uploadingAvatar || loadingData}
            >
              <Button 
                icon={<UploadOutlined />} 
                style={{ marginTop: 12 }}
                loading={uploadingAvatar}
                disabled={loadingData}
              >
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
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 2, max: 20, message: '用户名长度为2-20个字符' },
              { pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/, message: '用户名只能包含字母、数字、下划线和中文' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="请输入用户名"
              disabled={loadingData}
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
          >
            <Input prefix={<MailOutlined />} disabled />
          </Form.Item>

          <Form.Item
            name="phone"
            label="手机号"
            rules={[
              { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' }
            ]}
          >
            <Input 
              placeholder="请输入手机号（可选）"
              disabled={loadingData}
            />
          </Form.Item>

          <Form.Item
            name="bio"
            label="个人简介"
            rules={[
              { max: 200, message: '个人简介不能超过200个字符' }
            ]}
          >
            <Input.TextArea 
              rows={4}
              placeholder="介绍一下自己吧（可选）"
              disabled={loadingData}
              showCount
              maxLength={200}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={loading}
              disabled={loadingData}
            >
              保存更改
            </Button>
          </Form.Item>
        </Form>
      </Spin>
    </div>
  );
};

export default UserProfile;
