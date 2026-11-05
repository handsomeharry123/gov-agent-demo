import { useEffect, useRef, useState } from 'react';
import { Modal } from 'antd';
import './voiceInputDemo.css';
const SAMPLE = '帮我查找浦东新区适合人工智能企业的产业空间，并推荐相关扶持政策。';
export function useVoiceInputDemo(value: string, onChange: (text: string) => void, focusSelector = '[data-testid="home-v1-input"]') {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [silent, setSilent] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('');
  const latest = useRef({ value, onChange });
  latest.current = { value, onChange };
  const prefix = useRef('');
  const text = useRef('');
  const active = useRef(false);
  const finish = () => {
    if (!active.current) return;
    active.current = false;
    setListening(false);
    if (text.current) latest.current.onChange([prefix.current, text.current].filter(Boolean).join(' '));
    setVoiceStatus(text.current ? '文字已填入，可编辑后发送。' : '尚未录入文字，可重新演示。');
  };
  const cancel = () => { active.current = false; setListening(false); setVoiceStatus('已取消演示，原输入内容已保留。'); };
  useEffect(() => {
    if (!listening) return;
    const started = Date.now();
    let lastTextAt = started;
    const timer = window.setInterval(() => {
      if (!active.current) return;
      const ms = Date.now() - started;
      const next = SAMPLE.slice(0, Math.floor(Math.max(0, ms - 500) / 160));
      if (next !== text.current) {
        text.current = next;
        lastTextAt = Date.now();
        setTranscript(next);
      }
      setSilent(next === SAMPLE);
      // Mock silence starts after the final simulated speech character.
      if (Date.now() - lastTextAt >= 5000) finish();
    }, 80);
    return () => window.clearInterval(timer);
  }, [listening]);
  const toggleVoice = () => {
    if (active.current) { finish(); return; }
    prefix.current = latest.current.value.trim(); text.current = ''; active.current = true;
    setTranscript(''); setSilent(false); setVoiceStatus('正在演示语音输入'); setListening(true);
  };
  const voiceOverlay = <Modal open={listening} centered width={440} footer={null} onCancel={cancel} maskClosable={false} title="语音输入" className="voice-demo-modal" rootClassName="voice-demo-overlay" afterClose={() => document.querySelector<HTMLTextAreaElement>(focusSelector)?.focus()}>
    <div className="voice-demo-content">
      <div className={`voice-demo-wave${silent ? ' is-silent' : ''}`} aria-hidden="true">{Array.from({ length: 35 }, (_, i) => <i key={i} style={{ height: 12 + (1 - Math.abs(i - 17) / 18) * 62, animationDelay: `${i * -0.13}s` }} />)}</div>
      <div className="voice-demo-state">正在聆听</div>
      <div className="voice-demo-transcript" role="status" aria-live="polite">{transcript || <span className="voice-demo-placeholder">请说出您的业务需求…</span>}<span className="voice-demo-caret" aria-hidden="true" /></div>
    </div>
  </Modal>;
  return { listening, voiceStatus, toggleVoice, voiceOverlay, stopVoice: cancel };
}
