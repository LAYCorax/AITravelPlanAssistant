import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // WebSocket连接直接使用wss://，不需要代理
    // 科大讯飞语音识别使用WebSocket流式API：wss://iat-api.xfyun.cn/v2/iat
  },
})
