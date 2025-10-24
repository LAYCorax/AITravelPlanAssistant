/**
 * 科大讯飞语音识别服务
 * API文档: https://www.xfyun.cn/doc/asr/voicedictation/API.html
 * 使用WebSocket流式语音听写API
 */

import { getApiConfig } from '../api/apiConfig';

interface VoiceRecognitionResult {
  text: string;
  confidence: number;
}

interface IFlyTekWebSocketResponse {
  code: number;
  message: string;
  sid?: string;
  data?: {
    status: number;
    result?: {
      sn: number;
      ls: boolean;
      pgs?: 'apd' | 'rpl'; // 动态修正：apd=追加，rpl=替换
      rg?: [number, number]; // 替换范围 [start, end]
      ws: Array<{
        cw: Array<{
          w: string;
        }>;
      }>;
    };
  };
}

export const voiceService = {
  /**
   * 检查语音识别配置是否完整
   * 在开始录音前调用此方法
   */
  async checkVoiceConfig(): Promise<{ configured: boolean; message: string }> {
    try {
      const config = await getApiConfig('voice');
      if (config && config.api_key_encrypted && config.additional_config?.app_id) {
        const { getDecryptedApiKey, getDecryptedApiSecret } = await import('../api/apiConfig');
        const apiKey = await getDecryptedApiKey('voice');
        const apiSecret = await getDecryptedApiSecret('voice');
        
        if (apiKey && apiSecret) {
          return {
            configured: true,
            message: '语音识别服务配置正常',
          };
        }
      }
    } catch (error) {
      console.error('检查语音配置失败:', error);
    }
    
    return {
      configured: false,
      message: '语音识别服务未配置。请前往【设置 → API配置】页面配置科大讯飞语音识别服务的App ID、API Key和API Secret。',
    };
  },

  /**
   * 上传音频文件进行语音识别
   * 使用WebSocket流式API
   * @param audioBlob 音频文件
   * @returns 识别结果
   */
  async transcribeAudio(audioBlob: Blob): Promise<VoiceRecognitionResult> {
    // 从用户配置读取API密钥
    let appId: string | undefined;
    let apiKey: string | undefined;
    let apiSecret: string | undefined;

    try {
      const config = await getApiConfig('voice');
      if (config && config.api_key_encrypted) {
        // 解密获取实际密钥
        const { getDecryptedApiKey, getDecryptedApiSecret } = await import('../api/apiConfig');
        apiKey = await getDecryptedApiKey('voice') || undefined;
        apiSecret = await getDecryptedApiSecret('voice') || undefined;
        appId = config.additional_config?.app_id;
      }
    } catch (error) {
      console.error('读取用户配置失败:', error);
    }

    // 检查配置是否完整
    if (!appId || !apiKey || !apiSecret) {
      throw new Error('语音识别服务未配置。请前往【设置 → API配置】页面配置科大讯飞语音识别服务的App ID、API Key和API Secret。');
    }

    try {
      // 将音频转换为PCM格式 (WebM转PCM)
      const audioPCM = await this.convertToPCM(audioBlob);
      
      // 创建WebSocket连接
      const wsUrl = await this.generateWebSocketUrl(apiKey, apiSecret);
      
      // 通过WebSocket发送音频并接收识别结果
      const result = await this.recognizeWithWebSocket(wsUrl, appId, audioPCM);

      return {
        text: result,
        confidence: 0.9,
      };
    } catch (error: any) {
      console.error('语音识别失败:', error);
      throw new Error(`语音识别失败: ${error.message || '未知错误'}`);
    }
  },

  /**
   * 将音频转换为PCM格式
   */
  async convertToPCM(audioBlob: Blob): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const audioContext = new AudioContext({ sampleRate: 16000 });
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          
          // 转换为单声道 16kHz PCM
          const pcmData = audioBuffer.getChannelData(0);
          const pcmInt16 = new Int16Array(pcmData.length);
          
          for (let i = 0; i < pcmData.length; i++) {
            // 将float32转换为int16
            const s = Math.max(-1, Math.min(1, pcmData[i]));
            pcmInt16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
          }
          
          resolve(pcmInt16.buffer);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('读取音频文件失败'));
      reader.readAsArrayBuffer(audioBlob);
    });
  },

  /**
   * 生成WebSocket连接URL
   */
  async generateWebSocketUrl(apiKey: string, apiSecret: string): Promise<string> {
    const host = 'iat-api.xfyun.cn';
    const path = '/v2/iat';
    const date = new Date().toUTCString();
    
    // 构建签名原始字符串
    const signatureOrigin = `host: ${host}\ndate: ${date}\nGET ${path} HTTP/1.1`;
    
    // 使用HMAC-SHA256生成签名
    const encoder = new TextEncoder();
    const secretData = encoder.encode(apiSecret);
    const signData = encoder.encode(signatureOrigin);
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      secretData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, signData);
    const signatureBase64 = this.arrayBufferToBase64(signature);
    
    // 构建authorization参数
    const authorizationOrigin = `api_key="${apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signatureBase64}"`;
    const authorization = btoa(authorizationOrigin);
    
    // 构建完整的WebSocket URL
    const params = new URLSearchParams({
      authorization,
      date,
      host,
    });
    
    return `wss://${host}${path}?${params.toString()}`;
  },

  /**
   * 通过WebSocket识别音频
   */
  async recognizeWithWebSocket(wsUrl: string, appId: string, audioPCM: ArrayBuffer): Promise<string> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(wsUrl);
      let resultText = ''; // 最终识别文本
      const resultMap = new Map<number, string>(); // 使用Map存储结果，key为sn（序号）
      
      // 设置超时
      const timeout = setTimeout(() => {
        ws.close();
        reject(new Error('语音识别超时'));
      }, 60000); // 60秒超时

      ws.onopen = () => {
        console.log('WebSocket连接已建立');
        
        // 发送第一帧（包含参数）
        const params = {
          common: {
            app_id: appId,
          },
          business: {
            language: 'zh_cn',
            domain: 'iat',
            accent: 'mandarin',
            vad_eos: 3000,
            dwa: 'wpgs', // 开启动态修正
            pd: 'trip', // 旅游领域
            ptt: 1, // 开启标点符号
          },
          data: {
            status: 0, // 第一帧
            format: 'audio/L16;rate=16000',
            encoding: 'raw',
            audio: this.arrayBufferToBase64(audioPCM.slice(0, Math.min(1280, audioPCM.byteLength))),
          },
        };
        
        ws.send(JSON.stringify(params));
        
        // 发送音频数据
        let offset = 1280;
        const frameSize = 1280; // 每帧1280字节
        const interval = 40; // 每40ms发送一次
        
        const sendAudio = () => {
          if (offset >= audioPCM.byteLength) {
            // 发送最后一帧
            const endFrame = {
              data: {
                status: 2, // 最后一帧
              },
            };
            ws.send(JSON.stringify(endFrame));
            return;
          }
          
          const chunk = audioPCM.slice(offset, Math.min(offset + frameSize, audioPCM.byteLength));
          const frame = {
            data: {
              status: 1, // 中间帧
              format: 'audio/L16;rate=16000',
              encoding: 'raw',
              audio: this.arrayBufferToBase64(chunk),
            },
          };
          
          ws.send(JSON.stringify(frame));
          offset += frameSize;
          
          setTimeout(sendAudio, interval);
        };
        
        setTimeout(sendAudio, interval);
      };

      ws.onmessage = (event) => {
        try {
          const response: IFlyTekWebSocketResponse = JSON.parse(event.data);
          
          if (response.code !== 0) {
            clearTimeout(timeout);
            ws.close();
            reject(new Error(`识别错误: ${response.message} (code: ${response.code})`));
            return;
          }
          
          // 记录会话ID用于调试
          if (response.sid) {
            console.log('会话ID:', response.sid);
          }
          
          if (response.data?.result) {
            const { result } = response.data;
            
            // 解析当前帧的识别结果
            const currentText = result.ws
              .map(item => item.cw.map(word => word.w).join(''))
              .join('');
            
            // 使用sn（序号）作为key存储结果
            // sn从1开始计数
            const sn = result.sn;
            
            // 处理动态修正
            if (result.pgs) {
              if (result.pgs === 'apd') {
                // apd: 追加模式，直接存储当前结果
                resultMap.set(sn, currentText);
              } else if (result.pgs === 'rpl' && result.rg) {
                // rpl: 替换模式，替换指定范围的结果
                const [startSn, endSn] = result.rg;
                // 删除指定范围的结果
                for (let i = startSn; i <= endSn; i++) {
                  resultMap.delete(i);
                }
                // 存储新结果
                resultMap.set(sn, currentText);
              }
            } else {
              // 没有pgs字段，直接存储（通常是第一条结果）
              resultMap.set(sn, currentText);
            }
            
            // 按序号排序并拼接结果
            const sortedKeys = Array.from(resultMap.keys()).sort((a, b) => a - b);
            resultText = sortedKeys.map(key => resultMap.get(key)).join('');
            
            console.log(`[sn=${sn}] pgs=${result.pgs || 'none'} rg=${JSON.stringify(result.rg || [])} 片段: "${currentText}"`);
            console.log('当前完整结果:', resultText);
            
            // 如果是最后一片结果
            if (result.ls) {
              clearTimeout(timeout);
              ws.close();
              
              if (resultText.trim()) {
                resolve(resultText.trim());
              } else {
                reject(new Error('未识别到有效语音内容'));
              }
            }
          }
          
          // 如果status为2，表示识别结束
          if (response.data?.status === 2) {
            clearTimeout(timeout);
            ws.close();
            
            if (resultText.trim()) {
              resolve(resultText.trim());
            } else {
              reject(new Error('未识别到有效语音内容'));
            }
          }
        } catch (error: any) {
          clearTimeout(timeout);
          ws.close();
          reject(new Error(`解析响应失败: ${error.message}`));
        }
      };

      ws.onerror = (error) => {
        clearTimeout(timeout);
        console.error('WebSocket错误:', error);
        reject(new Error('WebSocket连接错误，请检查网络连接'));
      };

      ws.onclose = (event) => {
        clearTimeout(timeout);
        if (!event.wasClean) {
          reject(new Error(`WebSocket连接异常关闭 (code: ${event.code}, reason: ${event.reason})`));
        }
      };
    });
  },

  /**
   * 将ArrayBuffer转换为Base64字符串
   */
  arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  },

  /**
   * 检查浏览器是否支持语音录制
   */
  checkBrowserSupport(): boolean {
    return !!(
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function' &&
      window.MediaRecorder
    );
  },

  /**
   * 请求麦克风权限
   */
  async requestMicrophonePermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      return false;
    }
  },
};
