import { useEffect, useState } from 'react';
import { Button, Empty, Input, Modal, Popconfirm, Space, Table, Tabs, Tag, Typography, message } from 'antd';
import { FileTextOutlined, ReadOutlined, SearchOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../../hooks/useAuth';
import { publicKnowledgeFiles, readPersonalFiles, writePersonalFiles, type KnowledgeFile } from './knowledgeFiles';
const categories = ['全部', '我的文件', '政策服务', '空间服务', '企业服务', '产业服务'];
export default function KnowledgeCenter({ onAsk }: { onAsk: (prompt: string) => void }) {
  const { currentUser } = useAuth();
  const userId = currentUser?.id;
  const [personal, setPersonal] = useState<KnowledgeFile[]>([]);
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('全部');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<KnowledgeFile | null>(null);
  useEffect(() => { const refresh = () => { setPersonal(userId ? readPersonalFiles(userId) : []); setSelected(null); }; refresh(); window.addEventListener('knowledge-files-updated', refresh); window.addEventListener('storage', refresh); return () => { window.removeEventListener('knowledge-files-updated', refresh); window.removeEventListener('storage', refresh); }; }, [userId]);
  const all = [...publicKnowledgeFiles, ...personal].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  const filtered = all.filter(f => (category === '全部' || f.category === category) && `${f.title} ${f.publisher} ${f.content}`.toLowerCase().includes(keyword.trim().toLowerCase()));
  const remove = (file: KnowledgeFile) => { if (!userId || !file.personal) return; try { writePersonalFiles(userId, readPersonalFiles(userId).filter(f => f.id !== file.id)); setPage(p => Math.min(p, Math.max(1, Math.ceil((filtered.length - 1) / 10)))); message.success('文件已删除'); } catch { message.error('删除失败，请重试'); } };
  return <section className="knowledge-center" data-testid="home-v1-middle-knowledge">
    <header className="knowledge-center-header">
      <Typography.Title level={4} style={{ margin: 0 }}><ReadOutlined /> 知识中心</Typography.Title>
      <Input className="knowledge-center-search" prefix={<SearchOutlined />} placeholder="搜索文件名、发布人或内容" aria-label="搜索知识" allowClear value={keyword} onChange={e => { setKeyword(e.target.value); setPage(1); }} />
    </header>
    <Tabs className="knowledge-center-tabs" activeKey={category} onChange={value => { setCategory(value); setPage(1); }} items={categories.map(value => ({ key: value, label: <span className="knowledge-center-tab-label">{value}<span className="knowledge-center-tab-count">{value === '全部' ? all.length : all.filter(f => f.category === value).length}</span></span> }))} />
    <Table<KnowledgeFile> rowKey="id" dataSource={filtered} size="middle" scroll={{ x: 780 }} pagination={{ current: page, pageSize: 10, onChange: setPage, showSizeChanger: false, hideOnSinglePage: false, showTotal: total => `共 ${total} 份` }} locale={{ emptyText: <Empty description={category === '我的文件' && !keyword ? '暂无文件，使用智能体生成的方案、测算表和研判报告将自动保存在这里' : '未找到相关文件'} /> }} columns={[
      { title: '文件名', dataIndex: 'title', render: (title, file) => <Space><FileTextOutlined style={{ color: '#3978e8' }} /><Button type="link" style={{ padding: 0, whiteSpace: 'normal', textAlign: 'left', height: 'auto' }} onClick={() => setSelected(file)}>{title}</Button></Space> },
      { title: '分类', dataIndex: 'category', width: 115, render: value => <Tag color={value === '我的文件' ? 'purple' : 'blue'}>{value}</Tag> },
      { title: '发布日期', dataIndex: 'date', width: 130, sorter: (a, b) => a.date.localeCompare(b.date) },
      { title: '发布人', dataIndex: 'publisher', width: 220 },
      { title: '操作', key: 'actions', width: 120, render: (_, file) => <Space><Button type="link" size="small" onClick={() => setSelected(file)}>查看</Button>{file.personal && <Popconfirm title="确认删除这份文件？" description="删除后无法恢复，请确认已保留需要的内容。" okText="删除" cancelText="取消" okButtonProps={{ danger: true }} onConfirm={() => remove(file)}><Button danger type="link" size="small">删除</Button></Popconfirm>}</Space> },
    ]} />
    <Modal title={selected?.title} open={!!selected} onCancel={() => setSelected(null)} width={860} footer={<Button type="primary" onClick={() => { if (selected) onAsk(`请基于《${selected.title}》协助我处理业务。以下是文件内容：\n${selected.content}`); setSelected(null); }}>基于此文件提问</Button>}><Typography.Paragraph type="secondary">{selected?.publisher} · {selected?.date} · {selected?.source}</Typography.Paragraph><div style={{ maxHeight: '60vh', overflowY: 'auto', lineHeight: 1.9 }}><ReactMarkdown>{selected?.content || ''}</ReactMarkdown></div></Modal>
  </section>;
}
