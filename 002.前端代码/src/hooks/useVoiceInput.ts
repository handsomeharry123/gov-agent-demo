import { useEffect, useRef, useState } from 'react';

type RecognitionResult = { isFinal: boolean; 0: { transcript: string } };
type Recognition = {
  lang: string; interimResults: boolean; continuous: boolean;
  onresult: ((event: { results: ArrayLike<RecognitionResult> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void; stop(): void; abort(): void;
};
type RecognitionConstructor = new () => Recognition;

export function useVoiceInput(value: string, onChange: (text: string) => void) {
  const recognitionRef = useRef<Recognition | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const valueRef = useRef(value);
  const changeRef = useRef(onChange);
  valueRef.current = value;
  changeRef.current = onChange;
  const [listening, setListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('');
  const stopVoice = () => { recognitionRef.current?.stop(); };
  useEffect(() => () => {
    clearTimeout(timerRef.current);
    const recognition = recognitionRef.current;
    if (recognition) { recognition.onresult = null; recognition.onerror = null; recognition.onend = null; recognition.abort(); }
  }, []);
  const toggleVoice = () => {
    if (recognitionRef.current) { stopVoice(); return; }
    const speechWindow = window as unknown as { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor };
    const Constructor = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!Constructor) { setVoiceStatus('当前浏览器不支持语音输入，请使用 Chrome / Edge 或直接输入文字。'); return; }
    if (!window.isSecureContext) { setVoiceStatus('语音输入需要 HTTPS 或 localhost 安全环境，请直接输入文字。'); return; }
    const recognition = new Constructor();
    const prefix = valueRef.current.trim();
    let received = false;
    let failed = false;
    recognition.lang = 'zh-CN';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onresult = event => {
      const transcript = Array.from(event.results).map(result => result[0].transcript).join('');
      if (transcript) { received = true; changeRef.current([prefix, transcript].filter(Boolean).join(' ')); }
    };
    recognition.onerror = event => {
      failed = true;
      const errors: Record<string, string> = {
        'not-allowed': '麦克风权限未开启，请在浏览器中允许使用麦克风后重试。',
        'service-not-allowed': '浏览器语音服务不可用，请直接输入文字。',
        'audio-capture': '未检测到可用麦克风，请检查设备后重试。',
        'no-speech': '未识别到语音，请点击麦克风重试。',
        network: '语音服务连接失败，请检查网络后重试，或直接输入文字。',
        aborted: '语音输入已取消。',
      };
      setVoiceStatus(errors[event.error] ?? '语音识别失败，请重试或直接输入文字。');
    };
    recognition.onend = () => {
      clearTimeout(timerRef.current);
      recognitionRef.current = null;
      setListening(false);
      if (!failed) setVoiceStatus(received ? '语音已转为文字，您可以修改后发送。' : '未识别到语音，请重试或直接输入文字。');
    };
    recognitionRef.current = recognition;
    try {
      recognition.start();
      setListening(true);
      setVoiceStatus('正在聆听，请说出您的业务需求；再次点击麦克风结束。');
      timerRef.current = setTimeout(() => recognition.stop(), 60000);
    } catch {
      recognitionRef.current = null;
      setListening(false);
      setVoiceStatus('无法启动语音输入，请检查麦克风权限后重试。');
    }
  };
  return { listening, voiceStatus, toggleVoice, stopVoice };
}
