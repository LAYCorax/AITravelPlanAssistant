import React from 'react';
import { Outlet } from 'react-router-dom';
import './AuthLayout.css';

export function AuthLayout() {
  return (
    <div className="auth-layout">
      <div className="auth-container">
        <div className="auth-logo">
          <h1>🌍 AI Travel Planner</h1>
          <p>智能旅行规划助手</p>
        </div>
        <div className="auth-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
