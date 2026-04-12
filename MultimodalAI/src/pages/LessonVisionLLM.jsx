import React, { useState } from 'react';
import './LessonCommon.css';

/* ─────────────────────────────────────────────
   Module 02 — 视觉 + LLM
   GPT-4o Vision / OCR / 物体理解
   ───────────────────────────────────────────── */

const VISION_TOPICS = [
  { name: '图像理解', icon: '👁️', tag: 'Understanding',
    code: `# ─── 生产级图像理解 Pipeline ───
from openai import OpenAI
import base64, httpx, json
from PIL import Image
from io import BytesIO

client = OpenAI()

class VisionAnalyzer:
    """多功能图像分析器"""
    
    def __init__(self, model="gpt-4o"):
        self.model = model
    
    def analyze(self, image_source, prompt, detail="auto"):
        """
        image_source: URL 或本地文件路径
        detail: "low" (85 tokens, 快) | "high" (765+ tokens, 精) | "auto"
        """
        if image_source.startswith("http"):
            image_content = {
                "type": "image_url",
                "image_url": {"url": image_source, "detail": detail}
            }
        else:
            b64 = self._encode_file(image_source)
            ext = image_source.rsplit(".", 1)[-1].lower()
            mime = {"jpg": "jpeg", "jpeg": "jpeg", "png": "png", 
                    "gif": "gif", "webp": "webp"}.get(ext, "jpeg")
            image_content = {
                "type": "image_url",
                "image_url": {
                    "url": f"data:image/{mime};base64,{b64}",
                    "detail": detail,
                }
            }
        
        response = client.chat.completions.create(
            model=self.model,
            messages=[{
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    image_content,
                ],
            }],
            max_tokens=2048,
        )
        return response.choices[0].message.content
    
    def _encode_file(self, path):
        with open(path, "rb") as f:
            return base64.standard_b64encode(f.read()).decode()
    
    # ─── 预设分析模式 ───
    def describe(self, image):
        return self.analyze(image, "详细描述这张图片的内容。")
    
    def extract_text(self, image):
        return self.analyze(image, 
            "提取图片中所有可见的文字，保持原始格式。", 
            detail="high")
    
    def analyze_chart(self, image):
        return self.analyze(image, """
分析这个图表:
1. 图表类型
2. 提取所有数据点 (JSON格式)
3. 趋势分析
4. 关键发现
""", detail="high")
    
    def detect_objects(self, image):
        return self.analyze(image, """
检测图片中的所有物体:
返回 JSON 数组: [{"object": "名称", "location": "位置描述", 
"confidence": "高/中/低", "attributes": ["颜色", "大小"]}]
""")

# ─── 多图对比分析 ───
def compare_images(images: list, prompt: str):
    """同时分析多张图片"""
    content = [{"type": "text", "text": prompt}]
    for img_path in images:
        with open(img_path, "rb") as f:
            b64 = base64.standard_b64encode(f.read()).decode()
        content.append({
            "type": "image_url",
            "image_url": {"url": f"data:image/jpeg;base64,{b64}"}
        })
    
    resp = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": content}],
    )
    return resp.choices[0].message.content

# 用例: 产品质检 — 对比标准图和实物图
result = compare_images(
    ["standard.jpg", "actual.jpg"],
    "对比标准品(图1)和实物(图2)，找出所有差异和缺陷"
)` },
  { name: 'OCR + 文本提取', icon: '📝', tag: 'OCR',
    code: `# ─── 生产级 OCR: 多引擎融合 ───
from dataclasses import dataclass
from typing import Optional
import json

@dataclass
class OCRResult:
    text: str
    confidence: float
    structured_data: Optional[dict] = None
    source: str = "gpt-4o"

class ProductionOCR:
    """多引擎 OCR 系统"""
    
    def __init__(self):
        self.llm_analyzer = VisionAnalyzer("gpt-4o")
    
    # ─── 场景1: 发票/收据 ───
    async def extract_invoice(self, image_path: str) -> dict:
        result = self.llm_analyzer.analyze(image_path, """
请精确提取这张发票/收据的所有信息，返回 JSON:
{
  "type": "增值税专用发票 | 增值税普通发票 | 收据",
  "invoice_number": "发票号码",
  "invoice_code": "发票代码",
  "date": "开票日期 (YYYY-MM-DD)",
  "seller": {"name": "销方名称", "tax_id": "纳税人识别号"},
  "buyer":  {"name": "购方名称", "tax_id": "纳税人识别号"},
  "items": [
    {"name": "品名", "spec": "规格", "unit": "单位",
     "qty": 数量, "price": 单价, "amount": 金额}
  ],
  "subtotal": 合计金额,
  "tax_rate": "税率",
  "tax_amount": 税额,
  "total": 价税合计,
  "total_cn": "大写金额"
}

注意:
- 金额精确到分
- 如果某字段看不清，标记为 null 并说明
- 验证: 合计 + 税额 = 价税合计
""", detail="high")
        return json.loads(result)
    
    # ─── 场景2: 身份证/证件 ───
    async def extract_id_card(self, image_path: str) -> dict:
        result = self.llm_analyzer.analyze(image_path, """
提取证件信息，返回 JSON:
{
  "type": "身份证正面 | 身份证反面 | 护照 | 驾照",
  "name": "姓名",
  "id_number": "证件号码 (部分脱敏: 保留前3后4)",
  "gender": "性别",
  "ethnicity": "民族",
  "birth_date": "出生日期",
  "address": "地址 (部分脱敏)",
  "issue_authority": "签发机关",
  "valid_period": "有效期限"
}

⚠️ 安全要求: 身份证号中间用*替代!
""", detail="high")
        return json.loads(result)
    
    # ─── 场景3: 手写笔记 ───
    async def extract_handwriting(self, image_path: str) -> str:
        return self.llm_analyzer.analyze(image_path, """
识别图片中的手写文字:
1. 逐行转录，保持原始换行
2. 不确定的字用[?]标记
3. 如果有涂改，标注原始和修改后的内容
4. 保留数学公式 (用LaTeX格式)
""", detail="high")
    
    # ─── 场景4: 表格提取 ───
    async def extract_table(self, image_path: str) -> str:
        return self.llm_analyzer.analyze(image_path, """
提取图片中的表格，以 Markdown 格式返回。
- 保持表头、行列结构
- 合并单元格用注释标记
- 数值保持原始精度
""", detail="high")` },
  { name: '物体检测 + 定位', icon: '📦', tag: 'Detection',
    code: `# ─── 物体检测: LLM vs 传统模型 vs Grounding ───

# ═══ 方案1: GPT-4o 直接检测 (适合原型) ═══
def detect_with_gpt4o(image_path: str, categories=None):
    """LLM 做物体检测 — 简单但不精确"""
    category_hint = f"重点检测: {', '.join(categories)}" if categories else ""
    
    result = analyzer.analyze(image_path, f"""
检测图片中的所有物体，返回 JSON:
[{{
    "object": "物体名称",
    "bbox_pct": [x1%, y1%, x2%, y2%],  // 百分比坐标
    "confidence": 0.95,
    "description": "简短描述"
}}]
{category_hint}
""")
    return json.loads(result)

# ═══ 方案2: Grounding DINO (开源, 精确) ═══
from groundingdino.util.inference import load_model, predict

def detect_with_grounding_dino(image_path, text_prompt):
    """
    开放词汇检测: 用文本描述要检测的物体
    比 YOLO 灵活 — 不限于固定类别!
    """
    model = load_model(
        "GroundingDINO/groundingdino/config/GroundingDINO_SwinT.py",
        "weights/groundingdino_swint.pth"
    )
    
    image = load_image(image_path)
    boxes, logits, phrases = predict(
        model=model,
        image=image,
        caption=text_prompt,  # "person . car . traffic light"
        box_threshold=0.35,
        text_threshold=0.25,
    )
    
    return [{
        "object": phrase,
        "bbox": box.tolist(),  # [cx, cy, w, h] 归一化
        "confidence": logit.item(),
    } for box, logit, phrase in zip(boxes, logits, phrases)]

# ═══ 方案3: SAM2 (分割一切) ═══
from sam2.build_sam import build_sam2
from sam2.sam2_image_predictor import SAM2ImagePredictor

def segment_anything(image_path, points=None, boxes=None):
    """SAM2 — 给定点/框，精确分割物体"""
    predictor = SAM2ImagePredictor(
        build_sam2("sam2_hiera_l.yaml", "sam2_hiera_large.pt")
    )
    
    image = Image.open(image_path)
    predictor.set_image(image)
    
    masks, scores, _ = predictor.predict(
        point_coords=points,  # [[x, y]] 点提示
        box=boxes,            # [x1, y1, x2, y2] 框提示
        multimask_output=True,
    )
    
    # 返回最佳 mask
    best_idx = scores.argmax()
    return masks[best_idx]

# ═══ 生产Pipeline: DINO + SAM2 + GPT-4o ═══
# 1. Grounding DINO 检测物体 → bbox
# 2. SAM2 精确分割 → mask
# 3. GPT-4o 分析分割后的物体 → 语义理解
# → 在"先检测后理解"的流水线中各取所长!` },
  { name: '视觉 Agent', icon: '🤖', tag: 'Vision Agent',
    code: `# ─── 视觉 Agent: 看图做事 ───
from langgraph.graph import StateGraph, END
from typing import TypedDict, List
import json

class VisionAgentState(TypedDict):
    image_path: str
    task: str
    observations: List[str]
    actions_taken: List[str]
    result: str

# ─── 工具集 ───
vision_tools = {
    "describe": lambda img: analyzer.describe(img),
    "extract_text": lambda img: analyzer.extract_text(img),
    "detect_objects": lambda img: analyzer.detect_objects(img),
    "analyze_chart": lambda img: analyzer.analyze_chart(img),
    "extract_table": lambda img: analyzer.extract_table(img),
    "compare": lambda imgs, prompt: compare_images(imgs, prompt),
}

def plan_step(state: VisionAgentState):
    """规划下一步动作"""
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{
            "role": "system",
            "content": """你是视觉分析 Agent。
根据任务和已有观察，决定下一步:
- describe: 整体描述图片
- extract_text: OCR 提取文字
- detect_objects: 检测物体
- analyze_chart: 分析图表
- extract_table: 提取表格
- done: 已有足够信息，生成最终回答

返回 JSON: {"action": "...", "reason": "..."}"""
        }, {
            "role": "user",
            "content": f"""任务: {state["task"]}
已有观察: {json.dumps(state["observations"], ensure_ascii=False)}
已执行: {state["actions_taken"]}"""
        }],
    )
    return json.loads(response.choices[0].message.content)

def execute_step(state, action):
    """执行视觉分析动作"""
    tool = vision_tools.get(action)
    if tool:
        result = tool(state["image_path"])
        state["observations"].append(f"[{action}] {result}")
        state["actions_taken"].append(action)
    return state

# ─── 实际应用案例 ───
# 任务: "分析这张产品说明书，提取产品参数并与竞品对比"
# Agent 自动规划:
#   Step 1: describe → 了解整体内容
#   Step 2: extract_text → OCR 提取文字
#   Step 3: extract_table → 提取参数表
#   Step 4: done → 整合生成报告

# 任务: "这张地图上有哪些餐厅，距离最近的是哪家"
# Agent 自动规划:
#   Step 1: describe → 了解地图范围
#   Step 2: detect_objects → 检测标记点
#   Step 3: extract_text → 提取店名
#   Step 4: done → 排序并推荐` },
];

export default function LessonVisionLLM() {
  const [topicIdx, setTopicIdx] = useState(0);
  const t = VISION_TOPICS[topicIdx];

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge" style={{ background: '#0891b222', color: '#22d3ee', borderColor: '#0891b244' }}>
        🎨 module_02 — 视觉 + LLM
      </div>
      <div className="fs-hero">
        <h1>视觉 + LLM：让 AI 真正"看懂"图片</h1>
        <p>
          不只是识别猫狗——GPT-4o Vision 能<strong>读发票</strong>、<strong>分析图表</strong>、
          <strong>理解设计稿</strong>、<strong>检测缺陷</strong>。本模块从基础图像理解到
          <strong>生产级 OCR Pipeline</strong>再到<strong>视觉 Agent</strong>，覆盖真实业务场景。
        </p>
      </div>

      <div className="fs-section">
        <h2 className="fs-section-title">👁️ 视觉能力矩阵</h2>
        <div className="fs-pills">
          {VISION_TOPICS.map((t, i) => (
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
              🐍 vision_{t.tag.toLowerCase().replace(/\s/g, '_')}.py
            </div>
            <pre className="fs-code">{t.code}</pre>
          </div>
        </div>
      </div>

      <div className="fs-nav">
        <button className="fs-btn">← 多模态基础</button>
        <button className="fs-btn primary">语音工程 →</button>
      </div>
    </div>
  );
}
