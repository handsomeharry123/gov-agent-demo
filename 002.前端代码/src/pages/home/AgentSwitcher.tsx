import { useState } from 'react';
import { Modal } from 'antd';
import { AppstoreOutlined, BankOutlined, CheckOutlined, DownOutlined, EnvironmentOutlined, FileTextOutlined, PartitionOutlined } from '@ant-design/icons';

export const agents = [
  { key: 'general', name: '综合智能体', short: '招小慧', description: '政策 · 空间 · 产业 · 招引 · 研判 · 决策，一句话就能办', icon: <AppstoreOutlined />, color: '#bf5e73', scene: null },
  { key: 'space', name: '空间智能体', short: '空间智能体', description: '入驻匹配、载体选址与楼宇空间分析', icon: <EnvironmentOutlined />, color: '#5e8e86', scene: 'gov-space' },
  { key: 'policy', name: '政策智能体', short: '政策智能体', description: '政策匹配、奖补测算与申报材料清单', icon: <FileTextOutlined />, color: '#ad8956', scene: 'gov-policy' },
  { key: 'industry', name: '产业智能体', short: '产业智能体', description: '产业链分析、缺口识别与强链补链建议', icon: <PartitionOutlined />, color: '#7384ad', scene: null },
  { key: 'enterprise', name: '企业智能体', short: '企业智能体', description: '企业画像、项目尽调与投资价值研判', icon: <BankOutlined />, color: '#8d7aa3', scene: 'gov-review' },
] as const;
export type AgentKey = typeof agents[number]['key'];
export default function AgentSwitcher({ value, onChange, compact = false }: { value: AgentKey; onChange: (key: AgentKey) => void; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const active = agents.find(a => a.key === value)!;
  return <>
    <button className={`agent-switch-trigger ${compact ? 'is-compact' : ''}`} onClick={()=>setOpen(true)} aria-label={`当前${active.name}，切换智能体`} aria-haspopup="dialog">
      <span className="agent-switch-title">{compact ? active.short : `${active.short}${value==='general'?' · 综合智能体':''}`}</span><DownOutlined />
    </button>
    <Modal title="选择智能体" open={open} onCancel={()=>setOpen(false)} footer={null} width={460} centered wrapClassName="agent-switch-modal">
      <p className="agent-switch-intro">综合处理招商事务，或选择专业智能体深入分析。</p>
      <div className="agent-switch-options">{agents.map(a=><button key={a.key} className="agent-switch-option" aria-pressed={value===a.key} onClick={()=>{onChange(a.key);setOpen(false);}}>
        <span className="agent-switch-icon" style={{color:a.color,background:`${a.color}13`}}>{a.icon}</span>
        <span className="agent-switch-copy"><strong>{a.name}{a.key==='general' && <small>默认</small>}</strong><span>{a.description}</span></span>
        {value===a.key && <CheckOutlined className="agent-switch-check"/>}
      </button>)}</div>
      <p className="agent-switch-note">切换后保留各智能体的当前对话，可随时切回继续。</p>
    </Modal>
  </>;
}
