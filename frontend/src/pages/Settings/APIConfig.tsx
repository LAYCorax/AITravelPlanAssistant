import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Collapse, Alert, Skeleton } from 'antd';
import { 
  CheckCircleOutlined, 
  ExclamationCircleOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  SaveOutlined,
  DeleteOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import {
  saveApiConfig,
  getAllApiConfigStatus,
  deleteApiConfig,
  validateApiKey,
} from '../../services/api/apiConfig';
import type { ApiConfigInput, ServiceType, ApiConfigStatus } from '../../types/api';

const { Panel } = Collapse;
const { Password } = Input;

interface ServiceConfig {
  type: ServiceType;
  title: string;
  description: string;
  fields: {
    name: string;
    label: string;
    placeholder: string;
    required: boolean;
    type?: 'text' | 'password';
  }[];
  helpText: string;
  helpLink: string;
}

const serviceConfigs: ServiceConfig[] = [
  {
    type: 'llm',
    title: '大语言模型服务',
    description: '用于生成智能旅行计划的AI服务（阿里云通义千问）',
    fields: [
      {
        name: 'api_key',
        label: 'API Key',
        placeholder: '请输入LLM服务的API密钥',
        required: true,
        type: 'password',
      },
    ],
    helpText: '使用阿里云通义千问服务。请前往阿里云百炼平台获取API密钥。',
    helpLink: 'https://help.aliyun.com/zh/dashscope/developer-reference/api-key-setup',
  },
  {
    type: 'voice',
    title: '语音识别服务',
    description: '用于将语音转换为文字的服务（科大讯飞）',
    fields: [
      {
        name: 'app_id',
        label: 'App ID',
        placeholder: '请输入应用ID',
        required: true,
        type: 'text',
      },
      {
        name: 'api_key',
        label: 'API Key',
        placeholder: '请输入API密钥',
        required: true,
        type: 'password',
      },
      {
        name: 'api_secret',
        label: 'API Secret',
        placeholder: '请输入API Secret',
        required: true,
        type: 'password',
      },
    ],
    helpText: '使用科大讯飞语音识别服务。请前往科大讯飞开放平台注册并创建应用。',
    helpLink: 'https://www.xfyun.cn/doc/',
  },
  {
    type: 'map',
    title: '地图服务',
    description: '用于显示地图和地理位置信息（高德地图）',
    fields: [
      {
        name: 'api_key',
        label: 'API Key',
        placeholder: '请输入地图服务的API密钥（Web端 Key）',
        required: true,
        type: 'password',
      },
      {
        name: 'security_code',
        label: '安全密钥（Security Code）',
        placeholder: '请输入安全密钥（jscode）',
        required: true,
        type: 'password',
      },
    ],
    helpText: '使用高德地图 JavaScript API 2.0。需要配置 Key 和安全密钥（jscode），两者都可以在高德开放平台控制台获取。',
    helpLink: 'https://lbs.amap.com/api/javascript-api-v2/guide/abc/jscode',
  },
];

const APIConfig: React.FC = () => {
  const [loading, setLoading] = useState<Record<ServiceType, boolean>>({
    llm: false,
    voice: false,
    map: false,
  });
  const [configStatus, setConfigStatus] = useState<ApiConfigStatus[]>([]);
  const [activeKeys, setActiveKeys] = useState<string[]>([]);
  const [initialLoading, setInitialLoading] = useState(true); // 初始加载状态
  
  // 为每个服务创建Form实例
  const [llmForm] = Form.useForm();
  const [voiceForm] = Form.useForm();
  const [mapForm] = Form.useForm();

  const getFormInstance = (serviceType: ServiceType) => {
    switch (serviceType) {
      case 'llm':
        return llmForm;
      case 'voice':
        return voiceForm;
      case 'map':
        return mapForm;
      default:
        return llmForm;
    }
  };

  useEffect(() => {
    loadConfigStatus();
  }, []);

  const loadConfigStatus = async () => {
    try {
      setInitialLoading(true);
      const status = await getAllApiConfigStatus();
      setConfigStatus(status);
      
      // 默认展开未配置的项
      const unconfigured = status
        .filter(s => !s.is_configured)
        .map(s => s.service_type);
      setActiveKeys(unconfigured);
    } catch (error: any) {
      message.error(error.message || '加载配置状态失败');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSave = async (serviceType: ServiceType, values: any, formInstance: any) => {
    setLoading(prev => ({ ...prev, [serviceType]: true }));
    try {
      // 验证API密钥
      const validation = validateApiKey(serviceType, values.api_key);
      if (!validation.valid) {
        message.error(validation.message);
        setLoading(prev => ({ ...prev, [serviceType]: false }));
        return;
      }

      // 根据服务类型设置默认服务名称
      const serviceNames: Record<ServiceType, string> = {
        llm: '阿里云通义千问',
        voice: '科大讯飞',
        map: '高德地图',
      };

      // 准备配置数据
      const configInput: ApiConfigInput = {
        service_type: serviceType,
        service_name: serviceNames[serviceType],
        api_key: values.api_key,
        api_secret: values.api_secret,
        additional_config: {},
      };

      // 如果有 app_id，添加到 additional_config
      if (values.app_id) {
        configInput.additional_config = {
          app_id: values.app_id,
        };
      }

      // 如果是地图服务，需要保存安全密钥到 additional_config
      if (serviceType === 'map' && values.security_code) {
        configInput.additional_config = {
          ...configInput.additional_config,
          security_code: values.security_code,
        };
      }

      await saveApiConfig(configInput);
      message.success('API配置保存成功');
      
      // 重新加载状态
      await loadConfigStatus();
      
      // 清空该服务的表单
      formInstance.resetFields();
    } catch (error: any) {
      message.error(error.message || '保存失败');
    } finally {
      setLoading(prev => ({ ...prev, [serviceType]: false }));
    }
  };

  const handleDelete = async (serviceType: ServiceType) => {
    setLoading(prev => ({ ...prev, [serviceType]: true }));
    try {
      await deleteApiConfig(serviceType);
      message.success('API配置已删除');
      await loadConfigStatus();
    } catch (error: any) {
      message.error(error.message || '删除失败');
    } finally {
      setLoading(prev => ({ ...prev, [serviceType]: false }));
    }
  };

  const getServiceStatus = (serviceType: ServiceType) => {
    return configStatus.find(s => s.service_type === serviceType);
  };

  const renderConfigPanel = (config: ServiceConfig) => {
    const status = getServiceStatus(config.type);
    const isConfigured = status?.is_configured || false;
    // 获取对应服务的Form实例
    const panelForm = getFormInstance(config.type);

    return (
      <Panel
        key={config.type}
        header={
          <div className="api-config-header">
            <div className="api-config-title">
              <h3>{config.title}</h3>
              {initialLoading ? (
                <span className="api-config-status loading">
                  <LoadingOutlined spin /> 加载中...
                </span>
              ) : (
                <span className={`api-config-status ${isConfigured ? 'configured' : 'not-configured'}`}>
                  {isConfigured ? (
                    <>
                      <CheckCircleOutlined /> 已配置
                    </>
                  ) : (
                    <>
                      <ExclamationCircleOutlined /> 未配置
                    </>
                  )}
                </span>
              )}
            </div>
          </div>
        }
      >
        <div className="api-config-item">
          <p className="api-config-description">{config.description}</p>

          <Form
            form={panelForm}
            layout="vertical"
            onFinish={(values) => handleSave(config.type, values, panelForm)}
            className="api-config-form"
          >
            {config.fields.map(field => (
              <Form.Item
                key={field.name}
                name={field.name}
                label={field.label}
                rules={[
                  { required: field.required, message: `请输入${field.label}` }
                ]}
              >
                {field.type === 'password' ? (
                  <Password
                    placeholder={field.placeholder}
                    iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
                    autoComplete="off"
                  />
                ) : (
                  <Input placeholder={field.placeholder} />
                )}
              </Form.Item>
            ))}

            <div className="api-config-actions">
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={loading[config.type]}
              >
                保存配置
              </Button>
              
              {isConfigured && (
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(config.type)}
                  loading={loading[config.type]}
                >
                  删除配置
                </Button>
              )}
            </div>
          </Form>

          <div className="api-config-help">
            <p>
              <strong>📖 使用说明：</strong>
            </p>
            <p>{config.helpText}</p>
            <p>
              <a href={config.helpLink} target="_blank" rel="noopener noreferrer">
                查看官方文档 →
              </a>
            </p>
          </div>
        </div>
      </Panel>
    );
  };

  return (
    <div className="api-config-section">
      <Alert
        message="API密钥安全提示"
        description="您的API密钥将被加密存储在云端数据库中。请不要与他人分享您的密钥。如发现密钥泄露，请立即更换。"
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      {initialLoading ? (
        <div style={{ padding: '20px' }}>
          <Skeleton active paragraph={{ rows: 4 }} style={{ marginBottom: 24 }} />
          <Skeleton active paragraph={{ rows: 4 }} style={{ marginBottom: 24 }} />
          <Skeleton active paragraph={{ rows: 4 }} />
        </div>
      ) : (
        <Collapse
          activeKey={activeKeys}
          onChange={(keys) => setActiveKeys(keys as string[])}
        >
          {serviceConfigs.map(config => renderConfigPanel(config))}
        </Collapse>
      )}
    </div>
  );
};

export default APIConfig;
