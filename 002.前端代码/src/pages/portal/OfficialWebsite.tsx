import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EnvironmentFilled, SearchOutlined, ArrowRightOutlined, FileSearchOutlined, RiseOutlined, AudioOutlined, StopOutlined } from '@ant-design/icons';
import './officialWebsite.css';
import { governmentScenarios } from '../home/governmentScenarios';
import { useVoiceInputDemo } from '../../components/VoiceInputDemo';

export function AssistantSpark({ large = false }: { large?: boolean }) {
  return <span className={`pud-ai-spark${large ? ' pud-ai-spark-large' : ''}`} aria-hidden="true">
    <svg viewBox="0 0 32 32" fill="none"><path d="M17 3c1.4 7.7 4.3 10.6 12 12-7.7 1.4-10.6 4.3-12 12C15.6 19.3 12.7 16.4 5 15 12.7 13.6 15.6 10.7 17 3Z" fill="currentColor"/><path d="M6 2c.5 2.7 1.5 3.7 4 4-2.5.5-3.5 1.5-4 4-.5-2.5-1.5-3.5-4-4 2.5-.3 3.5-1.3 4-4Z" fill="currentColor" opacity=".65"/></svg>
  </span>;
}

function SceneIcon({ index }: { index: number }) {
  const drawings = [
    <><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/></>,
    <><rect x="5" y="4" width="14" height="17" rx="3"/><path d="M9 9h6M9 13h6M9 17h3M9 3v2m6-2v2"/></>,
    <><path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6l-7-3Z"/><path d="m9 12 2 2 4-4"/></>,
    <><path d="M5 19V5m0 14h14"/><path d="m8 14 4-4 3 2 5-6m-4 0h4v4"/></>,
  ];
  return <span className={`pud-scene-icon pud-scene-icon-${index}`} aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round">{drawings[index]}</svg></span>;
}

const hotWords = ['科技创业券', '科技创新券', '知识产权运用资助', '中小企业扶持'];
const sections = ['政策直达', '政策解读', '直播课堂', '服务直达', '企业空间'];
export default function OfficialWebsite() {
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');
  const questionRef = useRef<HTMLTextAreaElement>(null);
  const { listening, toggleVoice, stopVoice, voiceOverlay } = useVoiceInputDemo(question, setQuestion, '.pud-question textarea');

  useEffect(() => { const previous = document.title; document.title = '浦易达 · 浦东新区惠企政策服务平台'; return () => { document.title = previous; }; }, []);
  const openAssistant = (prompt = question) => {
    if (listening) { stopVoice(); return; }
    stopVoice();
    navigate('/website/pud/policyAI', { state: { portalPrompt: prompt.trim(), fromPortal: true } });
  };
  return <main className="pud-site">{voiceOverlay}
    <header className="pud-gov-header"><div className="pud-wide"><a href="https://zwdt.sh.gov.cn/" target="_blank" rel="noreferrer"><img src="/pudong/gov-logo.png" alt="全国一体化在线政务服务平台 上海一网通办" /></a><nav aria-label="上海政务导航">{['首页', '政务服务', '要闻动态', '政务公开', '政民互动', '走进上海'].map((name, i) => <a key={name} href={['https://www.shanghai.gov.cn/', 'https://zwdt.sh.gov.cn/', 'https://www.shanghai.gov.cn/nw4411/', 'https://www.shanghai.gov.cn/nw12344/', 'https://www.shanghai.gov.cn/nw12349/', 'https://www.shanghai.gov.cn/nw48081/'][i]} target="_blank" rel="noreferrer">{name}</a>)}</nav><button onClick={() => navigate('/login')}>登录 / 注册</button></div></header>
    <div className="pud-location pud-wide"><span><EnvironmentFilled /> 浦东新区</span><form onSubmit={e => { e.preventDefault(); openAssistant(); }}><input aria-label="全站搜索" value={question} onChange={e => setQuestion(e.target.value)} /><button aria-label="搜索"><SearchOutlined /></button></form><img src="/pudong/spirit.png" alt="上海城市精神 海纳百川 追求卓越 开明睿智 大气谦和" /></div>
    <section className="pud-hero">
      <video autoPlay muted loop playsInline aria-hidden="true"><source src="/pudong/hero.mp4" type="video/mp4" /></video><div className="pud-shade" />
      <div className="pud-platform-nav"><div className="pud-wide"><img src="/pudong/platform.svg" alt="浦易达 浦东新区惠企政策服务平台" /><nav aria-label="平台导航"><a className="active" href="/website/pud">首页</a>{sections.map(name => <a key={name} href={name === '政策直达' ? '/website/pud/policyretrieval' : `#${name}`}>{name}</a>)}</nav></div></div>
      <div className="pud-hero-content"><img className="pud-hero-logo" src="/pudong/hero-logo.svg" alt="浦易达 浦东新区惠企政策服务平台 更易获得·更易理解·更易享受" /><div className="pud-search-panel"><form className="pud-question" onSubmit={e => { e.preventDefault(); openAssistant(); }}><textarea ref={questionRef} aria-label="向招小慧提问" readOnly={listening} placeholder="向招小慧提问，描述您的业务需求" value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); openAssistant(); } }} /><div className="pud-question-toolbar"><button className="pud-assistant-pill" type="button" onClick={() => openAssistant()}><AssistantSpark /><strong>招小慧</strong><span className="pud-pill-divider" aria-hidden="true" /><span className="pud-pill-caption">智能助手</span><ArrowRightOutlined className="pud-pill-arrow" /></button><div className="pud-input-actions"><button type="button" className={`pud-voice-button${listening ? ' is-listening' : ''}`} aria-label={listening ? '停止语音输入' : '开始语音输入'} aria-pressed={listening} title={listening ? '点击结束录音' : '语音输入'} onClick={toggleVoice}>{listening ? <StopOutlined /> : <AudioOutlined />}</button><button className="pud-search-submit" aria-label="发送给招小慧" disabled={listening}><SearchOutlined /></button></div></div><div className="pud-scene-tags" aria-label="对话场景">{governmentScenarios.map((scene, index) => <button type="button" key={scene.key} disabled={listening} onClick={() => { stopVoice(); navigate('/website/pud/policyAI', { state: { portalScene: scene.key, fromPortal: true } }); }}><SceneIcon index={index} /><span>{scene.label}</span></button>)}</div></form><div className="pud-hot"><span>热门搜索：</span><div>{hotWords.map(word => <button key={word} onClick={() => openAssistant(`请介绍浦东新区${word}的政策和申报条件`)}>• &nbsp;{word}</button>)}</div></div></div></div>
    </section>
    <section className="pud-recommend pud-wide" id="企业空间"><div className="pud-section-title"><h2>智能推荐</h2><span>完善企业信息，匹配度更精准！ <button onClick={() => openAssistant('我想完善企业信息，进行政策匹配')}>立即前往</button></span></div><div className="pud-match"><RiseOutlined /><div><h3>浦易达帮您测一测：企业政策适配情况</h3><p>浦易达已按专项类别集浦东新区现行有效期内的惠企政策，完善企业信息后，即可快速预估您的企业在浦东可获得的政策支持力度。您可补充联系方式与实际经营地址，便于后续政策匹配和政策服务对接。</p><div><button onClick={() => openAssistant('帮我匹配浦东新区适合企业申报的惠企政策')}>◎ 测一测</button><button onClick={() => openAssistant('我想完善企业信息，进行政策匹配')}>完善企业信息 →</button><button onClick={() => openAssistant('查看浦东惠企政策清单')}>查看浦东政策清单 →</button></div></div></div></section>
    <section className="pud-services pud-wide">{sections.slice(0,4).map((name,i) => <article id={name} key={name}><h2>{name}</h2><p>{['精准找政策，惠企服务一键触达','读懂政策要点，明晰适用条件','了解申报流程，掌握办理要点','政策匹配、空间选址、项目研判'][i]}</p><button onClick={() => i === 0 ? navigate('/website/pud/policyretrieval') : openAssistant(['帮我查找浦东新区惠企政策','请帮我解读浦东高新技术企业相关政策','请介绍政策申报的流程和材料','我想了解招商服务和企业选址'][i])}>让招小慧帮我 <ArrowRightOutlined /></button></article>)}</section>
    <footer className="pud-footer">浦易达 · 浦东新区惠企政策服务平台 <span>招小慧为您提供智能服务</span><a href="/app/home/overview">AI 独立入口 →</a><p>官网适配演示 · 政策及办理要求以主管部门正式发布为准</p></footer>
    <aside className="pud-float" aria-label="快捷服务"><button className="pud-float-ai" onClick={() => openAssistant('')}><span className="pud-float-orb"><AssistantSpark large /></span><strong>招小慧</strong><span className="pud-float-caption">智能咨询 <ArrowRightOutlined /></span></button><button className="pud-progress" onClick={() => openAssistant('我想查询政策申报进度')}><FileSearchOutlined /><span>申报进度</span></button></aside>
  </main>;
}
