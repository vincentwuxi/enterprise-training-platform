import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['ControlNet 基础', 'IP-Adapter', '多控制组合', '实战案例'];

export default function LessonControlNetPrecision() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge blue">🎯 module_04 — ControlNet 精确控制</div>
      <div className="fs-hero">
        <h1>ControlNet 精确控制：姿态 / 线稿 / 深度 / IP-Adapter — 从随机到可控</h1>
        <p>
          <strong>ControlNet</strong> 解决了 AI 绘画最大的痛点——"不可控"。
          通过引入结构条件 (姿态/边缘/深度图)，精确控制生成结果的构图与形态。
          <strong>IP-Adapter</strong> 则实现了"以图引图"的风格迁移。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🎯 ControlNet</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🧩 ControlNet 基础</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#3b82f6'}}></span> controlnet_basics</div>
              <pre className="fs-code">{`# ControlNet: 给 AI 绘画加上"骨架"

# ═══ 核心原理 ═══
# 正常 SD: 文字 → 图像 (构图随机)
# + ControlNet: 文字 + 结构图 → 图像 (构图可控!)
# ControlNet 是一个"旁路网络", 注入结构信息

# ═══ 控制类型全览 ═══
control_types = {
    "Canny (边缘检测)": {
        "输入":   "自动提取图片边缘线",
        "控制":   "物体轮廓/形状",
        "适合":   "保持主体形状, 改变风格/材质",
        "强度":   "0.5-1.0",
    },
    "OpenPose (姿态检测)": {
        "输入":   "人体关键点骨架",
        "控制":   "人物姿态/动作",
        "适合":   "指定动作的人物绘画",
        "变体":   "全身/面部/手部",
    },
    "Depth (深度图)": {
        "输入":   "场景深度信息 (近白远黑)",
        "控制":   "空间层次/透视关系",
        "适合":   "室内设计/建筑/场景",
    },
    "Scribble (涂鸦)": {
        "输入":   "简笔画/草图",
        "控制":   "大致形状和布局",
        "适合":   "从手绘草图生成完整作品",
    },
    "Lineart (线稿)": {
        "输入":   "精细线条稿",
        "控制":   "精确的线条结构",
        "适合":   "漫画上色/线稿着色",
    },
    "SoftEdge (软边缘)": {
        "输入":   "柔和的边缘检测",
        "控制":   "大致结构(比Canny更自由)",
        "适合":   "希望有结构但保留创意空间",
    },
    "Tile (分块)": {
        "输入":   "原图分块",
        "控制":   "保持整体结构, 增加细节",
        "适合":   "超分辨率/细节增强",
    },
    "Seg (语义分割)": {
        "输入":   "分割图 (不同颜色=不同类别)",
        "控制":   "区域语义 (天空/建筑/人/地面)",
        "适合":   "城市/风景场景布局",
    },
}

# ═══ ComfyUI 中使用 ControlNet ═══
# 节点连接:
# Load ControlNet Model → ControlNet 模型
# Preprocessor (Canny/Pose...) → 条件图
# Apply ControlNet → 注入到采样流程
#
# Load Image → Canny Preprocessor → 边缘图
#                                      ↓
# Load ControlNet → Apply ControlNet(model, cond, image)
#                                      ↓
#                        → KSampler (生成)

# ═══ 关键参数 ═══
cn_params = {
    "strength":       "控制强度 0-1 (越高越贴合)",
    "start_percent":  "开始介入时机 0-1",
    "end_percent":    "结束时机 0-1",
    "建议": "strength=0.7-0.9, end=0.8 通常效果最好",
}`}</pre>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🖼️ IP-Adapter</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> ip_adapter</div>
              <pre className="fs-code">{`# IP-Adapter: 图像提示适配器

# ═══ 核心概念 ═══
# ControlNet: 控制"结构" (形状/姿态)
# IP-Adapter: 控制"内容/风格" (颜色/氛围/主体)
# 一句话: "像文字 Prompt 一样使用图片"

# ═══ IP-Adapter 变体 ═══
ip_adapter_versions = {
    "IP-Adapter": {
        "功能": "基础图像引导",
        "输入": "任意参考图",
        "输出": "风格+内容迁移",
    },
    "IP-Adapter FaceID": {
        "功能": "面部特征保持",
        "输入": "人脸参考图",
        "输出": "保持人脸特征的新图",
        "用途": "AI 换脸/虚拟形象",
    },
    "IP-Adapter Plus": {
        "功能": "增强版, 更精细的特征提取",
        "效果": "更好保留细节",
    },
    "InstantID": {
        "功能": "单图即保持身份",
        "输入": "1张人脸照片",
        "输出": "各种场景中保持身份",
        "特色": "无需训练, 即用即得",
    },
}

# ═══ 实战: 风格迁移工作流 ═══
style_transfer = """
# ComfyUI 节点:
Load Image (风格参考) → IP-Adapter Encoder
                             ↓
Load IP-Adapter Model → Apply IP-Adapter
                             ↓
CLIP Encode (内容描述) → KSampler → 输出

# 效果: 用参考图的"风格" + 文字的"内容"
# 例: 梵高风格参考 + "一只猫坐在窗台" → 梵高风格猫
"""

# ═══ IP-Adapter 关键参数 ═══
ipa_params = {
    "weight":        "参考图影响力 0-1 (建议0.6-0.8)",
    "weight_type": {
        "standard":    "均匀影响",
        "style transfer": "偏风格",
        "composition":    "偏构图",
    },
    "start_at":      "开始影响步数 (0-1)",
    "end_at":        "结束影响步数 (0-1)",
}

# ═══ 风格一致性方案对比 ═══
consistency_methods = {
    "IP-Adapter":  "灵活, 无需训练, 轻度一致"  ,
    "InstantID":   "强身份保持, 人脸专用",
    "LoRA 训练":   "最精确, 需要训练数据",
    "MJ --sref":   "最简单, 风格参考",
    "MJ --cref":   "角色一致, 最易用",
}`}</pre>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🔀 多控制组合</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> multi_control</div>
              <pre className="fs-code">{`# 多 ControlNet 组合: 精确控制的终极形态

# ═══ 组合策略 ═══
# 多个 ControlNet 可以同时使用!
combos = {
    "OpenPose + Depth": {
        "控制": "人物姿态 + 空间层次",
        "适合": "复杂场景中的人物",
        "例":   "指定动作 + 保持室内布局",
    },
    "Canny + IP-Adapter": {
        "控制": "轮廓结构 + 风格参考",
        "适合": "保持形状, 改变风格",
        "例":   "产品造型 + 品牌配色风格",
    },
    "Lineart + Depth + Color": {
        "控制": "线条 + 深度 + 色彩",
        "适合": "建筑/室内设计",
    },
    "Scribble + Seg": {
        "控制": "草图 + 区域语义",
        "适合": "从草稿快速生成",
    },
}

# ═══ ComfyUI 多控制节点示例 ═══
multi_cn = """
# 同时使用 OpenPose + Depth:

Load Image → OpenPose Preprocessor → pose_image
Load Image → Depth Preprocessor   → depth_image

Load ControlNet (openpose) → Apply CN 1
  (strength=0.8, end=0.9)
Load ControlNet (depth)    → Apply CN 2
  (strength=0.6, end=0.7)

Apply CN 1 → Apply CN 2 → KSampler → 输出

# 关键: 串联 Apply ControlNet 节点
# 每个 CN 独立设置 strength/timing
"""

# ═══ 权重平衡技巧 ═══
weight_balance = {
    "主控制":   "strength=0.8-1.0 (最重要的条件)",
    "辅控制":   "strength=0.3-0.6 (辅助条件)",
    "冲突处理": "如果两个CN冲突, 降低次要CN强度",
    "时序分离": {
        "结构CN (Canny)": "start=0, end=0.8 (早期介入)",
        "细节CN (Tile)":  "start=0.3, end=1.0 (后期细化)",
    },
}

# ═══ 预处理器选择指南 ═══
preprocessor_guide = {
    "保持精确轮廓":  "Canny (阈值调低)",
    "保持大致形状":  "SoftEdge / HED",
    "指定人物动作":  "OpenPose (DWPose更准)",
    "保持空间关系":  "Depth (MiDaS / ZoeDepth)",
    "从草图创作":    "Scribble",
    "漫画上色":      "Lineart (Anime专用)",
    "区域控制":      "Seg (分割图)",
    "提升分辨率":    "Tile (分块重绘)",
}`}</pre>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>💼 实战案例</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#ef4444'}}></span> practical_cases</div>
              <pre className="fs-code">{`# ControlNet 实战案例集

# ═══ 案例 1: 建筑效果图 ═══
architecture = {
    "需求": "客户手绘草图 → 逼真建筑效果图",
    "流程": [
        "1. Scribble CN: 导入手绘草图 (大致形状)",
        "2. Depth CN: 添加深度层次 (强度0.5)",
        "3. Prompt: modern minimalist house, glass facade, "
                   "garden, golden hour, architectural photography",
        "4. 生成 4 个方案 → 客户选择",
        "5. Vary Region 调整细节",
    ],
    "耗时": "传统建模: 2-3天 → AI: 30分钟",
}

# ═══ 案例 2: 时尚模特换装 ═══
fashion = {
    "需求": "同一模特穿不同服装",
    "流程": [
        "1. OpenPose: 提取模特姿态骨架",
        "2. IP-Adapter FaceID: 保持模特面部",
        "3. Inpainting: 只重绘服装区域",
        "4. Prompt: 分别描述不同服装",
    ],
    "优势": "无需反复拍摄, 减少 90% 拍摄成本",
}

# ═══ 案例 3: 漫画一致性制作 ═══
manga = {
    "需求": "系列漫画, 角色和风格一致",
    "流程": [
        "1. 训练角色 LoRA (20张参考图)",
        "2. 每个分镜用 OpenPose 指定动作",
        "3. IP-Adapter 锁定画风",
        "4. 固定 Seed + 风格 LoRA 保持一致",
    ],
    "产出": "每天可产出 20-50 个分镜",
}

# ═══ 案例 4: 产品概念设计 ═══
product_design = {
    "需求": "从草图到产品渲染图",
    "流程": [
        "1. Lineart CN: 产品线稿 (精确)",
        "2. Canny CN: 结构约束 (轮廓)",
        "3. Color Reference: 品牌配色",
        "4. 多角度渲染: 正面/侧面/45度",
    ],
    "工具链": "Figma 画线稿 → ComfyUI 渲染 → PS 精修",
}

# ═══ 案例 5: 室内设计方案 ═══
interior = {
    "需求": "空房间照片 → 不同风格装修效果",
    "流程": [
        "1. Depth CN: 保持房间空间结构",
        "2. Seg CN: 标注墙面/地板/天花板",
        "3. Prompt: 分别生成不同风格",
        "4. 中式/北欧/工业/日式 一键切换",
    ],
    "风格切换": {
        "北欧": "scandinavian, light wood, white, plants",
        "工业": "industrial, exposed brick, metal, loft",
        "日式": "japanese, tatami, minimal, wood, zen",
        "中式": "chinese traditional, rosewood, symmetry",
    },
}`}</pre>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
