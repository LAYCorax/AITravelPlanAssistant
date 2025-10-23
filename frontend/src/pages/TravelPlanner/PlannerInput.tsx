import React, { useState } from 'react';
import { Form, Input, DatePicker, InputNumber, Button, Card, Space, message, Tabs, Modal, Spin } from 'antd';
import { AudioOutlined, FormOutlined, CompassOutlined, LoadingOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { useNavigate } from 'react-router-dom';
import type { CreateTravelPlanInput } from '../../types';
import { VoiceRecorder } from '../../components/voice/VoiceRecorder';
import { generateTripPlan, checkLLMConfig } from '../../services/ai/llm';
import { saveTravelPlan } from '../../services/api/travelPlans';
import './PlannerInput.css';

const { RangePicker } = DatePicker;
const { TextArea } = Input;

interface PlanFormValues {
  destination: string;
  dateRange: [Dayjs, Dayjs];
  budget: number;
  travelerCount: number;
  description?: string;
}

export function PlannerInput() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'voice' | 'manual'>('manual');
  const [generatingPlan, setGeneratingPlan] = useState(false);

  const handleManualSubmit = async (values: PlanFormValues) => {
    try {
      setLoading(true);
      
      // 检查LLM配置
      const llmConfig = checkLLMConfig();
      if (!llmConfig.configured) {
        Modal.confirm({
          title: '未配置AI服务',
          content: llmConfig.message + '。是否跳过AI生成，直接创建计划？',
          okText: '直接创建',
          cancelText: '去设置',
          onOk: async () => {
            // 直接保存基础计划信息（不生成AI行程）
            await saveBasicPlan(values);
          },
          onCancel: () => {
            // TODO: 跳转到设置页面
            message.info('请前往设置页面配置API密钥');
          },
        });
        return;
      }

      // 使用AI生成旅行计划
      setGeneratingPlan(true);
      message.loading({ content: '正在为您生成旅行计划...', key: 'generating', duration: 0 });

      const result = await generateTripPlan({
        destination: values.destination,
        startDate: values.dateRange[0].format('YYYY-MM-DD'),
        endDate: values.dateRange[1].format('YYYY-MM-DD'),
        budget: values.budget,
        travelerCount: values.travelerCount,
        additionalRequirements: values.description,
      });

      message.destroy('generating');

      if (!result.success) {
        throw new Error(result.error || 'AI生成失败');
      }

      // 保存AI生成的完整计划
      const saveResult = await saveTravelPlan(result.plan!, result.itinerary!);

      if (!saveResult.success) {
        throw new Error(saveResult.error || '保存计划失败');
      }

      message.success('旅行计划生成成功！');
      
      // 跳转到计划详情页
      setTimeout(() => {
        navigate(`/plans/${saveResult.planId}`);
      }, 500);
      
    } catch (error: any) {
      message.error(error.message || '创建计划失败');
    } finally {
      setLoading(false);
      setGeneratingPlan(false);
    }
  };

  const saveBasicPlan = async (values: PlanFormValues) => {
    try {
      const planData = {
        title: `${values.destination}旅行计划`,
        destination: values.destination,
        startDate: values.dateRange[0].format('YYYY-MM-DD'),
        endDate: values.dateRange[1].format('YYYY-MM-DD'),
        days: values.dateRange[1].diff(values.dateRange[0], 'day') + 1,
        budget: values.budget,
        travelerCount: values.travelerCount,
        status: 'draft' as const,
        description: values.description || `${values.destination}旅行，${values.travelerCount}人，预算${values.budget}元`,
      };

      const result = await saveTravelPlan(planData, []);
      
      if (!result.success) {
        throw new Error(result.error || '保存失败');
      }

      message.success('基础计划创建成功！您可以稍后手动添加行程。');
      navigate('/plans');
    } catch (error: any) {
      message.error(error.message || '保存失败');
    }
  };

  const handleVoiceInput = () => {
    message.info('请点击麦克风按钮开始语音输入');
  };

  const handleTranscriptComplete = (text: string) => {
    message.success(`识别结果: ${text}`);
    // TODO: 解析语音文本并填充表单
    // 或直接使用语音文本创建计划
  };

  const handleVoiceError = (error: Error) => {
    console.error('Voice error:', error);
  };

  const disabledDate = (current: Dayjs) => {
    // 禁用今天之前的日期
    return current && current < dayjs().startOf('day');
  };

  const tabItems = [
    {
      key: 'manual',
      label: (
        <span>
          <FormOutlined /> 手动输入
        </span>
      ),
      children: (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleManualSubmit}
          initialValues={{
            travelerCount: 1,
            budget: 5000,
          }}
          size="large"
        >
          <Form.Item
            label="目的地"
            name="destination"
            rules={[
              { required: true, message: '请输入目的地' },
              { min: 2, message: '目的地至少2个字符' },
            ]}
          >
            <Input
              placeholder="例如：北京、上海、成都"
              prefix={<CompassOutlined />}
            />
          </Form.Item>

          <Form.Item
            label="出行日期"
            name="dateRange"
            rules={[{ required: true, message: '请选择出行日期' }]}
          >
            <RangePicker
              style={{ width: '100%' }}
              disabledDate={disabledDate}
              format="YYYY-MM-DD"
              placeholder={['开始日期', '结束日期']}
            />
          </Form.Item>

          <Form.Item
            label="预算（元）"
            name="budget"
            rules={[
              { required: true, message: '请输入预算' },
              { type: 'number', min: 100, message: '预算至少100元' },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="请输入预算"
              min={100}
              step={100}
              formatter={(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value!.replace(/¥\s?|(,*)/g, '') as any}
            />
          </Form.Item>

          <Form.Item
            label="人数"
            name="travelerCount"
            rules={[
              { required: true, message: '请输入人数' },
              { type: 'number', min: 1, message: '至少1人' },
              { type: 'number', max: 20, message: '最多20人' },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="请输入人数"
              min={1}
              max={20}
            />
          </Form.Item>

          <Form.Item
            label="补充说明（可选）"
            name="description"
          >
            <TextArea
              rows={4}
              placeholder="例如：喜欢历史文化、想吃当地美食、需要住宿推荐等"
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%' }} direction="vertical" size="middle">
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                loading={loading}
                icon={<CompassOutlined />}
              >
                生成旅行计划
              </Button>
              <Button
                block
                size="large"
                onClick={() => form.resetFields()}
              >
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'voice',
      label: (
        <span>
          <AudioOutlined /> 语音输入
        </span>
      ),
      children: (
        <div className="voice-input-container">
          <VoiceRecorder
            onTranscriptComplete={handleTranscriptComplete}
            onError={handleVoiceError}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="planner-input-page">
      <Card className="planner-card">
        <div className="planner-header">
          <h2>🌍 创建旅行计划</h2>
          <p>告诉我们你的旅行想法，AI 将为你生成完美的行程</p>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as 'voice' | 'manual')}
          items={tabItems}
          size="large"
        />
      </Card>
    </div>
  );
}
