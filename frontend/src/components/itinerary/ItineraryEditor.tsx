/**
 * ItineraryEditor Component - Week 8 Phase 2
 * 行程编辑器组件 - 支持添加/删除/编辑活动，自动按时间排序
 */

import { useState } from 'react';
import { 
  Card, 
  Button, 
  Space, 
  Modal, 
  Form, 
  Input, 
  TimePicker, 
  Select,
  message,
  Popconfirm,
  Typography,
  Tag,
  Empty
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SaveOutlined,
  CloseOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import type { ItineraryDetail, Activity } from '../../types';
import dayjs from 'dayjs';
import './ItineraryEditor.css';

const { Text } = Typography;
const { TextArea } = Input;

interface ItineraryEditorProps {
  itinerary: ItineraryDetail[];
  onSave: (updatedItinerary: ItineraryDetail[]) => Promise<void>;
  onCancel: () => void;
}

export function ItineraryEditor({ itinerary, onSave, onCancel }: ItineraryEditorProps) {
  const [editableItinerary, setEditableItinerary] = useState<ItineraryDetail[]>(
    JSON.parse(JSON.stringify(itinerary)) // 深拷贝
  );
  const [editingActivity, setEditingActivity] = useState<{
    dayIndex: number;
    activityIndex: number;
    activity: Activity;
  } | null>(null);
  const [isAddingActivity, setIsAddingActivity] = useState<{
    dayIndex: number;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  // 打开编辑活动对话框
  const handleEditActivity = (dayIndex: number, activityIndex: number) => {
    const activity = editableItinerary[dayIndex].activities[activityIndex];
    setEditingActivity({ dayIndex, activityIndex, activity });
    // 解析 time 字段
    let startTime, endTime;
    if (activity.time) {
      const [start, end] = activity.time.split('-');
      startTime = dayjs(start, 'HH:mm');
      endTime = dayjs(end, 'HH:mm');
    }
    form.setFieldsValue({
      dayIndex, // 添加日期选择
      startTime,
      endTime,
      type: activity.type,
      name: activity.name,
      location: activity.location,
      address: activity.address,
      description: activity.description,
      cost: activity.cost,
      tips: activity.tips,
    });
  };

  // 保存编辑的活动
  const handleSaveActivity = async () => {
    try {
      const values = await form.validateFields();
      if (editingActivity) {
        const newItinerary = [...editableItinerary];
        const { dayIndex: oldDayIndex, activityIndex } = editingActivity;
        const newDayIndex = values.dayIndex; // 获取新的日期索引
        
        const time = `${values.startTime.format('HH:mm')}-${values.endTime.format('HH:mm')}`;
        const updatedActivity = {
          ...newItinerary[oldDayIndex].activities[activityIndex],
          time,
          type: values.type,
          name: values.name,
          location: values.location,
          address: values.address,
          description: values.description,
          cost: Number(values.cost),
          tips: values.tips,
        };
        
        // 如果日期改变，需要移动活动到新的天
        if (oldDayIndex !== newDayIndex) {
          // 从原来的天删除
          newItinerary[oldDayIndex].activities.splice(activityIndex, 1);
          // 添加到新的天
          newItinerary[newDayIndex].activities.push(updatedActivity);
          // 对新的天排序
          newItinerary[newDayIndex].activities.sort((a, b) => {
            const aStart = a.time?.split('-')[0] || '';
            const bStart = b.time?.split('-')[0] || '';
            return aStart.localeCompare(bStart);
          });
        } else {
          // 同一天，直接更新
          newItinerary[oldDayIndex].activities[activityIndex] = updatedActivity;
          // 自动按时间排序
          newItinerary[oldDayIndex].activities.sort((a, b) => {
            const aStart = a.time?.split('-')[0] || '';
            const bStart = b.time?.split('-')[0] || '';
            return aStart.localeCompare(bStart);
          });
        }
        
        setEditableItinerary(newItinerary);
        setEditingActivity(null); // 自动关闭弹窗
        form.resetFields();
        message.success(oldDayIndex !== newDayIndex ? '活动已移动并更新' : '活动已更新');
      }
    } catch (error) {
      console.error('保存活动失败:', error);
    }
  };

  // 打开添加活动对话框
  const handleAddActivity = (dayIndex: number) => {
    setIsAddingActivity({ dayIndex });
    form.resetFields();
  };

  // 保存新添加的活动
  const handleSaveNewActivity = async () => {
    try {
      const values = await form.validateFields();
      if (isAddingActivity) {
        const newItinerary = [...editableItinerary];
        const { dayIndex } = isAddingActivity;
        const time = `${values.startTime.format('HH:mm')}-${values.endTime.format('HH:mm')}`;
        const newActivity: Activity = {
          time,
          type: values.type,
          name: values.name,
          location: values.location,
          address: values.address,
          description: values.description,
          cost: Number(values.cost),
          tips: values.tips,
          coordinates: { latitude: 0, longitude: 0 },
        };
        newItinerary[dayIndex].activities.push(newActivity);
        // 自动按时间排序
        newItinerary[dayIndex].activities.sort((a, b) => {
          const aStart = a.time?.split('-')[0] || '';
          const bStart = b.time?.split('-')[0] || '';
          return aStart.localeCompare(bStart);
        });
        setEditableItinerary(newItinerary);
        setIsAddingActivity(null); // 自动关闭弹窗
        form.resetFields();
        message.success('活动已添加');
      }
    } catch (error) {
      console.error('添加活动失败:', error);
    }
  };

  // 删除活动
  const handleDeleteActivity = (dayIndex: number, activityIndex: number) => {
    const newItinerary = [...editableItinerary];
    newItinerary[dayIndex].activities.splice(activityIndex, 1);
    setEditableItinerary(newItinerary);
    message.success('活动已删除');
  };

  // 保存整个行程
  const handleSaveItinerary = async () => {
    setSaving(true);
    try {
      await onSave(editableItinerary);
      message.success('行程已保存');
    } catch (error: any) {
      message.error(error.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  // 活动类型选项
  const activityTypeOptions = [
    { value: 'sightseeing', label: '🗺️ 景点游览' },
    { value: 'dining', label: '🍴 餐饮美食' },
    { value: 'activity', label: '🎯 活动体验' },
    { value: 'transport', label: '🚗 交通出行' },
  ];

  return (
    <div className="itinerary-editor">
      {/* 编辑器工具栏 */}
      <Card className="editor-toolbar">
        <Space>
          <Button 
            type="primary" 
            icon={<SaveOutlined />} 
            onClick={handleSaveItinerary}
            loading={saving}
          >
            保存行程
          </Button>
          <Button icon={<CloseOutlined />} onClick={onCancel}>
            取消编辑
          </Button>
          <Text type="secondary">
            💡 提示：编辑活动后，系统会自动按时间排序
          </Text>
        </Space>
      </Card>

      {/* 每日行程编辑 */}
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {editableItinerary.map((day, dayIndex) => (
          <Card
            key={day.id}
            className="day-editor-card"
            title={
              <Space>
                <Text strong>第{day.day}天 - {day.title}</Text>
                <Tag color="blue">{dayjs(day.date).format('MM月DD日')}</Tag>
              </Space>
            }
            extra={
              <Button
                type="dashed"
                size="small"
                icon={<PlusOutlined />}
                onClick={() => handleAddActivity(dayIndex)}
              >
                添加活动
              </Button>
            }
          >
            {day.activities.length === 0 ? (
              <Empty description="暂无活动，点击上方按钮添加" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <Space direction="vertical" style={{ width: '100%' }} size="small">
                {day.activities.map((activity: Activity, activityIndex: number) => (
                  <Card
                    key={`${dayIndex}-${activityIndex}`}
                    className="activity-card"
                    size="small"
                  >
                    <div className="activity-content">
                      <div className="activity-info">
                        <Space>
                          <ClockCircleOutlined />
                          <Text strong>
                            {activity.time || '未设置'}
                          </Text>
                          <Tag>{activityTypeOptions.find(t => t.value === activity.type)?.label}</Tag>
                        </Space>
                        <div style={{ marginTop: 8 }}>
                          <Text strong>{activity.name}</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            📍 {activity.location}
                          </Text>
                        </div>
                      </div>

                      <div className="activity-actions">
                        <Space>
                          <Button
                            type="text"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => handleEditActivity(dayIndex, activityIndex)}
                          >
                            编辑
                          </Button>
                          <Popconfirm
                            title="确定删除这个活动吗？"
                            onConfirm={() => handleDeleteActivity(dayIndex, activityIndex)}
                            okText="确定"
                            cancelText="取消"
                          >
                            <Button
                              type="text"
                              danger
                              size="small"
                              icon={<DeleteOutlined />}
                            >
                              删除
                            </Button>
                          </Popconfirm>
                        </Space>
                      </div>
                    </div>
                  </Card>
                ))}
              </Space>
            )}
          </Card>
        ))}
      </Space>

      {/* 编辑活动对话框 */}
      <Modal
        title="编辑活动"
        open={!!editingActivity}
        onOk={handleSaveActivity}
        onCancel={() => {
          setEditingActivity(null);
          form.resetFields();
        }}
        width={600}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="选择日期"
            name="dayIndex"
            rules={[{ required: true, message: '请选择日期' }]}
          >
            <Select
              placeholder="选择活动所属的日期"
              options={editableItinerary.map((day, index) => ({
                value: index,
                label: `第${day.day}天 - ${day.title} (${dayjs(day.date).format('MM月DD日')})`
              }))}
            />
          </Form.Item>

          <Space.Compact style={{ width: '100%', marginBottom: 16 }}>
            <Form.Item
              label="开始时间"
              name="startTime"
              rules={[{ required: true, message: '请选择开始时间' }]}
              style={{ flex: 1, marginBottom: 0 }}
            >
              <TimePicker format="HH:mm" style={{ width: '100%' }} placeholder="开始时间" />
            </Form.Item>
            <Form.Item
              label="结束时间"
              name="endTime"
              rules={[
                { required: true, message: '请选择结束时间' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const startTime = getFieldValue('startTime');
                    if (!value || !startTime) {
                      return Promise.resolve();
                    }
                    if (value.isBefore(startTime)) {
                      return Promise.reject(new Error('结束时间不能早于开始时间'));
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
              style={{ flex: 1, marginBottom: 0 }}
            >
              <TimePicker format="HH:mm" style={{ width: '100%' }} placeholder="结束时间" />
            </Form.Item>
          </Space.Compact>

          <Form.Item
            label="活动类型"
            name="type"
            rules={[{ required: true, message: '请选择类型' }]}
          >
            <Select options={activityTypeOptions} />
          </Form.Item>

          <Form.Item
            label="活动名称"
            name="name"
            rules={[{ required: true, message: '请输入名称' }]}
          >
            <Input placeholder="例如：参观故宫" />
          </Form.Item>

          <Form.Item
            label="地点"
            name="location"
            rules={[{ required: true, message: '请输入地点' }]}
          >
            <Input placeholder="例如：故宫博物院" />
          </Form.Item>

          <Form.Item label="详细地址" name="address">
            <Input placeholder="例如：北京市东城区景山前街4号" />
          </Form.Item>

          <Form.Item label="活动描述" name="description">
            <TextArea rows={3} placeholder="描述活动内容" />
          </Form.Item>

          <Form.Item
            label="预计费用（元）"
            name="cost"
            rules={[
              { required: true, message: '请输入费用' },
              { type: 'number', min: 0, message: '费用不能为负数', transform: (value) => Number(value) }
            ]}
          >
            <Input type="number" min={0} step="0.01" placeholder="0" />
          </Form.Item>

          <Form.Item label="小贴士" name="tips">
            <TextArea rows={2} placeholder="游玩提示或注意事项" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 添加活动对话框 */}
      <Modal
        title="添加活动"
        open={!!isAddingActivity}
        onOk={handleSaveNewActivity}
        onCancel={() => {
          setIsAddingActivity(null);
          form.resetFields();
        }}
        width={600}
        okText="添加"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Space.Compact style={{ width: '100%', marginBottom: 16 }}>
            <Form.Item
              label="开始时间"
              name="startTime"
              rules={[{ required: true, message: '请选择开始时间' }]}
              style={{ flex: 1, marginBottom: 0 }}
            >
              <TimePicker format="HH:mm" style={{ width: '100%' }} placeholder="开始时间" />
            </Form.Item>
            <Form.Item
              label="结束时间"
              name="endTime"
              rules={[
                { required: true, message: '请选择结束时间' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const startTime = getFieldValue('startTime');
                    if (!value || !startTime) {
                      return Promise.resolve();
                    }
                    if (value.isBefore(startTime)) {
                      return Promise.reject(new Error('结束时间不能早于开始时间'));
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
              style={{ flex: 1, marginBottom: 0 }}
            >
              <TimePicker format="HH:mm" style={{ width: '100%' }} placeholder="结束时间" />
            </Form.Item>
          </Space.Compact>

          <Form.Item
            label="活动类型"
            name="type"
            rules={[{ required: true, message: '请选择类型' }]}
            initialValue="sightseeing"
          >
            <Select options={activityTypeOptions} />
          </Form.Item>

          <Form.Item
            label="活动名称"
            name="name"
            rules={[{ required: true, message: '请输入名称' }]}
          >
            <Input placeholder="例如：参观故宫" />
          </Form.Item>

          <Form.Item
            label="地点"
            name="location"
            rules={[{ required: true, message: '请输入地点' }]}
          >
            <Input placeholder="例如：故宫博物院" />
          </Form.Item>

          <Form.Item label="详细地址" name="address">
            <Input placeholder="例如：北京市东城区景山前街4号" />
          </Form.Item>

          <Form.Item label="活动描述" name="description">
            <TextArea rows={3} placeholder="描述活动内容" />
          </Form.Item>

          <Form.Item
            label="预计费用（元）"
            name="cost"
            rules={[
              { required: true, message: '请输入费用' },
              { type: 'number', min: 0, message: '费用不能为负数', transform: (value) => Number(value) }
            ]}
            initialValue={0}
          >
            <Input type="number" min={0} step="0.01" placeholder="0" />
          </Form.Item>

          <Form.Item label="小贴士" name="tips">
            <TextArea rows={2} placeholder="游玩提示或注意事项" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
