# 语音识别API迁移文档

## 迁移概述

**日期**: 2025-10-24  
**迁移原因**: 原API使用错误，导致请求失败

### 变更内容

从 **转写API (raasr.xfyun.cn)** 迁移到 **WebSocket流式语音听写API (iat-api.xfyun.cn)**

## 原有问题

### 1. 使用了错误的API
- **原API**: 录音文件转写API (`https://raasr.xfyun.cn/api/transfer`)
- **问题**: 
  - 该API适用于离线大文件转写（最长5小时）
  - 需要上传完整音频文件
  - 需要轮询获取结果
  - 不适合实时语音输入场景

### 2. 错误处理不当
- 失败时返回默认数据而非真实错误信息
- 用户无法知道实际失败原因
- 不利于问题排查和调试

## 新方案

### 使用WebSocket流式语音听写API

**API地址**: `wss://iat-api.xfyun.cn/v2/iat`

**优势**:
1. ✅ 实时流式识别，边说边识别
2. ✅ 低延迟，用户体验更好
3. ✅ 支持60秒以内的音频（适合语音输入）
4. ✅ 支持动态修正，识别结果更准确
5. ✅ 明确的错误提示，便于调试

## 技术变更详情

### 1. 连接方式变更

**之前 (HTTP轮询)**:
```typescript
// 1. POST上传音频
POST https://raasr.xfyun.cn/api/transfer
// 2. 轮询获取结果
GET https://raasr.xfyun.cn/api/getResult?taskId=xxx
```

**现在 (WebSocket流式)**:
```typescript
// 建立WebSocket连接
const ws = new WebSocket('wss://iat-api.xfyun.cn/v2/iat?...')
// 实时发送音频帧
ws.send(audioFrame)
// 实时接收识别结果
ws.onmessage = (result) => { ... }
```

### 2. 鉴权方式变更

**之前 (HMAC-SHA1)**:
```typescript
const signature = hmacSha1(apiKey + timestamp, apiSecret);
// Headers: X-Appid, X-CurTime, X-CheckSum
```

**现在 (HMAC-SHA256 + URL参数)**:
```typescript
const signatureOrigin = `host: ${host}\ndate: ${date}\nGET ${path} HTTP/1.1`;
const signature = hmacSha256(signatureOrigin, apiSecret);
const authorization = base64(authString);
// URL参数: ?authorization=xxx&date=xxx&host=xxx
```

### 3. 音频格式变更

**之前**:
- 支持多种格式(mp3, wav等)
- 直接上传原始音频

**现在**:
- 要求PCM格式
- 16kHz, 16bit, 单声道
- 需要将WebM格式转换为PCM

### 4. 数据传输变更

**之前**:
```typescript
// 一次性上传整个音频
{
  audio: base64(audioBlob)
}
```

**现在**:
```typescript
// 分帧发送
// 第一帧: 包含参数
{
  common: { app_id },
  business: { language, domain, ... },
  data: { status: 0, audio: ... }
}
// 中间帧: 每40ms发送1280字节
{
  data: { status: 1, audio: ... }
}
// 最后一帧: 结束标识
{
  data: { status: 2 }
}
```

### 5. 结果返回变更

**之前**:
```typescript
// 轮询直到获得完整结果
{
  code: '000000',
  data: '0 完|1 整|2 文|3 本'
}
```

**现在**:
```typescript
// 实时流式返回
{
  code: 0,
  data: {
    status: 1,
    result: {
      ws: [{ cw: [{ w: '文本' }] }],
      ls: false  // 是否最后一片
    }
  }
}
```

## 错误处理改进

### 之前的问题
```typescript
catch (error) {
  console.warn('使用模拟数据继续');
  return { text: '我想去北京玩5天...', confidence: 0.85 };
}
```
❌ 用户看不到真实错误  
❌ 无法判断API是否正常工作  
❌ 调试困难

### 现在的处理
```typescript
catch (error) {
  console.error('语音识别失败:', error);
  throw new Error(`语音识别失败: ${error.message}`);
}
```
✅ 明确的错误信息  
✅ 用户知道问题所在  
✅ 便于调试和问题定位

## 配置变更

### 环境变量 (无变化)
```bash
VITE_VOICE_APP_ID=xxx
VITE_VOICE_API_KEY=xxx
VITE_VOICE_API_SECRET=xxx
```

### Vite配置变更
```typescript
// 移除HTTP代理配置
// WebSocket直接连接，不需要代理
server: {
  // proxy: { ... }  // 已移除
}
```

## 业务参数优化

### 新增优化参数
```typescript
{
  domain: 'iat',         // 日常用语领域
  accent: 'mandarin',    // 普通话
  vad_eos: 3000,        // 3秒静默检测
  dwa: 'wpgs',          // 动态修正
  pd: 'trip',           // 旅游领域个性化
  ptt: 1                // 开启标点符号
}
```

## 测试建议

### 1. API配置测试
- [ ] 验证环境变量是否正确设置
- [ ] 测试API凭证是否有效
- [ ] 检查控制台是否开通"语音听写（流式版）"服务

### 2. 功能测试
- [ ] 测试基本语音识别功能
- [ ] 测试不同长度的音频（10-60秒）
- [ ] 测试识别准确性
- [ ] 测试旅游相关词汇识别

### 3. 错误场景测试
- [ ] API未配置时的错误提示
- [ ] 网络连接失败时的提示
- [ ] 超时场景的处理
- [ ] 无效音频的处理

### 4. 性能测试
- [ ] 识别响应时间
- [ ] 音频转换性能
- [ ] WebSocket连接稳定性

## 常见问题排查

### Q1: WebSocket连接失败
**检查**:
- 网络连接是否正常
- API凭证是否正确
- 服务是否已开通
- IP白名单设置（如有）

### Q2: 识别结果为空
**检查**:
- 录音是否有声音
- 音频是否太短或太长
- 环境噪音是否过大
- 发音是否清晰

### Q3: 识别不准确
**优化**:
- 使用安静环境录音
- 清晰发音，语速适中
- 确保领域参数正确（pd: 'trip'）
- 检查音频质量

### Q4: 超时错误
**原因**:
- 音频超过60秒
- 网络连接不稳定
- 发送数据间隔过长

## 性能对比

| 指标 | 原方案(转写API) | 新方案(WebSocket) |
|-----|----------------|------------------|
| 响应延迟 | 高（需轮询） | 低（实时） |
| 适用场景 | 离线大文件 | 实时语音输入 |
| 最长时长 | 5小时 | 60秒 |
| 识别方式 | 批量处理 | 流式识别 |
| 用户体验 | 需等待 | 即时反馈 |
| 错误反馈 | 模糊 | 明确 |

## 升级影响

### 对用户的影响
- ✅ 更快的识别速度
- ✅ 更清晰的错误提示
- ✅ 更好的交互体验
- ⚠️ 需要正确配置API凭证

### 对开发的影响
- ✅ 代码更规范
- ✅ 错误更容易排查
- ✅ 更符合实际使用场景
- ⚠️ 需要重新测试功能

## 后续优化建议

1. **添加重试机制**: 网络错误时自动重试
2. **音频质量检测**: 录音前检测环境噪音
3. **识别进度显示**: 显示实时识别状态
4. **结果缓存**: 避免重复识别相同内容
5. **离线支持**: 考虑添加离线语音识别能力

## 参考资料

- [科大讯飞语音听写API文档](https://www.xfyun.cn/doc/asr/voicedictation/API.html)
- [iFlytek API集成指南](./iFlytek-API-Guide.md)
- [错误码查询](https://www.xfyun.cn/document/error-code)

## 版本历史

| 版本 | 日期 | 变更内容 |
|-----|------|---------|
| v1.0 | 2025-10-24 | 从转写API迁移到WebSocket流式API |
| v0.1 | 初始版本 | 使用转写API（已废弃） |
