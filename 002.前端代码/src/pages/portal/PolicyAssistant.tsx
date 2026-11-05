import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Button, Modal, Tooltip } from 'antd';
import { EnvironmentFilled, MenuUnfoldOutlined, QuestionCircleOutlined, ExportOutlined } from '@ant-design/icons';
import HomePage from '../home';
import { WorkspaceSidebarContext } from '../../hooks/WorkspaceSidebarContext';
import AutoTaskForm from '../home/AutoTaskForm';
import AutoTaskTemplateList from '../home/AutoTaskTemplateList';
import './officialWebsite.css';
import './policyAssistant.css';

/** 官网外框与独立工作台共用 HomePage，所有业务交互在同一组件中维护。 */
export default function PolicyAssistant() {
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  useEffect(() => {
    const previous = document.title;
    document.title = '招小慧 · 浦易达智能助手';
    return () => { document.title = previous; };
  }, []);
  if (/\/(connector|auto-tasks)(\/|$)/.test(pathname)) return <Navigate to="/website/pud/policyAI" replace />;
  return <main className="pud-site policy-site">
    <header className="pud-gov-header"><div className="pud-wide">
      <a href="https://zwdt.sh.gov.cn/" target="_blank" rel="noreferrer"><img src="/pudong/gov-logo.png" alt="上海一网通办" /></a>
      <nav aria-label="上海政务导航">{['首页', '政务服务', '要闻动态', '政务公开', '政民互动', '走进上海'].map((label, i) => <a key={label} href={['https://www.shanghai.gov.cn/', 'https://zwdt.sh.gov.cn/', 'https://www.shanghai.gov.cn/nw4411/', 'https://www.shanghai.gov.cn/nw12344/', 'https://www.shanghai.gov.cn/nw12349/', 'https://www.shanghai.gov.cn/nw48081/'][i]} target="_blank" rel="noreferrer">{label}</a>)}</nav>
      <Link to="/login">登录 / 注册</Link>
    </div></header>
    <div className="pud-location pud-wide"><span><EnvironmentFilled /> 浦东新区</span><span className="policy-service-label">浦东新区惠企政策服务平台</span><img src="/pudong/spirit.png" alt="上海城市精神" /></div>
    <div className="pud-platform-nav policy-platform"><div className="pud-wide">
      <Link to="/website/pud"><img src="/pudong/platform.svg" alt="浦易达 浦东新区惠企政策服务平台" /></Link>
      <nav aria-label="平台导航">{['首页', '政策直达', '政策解读', '直播课堂', '服务直达', '企业空间'].map(label => <Link key={label} to={label === '政策直达' ? '/website/pud/policyretrieval' : `/website/pud${label === '首页' ? '' : `#${label}`}`}>{label}</Link>)}</nav>
      <Link className="policy-back" to="/website/pud">← 返回上级</Link>
    </div></div>
    <section className={`policy-assistant${collapsed ? ' is-sidebar-collapsed' : ''}`} aria-label="招小慧智能助手">
      <div className="policy-toolbar">
        <div className="policy-breadcrumb"><Link to="/website/pud">首页</Link><span>›</span><strong>招小慧 · 智能助手</strong></div>
        <div className="policy-toolbar-actions"><Link to="/app/home/overview" target="_blank" rel="noreferrer"><ExportOutlined /> <span>独立页面</span></Link><Button icon={<QuestionCircleOutlined />} onClick={() => setHelpOpen(true)}>常见问题</Button></div>
      </div>
      <WorkspaceSidebarContext.Provider value={() => setCollapsed(true)}>
      <div className="policy-workspace">
        {collapsed && <aside className="policy-sidebar-rail" aria-label="已收起的工作台"><Tooltip title="展开工作台侧栏" placement="right"><Button type="text" icon={<MenuUnfoldOutlined />} aria-label="展开工作台侧栏" onClick={() => setCollapsed(false)} /></Tooltip><span>工作台</span></aside>}{pathname.endsWith('/auto-tasks/new') ? <AutoTaskForm embedded /> : pathname.endsWith('/auto-tasks/templates') ? <AutoTaskTemplateList embedded /> : <HomePage embedded />}</div>
      </WorkspaceSidebarContext.Provider>
      <div className="policy-ai-note">内容由 AI 生成，请仔细甄别；政策及办理要求以主管部门正式发布为准</div>
    </section>
    <footer className="policy-footer"><div className="pud-wide"><strong>浦易达 · 浦东新区惠企政策服务平台</strong><span>政策咨询 · 企业服务 · 智能协同</span><Link to="/website/pud">返回官网首页</Link><Link to="/app/home/overview" target="_blank" rel="noreferrer">打开招小慧独立页面 ↗</Link></div></footer>
    <Modal title="招小慧使用帮助" open={helpOpen} onCancel={() => setHelpOpen(false)} footer={<Button type="primary" onClick={() => setHelpOpen(false)}>开始使用</Button>}>
      <h4>如何开始对话？</h4><p>在输入框描述需求，点击发送；也可以选择空间智能匹配、招商方案生成、政策精准测算或项目快速研判。</p>
      <h4>官网版有哪些功能？</h4><p>官网版与独立页面复用同一工作台，支持智能对话、技能中心、知识中心和历史会话。点击“新对话”开始新的对话。</p>
      <h4>如何使用独立页面？</h4><p>点击右上方“独立页面”在新标签页打开完整工作台，官网当前对话仍保留在本页。两页会话分别管理。</p>
    </Modal>
  </main>;
}
