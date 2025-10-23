import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { AuthProvider } from './store/auth/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { AuthLayout, MainLayout } from './layouts';
import { Login } from './pages/Auth/Login';
import { Register } from './pages/Auth/Register';
import { Home } from './pages/Home/Home';
import { PlannerInput } from './pages/TravelPlanner/PlannerInput';
import { PlanDetail } from './pages/TravelPlanner/PlanDetail';
import { MyPlans } from './pages/MyPlans/MyPlans';
import './App.css';

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Auth Routes */}
            <Route path="/auth" element={<AuthLayout />}>
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route index element={<Navigate to="login" replace />} />
            </Route>

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
              <Route index element={<Home />} />
              <Route path="planner" element={<PlannerInput />} />
              <Route path="plans" element={<MyPlans />} />
              <Route path="plans/:id" element={<PlanDetail />} />
              <Route path="settings" element={<div>设置页面（待开发）</div>} />
            </Route> path="settings" element={<div>设置页面（待开发）</div>} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
