/**
 * 科大讯飞语音识别服务
 * API文档: https://www.xfyun.cn/doc/asr/voicedictation/API.html
 */

interface VoiceRecognitionResult {
  text: string;
  confidence: number;
}

export const voiceService = {
  /**
   * 上传音频文件进行语音识别
   * @param audioBlob 音频文件
   * @returns 识别结果
   */
  async transcribeAudio(audioBlob: Blob): Promise<VoiceRecognitionResult> {
    try {
      // TODO: 实现科大讯飞API调用
      // 1. 将音频转换为base64或直接上传
      // 2. 调用科大讯飞录音文件转写API
      // 3. 轮询获取识别结果

      // 目前返回模拟数据
      await new Promise(resolve => setTimeout(resolve, 2000));

      return {
        text: '我想去北京玩5天，预算5000元，2个人',
        confidence: 0.95,
      };
    } catch (error: any) {
      console.error('Voice recognition failed:', error);
      throw new Error('语音识别失败: ' + error.message);
    }
  },

  /**
   * 检查浏览器是否支持语音录制
   */
  checkBrowserSupport(): boolean {
    return !!(
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia &&
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

  /**
   * 解析语音识别文本，提取旅行信息
   * @param text 识别的文本
   * @returns 解析后的旅行信息
   */
  parseVoiceInput(text: string): {
    destination?: string;
    days?: number;
    budget?: number;
    travelerCount?: number;
  } {
    const result: any = {};

    // 提取目的地
    const destinationMatch = text.match(/去(.+?)(?:玩|旅游|旅行)/);
    if (destinationMatch) {
      result.destination = destinationMatch[1].trim();
    }

    // 提取天数
    const daysMatch = text.match(/(\d+)天/);
    if (daysMatch) {
      result.days = parseInt(daysMatch[1]);
    }

    // 提取预算
    const budgetMatch = text.match(/预算(\d+)(?:元|块)/);
    if (budgetMatch) {
      result.budget = parseInt(budgetMatch[1]);
    }

    // 提取人数
    const travelerMatch = text.match(/(\d+)(?:个)?人/);
    if (travelerMatch) {
      result.travelerCount = parseInt(travelerMatch[1]);
    }

    return result;
  },
};
