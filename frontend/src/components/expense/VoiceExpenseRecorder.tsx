/**
 * VoiceExpenseRecorder Component - Week 7
 * 语音费用录入组件 - 模态框版本
 */

import { useState } from 'react';
import { Button, Modal, Space, Typography, Tag, Alert, Spin, message } from 'antd';
import { AudioOutlined, CheckOutlined } from '@ant-design/icons';
import { VoiceRecorder } from '../voice/VoiceRecorder';
import { parseVoiceExpense, type ParsedExpense } from '../../services/ai/voiceExpenseParser';
import { categoryOptions } from './ExpenseForm';
import './VoiceExpenseRecorder.css';

const { Text } = Typography;

interface VoiceExpenseRecorderProps {
  planId: string;
  onExpenseCreated: (expense: any) => void | Promise<void>;
}

export function VoiceExpenseRecorder({ planId, onExpenseCreated }: VoiceExpenseRecorderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [parsedExpense, setParsedExpense] = useState<ParsedExpense | null>(null);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useDefaultDate, setUseDefaultDate] = useState(false); // 是否使用默认日期

  // 打开模态框
  const handleOpenModal = () => {
    setIsModalOpen(true);
    setParsedExpense(null);
    setError(null);
    setUseDefaultDate(false);
  };

  // 关闭模态框
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setParsedExpense(null);
    setError(null);
    setUseDefaultDate(false);
  };

  // 处理录音完成
  const handleTranscriptComplete = async (text: string) => {
    if (!text || text.trim().length === 0) {
      setError('未识别到语音内容，请重试');
      return;
    }

    // 解析费用信息
    setParsing(true);
    setError(null);
    
    try {
      const result = await parseVoiceExpense(text);
      
      if (result.success && result.expense) {
        setParsedExpense(result.expense);
        
        // 检查是否没有提供日期
        if (!result.expense.date) {
          setUseDefaultDate(true);
          message.info('未识别到日期，将使用今天的日期');
        } else {
          setUseDefaultDate(false);
        }
        
        message.success('费用信息解析成功！请确认后提交');
      } else {
        setError(result.error || '解析失败，请重试或手动输入');
      }
    } catch (err: any) {
      setError(err.message || '解析过程中发生错误');
    } finally {
      setParsing(false);
    }
  };

  // 确认提交
  const handleConfirm = async () => {
    if (parsedExpense) {
      try {
        // 创建费用记录，使用snake_case字段名
        await onExpenseCreated({
          plan_id: planId,
          category: parsedExpense.category,
          amount: parsedExpense.amount,
          description: parsedExpense.description,
          expense_date: parsedExpense.date || new Date().toISOString().split('T')[0], // 如果没有日期，使用今天
        });
        
        // 关闭模态框并重置
        handleCloseModal();
        message.success('费用记录成功');
      } catch (err: any) {
        message.error(err.message || '保存费用失败');
      }
    }
  };

  // 重新录音
  const handleRetry = () => {
    setParsedExpense(null);
    setError(null);
    setUseDefaultDate(false);
  };

  const getCategoryInfo = (category: string) => {
    return categoryOptions.find(opt => opt.value === category) || 
           { label: category, color: '#8c8c8c' };
  };

  return (
    <>
      {/* 语音录入按钮 */}
      <Button
        type="primary"
        icon={<AudioOutlined />}
        onClick={handleOpenModal}
        style={{ width: '100%' }}
      >
        语音录入费用
      </Button>

      {/* 语音录入模态框 */}
      <Modal
        title="🎤 语音录入费用"
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        width={500}
        destroyOnClose
      >
        <div className="voice-expense-recorder">
          <Space direction="vertical" style={{ width: '100%' }} size="small">
            {/* 录音组件 */}
            {!parsedExpense && !parsing && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <VoiceRecorder
                  onTranscriptComplete={handleTranscriptComplete}
                  tips={[
                    '一条语音中请只包含一条同类型支出',
                    '如果语音中未说明具体时间，则系统采用记录当天的时间',
                    '清晰说出费用金额和用途（如：午餐85块、打车30元）'
                  ]}
                />
              </div>
            )}

            {/* 解析中 */}
            {parsing && (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Spin size="large" />
                <Text type="secondary" style={{ marginTop: 16, display: 'block' }}>
                  AI正在分析您的费用信息...
                </Text>
              </div>
            )}

            {/* 解析结果预览 */}
            {parsedExpense && (
              <>
                <Alert
                  message="✅ 识别成功"
                  type="success"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
                <Space direction="vertical" style={{ width: '100%', padding: '16px', background: '#f6ffed', borderRadius: 8, border: '1px solid #b7eb8f' }} size="middle">
                  <div>
                    <Tag color={getCategoryInfo(parsedExpense.category).color}>
                      {getCategoryInfo(parsedExpense.category).label}
                    </Tag>
                    <Text strong style={{ fontSize: 24, color: '#ff4d4f', marginLeft: 8 }}>
                      ¥{parsedExpense.amount.toFixed(2)}
                    </Text>
                  </div>
                  <div>
                    <Text type="secondary">描述：</Text>
                    <Text>{parsedExpense.description}</Text>
                  </div>
                  <div>
                    <Text type="secondary">日期：</Text>
                    <Text>{parsedExpense.date || new Date().toISOString().split('T')[0]}</Text>
                    {useDefaultDate && (
                      <Tag color="orange" style={{ marginLeft: 8 }}>默认今天</Tag>
                    )}
                  </div>
                </Space>
              </>
            )}

            {/* 错误提示 */}
            {error && (
              <Alert
                message={error}
                type="error"
                showIcon
                closable
                onClose={() => setError(null)}
              />
            )}

            {/* 操作按钮 */}
            {parsedExpense && (
              <Space style={{ width: '100%', justifyContent: 'flex-end', marginTop: 16 }}>
                <Button onClick={handleRetry}>
                  重新录音
                </Button>
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={handleConfirm}
                >
                  确认提交
                </Button>
              </Space>
            )}
          </Space>
        </div>
      </Modal>
    </>
  );
}
