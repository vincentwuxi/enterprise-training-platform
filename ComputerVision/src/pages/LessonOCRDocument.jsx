import React from 'react';
import './LessonCommon.css';

export default function LessonOCRDocument() {
  return (
    <div className="lesson-common-container">
      <h1 className="lesson-title">📄 模块四：OCR 与文档理解 — PaddleOCR / 表格识别 / 版面分析</h1>
      <p className="lesson-subtitle">
        从文字识别到文档智能，构建端到端文档处理管线
      </p>

      <section className="lesson-section">
        <h2>1. OCR 技术体系与架构</h2>
        <div className="info-box">
          <h3>🏗️ OCR 管线架构</h3>
          <table className="lesson-table">
            <thead>
              <tr><th>阶段</th><th>任务</th><th>主流方案</th></tr>
            </thead>
            <tbody>
              <tr><td>文本检测</td><td>定位文字区域</td><td>DBNet++ / EAST / CRAFT</td></tr>
              <tr><td>文本识别</td><td>逐行文字识别</td><td>CRNN / SVTR / ABINet</td></tr>
              <tr><td>版面分析</td><td>文档结构解析</td><td>LayoutLMv3 / DocTR / PP-Structure</td></tr>
              <tr><td>表格识别</td><td>表格结构还原</td><td>TableMaster / SLANet</td></tr>
              <tr><td>KIE</td><td>关键信息提取</td><td>LayoutLMv3 / GeoLayoutLM</td></tr>
            </tbody>
          </table>
        </div>

        <div className="concept-card">
          <h3>📊 OCR 引擎对比</h3>
          <div className="code-block">
{`"""
┌────────────────┬──────────┬─────────┬────────────────┐
│ OCR 引擎       │ 中文精度  │ 速度    │ 特点           │
├────────────────┼──────────┼─────────┼────────────────┤
│ PaddleOCR v4   │ ★★★★★   │ ★★★★   │ 中文最优, 全栈  │
│ Tesseract 5    │ ★★★     │ ★★★    │ 开源经典, GPU弱 │
│ EasyOCR        │ ★★★★    │ ★★★    │ 80+语言, 易用   │
│ Surya OCR      │ ★★★★    │ ★★★★   │ 多语言, 版面好  │
│ GOT-OCR 2.0    │ ★★★★★   │ ★★★    │ LLM 端到端 OCR  │
│ 商用 (百度/腾讯)│ ★★★★★   │ ★★★★★  │ 云端API, 最稳定 │
└────────────────┴──────────┴─────────┴────────────────┘
"""`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>2. PaddleOCR 深度实战</h2>
        <div className="concept-card">
          <h3>🔥 PaddleOCR v4 全链路</h3>
          <div className="code-block">
{`from paddleocr import PaddleOCR, draw_ocr

# PP-OCRv4: 检测 + 识别 一体化
ocr = PaddleOCR(
    use_angle_cls=True,    # 文本方向分类
    lang='ch',              # 中文
    use_gpu=True,
    det_model_dir='ch_PP-OCRv4_det',
    rec_model_dir='ch_PP-OCRv4_rec',
    det_db_thresh=0.3,      # 检测阈值
    det_db_unclip_ratio=1.5 # 文本区域扩展
)

# 基础识别
result = ocr.ocr('document.pdf', cls=True)

for line in result[0]:
    bbox, (text, confidence) = line
    print(f"[{confidence:.3f}] {text}")

# 批量处理
import glob
for pdf_path in glob.glob('documents/*.pdf'):
    result = ocr.ocr(pdf_path, cls=True)
    # 按阅读顺序排序
    sorted_results = sort_by_reading_order(result)

# PP-Structure: 版面分析 + 表格识别
from paddleocr import PPStructure

engine = PPStructure(
    table=True,
    ocr=True,
    show_log=False,
    layout_model_dir='picodet_lcnet_x1_0_fgd_layout',
)
result = engine('complex_document.jpg')

for item in result:
    item_type = item['type']  # text/table/title/figure/list
    if item_type == 'table':
        html_table = item['res']['html']
        print(html_table)    # <table>...</table>
    elif item_type == 'text':
        for text_info in item['res']:
            print(text_info['text'])`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>3. 表格识别与结构化</h2>
        <div className="concept-card">
          <h3>📊 表格识别架构</h3>
          <div className="code-block">
{`# 表格识别两阶段方案
"""
阶段1: 表格检测 (定位表格区域)
  └─ YOLO / Faster R-CNN / PP-YOLOE

阶段2: 表格结构识别
  ├─ 有线表格: 线检测 → 交叉点 → 单元格
  ├─ 无线表格: SLANet / TableMaster → HTML 生成
  └─ 复杂表格: GPT-4o / Qwen-VL 多模态理解
"""

# 表格转 Excel/CSV
import pandas as pd
from bs4 import BeautifulSoup

def html_table_to_dataframe(html_str):
    """将 OCR 输出的 HTML 表格转为 DataFrame"""
    soup = BeautifulSoup(html_str, 'html.parser')
    rows = []
    for tr in soup.find_all('tr'):
        cells = [td.get_text(strip=True) for td in tr.find_all(['td', 'th'])]
        rows.append(cells)
    df = pd.DataFrame(rows[1:], columns=rows[0])
    return df

# GOT-OCR 2.0: LLM 端到端表格识别
from transformers import AutoModel, AutoTokenizer

model = AutoModel.from_pretrained(
    'stepfun-ai/GOT-OCR2_0',
    trust_remote_code=True
).cuda()

# 直接生成 LaTeX/Markdown 表格
result = model.chat(
    tokenizer, 'table_image.png',
    ocr_type='format',      # 'ocr' | 'format'
    render=True              # 输出渲染 HTML
)`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>4. 文档智能 — LayoutLM 与 KIE</h2>
        <div className="concept-card">
          <h3>🧠 LayoutLMv3 关键信息提取</h3>
          <div className="code-block">
{`from transformers import (
    LayoutLMv3ForTokenClassification,
    LayoutLMv3Processor
)

# LayoutLMv3 = 文本 + 版面 + 视觉 多模态融合
processor = LayoutLMv3Processor.from_pretrained(
    "microsoft/layoutlmv3-base"
)
model = LayoutLMv3ForTokenClassification.from_pretrained(
    "microsoft/layoutlmv3-base",
    num_labels=13  # 自定义实体类别
)

# KIE 任务: 从发票/收据中提取关键字段
"""
输入: 发票图片
输出: {
  "invoice_no": "INV-2024-001",
  "date": "2024-03-15",
  "total": "¥12,580.00",
  "vendor": "华为技术有限公司",
  "items": [
    {"name": "服务器", "qty": 2, "price": "¥5,000"},
    {"name": "交换机", "qty": 1, "price": "¥2,580"}
  ]
}
"""

# 文档处理管线最佳实践
pipeline = {
    "预处理":   "去噪/纠偏/二值化/DPI标准化",
    "检测":     "PaddleOCR v4 检测",
    "识别":     "PaddleOCR v4 识别",
    "版面分析": "PP-Structure / DocTR",
    "KIE":      "LayoutLMv3 / GPT-4o",
    "后处理":   "正则校验/格式对齐/置信度过滤"
}`}
          </div>
        </div>
      </section>

      <section className="lesson-section">
        <h2>5. OCR 工程化与质量优化</h2>
        <div className="info-box">
          <h3>📋 OCR 质量优化清单</h3>
          <table className="lesson-table">
            <thead>
              <tr><th>问题</th><th>原因</th><th>解决方案</th></tr>
            </thead>
            <tbody>
              <tr><td>漏检文字</td><td>小字/密集/倾斜</td><td>提高分辨率, 调低检测阈值</td></tr>
              <tr><td>识别错误</td><td>字体特殊/模糊</td><td>数据增强, 领域微调</td></tr>
              <tr><td>阅读顺序错</td><td>多栏/复杂版面</td><td>版面分析 + 区域排序</td></tr>
              <tr><td>表格错乱</td><td>无线表格/合并单元格</td><td>切换 LLM 方案</td></tr>
              <tr><td>速度慢</td><td>高分辨率/大文件</td><td>GPU 加速, 分块并行</td></tr>
              <tr><td>手写体差</td><td>训练数据不足</td><td>手写专用模型微调</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <div className="nav-buttons">
        <span className="nav-prev">← 上一模块：图像分割</span>
        <span className="nav-next">下一模块：视频分析 →</span>
      </div>
    </div>
  );
}
