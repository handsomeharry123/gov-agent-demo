import { useRef, useState } from 'react';
import { Button, Empty, Input, Modal, Popover, message } from 'antd';
import { CheckOutlined, DownOutlined, FolderOpenOutlined, FolderOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import './style.css';

type Workspace = { id: string; name: string; local?: boolean };
const STORAGE_KEY = 'gov-agent-workspaces-v1';
const initialWorkspaces: Workspace[] = [
  { id: 'investment', name: '产业招商项目' },
  { id: 'policy', name: '惠企政策服务' },
  { id: 'research', name: '企业走访与研判' },
];
function readSaved(): { items: Workspace[]; selected: string } {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (saved && Array.isArray(saved.items) && saved.items.every((item: Workspace) => typeof item.id === 'string' && typeof item.name === 'string')) {
      return { items: saved.items, selected: saved.items.some((item: Workspace) => item.id === saved.selected) ? saved.selected : '' };
    }
  } catch { /* Use the default spaces if browser storage is unavailable. */ }
  return { items: initialWorkspaces, selected: '' };
}

export default function WorkspacePicker() {
  const [saved, setSaved] = useState(readSaved);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const folderInput = useRef<HTMLInputElement>(null);
  const selected = saved.items.find(item => item.id === saved.selected);
  const update = (items: Workspace[], id: string) => {
    const next = { items, selected: id };
    setSaved(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { message.info('浏览器存储不可用，本次选择仅在当前页面保留'); }
    setOpen(false);
    setQuery('');
  };
  const create = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (saved.items.some(item => item.name === trimmed)) { message.warning('已存在同名工作空间'); return; }
    const item = { id: crypto.randomUUID(), name: trimmed };
    update([...saved.items, item], item.id);
    setCreating(false);
    setName('');
    message.success('工作空间已创建');
  };
  const content = <div className="workspace-menu">
    <Input autoFocus prefix={<SearchOutlined />} placeholder="搜索工作空间" value={query} onChange={event => setQuery(event.target.value)} allowClear aria-label="搜索工作空间" />
    <div className="workspace-list" role="group" aria-label="工作空间列表">
      {saved.items.filter(item => item.name.toLowerCase().includes(query.trim().toLowerCase())).map(item =>
        <button className={`workspace-option${saved.selected === item.id ? ' is-selected' : ''}`} key={item.id} onClick={() => update(saved.items, item.id)} aria-pressed={saved.selected === item.id}>
          <FolderOutlined /><span title={item.name}>{item.name}{item.local && <small>本地文件夹</small>}</span>{saved.selected === item.id && <CheckOutlined />}
        </button>)}
      {!saved.items.some(item => item.name.toLowerCase().includes(query.trim().toLowerCase())) && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="未找到工作空间" />}
    </div>
    <div className="workspace-menu-actions">
      <button onClick={() => { setOpen(false); setName(''); setCreating(true); }}><PlusOutlined />新建工作空间</button>
      <button onClick={() => folderInput.current?.click()}><FolderOpenOutlined />打开本地文件夹</button>
    </div>
  </div>;
  return <div className="workspace-bar">
    <Popover content={content} trigger="click" placement="topLeft" open={open} onOpenChange={value => { setOpen(value); if (!value) setQuery(''); }} overlayClassName="workspace-popover" overlayInnerStyle={{ padding: 12, borderRadius: 16 }}>
      <Button type="text" className="workspace-trigger" aria-label={selected ? `选择工作空间：${selected.name}` : '选择工作空间'} aria-expanded={open}>
        <FolderOpenOutlined /><span>{selected?.name || '选择工作空间'}</span><DownOutlined className={open ? 'is-open' : ''} />
      </Button>
    </Popover>
    <input ref={folderInput} type="file" style={{ display: 'none' }} {...{ webkitdirectory: '', directory: '' }} multiple onChange={event => {
      const files = event.target.files;
      if (!files?.length) return;
      const folderName = files[0].webkitRelativePath.split('/')[0];
      const existing = saved.items.find(item => item.local && item.name === folderName);
      const item = existing || { id: crypto.randomUUID(), name: folderName, local: true };
      update(existing ? saved.items : [...saved.items, item], item.id);
      message.success(`已选择文件夹「${folderName}」，文件未上传`);
      event.target.value = '';
    }} />
    <Modal title="新建工作空间" open={creating} onCancel={() => setCreating(false)} onOk={create} okText="创建并选择" cancelText="取消" okButtonProps={{ disabled: !name.trim() }} destroyOnClose>
      <label className="workspace-name-label" htmlFor="workspace-name">工作空间名称</label>
      <Input id="workspace-name" autoFocus placeholder="例如：张江园区招商项目" maxLength={40} showCount value={name} onChange={event => setName(event.target.value)} onPressEnter={create} />
      <p className="workspace-create-hint">为相关任务选择一个工作空间，便于区分不同项目。</p>
    </Modal>
  </div>;
}
