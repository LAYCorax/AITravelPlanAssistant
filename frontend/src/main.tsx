// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// 注意：StrictMode 在开发环境下会故意渲染组件两次以检测副作用
// 这可能导致看到重复的日志和 API 调用
// 生产环境不受影响，如果需要可以暂时移除 StrictMode 进行调试
createRoot(document.getElementById('root')!).render(
  // 暂时移除 StrictMode 以避免开发环境的重复渲染
  // <StrictMode>
    <App />
  // </StrictMode>,
)
