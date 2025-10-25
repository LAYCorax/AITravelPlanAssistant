/**
 * 空状态组件
 * 提供统一的空状态展示
 */

import { Empty, Button } from 'antd';
import { PlusOutlined, InboxOutlined, FileTextOutlined, SearchOutlined } from '@ant-design/icons';
import './EmptyState.css';

interface EmptyStateProps {
  type?: 'no-data' | 'no-plans' | 'no-search-results' | 'no-activities';
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  image?: React.ReactNode;
}

/**
 * 空状态组件
 */
export function EmptyState({
  type = 'no-data',
  title,
  description,
  actionText,
  onAction,
  image,
}: EmptyStateProps) {
  // 根据类型设置默认值
  const getDefaults = () => {
    switch (type) {
      case 'no-plans':
        return {
          icon: <FileTextOutlined style={{ fontSize: 64, color: '#bfbfbf' }} />,
          defaultTitle: '暂无旅行计划',
          defaultDescription: '创建您的第一个旅行计划，开始精彩旅程',
          defaultActionText: '创建计划',
        };
      case 'no-activities':
        return {
          icon: <InboxOutlined style={{ fontSize: 64, color: '#bfbfbf' }} />,
          defaultTitle: '暂无活动安排',
          defaultDescription: '添加活动，让您的行程更加丰富',
          defaultActionText: '添加活动',
        };
      case 'no-search-results':
        return {
          icon: <SearchOutlined style={{ fontSize: 64, color: '#bfbfbf' }} />,
          defaultTitle: '没有找到相关内容',
          defaultDescription: '尝试使用其他关键词搜索',
          defaultActionText: undefined,
        };
      default:
        return {
          icon: <InboxOutlined style={{ fontSize: 64, color: '#bfbfbf' }} />,
          defaultTitle: '暂无数据',
          defaultDescription: '当前没有可显示的内容',
          defaultActionText: undefined,
        };
    }
  };

  const defaults = getDefaults();

  return (
    <div className="empty-state-container">
      <Empty
        image={image || defaults.icon}
        description={
          <div className="empty-state-content">
            <h3 className="empty-state-title">{title || defaults.defaultTitle}</h3>
            <p className="empty-state-description">{description || defaults.defaultDescription}</p>
          </div>
        }
      >
        {(actionText || defaults.defaultActionText) && onAction && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onAction}
            size="large"
          >
            {actionText || defaults.defaultActionText}
          </Button>
        )}
      </Empty>
    </div>
  );
}

/**
 * 快捷空状态组件
 */
export function NoPlansState({ onCreatePlan }: { onCreatePlan?: () => void }) {
  return (
    <EmptyState
      type="no-plans"
      onAction={onCreatePlan}
    />
  );
}

export function NoActivitiesState({ onAddActivity }: { onAddActivity?: () => void }) {
  return (
    <EmptyState
      type="no-activities"
      onAction={onAddActivity}
    />
  );
}

export function NoSearchResultsState() {
  return <EmptyState type="no-search-results" />;
}
