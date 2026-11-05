export interface KnowledgeFile { id: string; title: string; category: string; date: string; publisher: string; content: string; source?: string; personal?: boolean }
const groups = [
  { category: '政策服务', publisher: '浦东新区企业服务中心', titles: ['高新技术企业认定申报材料准备指南', '研发费用加计扣除办理常见问题', '专精特新中小企业申报条件核验清单', '科技型中小企业评价入库操作指南', '张江园区企业政策匹配工作指引', '企业技术改造项目申报材料清单', '人才安居政策咨询与材料准备指南', '市区两级财政扶持重复申报核验指引', '集成电路企业政策适配服务手册', '生物医药研发项目政策咨询问答', '临港新片区企业政策服务办事指引', '年度惠企政策申报日历编制说明'] },
  { category: '空间服务', publisher: '浦东产业空间服务专班', titles: ['张江科学城研发办公载体资源清单', '金桥产业园标准厂房选址服务指南', '外高桥保税区域仓储空间需求采集表', '临港装备制造厂房入驻核验清单', '新能源汽车研发中心选址需求模板', '生物医药中试载体准入咨询指南', '集成电路洁净厂房配套条件核查表', '产业用房层高承重与配电踏勘记录表', '产业园区租赁意向与合同材料清单', '企业跨区搬迁与入驻服务流程', '存量厂房更新改造需求对接指南', '楼宇整层租赁现场踏勘工作手册'] },
  { category: '企业服务', publisher: '浦东新区投资促进服务中心', titles: ['一企一策招商服务方案编制指南', '投资项目初次接洽信息采集表', '企业工商股权与信用信息核验指引', '重点投资项目落地全流程服务手册', '招商项目尽职调查资料清单', '企业开办与迁入事项办理指南', '项目投资协议商务条款核验清单', '重点企业走访与诉求办理记录模板', '企业融资需求对接服务指南', '投资项目投产前手续核查清单', '外商投资企业设立咨询服务手册', '月度招商项目推进情况汇总模板'] },
  { category: '产业服务', publisher: '浦东新区产业研究服务团队', titles: ['新能源汽车零部件产业链分析简报', '集成电路设计与封测补链研究参考', '生物医药创新研发产业图谱说明', '人工智能产业重点应用场景梳理', '人形机器人核心零部件招商研究', '航空航天配套产业链企业画像模板', '高端装备制造产业项目研判指标', '新材料产业技术路线与招商方向参考', '产业链龙头与潜在配套企业筛选指引', '数字经济产业集群发展观察简报', '绿色低碳产业项目评价参考手册', '产业链缺口识别与招商线索核验指南'] },
];
export const publicKnowledgeFiles: KnowledgeFile[] = groups.flatMap((group, g) => group.titles.map((title, i) => ({ id: `public-${g}-${i}`, title: `${title}.${i % 4 === 1 ? 'xlsx' : 'pdf'}`, category: group.category, publisher: group.publisher, date: `2026-${i < 5 ? '11' : '10'}-${String(i < 5 ? 5 - i : 31 - i).padStart(2, '0')}`, source: '业务资料库 · 演示资料', content: `# ${title}\n\n> 本文件为业务演示资料，不属于主管部门正式发布文件。\n\n## 一、适用场景\n面向浦东新区招商与企业服务工作，供${group.category}咨询、资料准备及项目对接参考。\n\n## 二、业务办理要点\n1. 明确企业全称、注册区域、所属行业及项目联系人。\n2. 核验项目投资规模、实施进度、空间需求和已取得的资质。\n3. 对照${title}逐项整理资料，标明信息来源、更新时间和待补事项。\n4. 涉及申报条件、资金金额、载体可用性及审批要求的内容，由对应主管部门或园区复核。\n\n## 三、工作成果与后续跟进\n形成企业需求清单、条件核验记录和下一步推进计划。涉及工商、财务及联系人信息时，应按实际授权使用。\n\n维护单位：${group.publisher}\n资料性质：模拟业务参考资料` })));
const key = (userId: string) => `gov-knowledge-files-v1:${userId}`;
export function readPersonalFiles(userId: string): KnowledgeFile[] { try { const raw = localStorage.getItem(key(userId)); if (raw === null) return personalDemoFiles(); const data = JSON.parse(raw); return Array.isArray(data) ? data.filter(f => f && typeof f.id === 'string' && typeof f.content === 'string') : []; } catch { return []; } }
export function writePersonalFiles(userId: string, files: KnowledgeFile[]) { localStorage.setItem(key(userId), JSON.stringify(files)); window.dispatchEvent(new Event('knowledge-files-updated')); }
export function archiveGeneratedFile(userId: string, publisher: string, title: string, content: string) { const files = readPersonalFiles(userId); writePersonalFiles(userId, [{ id: `generated-${Date.now()}-${Math.random().toString(36).slice(2)}`, title: `${title}.md`, category: '我的文件', date: new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Shanghai' }), publisher, content, source: '智能体生成', personal: true }, ...files]); }

function personalDemoFiles(): KnowledgeFile[] {
  const titles = ['苏州精密结构件企业一企一策招商方案', '新能源汽车研发中心空间匹配方案', '张江高新技术企业政策测算表', '半导体封测项目初步研判卡', '本月招商项目推进情况汇总报告', '医疗器械中试厂房准入核验清单', '机器人核心零部件补链建议', '金桥存量厂房招商线索匹配清单', '集成电路设计企业申报材料清单', '外高桥仓储项目现场踏勘提纲', '生物医药研发中心选址对比报告', '重点企业走访问题与跟进计划'];
  return titles.map((title, i) => ({ id: `demo-personal-${i}`, title: `${title}.md`, category: '我的文件', date: `2026-${i < 5 ? '11' : '10'}-${String(i < 5 ? 5 - i : 31 - i).padStart(2, '0')}`, publisher: '我（智能体协助生成）', personal: true, source: '智能体生成 · 示例成果', content: `# ${title}

> 当前账号的演示成果，业务信息为模拟数据。

## 需求概述
围绕${title}，梳理企业需求、资源条件与实施路径。项目名称与经营信息需在正式对接时核验。

## 已梳理事项
- 企业画像：行业方向、投资计划与注册信息待企业确认。
- 空间需求：按面积、层高、承重、配电与交付时间比选。
- 政策适配：核验申报资质、支出范围、支持上限与重复补助要求。

## 下一步行动
1. 联系企业补齐资质、投资计划与用房参数。
2. 协调园区安排现场踏勘，形成条件核验记录。
3. 对接企业服务专员复核政策与办理路径。

本成果由智能体协助形成，供内部业务准备参考。` }));
}
