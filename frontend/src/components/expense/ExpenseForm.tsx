/**
 * ExpenseForm Component - Week 7
 * 费用录入表单组件
 */

import { Form, Input, InputNumber, Select, DatePicker, Button, Space, message } from 'antd';
import { DollarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { CreateExpenseInput } from '../../types';

const { TextArea } = Input;
const { Option } = Select;

interface ExpenseFormProps {
  planId: string;
  onSubmit: (expense: CreateExpenseInput) => Promise<void>;
  onCancel?: () => void;
  initialValues?: Partial<CreateExpenseInput>;
  loading?: boolean;
}

const categoryOptions = [
  { value: 'transport', label: '交通', color: '#1890ff' },
  { value: 'accommodation', label: '住宿', color: '#52c41a' },
  { value: 'food', label: '餐饮', color: '#faad14' },
  { value: 'attraction', label: '景点门票', color: '#f5222d' },
  { value: 'shopping', label: '购物', color: '#722ed1' },
  { value: 'other', label: '其他', color: '#8c8c8c' },
];

export function ExpenseForm({
  planId,
  onSubmit,
  onCancel,
  initialValues,
  loading = false,
}: ExpenseFormProps) {
  const [form] = Form.useForm();

  const handleSubmit = async (values: any) => {
    try {
      const expense: CreateExpenseInput = {
        plan_id: planId,
        category: values.category,
        amount: values.amount,
        description: values.description,
        expense_date: values.expense_date.format('YYYY-MM-DD'),
      };

      await onSubmit(expense);
      form.resetFields();
      message.success('费用记录添加成功');
    } catch (error: any) {
      message.error(error.message || '添加费用记录失败');
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        category: initialValues?.category || 'food',
        amount: initialValues?.amount,
        description: initialValues?.description,
        expense_date: initialValues?.expense_date 
          ? dayjs(initialValues.expense_date) 
          : dayjs(),
      }}
    >
      <Form.Item
        label="费用分类"
        name="category"
        rules={[{ required: true, message: '请选择费用分类' }]}
      >
        <Select placeholder="选择费用分类" size="large">
          {categoryOptions.map(option => (
            <Option key={option.value} value={option.value}>
              <Space>
                <span 
                  style={{
                    display: 'inline-block',
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: option.color,
                  }}
                />
                {option.label}
              </Space>
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        label="金额（元）"
        name="amount"
        rules={[
          { required: true, message: '请输入金额' },
          { type: 'number', min: 0.01, message: '金额必须大于0' },
        ]}
      >
        <InputNumber
          prefix={<DollarOutlined />}
          placeholder="请输入金额"
          style={{ width: '100%' }}
          precision={2}
          min={0}
          size="large"
        />
      </Form.Item>

      <Form.Item
        label="描述"
        name="description"
        rules={[
          { required: true, message: '请输入费用描述' },
          { max: 200, message: '描述不能超过200字' },
        ]}
      >
        <TextArea
          placeholder="例如：午餐 - 全聚德烤鸭"
          rows={3}
          maxLength={200}
          showCount
        />
      </Form.Item>

      <Form.Item
        label="日期"
        name="expense_date"
        rules={[{ required: true, message: '请选择费用日期' }]}
      >
        <DatePicker
          style={{ width: '100%' }}
          placeholder="选择日期"
          format="YYYY-MM-DD"
          size="large"
        />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            添加费用
          </Button>
          {onCancel && (
            <Button onClick={onCancel}>
              取消
            </Button>
          )}
        </Space>
      </Form.Item>
    </Form>
  );
}

export { categoryOptions };
