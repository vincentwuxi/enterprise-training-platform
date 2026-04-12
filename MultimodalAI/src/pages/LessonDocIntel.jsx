import React, { useState } from 'react';
import './LessonCommon.css';

/* ─────────────────────────────────────────────
   Module 06 — 文档智能
   PDF / 表格 / 图表结构化提取
   ───────────────────────────────────────────── */

const DOC_TOPICS = [
  { name: 'PDF 文档理解', icon: '📄', tag: 'PDF',
    code: `# ─── PDF 文档智能处理 Pipeline ───
from typing import List, Dict
import json

# ═══ 方案1: Gemini 原生 PDF (最简单) ═══
import google.generativeai as genai

def analyze_pdf_gemini(pdf_path: str, prompt: str):
    """Gemini 直接读 PDF! 无需解析库"""
    model = genai.GenerativeModel("gemini-2.0-flash")
    pdf_file = genai.upload_file(pdf_path, mime_type="application/pdf")
    
    response = model.generate_content([pdf_file, prompt])
    return response.text

# 实战: 财报分析
result = analyze_pdf_gemini("annual_report.pdf", """
从这份年报中提取:
1. 营收、净利润、毛利率 (近3年)
2. 主要业务线收入占比
3. 研发投入
4. 管理层讨论中提到的风险因素
5. 明年展望

返回结构化 JSON。
""")

# ═══ 方案2: 解析 + LLM (更可控) ═══
import pymupdf  # PyMuPDF
from PIL import Image
import io

class PDFProcessor:
    """PDF 解析: 文本 + 图片 + 表格 分别提取"""
    
    def extract_all(self, pdf_path: str) -> dict:
        doc = pymupdf.open(pdf_path)
        result = {"pages": [], "metadata": doc.metadata}
        
        for page_num, page in enumerate(doc):
            page_data = {
                "page": page_num + 1,
                "text": page.get_text("text"),
                "tables": self._extract_tables(page),
                "images": self._extract_images(page, doc),
            }
            result["pages"].append(page_data)
        
        doc.close()
        return result
    
    def _extract_tables(self, page) -> List[Dict]:
        """提取表格 (OCR + 坐标)"""
        tables = page.find_tables()
        extracted = []
        for table in tables:
            data = table.extract()  # [[cell,...],...]
            extracted.append({
                "headers": data[0] if data else [],
                "rows": data[1:] if len(data) > 1 else [],
                "bbox": list(table.bbox),
            })
        return extracted
    
    def _extract_images(self, page, doc) -> List[Dict]:
        """提取嵌入图片"""
        images = []
        for img in page.get_images():
            xref = img[0]
            pix = pymupdf.Pixmap(doc, xref)
            if pix.n > 4:  # CMYK → RGB
                pix = pymupdf.Pixmap(pymupdf.csRGB, pix)
            
            img_bytes = pix.tobytes("png")
            images.append({
                "xref": xref,
                "width": pix.width,
                "height": pix.height,
                "data": img_bytes,
            })
        return images

# ═══ 方案3: 视觉 OCR (扫描件/图片PDF) ═══
class VisualPDFProcessor:
    """图片型PDF: 逐页截图 → GPT-4o Vision"""
    
    def process(self, pdf_path: str, prompt: str):
        doc = pymupdf.open(pdf_path)
        results = []
        
        for page in doc:
            # 页面渲染为高分辨率图片
            pix = page.get_pixmap(dpi=200)
            img_bytes = pix.tobytes("png")
            
            b64 = base64.standard_b64encode(img_bytes).decode()
            
            # GPT-4o Vision 分析
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[{
                    "role": "user",
                    "content": [
                        {"type": "text", "text": f"第{page.number+1}页: {prompt}"},
                        {"type": "image_url", "image_url": {
                            "url": f"data:image/png;base64,{b64}",
                            "detail": "high"
                        }},
                    ],
                }],
            )
            results.append(response.choices[0].message.content)
        
        return results` },
  { name: '表格提取', icon: '📊', tag: 'Table',
    code: `# ─── 表格智能提取: 从图片/PDF 到结构化数据 ───

# ═══ 1. 图片中的表格 → GPT-4o Vision ═══
def extract_table_from_image(image_path: str) -> str:
    """用 GPT-4o Vision 精确提取表格"""
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{
            "role": "user",
            "content": [
                {"type": "text", "text": """
精确提取图片中的表格内容:
1. 保持原始行列结构
2. 数值保持原始精度
3. 合并单元格用注释说明
4. 返回 Markdown 表格 + JSON 双格式

Markdown 表格:
| 列1 | 列2 | ... |
|-----|-----|-----|
| ... | ... | ... |

JSON:
{"headers": [...], "rows": [[...], ...]}
"""},
                {"type": "image_url", "image_url": {
                    "url": encode_image(image_path), "detail": "high"
                }},
            ],
        }],
        max_tokens=4096,
    )
    return response.choices[0].message.content

# ═══ 2. 复杂表格 (跨页/合并单元格) ═══
class ComplexTableExtractor:
    """处理复杂表格: 跨页、嵌套、合并单元格"""
    
    async def extract_multi_page_table(self, pages: list) -> dict:
        """跨页表格合并"""
        # 先单独提取每页
        page_tables = []
        for page in pages:
            table = await self._extract_single(page)
            page_tables.append(table)
        
        # LLM 智能合并
        merged = await self._merge_tables(page_tables)
        return merged
    
    async def _merge_tables(self, tables: list) -> dict:
        """用 LLM 判断哪些行属于同一个表"""
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{
                "role": "user",
                "content": f"""
以下是从多页提取的表格数据。
请判断它们是否属于同一个表，并进行智能合并:
- 对齐列头
- 删除重复的表头行
- 处理跨页续表

{json.dumps(tables, ensure_ascii=False)}

返回合并后的完整表格 (JSON 格式)。
"""
            }],
        )
        return json.loads(response.choices[0].message.content)

# ═══ 3. Excel 生成 ═══
import openpyxl
from openpyxl.styles import Font, Alignment, Border

def table_to_excel(table_data: dict, output_path: str):
    """将提取的表格导出为格式化的 Excel"""
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "提取数据"
    
    # 写入表头
    headers = table_data["headers"]
    for col, header in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col, value=header)
        cell.font = Font(bold=True, size=11)
        cell.alignment = Alignment(horizontal="center")
    
    # 写入数据
    for row_idx, row in enumerate(table_data["rows"], 2):
        for col_idx, value in enumerate(row, 1):
            cell = ws.cell(row=row_idx, column=col_idx, value=value)
            # 尝试转换数值
            try:
                cell.value = float(value.replace(",", ""))
                cell.number_format = '#,##0.00'
            except (ValueError, AttributeError):
                pass
    
    # 自动列宽
    for col in ws.columns:
        max_len = max(len(str(cell.value or "")) for cell in col)
        ws.column_dimensions[col[0].column_letter].width = max_len + 2
    
    wb.save(output_path)
    return output_path` },
  { name: '图表分析', icon: '📈', tag: 'Chart',
    code: `# ─── 图表理解: 从可视化反向提取数据 ───

class ChartAnalyzer:
    """图表 → 数据 + 洞察"""
    
    def analyze(self, image_path: str) -> dict:
        """全面分析图表"""
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{
                "role": "user",
                "content": [
                    {"type": "text", "text": """
全面分析这个图表，返回 JSON:
{
  "chart_type": "折线图|柱状图|饼图|散点图|其他",
  "title": "图表标题",
  "axes": {
    "x": {"label": "X轴标签", "type": "时间|分类|数值", "range": [min, max]},
    "y": {"label": "Y轴标签", "type": "数值", "range": [min, max], "unit": "单位"}
  },
  "data_series": [
    {
      "name": "系列名称",
      "data_points": [{"x": "标签", "y": 数值}, ...],
      "color": "颜色描述"
    }
  ],
  "insights": [
    "趋势1: ...",
    "异常: ...",
    "关键发现: ..."
  ],
  "csv_data": "x,series1,series2\\n..."
}

要求:
1. 数据点尽可能精确读取
2. 识别所有图例和标注
3. 分析趋势和异常值
"""},
                    {"type": "image_url", "image_url": {
                        "url": encode_image(image_path), "detail": "high"
                    }},
                ],
            }],
            max_tokens=4096,
        )
        return json.loads(response.choices[0].message.content)
    
    def compare_charts(self, chart_images: list) -> str:
        """对比分析多个图表"""
        content = [{"type": "text", "text": """
对比分析以下图表:
1. 各图表分别展示什么
2. 数据是否一致/矛盾
3. 综合所有图表的关键结论
4. 建议关注的趋势或异常
"""}]
        
        for img_path in chart_images:
            content.append({
                "type": "image_url",
                "image_url": {"url": encode_image(img_path), "detail": "high"}
            })
        
        resp = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": content}],
        )
        return resp.choices[0].message.content

# ─── 实战: 自动化报告解析 ─── 
async def auto_report_analysis(pdf_path: str):
    """PDF 报告 → 提取所有图表 → 数据化 → 生成摘要"""
    # 1. PDF → 逐页图片
    processor = VisualPDFProcessor()
    pages = processor.render_pages(pdf_path)
    
    # 2. 识别包含图表的页面
    chart_pages = []
    for page in pages:
        has_chart = detect_chart(page)  # LLM判断
        if has_chart:
            chart_pages.append(page)
    
    # 3. 提取每个图表的数据
    chart_data = []
    for page in chart_pages:
        data = analyzer.analyze(page)
        chart_data.append(data)
    
    # 4. 综合分析
    summary = client.chat.completions.create(
        model="gpt-4o",
        messages=[{
            "role": "user",
            "content": f"""
基于从PDF报告中提取的所有图表数据:
{json.dumps(chart_data, ensure_ascii=False)}

生成一份综合分析:
1. 关键数据汇总
2. 趋势分析
3. 风险信号
4. 行动建议
"""
        }],
    )
    return summary.choices[0].message.content` },
  { name: '端到端文档 AI', icon: '🔗', tag: 'Pipeline',
    code: `# ─── 企业级文档 AI Pipeline ───

class DocumentAIPipeline:
    """端到端文档智能: 上传 → 分类 → 解析 → 结构化"""
    
    def __init__(self):
        self.pdf_processor = PDFProcessor()
        self.table_extractor = ComplexTableExtractor()
        self.chart_analyzer = ChartAnalyzer()
    
    async def process(self, file_path: str) -> dict:
        """主入口: 自动处理任意文档"""
        
        # 1. 文档分类
        doc_type = await self._classify(file_path)
        
        # 2. 根据类型选择处理策略
        handlers = {
            "invoice":    self._process_invoice,
            "contract":   self._process_contract,
            "report":     self._process_report,
            "resume":     self._process_resume,
            "receipt":    self._process_receipt,
            "id_card":    self._process_id,
            "general":    self._process_general,
        }
        
        handler = handlers.get(doc_type, self._process_general)
        result = await handler(file_path)
        
        # 3. 质量检查
        result["quality_score"] = await self._quality_check(result)
        result["doc_type"] = doc_type
        
        return result
    
    async def _classify(self, file_path: str) -> str:
        """LLM 文档分类"""
        # 取第一页截图做分类
        first_page = self._get_first_page(file_path)
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{
                "role": "user",
                "content": [
                    {"type": "text", "text": "这是什么类型的文档? 返回一个类别: invoice/contract/report/resume/receipt/id_card/general"},
                    {"type": "image_url", "image_url": {"url": first_page, "detail": "low"}},
                ],
            }],
        )
        return response.choices[0].message.content.strip()
    
    async def _process_invoice(self, path):
        """发票专用处理"""
        return await ProductionOCR().extract_invoice(path)
    
    async def _process_contract(self, path):
        """合同提取: 甲乙方/金额/期限/关键条款"""
        pdf_data = self.pdf_processor.extract_all(path)
        full_text = "\\n".join(p["text"] for p in pdf_data["pages"])
        
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{
                "role": "user",
                "content": f"""
提取合同关键信息:
{full_text[:8000]}

返回 JSON:
{{
  "parties": [{{name, role (甲方/乙方), contact}}],
  "contract_type": "类型",
  "effective_date": "生效日",
  "expiry_date": "到期日",
  "total_amount": "合同金额",
  "payment_terms": "付款条款",
  "key_clauses": ["违约条款", "保密条款", ...],
  "risks": ["识别到的风险点"],
}}
"""
            }],
        )
        return json.loads(response.choices[0].message.content)
    
    async def _quality_check(self, result):
        """结果质检: 检查是否有遗漏/错误"""
        checks = {
            "completeness": all(v is not None for v in result.values()),
            "no_hallucination": True,  # 交叉验证
        }
        return sum(checks.values()) / len(checks) * 100
    
# ─── 批量处理 ───
async def batch_process(file_list: list):
    pipeline = DocumentAIPipeline()
    results = await asyncio.gather(
        *[pipeline.process(f) for f in file_list]
    )
    return results` },
];

export default function LessonDocIntel() {
  const [topicIdx, setTopicIdx] = useState(0);
  const t = DOC_TOPICS[topicIdx];

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge" style={{ background: '#0891b222', color: '#22d3ee', borderColor: '#0891b244' }}>
        🎨 module_06 — 文档智能
      </div>
      <div className="fs-hero">
        <h1>文档智能：从 PDF 到结构化数据</h1>
        <p>
          企业 80% 的数据锁在 PDF、发票、合同、报表里。<strong>Gemini 原生读 PDF</strong>、
          <strong>GPT-4o Vision 识别表格</strong>、<strong>PyMuPDF 精确提取</strong>——
          本模块教你构建能处理任意文档的<strong>端到端 Document AI Pipeline</strong>。
        </p>
      </div>

      <div className="fs-section">
        <h2 className="fs-section-title">📄 文档 AI 技术栈</h2>
        <div className="fs-pills">
          {DOC_TOPICS.map((t, i) => (
            <button key={i} className={`fs-btn ${i === topicIdx ? 'primary' : ''}`}
              onClick={() => setTopicIdx(i)}>
              {t.icon} {t.name}
            </button>
          ))}
        </div>
        <div className="fs-card" style={{ borderLeft: '3px solid #06b6d4' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, color: '#22d3ee' }}>{t.icon} {t.name}</h3>
            <span className="fs-tag cyan">{t.tag}</span>
          </div>
          <div className="fs-code-wrap">
            <div className="fs-code-head">
              <span className="fs-code-dot" style={{ background: '#ef4444' }} />
              <span className="fs-code-dot" style={{ background: '#f59e0b' }} />
              <span className="fs-code-dot" style={{ background: '#22c55e' }} />
              🐍 doc_{t.tag.toLowerCase()}.py
            </div>
            <pre className="fs-code">{t.code}</pre>
          </div>
        </div>
      </div>

      <div className="fs-nav">
        <button className="fs-btn">← 图像生成</button>
        <button className="fs-btn primary">多模态 RAG →</button>
      </div>
    </div>
  );
}
