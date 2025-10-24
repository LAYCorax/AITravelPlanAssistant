import { useState } from 'react';
import { Form, Input, DatePicker, InputNumber, Button, Card, Space, message, Tabs, Modal } from 'antd';
import { AudioOutlined, FormOutlined, CompassOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { useNavigate } from 'react-router-dom';
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

  const handleManualSubmit = async (values: PlanFormValues) => {
    try {
      setLoading(true);
      
      // 检查LLM配置
      const llmConfig = await checkLLMConfig();
      if (!llmConfig.configured) {
        // 强制要求配置API Key
        Modal.error({
          title: '无法使用服务',
          content: (
            <div>
              <p>{llmConfig.message}</p>
              <p style={{ marginTop: '10px', color: '#666' }}>
                配置完成后，您才能使用AI生成旅行计划功能。
              </p>
            </div>
          ),
          okText: '前往设置',
          onOk: () => {
            navigate('/settings?tab=api');
          },
        });
        return;
      }

      // 使用AI生成旅行计划
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
    }
  };



  const handleTranscriptComplete = async (text: string) => {
    // 显示识别结果并让用户确认
    Modal.confirm({
      title: '语音识别完成',
      content: (
        <div>
          <p><strong>您的需求：</strong></p>
          <p style={{ padding: '10px', background: '#f5f5f5', borderRadius: '4px', marginTop: '10px' }}>
            {text}
          </p>
          <p style={{ marginTop: '15px', color: '#666' }}>
            确认后，AI将根据您的口述需求生成旅行计划。
          </p>
        </div>
      ),
      okText: '确认并生成计划',
      cancelText: '重新录制',
      width: 500,
      onOk: async () => {
        try {
          setLoading(true);
          
          // 检查LLM配置
          const llmConfig = await checkLLMConfig();
          if (!llmConfig.configured) {
            message.error(llmConfig.message);
            Modal.info({
              title: '无法使用服务',
              content: llmConfig.message,
              okText: '前往设置',
              onOk: () => {
                navigate('/settings?tab=api');
              },
            });
            return;
          }

          message.loading({ content: '正在为您生成旅行计划...', key: 'generating', duration: 0 });

          // 直接使用语音输入生成旅行计划
          const { generateTripPlanFromVoice } = await import('../../services/ai/llm');
          const result = await generateTripPlanFromVoice(text);

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
          message.error(error.message || '生成计划失败');
          console.error('语音生成计划失败:', error);
        } finally {
          setLoading(false);
        }
      },
      onCancel: () => {
        message.info('已取消，您可以重新录制');
      },
    });
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
