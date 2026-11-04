import { useEffect, useState } from 'react';
import { Button, Dropdown, Input, Space } from 'antd';
import { CheckOutlined, LoadingOutlined, DownOutlined, EnvironmentOutlined, FileSearchOutlined, DownloadOutlined, MoreOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';

export const governmentScenarios = [
  { key: 'gov-space', label: '空间智能匹配', welcome: '您好！我是招商 AI 助手。请告诉我企业的行业类型、所需面积、人员规模，以及层高、独立门头、配电等特殊要求，我将匹配入驻空间和政策支持。', example: '有家做新能源汽车零部件的企业，想在浦东设华东研发中心，需要独立整层约 2000㎡，员工 80 人左右，对层高没有特殊要求。', steps: ['读取企业库 — 新能源汽车 · 零部件研发，浦东重点支持产业', '检索政策库 — 市级／区级／张江园区共命中 7 条', '筛选空间库 — 约 2000㎡整层空间共 23 处，核验硬约束', '综合评分排序 — 生成 Top 3 空间与政策清单'], actions: ['查看地图', '查看第一个空间楼层详情', '导出空间匹配方案'] },
  { key: 'gov-plan', label: '招商方案生成', welcome: '您好！请提供企业名称或所属行业、拟投资规模、用地／用房需求。我将生成产业契合分析、空间推荐、政策包测算和风险提示，形成可编辑的一企一策方案。', example: '苏州有家做精密结构件的企业，想在长三角扩产，投资规模 1.5 亿，需要单层厂房约 2 万㎡，员工 300 人。帮我生成一份招商方案。', steps: ['调用企业库与产业链图谱，定位电池结构件环节', '本地缺口分析 — 电池结构件仅 2 家；符合硬约束厂房 4 处', '三级政策测算 — 3 年综合奖补约 1860 万元', '扫描合规、市场与竞争风险，生成一企一策'], actions: ['生成方案 A 申报材料清单', '编辑招商方案', '导出招商方案'] },
  { key: 'gov-policy', label: '政策精准测算', welcome: '您好！请告诉我企业所属行业、注册地、规模（营收／员工数）和已有资质认定。我将匹配三级政策，测算奖补金额，并列出申报材料与叠加条件。', example: '我们是高新技术企业，去年营收 5000 万，研发投入 800 万，注册在张江园区。能享受哪些政策？大概能拿多少钱？', steps: ['读取企业画像，核验注册地与资质', '遍历市级 42 条、区级 67 条、园区 23 条政策', '匹配 11 条政策，核验叠加规则与上限', '生成测算表、来源与材料清单'], actions: ['生成申报材料清单', '如果注册地改到临港，政策有什么变化？', '导出政策测算表'] },
  { key: 'gov-review', label: '项目快速研判', welcome: '您好！请提供企业名称（或所属行业）、拟投资规模和主要业务方向。我将展示尽调步骤，形成产业契合度、效益测算和风险等级的一页纸研判卡。', example: '刚收到一个项目意向，做半导体封测的，计划投资 3 亿，明天要给领导汇报。能帮我快速出一份研判卡吗？', steps: ['查询企业工商信息', '查询股权结构与实控人', '检索近 5 年专利与招投标记录', '扫描涉诉与失信记录', '匹配本地产业链缺口，生成一页纸研判卡'], actions: ['查看研判依据', '导出 PDF 研判卡'] },
] as const;
export type GovernmentSceneKey = typeof governmentScenarios[number]['key'];
export const isGovernmentScene = (key: string): key is GovernmentSceneKey => governmentScenarios.some(s => s.key === key);

type GovernmentSource = { id: string; name: string; href: string };
const sourcesByScene: Record<GovernmentSceneKey, GovernmentSource[]> = {
  'gov-space': [
    {"id": "S1", "name": "浦东新能源汽车零部件产业链企业名录_2026年10月.txt", "href": "/reference-materials/浦东新能源汽车零部件产业链企业名录_2026年10月.txt"},
    {"id": "S2", "name": "浦东重点园区可租空间台账_2026年10月.csv", "href": "/reference-materials/浦东重点园区可租空间台账_2026年10月.csv"},
    {"id": "S3", "name": "浦东研发机构与人才安居政策申报指引_2026年度.txt", "href": "/reference-materials/浦东研发机构与人才安居政策申报指引_2026年度.txt"},
    {"id": "S4", "name": "新能源汽车研发中心选址综合评分表_20261104.csv", "href": "/reference-materials/新能源汽车研发中心选址综合评分表_20261104.csv"},
  ],
  'gov-plan': [
    {"id": "S1", "name": "浦东新能源汽车零部件产业链企业名录_2026年10月.txt", "href": "/reference-materials/浦东新能源汽车零部件产业链企业名录_2026年10月.txt"},
    {"id": "S2", "name": "浦东重点园区可租空间台账_2026年10月.csv", "href": "/reference-materials/浦东重点园区可租空间台账_2026年10月.csv"},
    {"id": "S3", "name": "精密结构件扩产项目政策适用清单_20261104.txt", "href": "/reference-materials/精密结构件扩产项目政策适用清单_20261104.txt"},
    {"id": "S4", "name": "精密结构件项目三年奖补测算底稿_20261104.txt", "href": "/reference-materials/精密结构件项目三年奖补测算底稿_20261104.txt"},
  ],
  'gov-policy': [
    {"id": "S1", "name": "张江高新技术企业政策匹配信息表_20261104.txt", "href": "/reference-materials/张江高新技术企业政策匹配信息表_20261104.txt"},
    {"id": "S2", "name": "浦东重点园区可租空间台账_2026年10月.csv", "href": "/reference-materials/浦东重点园区可租空间台账_2026年10月.csv"},
    {"id": "S3", "name": "浦东研发机构与人才安居政策申报指引_2026年度.txt", "href": "/reference-materials/浦东研发机构与人才安居政策申报指引_2026年度.txt"},
    {"id": "S4", "name": "张江高新技术企业奖补测算明细_20261104.csv", "href": "/reference-materials/张江高新技术企业奖补测算明细_20261104.csv"},
  ],
  'gov-review': [
    {"id": "S1", "name": "半导体封测项目初步尽调记录_20261104.txt", "href": "/reference-materials/半导体封测项目初步尽调记录_20261104.txt"},
    {"id": "S2", "name": "浦东重点园区可租空间台账_2026年10月.csv", "href": "/reference-materials/浦东重点园区可租空间台账_2026年10月.csv"},
    {"id": "S3", "name": "浦东集成电路封测产业链分析简报_2026年10月.txt", "href": "/reference-materials/浦东集成电路封测产业链分析简报_2026年10月.txt"},
    {"id": "S4", "name": "半导体封测项目投资效益测算表_20261104.csv", "href": "/reference-materials/半导体封测项目投资效益测算表_20261104.csv"},
  ],
};

const table = (heads: string[], rows: string[][]) => `\n\n| ${heads.join(' | ')} |\n| ${heads.map(() => '---').join(' | ')} |\n${rows.map(r => `| ${r.join(' | ')} |`).join('\n')}\n`;
export function governmentReply(key: GovernmentSceneKey, question: string) {
  if ((key === 'gov-plan' || key === 'gov-policy') && /材料/.test(question)) return `### 政策申报材料清单（11 项）\n适用范围：${key === 'gov-plan' ? '方案 A／临港项目' : '当前企业政策匹配'}。[S3]\n\n${['营业执照副本（盖章）', '近三年审计报告；不足三年提供现有年度', '项目投资计划与资金证明', '项目备案或核准文件', '场地租赁合同及产权证明', '设备采购合同、发票与付款凭证', '研发费用专项台账与辅助账', '高新技术／专精特新等资质证明', '人才劳动合同、社保与住房证明', '纳税及信用记录', '申报表、真实性承诺及不重复享受补贴说明'].map((s,i) => `${i+1}. ${s}`).join('\n')}\n\n材料要求为申报指引汇总，各政策应分别核对正式申报通知；不表示每项政策均要求全部材料。[S3]`;
  if (key === 'gov-review' && /依据/.test(question)) return '### 研判依据与取证清单\n1. 工商、股权与实控人：国家企业信用信息公示系统。[S1]\n2. 专利：知识产权局专利库，初步记录近三年 42 项。[S1]\n3. 产业链：本地封测覆盖率 23%，简报更新于 2026-10。[S3]\n4. 效益：年产值 8 亿元、税收 6000 万元、就业 350 人；奖补 2400 万元为初步测算。[S4]\n\n企业全称尚未提供，以上为项目初步记录；补充企业信息后可开展正式核验。';
  if (key === 'gov-space' && /楼层|详情|第一个/.test(question)) return '### 张江科学城 A 座 · 8 楼\n- 建筑面积：2100㎡；实用率约75%。[S2]\n- 精装交付、中央空调。[S2]\n- 配电200kVA，可扩容至400kVA（待园区确认）。[S2]\n- 车位21个，配比1:100㎡。[S2]\n- 食堂、人才公寓步行约5分钟。[S2]\n- 独立整层满足当前需求；承重、消防及实时空置状态待核验。[S2]';
  if (key === 'gov-policy' && /临港|注册地|对比/.test(question)) return '### 张江园区与临港新片区对比'+table(['维度','张江','临港','适用条件／变化'], [['所得税','符合资质时15%','不提供有效税率','适用税率需核验产业目录与资质 [S3]'],['研发补贴上限','80万元','120万元','须满足正式申报条件 [S3]'],['一次性落地补贴','50万元','80万元','注册迁移、实质经营及重复补助限制待核验 [S3]'],['人才住房','一般配套','专项人才公寓','需人才资格审核 [S2][S3]'],['通勤','地铁直达','距市区约75km','需结合居住地测算 [S2]']])+'\n建议先核验产业目录与实质经营要求，再比较迁移成本。仅调整注册地，不能直接推导实际奖补或税率。[S3][S4]';
  if (key === 'gov-space') return '### 空间推荐与政策匹配\n企业画像：新能源汽车零部件研发／浦东华东研发中心／约2000㎡独立整层／约80人。[S1]\n\n空间库初筛23处、政策库命中7条；综合评分后为您推荐以下 Top 3 空间。[S2][S3]'+table(['排序／空间','楼层／面积','参考租金','适配说明'],[['1 · 张江科学城 A 座','8F／2100㎡','5.2元/㎡/天','独立整层、同类企业集聚 [S2]'],['2 · 金桥产业园3号楼','5F／1980㎡','4.8元/㎡/天','配套完善、地铁约500米 [S2]'],['3 · 外高桥科创园B栋','3F／2050㎡','4.5元/㎡/天','参考租金最低，综合成本较优 [S2][S3]']])+'\n### 政策清单（7条中展示2条）\n- 研发机构落地补贴：最高80万元，需核验资质、投资及落地条件。来源：《浦东研发机构与人才安居政策申报指引》“研发机构落地支持”。[S3]\n- 人才安居补贴：每人每月最高2000元，人才资格及叠加条件待审核。来源：《浦东研发机构与人才安居政策申报指引》“人才安居支持”。[S3]\n\n建议优先核验张江A座。未提供的层高、承重、消防证明与实时配电余量列为待确认项，推荐不等于通过准入。[S2][S4]';
  if (key === 'gov-plan') return '### 精密结构件项目 · 一企一策招商方案（草稿）\n企业画像：苏州精密结构件企业／投资1.5亿元／单层约2万㎡／300人。[S1]\n\n#### 一、产业契合\n契合度92分，强链优先；本地电池结构件企业2家，当前缺口率76%，预计带动产值约8亿元。评分及带动效应为初评结果，需项目尽调复核。[S1][S4]\n\n#### 二、空间方案'+table(['方案／载体','面积／层高','承重／配电','月租'],[['A 推荐 · 临港重装备产业区1号厂房','21000㎡／12m','5t/㎡／3000kVA','18万元 [S2]'],['B · 金桥标准厂房C区','19500㎡／10m','3t/㎡／2500kVA','15万元 [S2]'],['C · 外高桥加工厂','20500㎡／11m','4t/㎡／2800kVA','16万元 [S2]']])+'\n#### 三、三级政策包\n- 市级设备投资补贴：符合条件的设备投资额×8%，上限500万元。[S3]\n- 区级租金补贴：前三年50%，第四至五年30%，资格与重复补助规则待确认。[S3]\n- 园区人才住房：管理岗每月最高3000元，人数及年限待核验。[S3]\n- 三年奖补约1860万元为初步测算金额；设备投资基数、人才人数等参数缺失，暂不可复算，不直接将总投资作为设备投资。[S4]\n\n#### 四、风险与推进建议\n方案B排污指标余量不足（待园区确认），提前协调环保主管部门；关注嘉兴、宁波竞争政策。优先开展A方案现场踏勘、政策适用性核验及投资协议审查。[S2][S3][S4]';
  if (key === 'gov-policy') return '### 政策精准匹配与测算\n企业画像：高新技术企业／张江注册／营收5000万元／研发投入800万元；行业及员工数尚待补充。[S1]\n\n遍历市级42条、区级67条、园区23条共132条，命中11条，其中3条在满足条件时可叠加（适用条件待逐项核验）。[S3]'+table(['政策','测算／金额','窗口','来源'],[['研发费用补贴','800万元×10%=80万元','每年3月，以通知为准','研发费用支持申报指引 [S3]'],['张江园区落地补贴','一次性50万元','入驻满1年后','园区落地支持申报指引 [S3]'],['人才安居补贴','最高2000元/人/月；人数待补','滚动申报','人才安居支持申报指引 [S3]']])+'\n综合初估：约210–280万元／年，含未展开政策。一次性50万元应单列，不能当作每年重复收益；人才人数等缺失，当前只可复算研发补贴80万元。[S4]\n\n叠加原则：同一支出避免重复补助，分别核验适用对象、资金上限、入驻年限和当年通知。实际金额以主管部门审核为准。[S3]';
  return '### 半导体封测项目 · 一页纸研判卡\n项目：拟投资3亿元的半导体封测项目。企业名称尚未提供，尽调信息为初步线索，待核验。[S1]\n\n**产业契合度：88分｜建议：优先跟进** [S1][S4]'+table(['维度','结论／依据'],[['产业链','本地封测覆盖率23%，存在补链机会 [S3]'],['企业资质','资质线索为国家级专精特新，近3年专利42项；不能视为目标企业真实资质 [S1]'],['效益预估','年产值8亿元／年税收6000万元／新增就业350人，需财务及产能模型验证 [S4]'],['空间适配','调用空间库开展厂房、承重、配电筛选，具体载体待补充参数 [S2]'],['风险','初评低风险；实际工商、股权、涉诉、履约及市场风险均待核验 [S1]'],['政策','三年综合奖补约2400万元为初步估值，需逐项适用性审核 [S3][S4]']])+'\n建议下一步：补充企业全称、产能计划、资金来源及用房参数后开展正式尽调。取证渠道包括国家企业信用信息公示系统、知识产权局专利库及本地产业链图谱（更新于2026-10，企业信息待核验）。[S1]';
}

export function GovernmentEvidence({ scene, content, onSkill }: { scene: GovernmentSceneKey; content: string; onSkill: () => void }) {
  const config = governmentScenarios.find(s => s.key === scene)!;
  const sources = sourcesByScene[scene];
  const [step, setStep] = useState(0);
  const [expanded, setExpanded] = useState(true);
  const ready = step === config.steps.length;
  const [mapOpen, setMapOpen] = useState(false);
  const [selected, setSelected] = useState(0);
  const [detailOpen, setDetailOpen] = useState(false);
  const [edit, setEdit] = useState(false);
  const [draft, setDraft] = useState(content);
  useEffect(() => { setStep(0); setExpanded(true); setDraft(content); const timer = window.setInterval(() => setStep(v => { if (v + 1 >= config.steps.length) window.clearInterval(timer); return Math.min(v + 1, config.steps.length); }), 850); return () => clearInterval(timer); }, [scene, content, config.steps.length]);
  useEffect(() => { if (ready) setExpanded(false); }, [ready]);
  const download = () => { const url = URL.createObjectURL(new Blob([draft], {type:'text/markdown;charset=utf-8'})); const a=document.createElement('a'); a.href=url; a.download=`${config.label}-方案.md`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); };
  const print = () => { const w=window.open('', '_blank'); if (!w) return; const pre=w.document.createElement('pre'); pre.textContent=draft; pre.style.cssText='white-space:pre-wrap;font:14px/1.8 sans-serif;padding:24px'; w.document.title=config.label+''; w.document.body.append(pre); w.print(); };
  return <div className="gov-evidence" data-ready={step === config.steps.length}>
    <div className="gov-progress" aria-busy={!ready}>
      <button className="gov-progress-toggle" onClick={() => setExpanded(v => !v)} aria-expanded={expanded}>
        <span className={ready ? 'gov-status done' : 'gov-status'}>{ready ? <CheckOutlined /> : <LoadingOutlined spin />}</span>
        <span className="gov-progress-label"><strong>{ready ? '分析已完成' : '正在分析您的需求'}<span className="gov-thinking-dots" hidden={ready}>···</span></strong><small aria-live="polite">{ready ? `已完成 ${config.steps.length} 个处理步骤` : config.steps[step]?.split(' — ')[0]}</small></span>
        <span className="gov-progress-count">{step}/{config.steps.length}</span><DownOutlined rotate={expanded ? 180 : 0} />
      </button>
      {expanded && <ol className="gov-step-list">{config.steps.map((s,i) => <li key={s} className={i < step ? 'complete' : i === step ? 'active' : 'pending'}><span className="gov-step-icon">{i < step ? <CheckOutlined /> : i === step ? <LoadingOutlined spin /> : i + 1}</span><span>{s}</span></li>)}</ol>}
    </div>
    {ready && <div className="gov-answer"><GovernmentContent content={draft} />
      <div className="gov-answer-actions">
        <Space wrap size={8}>
          {scene === 'gov-space' && <><Button type="primary" icon={<FileSearchOutlined />} onClick={() => setDetailOpen(v => !v)} aria-expanded={detailOpen}>{detailOpen ? '收起楼层详情' : '查看推荐空间详情'}</Button><Button icon={<EnvironmentOutlined />} onClick={() => setMapOpen(v => !v)} aria-expanded={mapOpen}>{mapOpen ? '收起地图' : '查看地图'}</Button></>}
          {scene === 'gov-plan' && <Button type="primary" onClick={() => setEdit(v => !v)}>{edit ? '收起编辑' : '编辑招商方案'}</Button>}
        </Space>
        <Space size={8}><Dropdown menu={{ items: [{key:'md', label:'导出 Markdown', onClick:download}, {key:'pdf', label:'打印 / 另存为 PDF', onClick:print}] }} trigger={['click']}><Button icon={<DownloadOutlined />}>导出结果 <DownOutlined /></Button></Dropdown><Dropdown menu={{items:[{key:'skill',label:'技能中心',onClick:onSkill}]}} trigger={['click']}><Button aria-label="更多操作" icon={<MoreOutlined />} /></Dropdown></Space>
      </div>
      <details className="gov-sources" open><summary>引用材料 <span>{sources.length} 份材料</span></summary><ul className="gov-source-list">{sources.map(s => <li key={s.id}><span className="gov-source-id">{s.id}</span><a href={s.href} target="_blank" rel="noopener noreferrer">{s.name}</a><a className="gov-source-open" href={s.href} target="_blank" rel="noopener noreferrer" aria-label={`打开${s.name}`}>查看材料 ↗</a></li>)}</ul></details>
    </div>}
    {detailOpen && <div className="gov-space-detail"><GovernmentContent content={governmentReply('gov-space', '第一个空间楼层详情')} /><small>来源：园区空间库 · 台账更新时间 2026-10-28 [S2]</small></div>}
    {edit && <div><Input.TextArea value={draft} onChange={e=>setDraft(e.target.value)} rows={10}/><Button onClick={()=>setEdit(false)}>保存修改</Button><p>修改保存在当前卡片，导出采用修改后的内容。</p></div>}
    {mapOpen && <div className="gov-space-map"><p>浦东空间选址示意图 · 非导航地图／点位非精确坐标</p><svg viewBox="0 0 360 190" role="img" aria-label="张江、金桥、外高桥空间点位示意"><rect width="360" height="190" rx="12" fill="#f0f6f5"/><path d="M25 0 Q110 90 45 190" stroke="#bbdce6" strokeWidth="24" fill="none"/><path d="M100 0L280 190M80 120L360 60M160 0L160 190" stroke="white" strokeWidth="8"/>{[['张江科学城 A 座',220,144],['金桥产业园3号楼',190,83],['外高桥科创园B栋',255,32]].map(([label,x,y],i)=><g key={label} onClick={()=>setSelected(i)} role="button" tabIndex={0} onKeyDown={e=>{if(e.key==='Enter'||e.key===' ')setSelected(i);}} aria-label={`选择${label}`} style={{cursor:'pointer'}}><circle cx={x} cy={y} r={selected===i?10:7} fill={selected===i?'#c85d73':'#719d93'}/><text x={Number(x)+13} y={Number(y)+4} fontSize="10" fill="#344054">{label}</text></g>)}</svg><p>{['张江 A 座 · 8F · 2100㎡ · 5.2元/㎡/天','金桥3号楼 · 5F · 1980㎡ · 4.8元/㎡/天','外高桥B栋 · 3F · 2050㎡ · 4.5元/㎡/天'][selected]} [S2]</p></div>}
  </div>;
}


/** Render the scenario tables without introducing a markdown parser dependency. */
export function GovernmentContent({ content }: { content: string }) {
  const sections = content.split(/(\n?\|[^\n]+\|\n\|(?:[ :|-]+)\|\n(?:\|[^\n]+\|\n?)+)/g);
  return <div className="gov-content">{sections.map((part, index) => {
    if (!/^\n?\|/.test(part)) return <ReactMarkdown key={index}>{part}</ReactMarkdown>;
    const rows = part.trim().split('\n').map(row => row.trim().slice(1, -1).split('|').map(cell => cell.trim()));
    return <div key={index} style={{overflowX:'auto', margin:'12px 0'}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}><thead><tr>{rows[0].map((cell,i)=><th key={i} style={{padding:10,textAlign:'left',background:'#eef5f3',borderBottom:'1px solid #dce8e3'}}>{cell}</th>)}</tr></thead><tbody>{rows.slice(2).map((row,i)=><tr key={i}>{row.map((cell,j)=><td key={j} style={{padding:10,borderBottom:'1px solid #edf0ee',verticalAlign:'top'}}>{cell}</td>)}</tr>)}</tbody></table></div>;
  })}</div>;
}
