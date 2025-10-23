import React, { useState, useRef, useEffect } from 'react';
import { Button, Progress, message } from 'antd';
import { AudioOutlined, LoadingOutlined } from '@ant-design/icons';
import { voiceService } from '../../services/voice/iflytek';
import './VoiceRecorder.css';

interface VoiceRecorderProps {
  onTranscriptComplete?: (text: string) => void;
  onError?: (error: Error) => void;
}

type RecordingState = 'idle' | 'recording' | 'processing' | 'completed';

export function VoiceRecorder({ onTranscriptComplete, onError }: VoiceRecorderProps) {
  const [state, setState] = useState<RecordingState>('idle');
  const [duration, setDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      stopRecording();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // 创建音频分析器
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      // 开始音频级别监测
      const updateAudioLevel = () => {
        if (analyserRef.current && state === 'recording') {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel(Math.min(100, average));
          animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
        }
      };
      updateAudioLevel();

      // 创建媒体录制器
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        
        // 停止音频流
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setState('recording');
      setDuration(0);

      // 启动计时器
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);

      message.success('开始录音');
    } catch (error: any) {
      console.error('Failed to start recording:', error);
      message.error('无法访问麦克风，请检查权限设置');
      if (onError) {
        onError(error);
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && state === 'recording') {
      mediaRecorderRef.current.stop();
      setState('processing');
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      message.info('正在处理录音...');
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    try {
      // 调用语音识别服务
      const result = await voiceService.transcribeAudio(audioBlob);
      
      setState('completed');
      message.success('语音识别完成');
      
      if (onTranscriptComplete) {
        onTranscriptComplete(result.text);
      }

      // 3秒后重置状态
      setTimeout(() => {
        setState('idle');
        setDuration(0);
        setAudioLevel(0);
      }, 3000);

    } catch (error: any) {
      console.error('Failed to process audio:', error);
      message.error('语音识别失败');
      setState('idle');
      if (onError) {
        onError(error);
      }
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="voice-recorder">
      <div className="recorder-container">
        {state === 'idle' && (
          <div className="recorder-idle">
            <Button
              type="primary"
              shape="circle"
              size="large"
              icon={<AudioOutlined />}
              onClick={startRecording}
              className="record-button"
            />
            <p>点击开始录音</p>
          </div>
        )}

        {state === 'recording' && (
          <div className="recorder-recording">
            <div className="audio-wave">
              <div className="wave-bar" style={{ height: `${audioLevel}%` }} />
              <div className="wave-bar" style={{ height: `${audioLevel * 0.8}%` }} />
              <div className="wave-bar" style={{ height: `${audioLevel * 0.6}%` }} />
              <div className="wave-bar" style={{ height: `${audioLevel * 0.8}%` }} />
              <div className="wave-bar" style={{ height: `${audioLevel}%` }} />
            </div>
            <p className="recording-time">{formatDuration(duration)}</p>
            <Button
              danger
              shape="circle"
              size="large"
              onClick={stopRecording}
              className="stop-button"
            >
              停止
            </Button>
          </div>
        )}

        {state === 'processing' && (
          <div className="recorder-processing">
            <LoadingOutlined style={{ fontSize: 48, color: '#1890ff' }} />
            <p>正在识别...</p>
            <Progress percent={60} showInfo={false} />
          </div>
        )}

        {state === 'completed' && (
          <div className="recorder-completed">
            <div className="success-icon">✓</div>
            <p>识别完成</p>
          </div>
        )}
      </div>

      <div className="recorder-tips">
        <p>💡 提示：</p>
        <ul>
          <li>请在安静的环境中录音</li>
          <li>清晰地说出目的地、日期、预算和人数</li>
          <li>录音时长建议在10-30秒</li>
        </ul>
      </div>
    </div>
  );
}
