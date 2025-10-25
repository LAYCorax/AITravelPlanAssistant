/**
 * 加载状态组件
 * 提供统一的加载状态展示
 */

import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import './LoadingState.css';

interface LoadingStateProps {
  loading?: boolean;
  tip?: string;
  size?: 'small' | 'default' | 'large';
  fullScreen?: boolean;
  children?: React.ReactNode;
}

/**
 * 加载状态组件
 */
export function LoadingState({
  loading = true,
  tip = '加载中...',
  size = 'default',
  fullScreen = false,
  children,
}: LoadingStateProps) {
  if (!loading && children) {
    return <>{children}</>;
  }

  const loadingIcon = <LoadingOutlined style={{ fontSize: size === 'large' ? 48 : size === 'small' ? 24 : 36 }} spin />;

  if (fullScreen) {
    return (
      <div className="loading-state-fullscreen">
        <Spin indicator={loadingIcon} tip={tip} size={size} />
      </div>
    );
  }

  return (
    <div className="loading-state-container">
      <Spin indicator={loadingIcon} tip={tip} size={size}>
        {children}
      </Spin>
    </div>
  );
}

/**
 * 内联加载指示器（用于按钮等）
 */
export function InlineLoading({ tip }: { tip?: string }) {
  return (
    <span className="inline-loading">
      <LoadingOutlined spin />
      {tip && <span className="inline-loading-tip">{tip}</span>}
    </span>
  );
}

/**
 * 页面加载组件
 */
export function PageLoading({ tip = '页面加载中...' }: { tip?: string }) {
  return <LoadingState loading tip={tip} size="large" fullScreen />;
}

/**
 * 数据加载组件
 */
export function DataLoading({ tip = '数据加载中...' }: { tip?: string }) {
  return (
    <div className="data-loading">
      <LoadingState loading tip={tip} />
    </div>
  );
}
