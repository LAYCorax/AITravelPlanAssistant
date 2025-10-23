# CORS跨域问题解决方案

## 问题描述

科大讯飞语音识别API (https://raasr.xfyun.cn) 存在CORS跨域限制，浏览器端直接调用会被拦截。

## 解决方案

### 开发环境（已配置）

使用Vite开发服务器的代理功能，已在 `vite.config.ts` 中配置：

```typescript
server: {
  proxy: {
    '/api/iflytek': {
      target: 'https://raasr.xfyun.cn',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api\/iflytek/, ''),
    },
  },
}
```

**工作原理：**
- 前端请求 `/api/iflytek/api/transfer` 
- Vite开发服务器将请求代理到 `https://raasr.xfyun.cn/api/transfer`
- 因为是服务器到服务器的请求，不存在CORS限制

### 生产环境

生产环境需要配置后端代理服务器。有以下几种方案：

#### 方案1：使用Nginx反向代理（推荐）

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态资源
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }

    # 代理科大讯飞API
    location /api/iflytek/ {
        # 移除 /api/iflytek 前缀
        rewrite ^/api/iflytek/(.*)$ /$1 break;
        
        # 代理到科大讯飞服务器
        proxy_pass https://raasr.xfyun.cn;
        
        # 设置请求头
        proxy_set_header Host raasr.xfyun.cn;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
        # SSL设置
        proxy_ssl_server_name on;
        proxy_ssl_protocols TLSv1.2 TLSv1.3;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

#### 方案2：使用Node.js/Express后端代理

创建一个简单的Express代理服务器：

```javascript
// server.js
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 静态文件服务
app.use(express.static(path.join(__dirname, 'dist')));

// API代理
app.use('/api/iflytek', createProxyMiddleware({
  target: 'https://raasr.xfyun.cn',
  changeOrigin: true,
  pathRewrite: {
    '^/api/iflytek': '',
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log('Proxying request to:', req.url);
  },
}));

// SPA路由支持
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

安装依赖：
```bash
npm install express http-proxy-middleware
```

启动服务器：
```bash
node server.js
```

#### 方案3：使用云函数/Serverless

如果部署在云平台，可以使用云函数作为代理：

**阿里云函数计算示例：**

```javascript
exports.handler = async (event, context) => {
  const { path, headers, body, method } = JSON.parse(event.toString());
  
  // 转发请求到科大讯飞
  const response = await fetch(`https://raasr.xfyun.cn${path}`, {
    method,
    headers: {
      ...headers,
      'Host': 'raasr.xfyun.cn',
    },
    body: method !== 'GET' ? body : undefined,
  });
  
  const data = await response.text();
  
  return {
    statusCode: response.status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: data,
  };
};
```

#### 方案4：使用自建后端API（最灵活）

创建专门的后端API服务来处理语音识别：

```typescript
// backend/src/api/voice.ts
import express from 'express';
import fetch from 'node-fetch';
import crypto from 'crypto';

const router = express.Router();

// 生成科大讯飞API签名
function generateSignature(apiKey: string, apiSecret: string, timestamp: string): string {
  const signStr = apiKey + timestamp;
  return crypto.createHmac('sha1', apiSecret).update(signStr).digest('hex');
}

// 提交转写任务
router.post('/transcribe', async (req, res) => {
  try {
    const { audio } = req.body;
    const appId = process.env.IFLYTEK_APP_ID;
    const apiKey = process.env.IFLYTEK_API_KEY;
    const apiSecret = process.env.IFLYTEK_API_SECRET;
    
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = generateSignature(apiKey!, apiSecret!, timestamp);
    
    const response = await fetch('https://raasr.xfyun.cn/api/transfer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Appid': appId!,
        'X-CurTime': timestamp,
        'X-Param': Buffer.from(JSON.stringify({ language: 'cn', pd: 'travel' })).toString('base64'),
        'X-CheckSum': signature,
      },
      body: JSON.stringify({ audio }),
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Transcription failed' });
  }
});

// 获取转写结果
router.get('/result/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const appId = process.env.IFLYTEK_APP_ID;
    const apiKey = process.env.IFLYTEK_API_KEY;
    const apiSecret = process.env.IFLYTEK_API_SECRET;
    
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = generateSignature(apiKey!, apiSecret!, timestamp);
    
    const response = await fetch(`https://raasr.xfyun.cn/api/getResult?taskId=${taskId}`, {
      method: 'GET',
      headers: {
        'X-Appid': appId!,
        'X-CurTime': timestamp,
        'X-CheckSum': signature,
      },
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get result' });
  }
});

export default router;
```

前端调用示例：
```typescript
// 使用自建后端API
const apiUrl = '/api/voice/transcribe';
const response = await fetch(apiUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ audio: audioBase64 }),
});
```

## 当前实现

项目已配置自动检测环境：
- **开发环境** (`npm run dev`)：使用Vite代理，路径 `/api/iflytek/*`
- **生产环境** (`npm run build`)：直接调用科大讯飞API（需配置上述任一方案）

## 推荐方案

根据部署场景选择：

1. **简单部署**：方案1 (Nginx) - 配置简单，性能好
2. **Node.js项目**：方案2 (Express) - 与现有技术栈一致
3. **云平台部署**：方案3 (Serverless) - 按需计费，自动扩展
4. **复杂业务**：方案4 (自建后端) - 最灵活，可添加缓存、限流等功能

## 注意事项

1. **API密钥安全**：生产环境务必将密钥存储在后端环境变量中
2. **请求限流**：考虑添加请求频率限制，避免API配额耗尽
3. **错误处理**：添加完善的错误处理和重试机制
4. **日志记录**：记录API调用日志，便于问题排查
5. **监控告警**：监控API调用成功率和响应时间

## 测试代理配置

开发环境测试：
```bash
cd frontend
npm run dev
# 访问 http://localhost:5173
# 尝试使用语音输入功能
```

检查代理是否工作：
- 打开浏览器开发者工具 Network 标签
- 录制语音
- 查看请求URL应该是 `/api/iflytek/api/transfer` 而不是 `https://raasr.xfyun.cn/api/transfer`
- 状态码应该是 200，而不是 CORS 错误

## 常见问题

### Q: 代理配置后仍然报CORS错误
A: 检查以下几点：
- 确认Vite开发服务器已重启
- 检查 `vite.config.ts` 配置是否正确保存
- 查看控制台是否有代理相关的错误日志

### Q: 生产环境如何部署？
A: 必须配置上述任一后端代理方案，浏览器端无法直接调用科大讯飞API。

### Q: 可以使用CORS插件吗？
A: 不推荐。CORS插件只在开发时有效，无法解决生产环境的问题。
