import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['图像标注', '音视频数据', '跨模态对齐', '数据管线'];

export default function LessonMultimodalData() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge cyan">🏗️ module_07 — 多模态数据</div>
      <div className="fs-hero">
        <h1>多模态数据：图像 / 音频 / 视频的标注与对齐</h1>
        <p>
          GPT-4o 能看图、听声、读文本——这背后是海量<strong>多模态数据工程</strong>。
          本模块覆盖图像标注（目标检测/分割/图文描述）、
          音视频数据处理（ASR 标注/视频片段切分/时间戳对齐）、
          跨模态对齐（CLIP/图文对/视频文本对齐）、
          以及端到端的多模态数据管线构建。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🎨 多模态数据</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🖼️ 图像标注任务层次</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> image_annotation</div>
                <pre className="fs-code">{`图像标注: 从简单到复杂

         简单                              复杂
    ◀──────────────────────────────────────▶
    
1️⃣ 图像分类 (Classification)
   输入: 整张图 → 输出: 类别标签
   成本: $0.01-0.05/张 | 速度: 300/hr
   工具: Label Studio | 标签体系设计关键
   
2️⃣ 目标检测 (Object Detection)
   输入: 图像 → 输出: 边界框 (BBox) + 类别
   成本: $0.10-0.30/张 | 速度: 60/hr
   格式: COCO / Pascal VOC / YOLO
   ┌──────────────────┐
   │  ┌───────┐       │
   │  │ person│       │
   │  └───────┘       │
   │      ┌──────┐    │
   │      │  car │    │
   │      └──────┘    │
   └──────────────────┘

3️⃣ 语义分割 (Semantic Segmentation)
   输入: 图像 → 输出: 每个像素的类别
   成本: $1.0-5.0/张 | 速度: 5/hr
   工具: CVAT / Labelme
   应用: 自动驾驶, 医疗影像

4️⃣ 实例分割 (Instance Segmentation)
   输入: 图像 → 输出: 每个实例的掩码
   成本: $2.0-10/张 | 速度: 3/hr
   比语义分割更细: 区分不同的object

5️⃣ 图文描述 (Image Captioning)
   输入: 图像 → 输出: 自然语言描述
   成本: $0.15-0.50/张 | 速度: 30/hr
   质量关键: 描述丰富度和准确度
   应用: 训练多模态模型 (CLIP/LLaVA)

6️⃣ Visual QA
   输入: 图像 + 问题 → 输出: 答案
   成本: $0.20-1.00/对 | 速度: 20/hr
   应用: 训练视觉推理能力

AI 辅助标注趋势:
├── SAM (Segment Anything): 一键分割
├── Grounding DINO: 文本→检测框
├── LLaVA: 自动生成图文描述
└── 人工只需审核 (效率 ↑ 5x)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card">
              <h3>🎵 音频数据工程</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> audio</div>
                <pre className="fs-code">{`音频数据处理管线:

1️⃣ 语音识别 (ASR) 标注
├── 逐字转写 (Transcription)
├── 时间戳对齐 (Word-level)
├── 说话人分离 (Diarization)
├── 情感标注 (语气/情绪)
└── 工具: Whisper + 人工校对

2️⃣ 音频预处理
├── 采样率标准化 (16kHz/48kHz)
├── 降噪 (RNNoise/DeepFilterNet)
├── 静音切分 (VAD)
├── 音量归一化 (LUFS)
└── 格式: WAV/FLAC (无损)

3️⃣ 训练数据构建
├── 语音合成 (TTS): 文本→音频对
│   成本: ~$0.001/条 (合成)
├── 语音识别 (ASR): 音频→文本对
│   成本: ~$0.05/条 (人工转写)
├── 语音翻译: 音频→另一语言
│   成本: ~$0.10/条
└── 音频理解: 音频→描述/问答
    成本: ~$0.15/条

4️⃣ 数据增强
├── 速度变换 (0.8x-1.2x)
├── 音高变换 (±2 semitones)
├── 背景噪声混合
│   ├── 噪声库: AudioSet
│   ├── SNR: 0-20dB
│   └── 环境: 咖啡馆/街道/办公室
├── 房间模拟 (RIR 混响)
└── SpecAugment (频谱遮挡)`}</pre>
              </div>
            </div>

            <div className="fs-card">
              <h3>🎥 视频数据工程</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#fb7185'}}></span> video</div>
                <pre className="fs-code">{`视频数据: 最复杂的模态

1️⃣ 视频标注任务
├── 时序动作检测
│   "0:03-0:08 打篮球"
│   "0:12-0:15 投篮"
├── 视频分割 (Video Segmentation)
│   逐帧目标追踪
├── 视频描述 (Video Captioning)
│   "一个人在公园里遛狗"
├── 视频QA
│   Q: "视频中有几辆车?"
│   A: "3辆"
└── 视频摘要
    长视频 → 关键帧提取

2️⃣ 处理挑战
├── 数据量巨大
│   1小时 1080p ≈ 10GB
│   100hr 训练数据 ≈ 1TB
├── 标注成本极高
│   逐帧标注: $50-200/分钟
│   时序标注: $5-20/分钟
├── 时空一致性
│   帧间标注需保持一致
└── 存储和传输
    需要分布式处理

3️⃣ 优化策略
├── 关键帧采样 (不是每帧都需要)
│   每秒 1-5 帧 (vs 30fps)
├── 自动追踪 + 人工修正
│   用 SAM2 自动跟踪,人工修正
├── 层级标注
│   粗标 → 细标 → 审核
└── 视频合成
    Sora/Gen-3 → 合成训练视频

主要数据集:
├── Kinetics-700: 动作识别
├── ActivityNet: 动作检测
├── HowTo100M: 教学视频
└── WebVid: 网络视频-文本对`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔗 跨模态对齐</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> alignment.py</div>
                <pre className="fs-code">{`# —— 跨模态对齐: 让 AI 同时理解"看"和"读" ——

class MultimodalAlignment:
    """构建跨模态对齐数据"""
    
    # 核心: 图文对齐 (Image-Text Pairs)
    # CLIP 的训练需要 4 亿图文对!
    
    def build_image_text_pairs(self, raw_images, raw_texts):
        """构建高质量图文对"""
        pairs = []
        
        # 策略 1: 网页爬取 (alt-text)
        # <img alt="金毛犬在草地上奔跑" src="...">
        # 数量: 亿级 | 质量: 中低 (alt-text 常常不准)
        web_pairs = self.crawl_alt_text()
        
        # 策略 2: LLM 重新描述 (Re-captioning)
        # 用 LLaVA/GPT-4V 重新生成描述
        # 质量: 高 | 成本: ~$0.01/张
        for img in raw_images:
            caption = await self.vlm.describe(img, detail="high")
            pairs.append({"image": img, "text": caption})
        
        # 策略 3: 合成图文对
        # 用文本生成图像 (DALL-E/SD)
        # 完美对齐 | 但图像不够真实
        
        return pairs
    
    def quality_filter(self, pairs):
        """图文对齐质量过滤"""
        filtered = []
        for pair in pairs:
            # 1. CLIP Score (图文相似度)
            clip_score = self.clip.score(pair["image"], pair["text"])
            if clip_score < 0.25:
                continue  # 图文不匹配
            
            # 2. 文本质量
            if len(pair["text"]) < 10:
                continue  # 描述太短
            
            # 3. 图像质量
            if self.image_quality(pair["image"]) < 0.5:
                continue  # 模糊/水印/低质量
            
            # 4. 去重 (相似图像只保留一张)
            if not self.is_duplicate(pair["image"]):
                filtered.append(pair)
        
        return filtered
    
    # 对齐数据的规模需求:
    # ├── CLIP:     400M 图文对
    # ├── LLaVA:    1.5M 图文对 (高质量)
    # ├── Qwen2-VL: 数十亿图文对
    # └── 趋势: 质量比数量重要
    #     高质量 1M > 低质量 100M`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⚡ 多模态数据管线</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> pipeline</div>
                <pre className="fs-code">{`# —— 端到端多模态数据管线 ——

多模态数据处理管线:

┌─────────────────────────────────────────────────────────┐
│ 数据源                                                   │
│ ├── 网页爬取 (图片+alt-text+正文)                         │
│ ├── 视频平台 (视频+字幕+评论)                              │
│ ├── 文档 (PDF/PPT 内嵌图表)                               │
│ └── 传感器 (相机/麦克风/LiDAR)                            │
└────────────────────┬────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 模态分离与预处理                                          │
│ ├── 图像: 裁剪/缩放/去水印/质量评分                       │
│ ├── 文本: 清洗/语言检测/有害内容过滤                       │
│ ├── 音频: 降噪/分段/ASR转写                               │
│ ├── 视频: 关键帧提取/场景切分                              │
│ └── 表格/图表: OCR/结构化提取                              │
└────────────────────┬────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 对齐与关联                                               │
│ ├── 图文对齐: CLIP Score 过滤                             │
│ ├── 音文对齐: 时间戳→文本 (Whisper)                       │
│ ├── 视频文本: 帧→描述 (VLM Re-captioning)                 │
│ └── 交叉引用: 同一实体跨模态关联                           │
└────────────────────┬────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 质量控制 & 去重                                           │
│ ├── 单模态去重 (图像pHash/文本MinHash)                     │
│ ├── 跨模态去重 (相似图文对去重)                            │
│ ├── 质量评分 (多维度自动评分)                              │
│ └── 人工抽检 (5-10% 样本)                                │
└────────────────────┬────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 格式化 & 存储                                             │
│ ├── WebDataset: 高效大规模训练                             │
│ ├── HuggingFace Datasets: 社区标准                        │
│ ├── 版本控制: DVC / Git LFS                                │
│ └── 元数据: 来源/许可/处理历史                             │
└─────────────────────────────────────────────────────────┘

工具链:
├── 爬取: scrapy + Playwright
├── 处理: FFmpeg + Pillow + Librosa
├── 标注: CVAT + Label Studio
├── 计算: Apache Spark + Ray
├── 存储: S3 + Parquet + WebDataset
└── 编排: Airflow + Prefect`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
