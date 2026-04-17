import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['智能剪辑', '内容理解', '字幕/翻译', '视频摘要'];

export default function LessonVideoEditing() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge teal">✂️ module_06 — AI 视频编辑</div>
      <div className="fs-hero">
        <h1>AI 视频编辑：智能剪辑 / 内容理解 / 字幕翻译 / 摘要 — 视频后期自动化</h1>
        <p>
          视频内容爆炸式增长，但编辑成本居高不下。AI 正在颠覆视频后期：
          <strong>自动剪辑</strong> (精彩片段提取/节奏对齐)、
          <strong>视频理解</strong> (场景/物体/事件检测)、
          <strong>多语言字幕</strong> (Whisper 转写+翻译)、
          <strong>视频摘要</strong> (长视频自动浓缩) — 将数小时的人工缩短到分钟级。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">✂️ 视频编辑</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🎬 智能剪辑</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#14b8a6'}}></span> smart_editing</div>
              <pre className="fs-code">{`# AI 智能剪辑: 自动化视频后期

# ═══ 核心能力 ═══
smart_editing_features = {
    "精彩片段提取": "识别高光时刻 → 自动剪辑短视频",
    "无用镜头删除": "删除空镜/模糊/重复片段",
    "节奏剪辑":     "按音乐节拍自动切换镜头",
    "转场添加":     "智能选择转场效果",
    "色彩校正":     "自动白平衡/曝光/色调统一",
}

# ═══ 精彩片段提取 ═══
import cv2
import numpy as np
from transformers import pipeline

# 方法1: 基于视觉显著性
def extract_highlights(video_path, threshold=0.7):
    """提取视觉变化大的片段"""
    cap = cv2.VideoCapture(video_path)
    scores = []
    prev_frame = None
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret: break
        
        if prev_frame is not None:
            diff = cv2.absdiff(frame, prev_frame)
            score = diff.mean() / 255.0
            scores.append(score)
        prev_frame = frame
    
    # 选择分数最高的片段
    highlights = find_peaks(scores, threshold)
    return highlights

# 方法2: 多模态理解 (GPT-4V / Gemini)
highlight_prompt = """
分析这段视频, 找出最有趣/有价值的片段:
- 返回每个片段的起止时间
- 标注片段类型(搞笑/观点/产品展示/高光时刻)
- 评分 1-10 (适合做短视频的程度)
"""

# ═══ 无声检测 + 删除 ═══
def remove_silence(audio, threshold_db=-40, min_silence_ms=500):
    """检测并删除静音段"""
    from pydub import AudioSegment
    from pydub.silence import detect_silence
    
    audio = AudioSegment.from_file(audio)
    silences = detect_silence(audio, min_silence_ms, threshold_db)
    
    # 返回非静音时间段
    non_silent = get_non_silent_ranges(audio.duration_seconds, silences)
    return non_silent

# ═══ 商业工具 ═══
editing_tools = {
    "OpusClip":      "长视频 → 短视频 (AI 自动)",
    "Descript":      "文本式视频编辑 (删除文字=删除视频)",
    "CapCut (剪映)": "字节跳动, AI 剪辑+特效",
    "Runway":        "AI 视频编辑 + 生成一体",
    "Adobe Premiere": "AI 功能集成 (Firefly)",
}`}</pre>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🧠 视频内容理解</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#3b82f6'}}></span> video_understanding</div>
              <pre className="fs-code">{`# 视频理解: 让 AI 读懂视频的每一帧

# ═══ 多模态视频理解 ═══
# GPT-4o / Gemini 可以直接"看"视频!

# Gemini 视频理解 (原生支持)
import google.generativeai as genai

model = genai.GenerativeModel("gemini-2.0-flash")

# 上传视频文件
video = genai.upload_file("meeting_recording.mp4")

# 视频问答
response = model.generate_content([
    video,
    "请分析这个会议视频:"
    "1. 参会人数和角色"
    "2. 讨论了哪些议题"
    "3. 每个议题的结论"
    "4. 代办事项列表"
])
print(response.text)

# ═══ 场景检测 ═══
scene_detection = {
    "PySceneDetect": {
        "方法": "内容变化检测 (图像差异)",
        "速度": "快 (CPU 即可)",
        "精度": "基本准确",
    },
    "TransNetV2": {
        "方法": "深度学习场景边界检测",
        "速度": "中 (需 GPU)",
        "精度": "最高",
    },
}

# PySceneDetect 使用
from scenedetect import detect, ContentDetector
scene_list = detect("video.mp4", ContentDetector())
for scene in scene_list:
    print(f"Scene: {scene[0].get_timecode()} - {scene[1].get_timecode()}")

# ═══ 视频标签/分类 ═══
video_tagging = {
    "Google Video AI": "商业 API, 预训练标签检测",
    "Amazon Rekognition": "物体/人脸/文字/不安全内容",
    "InternVideo":       "开源, 视频理解 foundation model",
    "VideoLLaMA":        "开源, 视频+语言多模态",
}

# ═══ 视频搜索 ═══
# 未来: 用自然语言搜索视频中的片段
# "找到视频中讨论预算的部分"
# → 语音转写 + 视觉理解 + 语义检索`}</pre>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>📝 字幕与翻译</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f97316'}}></span> subtitles</div>
              <pre className="fs-code">{`# AI 字幕: 转写 + 翻译 + 硬字幕

# ═══ 全流程 ═══
# 视频 → 音频提取 → ASR 转写 → 时间戳对齐 → 翻译 → 渲染字幕

# ═══ Step 1: 高质量转写 ═══
from faster_whisper import WhisperModel

model = WhisperModel("large-v3", device="cuda")

def transcribe_video(video_path):
    """视频转写为带时间戳的字幕"""
    segments, info = model.transcribe(
        video_path,
        word_timestamps=True,  # 词级时间戳!
        language="zh",
    )
    
    srt_entries = []
    for i, seg in enumerate(segments):
        srt_entries.append({
            "index": i + 1,
            "start": format_time(seg.start),
            "end":   format_time(seg.end),
            "text":  seg.text.strip(),
        })
    
    return srt_entries

# ═══ Step 2: 多语言翻译 ═══
# 方案1: LLM 翻译 (上下文更好)
from openai import OpenAI
client = OpenAI()

def translate_subtitles(srt_entries, target_lang="en"):
    """批量翻译字幕 (保持时间戳)"""
    # 提取纯文本
    texts = [e["text"] for e in srt_entries]
    
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{
            "role": "system",
            "content": f"翻译以下字幕到{target_lang}。"
                       "保持简洁, 适合字幕显示。"
                       "每行对应翻译, 用\\n分隔。"
        }, {
            "role": "user",
            "content": "\\n".join(texts)
        }]
    )
    
    translations = response.choices[0].message.content.split("\\n")
    
    for entry, trans in zip(srt_entries, translations):
        entry["translated"] = trans
    
    return srt_entries

# ═══ Step 3: 字幕渲染 ═══
# 方案A: FFmpeg 硬字幕
# ffmpeg -i video.mp4 -vf subtitles=subs.srt output.mp4

# 方案B: 可定制样式
# ffmpeg -i video.mp4 -vf "subtitles=subs.srt:force_style=
# 'FontSize=24,PrimaryColour=&HFFFFFF,Outline=2'" output.mp4

# ═══ 字幕工具对比 ═══
subtitle_tools = {
    "Whisper + FFmpeg": "开源免费, 质量最高",
    "剪映/CapCut":      "一键字幕, 支持多语言",
    "Rev.com":          "专业字幕服务 + AI 辅助",
    "YouTube Studio":   "内置 AI 字幕 (尚可)",
}`}</pre>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>📊 视频摘要</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> video_summary</div>
              <pre className="fs-code">{`# 视频摘要: 长视频 → 精华提炼

# ═══ 应用场景 ═══
use_cases = {
    "会议录像":   "1小时会议 → 3分钟摘要 + 文字纪要",
    "教学视频":   "45分钟课程 → 知识点列表 + 重点片段",
    "监控视频":   "24小时 → 异常事件列表",
    "体育赛事":   "90分钟比赛 → 5分钟精彩集锦",
    "新闻视频":   "多段新闻 → 主题+要点摘要",
}

# ═══ 技术方案 ═══

# 方案A: 视觉+音频 多模态摘要
multimodal_summary = {
    "Step 1": "场景检测 → 分割片段",
    "Step 2": "每段提取关键帧 (代表图)",
    "Step 3": "音频转文字 (Whisper)",
    "Step 4": "LLM 综合视觉+文字 → 生成摘要",
    "Step 5": "根据摘要选择关键片段 → 精华视频",
}

# 方案B: Gemini 直接理解 (最简单)
import google.generativeai as genai

model = genai.GenerativeModel("gemini-2.0-flash")
video = genai.upload_file("lecture.mp4")

# 文字摘要
text_summary = model.generate_content([
    video,
    """请为这个视频生成结构化摘要:
    1. 视频主题和概要 (50字)
    2. 时间线分段 (每段主题+要点)
    3. 关键知识点列表
    4. 精华片段时间戳 (最值得看的)
    5. 一句话总结"""
])

# 方案C: NotebookLM (Google)
# 上传视频 → 自动生成音频播客摘要
# 完全免费, 但不可编程

# ═══ 关键帧提取 ═══
import cv2
from sklearn.cluster import KMeans

def extract_keyframes(video_path, n_keyframes=10):
    """K-Means 聚类提取关键帧"""
    cap = cv2.VideoCapture(video_path)
    frames, features = [], []
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret: break
        frame_small = cv2.resize(frame, (64, 64))
        features.append(frame_small.flatten())
        frames.append(frame)
    
    # 聚类 → 选择最接近聚类中心的帧
    kmeans = KMeans(n_clusters=n_keyframes)
    kmeans.fit(features)
    
    keyframes = []
    for center in kmeans.cluster_centers_:
        distances = [np.linalg.norm(f - center) for f in features]
        idx = np.argmin(distances)
        keyframes.append((idx, frames[idx]))
    
    return sorted(keyframes)

# ═══ 企业应用 ═══
# 会议助手: Otter.ai / Fireflies.ai / 飞书妙记
# 教育平台: 自动为课程视频生成目录+摘要
# 媒体:     长视频自动生成短视频版本`}</pre>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
