import { getUserDisplayName } from '../../utils/userDisplayName';
import { useEffect, useRef, useState } from "react";
import { Button, Drawer, Input, Modal, Space, Table, Tag, message } from "antd";
import {
  FileTextOutlined,
  FileExcelOutlined,
  FullscreenOutlined,
} from "@ant-design/icons";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
import { useAuth } from "../../hooks/useAuth";
import {
  readPersonalFiles,
  writePersonalFiles,
  type KnowledgeFile,
} from "./knowledgeFiles";
import {
  exportArtifact,
  materialsContent,
  policyContent,
  policyRows,
  type ArtifactFormat,
} from "./artifactExport";
import {
  GovernmentContent,
  governmentReply,
  type GovernmentSceneKey,
} from "./governmentScenarios";
import "./governmentArtifacts.css";
const parks = [
  { name: "张江", projects: 48, vacancy: "12.8%", x: 57, y: 67 },
  { name: "金桥", projects: 35, vacancy: "16.2%", x: 43, y: 42 },
  { name: "外高桥", projects: 23, vacancy: "21.5%", x: 70, y: 23 },
  { name: "临港", projects: 20, vacancy: "18.1%", x: 78, y: 82 },
];
const trends = [8, 10, 12, 11, 15, 13, 14, 12, 16, 10, 5].map((value, i) => ({
  month: `${i + 1}月`,
  签约数: value,
  投资额: [22, 28, 35, 30, 46, 38, 42, 36, 49, 32, 28][i],
}));
const idle = Array.from({ length: 23 }, (_, i) => ({
  id: i + 1,
  name:
    i === 0
      ? "科创中心 D 栋 3–6 层"
      : i === 1
        ? "创新园 B2 号楼"
        : i === 2
          ? "生命科学园 7 号楼"
          : `${parks[i % 4].name}待租载体 ${i + 1}`,
  park: parks[i % 4].name,
  days: 420 - i * 14,
  area: 4800 - i * 120,
}));
export default function GovernmentArtifacts({
  scene,
  content,
  onContentChange,
}: {
  scene: GovernmentSceneKey;
  content: string;
  onContentChange: (value: string) => void;
}) {
  const { currentUser } = useAuth();
  const [preview, setPreview] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(content);
  const [archiveStatus, setArchiveStatus] = useState("");
  const [screen, setScreen] = useState(false);
  const [presentation, setPresentation] = useState(false);
  const [selectedPark, setSelectedPark] = useState<string | null>(null);
  const [carrier, setCarrier] = useState<(typeof idle)[number] | null>(null);
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [localWarning, setLocalWarning] = useState(false);
  const saved = useRef("");
  const warning = localWarning || /V2|新增空间闲置/.test(content);
  const version = /V2/.test(content) ? "V2" : "V1";
  const isFiles = scene === "gov-policy" && /文件已生成/.test(content);
  const report = scene === "gov-plan";
  const dashboard = scene === "gov-dashboard";
  const files: { title: string; format: ArtifactFormat; content: string }[] =
    isFiles
      ? [
          {
            title: "张江高新技术企业政策奖补测算表.xlsx",
            format: "xlsx",
            content: policyContent,
          },
          {
            title: "张江高新技术企业政策申报材料清单.docx",
            format: "docx",
            content: materialsContent,
          },
        ]
      : report
        ? [
            {
              title: `精密结构件项目一企一策招商方案_${version}.docx`,
              format: "docx",
              content,
            },
          ]
        : [];
  useEffect(() => {
    if (!currentUser || (!files.length && !dashboard)) return;
    const signature = JSON.stringify([scene, content, warning]);
    if (saved.current === signature) return;
    try {
      const existing = readPersonalFiles(currentUser.id);
      const entries: KnowledgeFile[] = dashboard
        ? [
            {
              id: `generated-dashboard-${warning ? "v2" : "v1"}`,
              title: `2026年浦东招商工作态势大屏_${warning ? "V2" : "V1"}`,
              category: "我的文件",
              date: "2026-11-05",
              publisher: getUserDisplayName(currentUser),
              content:
                content + (warning ? "\n已新增空间闲置预警：23处。" : ""),
              source: "智能体生成 · 大屏快照",
              personal: true,
            },
          ]
        : files.map((file) => ({
            id: `generated-${scene}-${file.title}`,
            title: file.title,
            category: "我的文件",
            date: "2026-11-05",
            publisher: getUserDisplayName(currentUser),
            content: file.content,
            source: "智能体生成 · 演示数据",
            personal: true,
            format: file.format,
          }));
      writePersonalFiles(currentUser.id, [
        ...entries,
        ...existing.filter((f) => !entries.some((e) => e.id === f.id)),
      ]);
      saved.current = signature;
      setArchiveStatus("已归档至知识中心 · 我的文件");
    } catch {
      setArchiveStatus("归档失败，请下载后重试");
    }
  }, [scene, content, currentUser?.id, warning, isFiles]);
  const download = async (file: (typeof files)[number]) => {
    setBusy(true);
    try {
      await exportArtifact(file.title, file.content, file.format);
      message.success("文件已下载");
    } catch {
      message.error("导出失败，请重试");
    } finally {
      setBusy(false);
    }
  };
  const print = () => {
    const root = document.querySelector(".gov-report-preview");
    if (!root) return;
    const w = window.open("", "_blank");
    if (!w) {
      message.warning("请允许打开打印窗口");
      return;
    }
    w.document.title = `招商方案_${version}`;
    w.document.body.innerHTML =
      "<style>body{font:14px/1.8 sans-serif;padding:32px}button,textarea{display:none}table{border-collapse:collapse;width:100%}td,th{padding:8px;border:1px solid #ddd}@page{margin:18mm}</style>" +
      root.innerHTML;
    w.document.close();
    w.focus();
    w.print();
  };
  const adjust = () => {
    if (!/闲置|90|预警/.test(prompt)) {
      message.info(
        "此演示支持追加“空置超过90天的载体预警”，其他指标请补充数据。",
      );
      return;
    }
    onContentChange(governmentReply("gov-dashboard", "新增空间闲置预警"));
    setLocalWarning(true);
    setPrompt("");
    message.success("大屏已更新为 V2，新增模块与地图联动");
  };
  const screenBody = (
    <div className={`gov-dashboard ${presentation ? "is-presentation" : ""}`}>
      <header>
        <div>
          <small>浦东新区 · 招商驾驶舱</small>
          <h2>2026 年招商工作态势</h2>
          <span>2026-01-01 至 2026-11-05 · 全区 · 演示数据</span>
        </div>
        <Tag color="cyan">{warning ? "V2 · 已新增预警" : "V1"}</Tag>
      </header>
      <div className="gov-kpis">
        {[
          ["新签约项目", "126", "个"],
          ["意向投资额", "386", "亿元"],
          ["落地企业", "214", "家"],
          ["政策兑现", "3.2", "亿元"],
        ].map(([label, value, unit]) => (
          <div key={label}>
            <small>{label}</small>
            <strong>
              {value}
              <em>{unit}</em>
            </strong>
          </div>
        ))}
      </div>
      <div className="gov-dash-grid">
        <section>
          <h3>
            园区分布 <small>点击查看统计</small>
          </h3>
          <div className="gov-dash-map">
            {parks.map((p) => (
              <button
                key={p.name}
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
                className={warning ? "warn" : ""}
                onClick={() => setSelectedPark(p.name)}
              >
                {p.name}
                <small>
                  {p.projects} 个 · 空置率 {p.vacancy}
                </small>
              </button>
            ))}
          </div>
          {selectedPark && (
            <p>
              {selectedPark}：签约{" "}
              {parks.find((p) => p.name === selectedPark)?.projects} 个；空置率{" "}
              {parks.find((p) => p.name === selectedPark)?.vacancy}
              。来源：企业库／空间库（模拟汇总）。
            </p>
          )}
        </section>
        <section>
          <h3>月度签约与意向投资趋势</h3>
          <p>左轴：项目数（个） · 右轴：投资额（亿元）</p>
          <ResponsiveContainer width="100%" height={210}>
            <LineChart data={trends}>
              <XAxis dataKey="month" stroke="#a7c4df" />
              <YAxis stroke="#a7c4df" />
              <YAxis yAxisId="right" orientation="right" stroke="#a7c4df" />
              <Tooltip />
              <Line dataKey="签约数" stroke="#50d5ff" strokeWidth={3} />
              <Line
                dataKey="投资额"
                yAxisId="right"
                stroke="#f7ce71"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </section>
        <section>
          <h3>重点产业排行 · 签约数</h3>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart
              data={[
                { name: "集成电路", 项目数: 48 },
                { name: "生物医药", 项目数: 36 },
                { name: "新能源汽车", 项目数: 28 },
                { name: "其他", 项目数: 14 },
              ]}
            >
              <XAxis dataKey="name" stroke="#a7c4df" />
              <YAxis stroke="#a7c4df" />
              <Tooltip />
              <Bar dataKey="项目数" fill="#50b8e8" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>
        <section>
          <h3>统计口径与数据来源</h3>
          <p>企业库：按签约项目去重；意向投资额按签约台账汇总。</p>
          <p>空间库：可租载体空置率；闲置预警按空置时长 &gt; 90 天筛选。</p>
          <p>
            政策库与兑现台账：按已兑现批次汇总。系统日志：记录生成与服务行为。
          </p>
          <p>
            数据截止 2026-11-05；均为 PRD 演示数据，未连接实时业务系统。[S1]
          </p>
        </section>
      </div>
      {warning && (
        <section className="gov-idle">
          <h3>
            新增 · 空间闲置预警 <Tag color="orange">23 处</Tag>
          </h3>
          <p>
            空置超过 90
            天，按空置天数降序；点击载体查看详情。地图红色标记表示含预警载体的园区。
          </p>
          <div style={{ maxHeight: 230, overflow: "auto" }}>
            {idle.map((item) => (
              <button key={item.id} onClick={() => setCarrier(item)}>
                <span>
                  {item.name} · {item.park}
                </span>
                <span>
                  {item.area}㎡ · {item.days} 天 ↗
                </span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
  if (!report && !isFiles && !dashboard) return null;
  return (
    <div className="gov-artifacts">
      {report && (
        <div className="gov-artifact-card">
          <FileTextOutlined />
          <div>
            <Tag color="blue">生成报告 · {version}</Tag>
            <h3>精密结构件项目一企一策招商方案</h3>
            <p>
              项目概况 / 产业契合 / 空间方案 / 政策测算 / 风险提示
              {version === "V2" ? " / 下一步推进建议" : ""}
            </p>
            {version === "V2" && (
              <p className="gov-change">V1 → V2：风险扩写与推进建议已更新</p>
            )}
            <Space wrap>
              <Button type="primary" onClick={() => setPreview("report")}>
                章节预览
              </Button>
              <Button
                onClick={() => {
                  setEditText(content);
                  setEditing(true);
                  setPreview("report");
                }}
              >
                在线编辑
              </Button>
              <Button loading={busy} onClick={() => download(files[0])}>
                导出 Word
              </Button>
              <Button onClick={() => setPreview("report")}>
                预览并导出 PDF
              </Button>
            </Space>
          </div>
        </div>
      )}
      {isFiles &&
        files.map((file) => (
          <div className="gov-artifact-card" key={file.title}>
            {file.format === "xlsx" ? (
              <FileExcelOutlined />
            ) : (
              <FileTextOutlined />
            )}
            <div>
              <Tag color={file.format === "xlsx" ? "green" : "blue"}>
                {file.format.toUpperCase()} · 已生成
              </Tag>
              <h3>{file.title}</h3>
              <p>
                {file.format === "xlsx"
                  ? "11条匹配记录 · 含公式、适用条件、申报窗口与来源"
                  : "23项准备材料 · 分类去重 · 原件与盖章要求"}
              </p>
              <Space>
                <Button onClick={() => setPreview(file.format)}>
                  在线预览
                </Button>
                <Button
                  type="primary"
                  loading={busy}
                  onClick={() => download(file)}
                >
                  下载
                </Button>
              </Space>
            </div>
          </div>
        ))}
      {dashboard && (
        <div className="gov-screen-card">
          <div
            className="gov-screen-thumbnail"
            onClick={() => setScreen(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter") setScreen(true);
            }}
            aria-label="预览招商态势大屏"
          >
            <small>2026 浦东招商工作态势</small>
            <div>
              {["126 个", "386 亿元", "214 家", "3.2 亿元"].map((v) => (
                <b key={v}>{v}</b>
              ))}
            </div>
            <span>
              园区分布 · 月度趋势 · 产业排行{warning ? " · 闲置预警 23 处" : ""}
            </span>
          </div>
          <Space wrap>
            <Button
              type="primary"
              icon={<FullscreenOutlined />}
              onClick={() => {
                setPresentation(false);
                setScreen(true);
              }}
            >
              全屏打开
            </Button>
            <Button
              onClick={() => {
                setPresentation(true);
                setScreen(true);
              }}
            >
              投屏模式
            </Button>
          </Space>
        </div>
      )}
      <p className="gov-archive-status" role="status">
        {archiveStatus || "正在归档…"}
      </p>
      <Drawer
        title={`一企一策招商报告 · ${version}`}
        width="min(920px, 100vw)"
        open={preview === "report"}
        onClose={() => setPreview(null)}
        extra={
          <Space>
            <Button onClick={() => download(files[0])}>导出 Word</Button>
            <Button onClick={print} disabled={editing}>打印 / 另存 PDF</Button>
          </Space>
        }
      >
        <div className="gov-report-layout">
          <nav>
            {content.split(/(?=\n#### )/).map((part, i) => (
              <a key={i} href={`#gov-chapter-${i}`}>
                {i === 0 ? '项目概况' : part.match(/#### ([^\n]+)/)?.[1] || '章节'}
              </a>
            ))}
          </nav>
          <div className="gov-report-preview">
            <Tag>内部讨论稿 · {version}</Tag>
            {editing ? (
              <>
                <Input.TextArea
                  rows={25}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                />
                <Button
                  type="primary"
                  onClick={() => {
                    onContentChange(editText);
                    setEditing(false);
                    message.success("修改已保存，导出将采用当前内容");
                  }}
                >
                  保存修改
                </Button>
              </>
            ) : (
              <>
                {content.split(/(?=\n#### )/).map((part, i) => (
                  <section id={`gov-chapter-${i}`} key={i}>
                    <GovernmentContent content={part} />
                  </section>
                ))}
                <Button
                  onClick={() => {
                    setEditText(content);
                    setEditing(true);
                  }}
                >
                  在线编辑
                </Button>
              </>
            )}
          </div>
        </div>
      </Drawer>
      <Modal
        title={
          preview === "xlsx"
            ? "奖补测算表 · 张江园区"
            : "申报材料清单 · 张江园区"
        }
        open={preview === "xlsx" || preview === "docx"}
        width={1000}
        footer={null}
        onCancel={() => setPreview(null)}
      >
        {preview === "xlsx" ? (
          <>
            <p>
              仅研发费用支持可由已知参数复算；记录4至11的政策原文待补，不编造政策条款。
            </p>
            <Table
              size="small"
              pagination={false}
              scroll={{ x: 1000 }}
              rowKey="id"
              columns={policyRows[0].map((title, i) => ({
                title,
                dataIndex: `c${i}`,
                width: i === 4 ? 300 : 160,
              }))}
              dataSource={policyRows
                .slice(1)
                .map((row, id) =>
                  Object.fromEntries([
                    ["id", id],
                    ...row.map((v, i) => [`c${i}`, v]),
                  ]),
                )}
            />
          </>
        ) : (
          <GovernmentContent content={materialsContent} />
        )}
      </Modal>
      <Modal
        title="招商工作态势大屏"
        open={screen}
        onCancel={() => {
          setScreen(false);
          setPresentation(false);
        }}
        footer={null}
        width="100vw"
        style={{ top: 0, padding: 0, maxWidth: "100vw" }}
        styles={{
          body: {
            padding: 0,
            maxHeight: "calc(100dvh - 80px)",
            overflow: "auto",
          },
        }}
      >
        <div className="gov-screen-toolbar">
          <Space>
            <Button onClick={() => setPresentation((v) => !v)}>
              {presentation ? "退出投屏" : "投屏模式"}
            </Button>
            <Button
              onClick={() => {
                onContentChange(
                  governmentReply("gov-dashboard", "新增空间闲置预警"),
                );
                setLocalWarning(true);
              }}
            >
              新增空间闲置预警
            </Button>
          </Space>
          <Space.Compact>
            <Input
              aria-label="调整大屏指标"
              placeholder="例如：加一块空间闲置预警"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onPressEnter={adjust}
            />
            <Button type="primary" onClick={adjust}>
              调整大屏
            </Button>
          </Space.Compact>
        </div>
        {screenBody}
      </Modal>
      <Modal
        title="园区载体详情"
        open={!!carrier}
        onCancel={() => setCarrier(null)}
        footer={null}
      >
        <h3>{carrier?.name}</h3>
        <p>
          所属园区：{carrier?.park}；面积：{carrier?.area}㎡；空置：
          {carrier?.days} 天。
        </p>
        <p>状态：可租 · 建议核验配电、层高及租金，优先安排招商去化。</p>
        <p>来源：空间库模拟台账，2026-11-05。载体名称及面积为演示构造。</p>
      </Modal>
    </div>
  );
}
