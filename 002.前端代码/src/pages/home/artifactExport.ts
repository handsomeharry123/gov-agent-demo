import type { Paragraph as DocParagraph, Table as DocTable } from "docx";
export type ArtifactFormat = "docx" | "xlsx";
export const policyRows = [
  [
    "政策／匹配记录",
    "测算公式",
    "金额（万元）",
    "申报窗口",
    "核验与叠加条件",
    "来源",
  ],
  [
    "研发费用支持",
    "800×10%",
    80,
    "以当年通知为准",
    "研发投入800万元；须核验费用口径",
    "S3／S4",
  ],
  [
    "园区落地支持",
    "一次性50万元（待审核）",
    "待核验",
    "入驻满1年后",
    "不得当作每年重复收益",
    "S3",
  ],
  [
    "人才安居支持",
    "人数×月数×2000元",
    "待补人数",
    "滚动申报",
    "核验人才资格、人数和支持期限",
    "S3",
  ],
  ...Array.from({ length: 8 }, (_, i) => [
    `匹配记录 ${i + 4}（待补原文）`,
    "待核验",
    "待核验",
    "待核验",
    "PRD仅提供11条命中总数，未提供该条明细；不计入已测算金额",
    "待补政策原文",
  ]),
  ["已知参数可复算小计", "SUM(C2:C12)", 80, "", "不含一次性及未核验金额", "S4"],
  [
    "PRD演示初估区间",
    "210–280万元／年",
    "非确定金额",
    "",
    "不能由现有参数完整复算；不作为申报承诺",
    "S4",
  ],
];
export const materials = [
  ["主体资质", "营业执照副本", "复印件盖公章"],
  ["主体资质", "高新技术企业证书", "复印件盖公章"],
  ["主体资质", "法定代表人身份证明", "核验原件"],
  ["主体资质", "经办人授权委托书", "原件盖公章"],
  ["主体资质", "企业信用记录", "以申报通知为准"],
  ["主体资质", "注册及实际经营地址证明", "复印件盖公章"],
  ["财务研发", "上一年度审计报告", "复印件盖公章"],
  ["财务研发", "年度财务报表", "盖公章"],
  ["财务研发", "纳税证明", "核验电子凭证"],
  ["财务研发", "研发费用专项审计报告", "以正式通知为准"],
  ["财务研发", "研发费用辅助账", "盖公章"],
  ["财务研发", "研发项目立项材料", "复印件盖公章"],
  ["财务研发", "研发人员名册", "盖公章"],
  ["落地项目", "入驻或租赁合同", "复印件盖公章"],
  ["落地项目", "产权或场地证明", "复印件盖公章"],
  ["落地项目", "项目备案文件", "核验电子凭证"],
  ["落地项目", "投资计划书", "盖公章"],
  ["落地项目", "合同发票及付款凭证", "复印件盖公章"],
  ["人才支持", "人才资格认定文件", "核验原件"],
  ["人才支持", "人才劳动合同", "复印件盖公章"],
  ["人才支持", "人才社保缴纳证明", "核验电子凭证"],
  ["人才支持", "人才住房证明", "复印件盖公章"],
  ["通用申报", "申报表及真实性与不重复享受承诺", "原件签字盖章"],
];
export const materialsContent =
  "# 张江高新技术企业政策申报材料清单\n\n适用范围：张江注册高新技术企业。以下23项为演示准备清单，按材料类别去重归集；具体政策名称及对应材料要求需逐条核对正式申报通知。[S3]\n\n" +
  materials.map((m, i) => `${i + 1}. 【${m[0]}】${m[1]}：${m[2]}`).join("\n") +
  "\n\n来源：浦东研发机构与人才安居政策申报指引（演示材料）。未提供完整11条政策原文，不能确认去重前数量及逐政策必需项。";
export const policyContent =
  "# 张江高新技术企业政策奖补测算表\n\n" +
  policyRows.map((r) => r.join(" ｜ ")).join("\n\n");
function save(blob: Blob, title: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = title;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export async function exportArtifact(
  title: string,
  content: string,
  format: ArtifactFormat,
) {
  if (format === "xlsx") {
    const XLSX = await import("xlsx");
    const sheet = XLSX.utils.aoa_to_sheet(policyRows);
    sheet.C13 = { t: "n", f: "SUM(C2:C12)", v: 80 };
    sheet["!cols"] = [
      { wch: 32 },
      { wch: 32 },
      { wch: 18 },
      { wch: 24 },
      { wch: 70 },
      { wch: 18 },
    ];
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "张江奖补测算");
    XLSX.utils.book_append_sheet(
      book,
      XLSX.utils.aoa_to_sheet([
        ["口径", "说明"],
        ["注册地", "张江园区"],
        ["资料性质", "PRD V1.2 演示数据，非正式政策"],
        ["缺失明细", "记录4至11待补原文；仅研发费用80万元可复算"],
        ["数据时间", "2026-11-05"],
      ]),
      "口径与来源",
    );
    const bytes = XLSX.write(book, { type: "array", bookType: "xlsx" });
    save(
      new Blob([bytes], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      title,
    );
    return;
  }
  const { Document, Packer, Paragraph, HeadingLevel, Table, TableRow, TableCell, TextRun } = await import("docx");
  const lines = content.split("\n");
  const children: (DocParagraph | DocTable)[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    if (line.startsWith("|")) {
      const rows = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        if (!/^\|[\s:|\-]+\|$/.test(lines[i]))
          rows.push(lines[i].slice(1, -1).split("|"));
        i++;
      }
      i--;
      children.push(
        new Table({
          rows: rows.map(
            (row) =>
              new TableRow({
                children: row.map(
                  (cell) =>
                    new TableCell({ children: [new Paragraph(cell.trim())] }),
                ),
              }),
          ),
        }),
      );
      continue;
    }
    children.push(
      new Paragraph({
        text: line.replace(/^#+\s*/, "").replace(/\*\*/g, ""),
        heading: line.startsWith("#")
          ? children.length === 0
            ? HeadingLevel.TITLE
            : HeadingLevel.HEADING_2
          : undefined,
        spacing: { after: 160 },
      }),
    );
  }
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "招小慧 · 演示生成成果 · 数据及政策适用条件待核验",
          color: "777777",
          size: 18,
        }),
      ],
    }),
  );
  save(
    await Packer.toBlob(
      new Document({
        sections: [{ children }],
        styles: {
          default: { document: { run: { font: "Microsoft YaHei", size: 22 } } },
        },
      }),
    ),
    title,
  );
}
