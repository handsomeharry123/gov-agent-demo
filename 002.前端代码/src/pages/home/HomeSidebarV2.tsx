import { investmentSessions, investmentHistories } from './investmentSessionMocks';
import { ReadOutlined } from '@ant-design/icons';
import { PUDONG_BLUE } from '../../theme/brand';
import { useWorkspaceNavigate } from '../../hooks/useWorkspaceNavigate';
/**
 * 招小慧智能体首页 V1.x · 第二层 · 首页内左侧管理栏
 *
 * PRD §1:自上而下 6 大区 —— 工具区 / 品牌区 / 工作台区 / 自动化任务执行区(称「自动化任务记录」) / 最近对话区(称「历史会话」) / 账户区。
 *
 * 设计要点:
 *   - 固定宽 280px,与右侧第三层 Card 等高(高度由 home/index.tsx 的 Row 高度约束)。
 *   - 不新建 store / Context,会话历史 mock 在本文件 export,被 home/index.tsx 引用(避免双源)。
 *   - 所有 data-testid 命名 home-v1-side-*,不影响 verify_home_v1.mjs 黑名单断言。
 *   - 文案避开黑名单:1.3 「新建任务」(≠「新建对话」)、1.4 「自动化任务记录」(≠「自动化任务执行」)、1.5 「历史会话」(≠「最近对话」)。
 */
import { useContext, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ApiOutlined,
  CaretDownOutlined,
  CaretRightOutlined,
  ClockCircleOutlined,
  CloseOutlined,
  LoadingOutlined,
  MenuFoldOutlined,
  PlusOutlined,
  SearchOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Input,
  Space,
  Tooltip,
  Typography,
} from 'antd';
import { governmentScenarios, governmentReply, type GovernmentSceneKey } from './governmentScenarios';
import AgentRobotIcon from '../agent-center/smart/AgentRobotIcon';
import { WorkspaceSidebarContext } from '../../hooks/WorkspaceSidebarContext';
import { toggleSiderCollapsed } from '../../hooks/useSiderCollapsed';

const { Text } = Typography;

/* =========================================================
 * 类型与本地 mock
 * ========================================================= */
export interface AutoTaskSubRun {
  /** 子任务命名规则:任务名称-yyyy-MM-dd-HH-mm-ss */
  id: string;
  /** 子任务展示名(同 name 字段) */
  name: string;
  /** 相对执行时间,例如「刚刚」「22 分钟前」 */
  updatedAt: string;
  /** 本次执行状态 */
  status: '成功' | '失败' | '部分失败';
  /** 本次执行是否启用,与父任务 enabled 同步(便于列表筛选) */
  enabled?: boolean;
  /** 下次执行相对时间,例如「约 24 小时后执行」「已暂停」 */
  nextRunIn?: string;
  /** 输出消息摘要,运行记录 Tab 使用 */
  summary?: string;
  /** 是否已归档；旧 mock 未提供时由相对执行时间兼容判断 */
  archived?: boolean;
  /** 侧栏尾部状态:生成中显示转圈,有新回复显示圆点,其余显示 updatedAt */
  activityStatus?: 'generating' | 'newReply';
}

export interface AutoTask {
  id: string;
  name: string;
  /** 是否启用(true → 目前分组;false → 暂停分组) */
  enabled: boolean;
  /** 触发频率描述,例如「每天 09:00」 */
  frequencyDesc: string;
  updatedAt: string;
  status: '成功' | '失败' | '部分失败';
  /** 一级任务下属子任务执行记录(按时间倒序) */
  runs: AutoTaskSubRun[];
}

export interface SessionEntry {
  id: string;
  title: string;
  updatedAt: string;
  /** 侧栏尾部状态:生成中显示转圈,有新回复显示圆点,其余显示 updatedAt */
  activityStatus?: 'generating' | 'newReply';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  governmentScene?: GovernmentSceneKey;
  quickActions?: string[];
  module?: string;
  link?: { to: string; text: string };
  time: string;
}

export const initialAutoTasks: AutoTask[] = [
  {
    "id": "t1",
    "name": "今日招商动态监测报告",
    "enabled": true,
    "frequencyDesc": "每天 08:30",
    "updatedAt": "今日",
    "status": "成功",
    "runs": [
      {
        "id": "t1-r1",
        "name": "今日招商动态监测报告-2026-11-04-08-30-00",
        "updatedAt": "今日",
        "status": "成功",
        "enabled": true,
        "nextRunIn": "明日 08:30",
        "summary": "新增企业投资信号 8 条、政策变动 3 条、空间去化动态 5 条。",
        "archived": false
      },
      {
        "id": "t1-r2",
        "name": "今日招商动态监测报告-2026-11-03-08-30-00",
        "updatedAt": "昨日",
        "status": "成功",
        "enabled": true,
        "nextRunIn": "明日 08:30",
        "summary": "新增企业投资信号 6 条、政策变动 2 条、空间去化动态 4 条。",
        "archived": false
      },
      {
        "id": "t1-r3",
        "name": "今日招商动态监测报告-2026-11-02-08-30-00",
        "updatedAt": "2天前",
        "status": "成功",
        "enabled": true,
        "nextRunIn": "明日 08:30",
        "summary": "新增企业投资信号 5 条、政策变动 1 条、空间去化动态 3 条。",
        "archived": false
      }
    ]
  },
  {
    "id": "t2",
    "name": "重点企业投资信号预警推送",
    "enabled": true,
    "frequencyDesc": "实时监测，触发即推送",
    "updatedAt": "昨日 18:00",
    "status": "成功",
    "runs": [
      {
        "id": "t2-r1",
        "name": "重点企业投资信号预警推送-2026-11-03-18-00",
        "updatedAt": "昨日 18:00",
        "status": "成功",
        "enabled": true,
        "nextRunIn": "触发即执行",
        "summary": "监测到精密结构件企业扩产备案、半导体企业融资及新能源企业中标信号，共 3 条，已推送招商专员（模拟）。",
        "archived": false
      },
      {
        "id": "t2-r2",
        "name": "重点企业投资信号预警推送-2026-11-02-18-00",
        "updatedAt": "2天前",
        "status": "成功",
        "enabled": true,
        "nextRunIn": "触发即执行",
        "summary": "监测到目标企业扩产及融资信号共 2 条，已推送招商专员（模拟）。",
        "archived": false
      }
    ]
  },
  {
    "id": "t3",
    "name": "本周新增目标企业入库汇总",
    "enabled": true,
    "frequencyDesc": "每周一 09:00",
    "updatedAt": "3天前",
    "status": "成功",
    "runs": [
      {
        "id": "t3-r1",
        "name": "本周新增目标企业入库汇总-2026-11-01-09-00-00",
        "updatedAt": "3天前",
        "status": "成功",
        "enabled": true,
        "nextRunIn": "下周一 09:00",
        "summary": "上周新增目标企业 24 家，覆盖新能源汽车、集成电路、生物医药，待招商专员审核。",
        "archived": false
      }
    ]
  }
];

export const initialSessions: SessionEntry[] = [
  {
    "id": "s1",
    "title": "招商方案生成",
    "updatedAt": "刚刚"
  },
  {
    "id": "s2",
    "title": "空间智能匹配",
    "updatedAt": "刚刚"
  },
  {
    "id": "s3",
    "title": "苏州精密结构件企业入驻咨询",
    "updatedAt": "22 分钟前"
  },
  {
    "id": "s4",
    "title": "浦东新能源汽车产业链缺口分析",
    "updatedAt": "今早 09:12"
  },
  {
    "id": "s5",
    "title": "张江园区政策奖补测算",
    "updatedAt": "昨日 16:40"
  },
  {
    "id": "s6",
    "title": "半导体封测项目落地研判",
    "updatedAt": "昨日 18:10"
  },
  {
    "id": "s7",
    "title": "本月招商进展汇总报告生成",
    "updatedAt": "昨日 17:30"
  },
  ...investmentSessions,
];

export const sessionHistoryMocks: Record<string, ChatMessage[]> = { ...investmentHistories };
{ const scene = governmentScenarios.find(s => s.key === 'gov-plan')!;
  sessionHistoryMocks.s1 = [{id:'s1-u1',role:'user',content:scene.example,time:"刚刚"},{id:'s1-a1',role:'assistant',content:governmentReply(scene.key,scene.example),governmentScene:scene.key,quickActions:scene.actions.filter(a => /材料|楼层|注册地/.test(a)),time:"刚刚"}]; }
{ const scene = governmentScenarios.find(s => s.key === 'gov-space')!;
  sessionHistoryMocks.s2 = [{id:'s2-u1',role:'user',content:scene.example,time:"刚刚"},{id:'s2-a1',role:'assistant',content:governmentReply(scene.key,scene.example),governmentScene:scene.key,quickActions:scene.actions.filter(a => /材料|楼层|注册地/.test(a)),time:"刚刚"}]; }
{ const scene = governmentScenarios.find(s => s.key === 'gov-space')!;
  sessionHistoryMocks.s3 = [{id:'s3-u1',role:'user',content:scene.example,time:"22 分钟前"},{id:'s3-a1',role:'assistant',content:governmentReply(scene.key,scene.example),governmentScene:scene.key,quickActions:scene.actions.filter(a => /材料|楼层|注册地/.test(a)),time:"22 分钟前"}]; }
sessionHistoryMocks.s4 = [{"id": "s4-u1", "role": "user", "content": "浦东新能源汽车产业链缺口分析", "time": "今早 09:12"}, {"id": "s4-a1", "role": "assistant", "content": "新能源汽车产业链覆盖：电池材料12家、电池结构件2家、BMS 5家、电机/电控8家、整车制造1家、充换电设备3家。优先补链电池结构件与整车制造，重点强链BMS与充换电设备。来源：产业链图谱、企业库（PRD演示数据）。", "time": "今早 09:12"}];
{ const scene = governmentScenarios.find(s => s.key === 'gov-policy')!;
  sessionHistoryMocks.s5 = [{id:'s5-u1',role:'user',content:scene.example,time:"昨日 16:40"},{id:'s5-a1',role:'assistant',content:governmentReply(scene.key,scene.example),governmentScene:scene.key,quickActions:scene.actions.filter(a => /材料|楼层|注册地/.test(a)),time:"昨日 16:40"}]; }
{ const scene = governmentScenarios.find(s => s.key === 'gov-review')!;
  sessionHistoryMocks.s6 = [{id:'s6-u1',role:'user',content:scene.example,time:"上周"},{id:'s6-a1',role:'assistant',content:governmentReply(scene.key,scene.example),governmentScene:scene.key,quickActions:scene.actions.filter(a => /材料|楼层|注册地/.test(a)),time:"上周"}]; }
sessionHistoryMocks.s7 = [{"id": "s7-u1", "role": "user", "content": "本月招商进展汇总报告生成", "time": "上周"}, {"id": "s7-a1", "role": "assistant", "content": "本月招商进展汇总报告（草稿）\n\n在库目标企业12,847家，本月服务企业186家，空间闲置预警23处。报告包含企业接洽、空间匹配、政策测算与重点项目研判；建议优先跟进半导体封测项目，协调精密结构件扩产项目现场踏勘。\n\n来源：企业库、空间库、系统对话日志（演示数据）。", "time": "上周"}];


// 原有场景也保留后续沟通，历史详情呈现业务推进过程。
const existingFollowups: Record<string, [string, string]> = {
  s1: ['方案拿去谈判之前，哪些内容必须先确认？', '优先确认设备投资构成、拟注册主体、厂房交付和政策适用条件。三年奖补合计仅为演示初估，参数不全时不应作为对外承诺；建议输出待核验清单，由招商专员、园区和企业逐项确认后更新方案。'],
  s2: ['先比较前两个载体，除了租金还要重点看什么？', '重点比较用途及准入、实用面积、配电扩容、交付时间、装修成本、通勤配套与提前退租条款。约看前先确认实时可租状态，再核对企业设备清单；推荐排名属于初筛，不能替代现场核验。'],
  s3: ['企业补充有冲压设备，希望下周安排现场踏勘，提前准备哪些材料？', '请企业提供设备尺寸、最大点荷载、振动参数、峰值用电及工艺说明；园区准备结构图、消防验收、供电及交付资料。建议先对临港候选厂房开展工程核验，再确定踏勘时间。目前仅整理准备事项，未实际预约。'],
  s4: ['下一阶段招商先聚焦哪个环节？不要只按企业数量判断。', '建议将电池结构件列为优先核验方向，同时补充本地采购需求、现有产能、技术门槛和目标企业扩产意愿。企业数量少只能提示线索，不能直接推导市场缺口；先访谈需求方，再形成补链名单和接洽次序。'],
  s5: ['企业还没落户，能把最高补贴写进意向书吗？', '建议写为“符合条件后协助申报，具体以有效政策及主管部门审核为准”。注册、资质、投入认定、申报窗口和同类补助限制需逐项核对，最高额度不能直接当作企业可得金额。先收集主体信息和投资明细，再复算政策包。'],
  s6: ['领导关心能不能落，给一个明确的阶段性判断。', '阶段性判断：有条件推进，尚不具备确认落地条件。企业需补充工艺、用能与排放数据，园区核实准入和基础设施；同步核验投资来源、客户订单及建设排期。关键约束未核清前，不建议作出供地或奖补承诺。'],
  s7: ['报告给例会用，补上风险和下周行动，注意别把服务企业数写成签约数。', '### 例会补充：风险与下一步\n\n- **统计口径**：本月服务企业186家为对话日志按企业去重的服务量，不代表新增线索、签约或落地数量；在库12,847家为存量规模。\n- **空间风险**：23处为可租且超过90天未更新的台账预警，先回访核实状态，再统计实际空置面积。\n- **精密结构件**：招商专员会同园区工程人员核实设备基础和供电，具备条件后协调踏勘。\n- **半导体封测**：补齐工艺、用能及排放资料，完成准入预沟通后更新研判结论。\n- **政策测算**：核对设备投入基数、主体资格及重复补助限制，不把初估奖补作为承诺。\n\n以上为报告草稿及建议分工，未实际派发任务。来源：企业库、空间库及对话日志（演示数据）。'],
};
Object.entries(existingFollowups).forEach(([id, [question, answer]]) => {
  const time = initialSessions.find(s => s.id === id)!.updatedAt;
  sessionHistoryMocks[id] = sessionHistoryMocks[id].map(message => ({ ...message, time }));
  sessionHistoryMocks[id].push(
    { id: `${id}-u2`, role: 'user', content: question, time },
    { id: `${id}-a2`, role: 'assistant', content: `${answer}\n\n本会话为业务演示，相关参数及建议待核验。`, time },
  );
});

export const buildRunHistoryMock = (task: AutoTask, run: AutoTaskSubRun): ChatMessage[] => [
  {
    id: `${run.id}-u1`,
    role: 'user',
    content: `查看自动化任务「${task.name}」本次执行结果`,
    time: run.updatedAt,
  },
  {
    id: `${run.id}-a1`,
    role: 'assistant',
    content:
      `**执行状态：${run.status}**\n\n${run.summary ?? '本次任务已执行完成，暂无结果摘要。'}\n\n` +
      `- 执行记录：${run.name}\n- 触发规则：${task.frequencyDesc}\n- 下次执行：${run.nextRunIn ?? '待调度'}`,
    module: '自动化任务执行结果',
    time: run.updatedAt,
  },
];

/* 每条自动化执行记录对应一组可恢复的 mock 对话 */
export const runHistoryMocks: Record<string, ChatMessage[]> = Object.fromEntries(
  initialAutoTasks.flatMap((task) =>
    task.runs.map((run) => [run.id, buildRunHistoryMock(task, run)]),
  ),
);

export const ensureRunHistoryMock = (task: AutoTask, run: AutoTaskSubRun) => {
  runHistoryMocks[run.id] = buildRunHistoryMock(task, run);
};

/* =========================================================
 * 子组件:Section 标题
 * ========================================================= */
const SectionTitle = ({
  children,
  count,
  open,
  onToggle,
}: {
  children: React.ReactNode;
  count?: number;
  open?: boolean;
  onToggle?: () => void;
}) => {
  const interactive = typeof onToggle === 'function';
  return (
    <div
      onClick={onToggle}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        cursor: interactive ? 'pointer' : 'default',
        userSelect: 'none',
      }}
    >
      {interactive ? (
        open ? (
          <CaretDownOutlined style={{ fontSize: 10, color: '#8c8c8c' }} />
        ) : (
          <CaretRightOutlined style={{ fontSize: 10, color: '#8c8c8c' }} />
        )
      ) : null}
      <Text strong style={{ fontSize: 12, color: '#8c8c8c', letterSpacing: 0.5 }}>
        {children}
      </Text>
      {typeof count === 'number' ? (
        <Text type="secondary" style={{ fontSize: 12, color: '#8c8c8c' }}>
          （{count}）
        </Text>
      ) : null}
    </div>
  );
};

/* =========================================================
 * 子组件:高亮行 —— 参考图1/2/3 「左侧 3px 蓝色竖条 + 浅蓝底 + 蓝字」
 *  非选中态:透明底 + 灰字(对齐原本的 link 视觉)
 * ========================================================= */
const HighlightRow = ({
  active,
  onClick,
  icon,
  children,
  testId,
  level = 0,
}: {
  active: boolean;
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  icon?: React.ReactNode;
  children: React.ReactNode;
  testId: string;
  /** 层级:0 = 一级(工作台/会话/一级任务);1 = 二级(子任务执行记录) */
  level?: 0 | 1;
}) => {
  return (
    <div
      data-testid={testId}
      data-active={active ? 'true' : 'false'}
      onClick={onClick}
      style={{
        position: 'relative',
        padding: level === 0 ? '6px 8px 6px 12px' : '4px 8px 4px 16px',
        paddingLeft: level === 0 ? 12 : 16,
        marginLeft: -8,
        width: 'calc(100% + 16px)',
        borderRadius: 6,
        background: active ? '#F0F6FF' : 'transparent',
        cursor: 'pointer',
        transition: 'all 0.15s',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = '#F5F5F5';
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = 'transparent';
      }}
    >
      {active && (
        <span
          aria-hidden
          style={{
            position: 'absolute',
            left: 0,
            top: 4,
            bottom: 4,
            width: 3,
            borderRadius: 2,
            background: '#4083E8',
          }}
        />
      )}
      {icon ? (
        <span style={{ color: active ? '#2468D8' : '#667085', fontSize: 12, flexShrink: 0 }}>{icon}</span>
      ) : null}
      <span
        style={{
          fontSize: 13,
          color: active ? '#1854B7' : '#344054',
          fontWeight: active ? 500 : 400,
          flex: 1,
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {children}
      </span>
    </div>
  );
};

const ActivityIndicator = ({
  status,
  fallback,
}: {
  status?: 'generating' | 'newReply';
  fallback: string;
}) => {
  if (status === 'generating') {
    return (
      <LoadingOutlined
        aria-label="智能体正在生成"
        style={{ color: '#18C8A5', fontSize: 13, flexShrink: 0 }}
      />
    );
  }

  if (status === 'newReply') {
    return (
      <span
        aria-label="智能体有新回复"
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: '#18C8A5',
          flexShrink: 0,
        }}
      />
    );
  }

  return (
    <Text type="secondary" style={{ fontSize: 11, flexShrink: 0, whiteSpace: 'nowrap' }}>
      {fallback}
    </Text>
  );
};

/* =========================================================
 * 主组件
 * ========================================================= */
interface Props {
  onNewTask: () => void;
  onRestoreSession: (id: string) => void;
  onRestoreRun: (id: string) => void;
  /** 独立子页可指定进入时的工作台高亮项。 */
  initialActiveKey?: 'new' | 'connector' | 'skill' | 'auto-task' | 'knowledge';
  /** 新建自动化任务成功 → 同步在右侧对话区推一条「任务创建成功」气泡 */
  onAutoTaskCreated?: (task: AutoTask, firstRunName: string) => void;
  /** 点 sidebar「连接器」→ 切换首页中间内容区(不跳路由) */
  onOpenConnector?: () => void;
  /** 点 sidebar「技能」→ 切换首页中间内容区(不跳路由) */
  onOpenSkill?: () => void;
  onOpenKnowledge?: () => void;
  /** 点 sidebar「自动化任务」→ 切换首页中间内容区(不跳路由) */
  onOpenAutoTasks?: () => void;
  /** 与中间自动化列表共享的任务数据，确保测试运行记录实时同步到侧栏 */
  autoTasks?: AutoTask[];
  /** 首页可动态追加的历史会话，例如「登记需求」创建的演示会话 */
  sessions?: SessionEntry[];
  /** 外部切换/创建会话后，同步侧栏高亮 */
  activeSessionId?: string | null;
  /** 当前正在生成回复的历史会话;优先显示转圈 */
  generatingSessionId?: string | null;
  /** 已生成新回复但仍需提示的历史会话 */
  newReplySessionIds?: Set<string>;
}

const HomeSidebarV2 = ({ onNewTask, onRestoreSession, onRestoreRun, initialActiveKey = 'new', onAutoTaskCreated, onOpenConnector, onOpenSkill, onOpenKnowledge, onOpenAutoTasks, autoTasks = initialAutoTasks, sessions: sessionsProp, activeSessionId, generatingSessionId, newReplySessionIds }: Props) => {
  const navigate = useWorkspaceNavigate();
  const collapseWorkspace = useContext(WorkspaceSidebarContext);
  const sessions = sessionsProp ?? initialSessions;

  /* Drawer:搜索对话 */
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');

  /* 历史会话 / 自动化任务记录 折叠状态 */
  const [sessionsExpanded, setSessionsExpanded] = useState(true);
  const [tasksExpanded, setTasksExpanded] = useState(true);
  /* 一级自动化任务独立折叠状态(默认全部展开) */
  const [taskGroupOpen, setTaskGroupOpen] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(initialAutoTasks.map((t) => [t.id, true])),
  );

  /* 1.1 工具区:收起 / 搜索 */
  const handleCollapse = () => {
    // 联动全局 ProLayout 折叠状态:点击后左侧 7 菜单立刻收起/展开
    if (collapseWorkspace) collapseWorkspace();
    else toggleSiderCollapsed();
  };
  const handleSearch = () => {
    setSearchOpen(true);
  };

  /* 中间内容区高亮:点 sidebar「连接器 / 自动化任务」时,中间内容区切换,sidebar 本地保持 active 视觉 */
  /* activeKey 为字符串标识当前中间内容区展示,例如 'connector' / 'auto-task' / 'session-s1' / 'run-t1-r1' */
  const [activeKey, setActiveKey] = useState<string>(initialActiveKey);

  useEffect(() => {
    if (activeSessionId) {
      setActiveKey(`session-${activeSessionId}`);
      return;
    }
    setActiveKey(initialActiveKey);
  }, [activeSessionId, initialActiveKey]);

  /* 自动任务新建已下钻到 /app/home/auto-tasks/new,本页不再持有 Drawer state */

  return (
    <>
      <Card
        bordered={false}
        styles={{
          body: {
            padding: '16px 16px 12px',
            background: '#FFFFFF',
            borderRadius: 8,
            overflow: 'hidden',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          },
        }}
        style={{ height: '100%' }}
      >
        {/* ============ 1.1 + 1.3 工具区 + 工作台(同一行) ============ */}
        <div
          data-testid="home-v1-side-tools"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          <SectionTitle>工作台</SectionTitle>
          <Space size={4}>
            <Tooltip title="收起左侧导航">
              <Button
                type="text"
                size="small"
                icon={<MenuFoldOutlined />}
                onClick={handleCollapse}
                aria-label="收起工作台侧栏"
                data-testid="home-v1-side-tools-collapse"
              />
            </Tooltip>
            <Tooltip title="搜索对话任务">
              <Button
                type="text"
                size="small"
                icon={<SearchOutlined />}
                onClick={handleSearch}
                data-testid="home-v1-side-tools-search"
              />
            </Tooltip>
          </Space>
        </div>

        {/* ============ 1.3 工作台区 ============ */}
        <div data-testid="home-v1-side-workbench">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <HighlightRow
              active={activeKey === 'new'}
              onClick={() => {
                setActiveKey('new');
                onNewTask();
              }}
              testId="home-v1-side-workbench-new"
              icon={<PlusOutlined />}
            >
              新对话
            </HighlightRow>
            <HighlightRow
              active={activeKey === 'skill'}
              onClick={() => {
                setActiveKey('skill');
                if (onOpenSkill) {
                  onOpenSkill();
                } else {
                  navigate('/app/home/skill');
                }
              }}
              testId="home-v1-side-workbench-skill"
              icon={<ToolOutlined />}
            >
              技能中心
            </HighlightRow>
            <HighlightRow
              active={activeKey === 'knowledge'}
              onClick={() => {
                setActiveKey('knowledge');
                if (onOpenKnowledge) onOpenKnowledge();
                else navigate('/app/home/knowledge');
              }}
              testId="home-v1-side-workbench-knowledge"
              icon={<ReadOutlined />}
            >知识中心</HighlightRow>
          </div>
        </div>

        {/* ============ 1.4 + 1.5 滚动区 ============ */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            paddingRight: 2,
          }}
        >
          {/* 1.4 历史会话 */}
          <div data-testid="home-v1-side-sessions">
            <div style={{ marginBottom: 6 }}>
              <SectionTitle
                count={sessions.length}
                open={sessionsExpanded}
                onToggle={() => setSessionsExpanded((v) => !v)}
              >
                历史会话
              </SectionTitle>
            </div>
            {sessionsExpanded && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {sessions.map((s) => {
                  const sessionKey = `session-${s.id}`;
                  const isActive = activeKey === sessionKey;
                  const activityStatus =
                    generatingSessionId === s.id
                      ? 'generating'
                      : newReplySessionIds?.has(s.id)
                        ? 'newReply'
                        : s.activityStatus;
                  return (
                    <HighlightRow
                      key={s.id}
                      active={isActive}
                      onClick={() => {
                        setActiveKey(sessionKey);
                        onRestoreSession(s.id);
                      }}
                      testId={`home-v1-side-session-${s.id}`}
                    >
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          width: '100%',
                          minWidth: 0,
                          gap: 6,
                        }}
                      >
                        <Text
                          ellipsis
                          style={{
                            display: 'block',
                            fontSize: 12,
                            color: isActive ? PUDONG_BLUE : '#333',
                            fontWeight: isActive ? 500 : 400,
                            flex: 1,
                            minWidth: 0,
                          }}
                        >
                          {s.title}
                        </Text>
                        <ActivityIndicator status={activityStatus} fallback={s.updatedAt} />
                      </span>
                    </HighlightRow>
                  );
                })}
              </div>
            )}
          </div>


        </div>

        {/* 1.6 账户区已下线(顶部已有角色徽标) */}
      </Card>

      {/* ============ 搜索弹窗(图2 风格:居中圆角白卡 + 输入 + 关闭) ============ */}
      {searchOpen && createPortal(
        <div
          className="home-v1-task-search-overlay"
          onClick={() => setSearchOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            className="home-v1-task-search-panel"
            role="dialog"
            aria-modal="true"
            aria-label="搜索任务"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(520px, 92vw)',
              maxHeight: '80vh',
              background: '#FFFFFF',
              borderRadius: 16,
              padding: '20px 22px 16px',
              boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            {/* 顶部:搜索框 + 关闭按钮 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Input
                size="large"
                autoFocus
                placeholder="搜索任务"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
                style={{ borderRadius: 10, flex: 1 }}
                data-testid="home-v1-search-input"
              />
              <Button
                type="text"
                size="large"
                icon={<CloseOutlined />}
                onClick={() => setSearchOpen(false)}
                data-testid="home-v1-search-close"
              />
            </div>

            {/* 最近任务 */}
            <div className="home-v1-task-search-results" style={{ overflowY: 'auto', maxHeight: 'calc(80vh - 110px)' }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                最近任务
              </Text>
              <div
                style={{
                  marginTop: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                {sessions
                  .filter((s) =>
                    searchKeyword.trim() ? s.title.includes(searchKeyword.trim()) : true,
                  )
                  .map((s) => {
                    return (
                      <div
                        key={s.id}
                        onClick={() => {
                          setActiveKey(`session-${s.id}`);
                          onRestoreSession(s.id);
                          setSearchOpen(false);
                          setSearchKeyword('');
                        }}
                        data-testid={`home-v1-search-item-${s.id}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 4px',
                          cursor: 'pointer',
                          borderRadius: 6,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#F5F5F5';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <Text ellipsis style={{ fontSize: 14, color: '#333', flex: 1, minWidth: 0 }}>
                          {s.title}
                        </Text>
                        <Text className="home-v1-task-search-time" type="secondary" style={{ fontSize: 12, minWidth: 140, textAlign: 'right' }}>
                          {s.updatedAt}
                        </Text>
                      </div>
                    );
                  })}
                {searchKeyword.trim() &&
                  sessions.filter((s) => s.title.includes(searchKeyword.trim())).length === 0 && (
                    <Text type="secondary" style={{ fontSize: 12, padding: '12px 4px' }}>
                      未找到匹配的会话
                    </Text>
                  )}
              </div>
            </div>
          </div>
        </div>, document.body
      )}

    </>
  );
};

export default HomeSidebarV2;
