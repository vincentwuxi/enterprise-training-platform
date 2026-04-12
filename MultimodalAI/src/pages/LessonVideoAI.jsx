import React, { useState } from 'react';
import './LessonCommon.css';

/* ─────────────────────────────────────────────
   Module 04 — 视频理解与生成
   Gemini 原生 / Sora / Runway
   ───────────────────────────────────────────── */

const VIDEO_TOPICS = [
  { name: 'Gemini 原生视频', icon: '💎', tag: 'Gemini',
    code: `# ─── Gemini: 原生视频理解 (无需抽帧!) ───
import google.generativeai as genai
import time

genai.configure(api_key="xxx")
model = genai.GenerativeModel("gemini-2.0-flash")

# ─── 1. 上传视频 ───
def upload_video(video_path: str):
    """上传视频到 Gemini File API"""
    video_file = genai.upload_file(video_path, mime_type="video/mp4")
    
    # 等待处理完成
    while video_file.state.name == "PROCESSING":
        print(f"⏳ 处理中... {video_file.state.name}")
        time.sleep(5)
        video_file = genai.get_file(video_file.name)
    
    if video_file.state.name != "ACTIVE":
        raise Exception(f"视频处理失败: {video_file.state.name}")
    
    print(f"✅ 视频就绪: {video_file.uri}")
    return video_file

# ─── 2. 视频理解 ───
def analyze_video(video_file, prompt: str):
    """原生视频分析 (不需要抽帧!)"""
    response = model.generate_content(
        [video_file, prompt],
        generation_config={"max_output_tokens": 4096},
    )
    return response.text

# ─── 实战场景 ───

# 场景1: 视频摘要
video = upload_video("meeting_recording.mp4")
summary = analyze_video(video, """
生成这个会议视频的结构化摘要:
1. 参会人数和角色
2. 讨论的主要议题
3. 达成的决议
4. 行动项 (谁/做什么/截止时间)
5. 关键争议点
""")

# 场景2: 教学视频章节
chapters = analyze_video(video, """
为这个教学视频生成章节时间轴:
- 列出每个主题的开始时间 (MM:SS 格式)
- 每个章节的标题和1句话摘要
- 标注重点/考点部分
格式: HH:MM:SS - 标题 | 摘要
""")

# 场景3: 视频问答
answer = analyze_video(video, "视频里的白板上写了什么公式？")

# 场景4: 安防/监控分析
alert = analyze_video(video, """
分析这段监控视频:
1. 检测异常行为
2. 统计人流量
3. 标注可疑时间点
返回 JSON 格式
""")

# ─── Gemini 视频优势 ───
# ✅ 无需抽帧: 直接上传原始视频
# ✅ 音频同步: 同时理解画面和声音
# ✅ 长视频: 支持 1 小时+
# ✅ 超低成本: 1分钟 ≈ ¥0.001
# ❌ 限制: 最大 2GB, 需要上传等待` },
  { name: '智能视频分析', icon: '🔍', tag: 'Analysis',
    code: `# ─── 视频分析 Pipeline: 抽帧 + 多模态理解 ───
import cv2
import base64
import numpy as np
from concurrent.futures import ThreadPoolExecutor

class VideoAnalyzer:
    """通用视频分析器 (支持任何 VLM)"""
    
    def __init__(self, vlm_client=None):
        self.client = vlm_client or OpenAI()
    
    # ─── 智能抽帧策略 ───
    def extract_frames(self, video_path, strategy="smart", **kwargs):
        """
        三种抽帧策略:
        - fixed:  固定间隔 (每N秒一帧)
        - scene:  场景变化检测 (内容变化时抽帧)
        - smart:  结合两者 + 关键帧
        """
        cap = cv2.VideoCapture(video_path)
        fps = cap.get(cv2.CAP_PROP_FPS)
        total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        if strategy == "fixed":
            return self._fixed_sample(cap, fps, kwargs.get("interval", 5))
        elif strategy == "scene":
            return self._scene_detect(cap, fps, kwargs.get("threshold", 30))
        else:
            return self._smart_sample(cap, fps, total)
    
    def _scene_detect(self, cap, fps, threshold):
        """基于直方图差异的场景变化检测"""
        frames = []
        prev_hist = None
        frame_idx = 0
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            # 计算直方图
            hist = cv2.calcHist([frame], [0, 1, 2], None, 
                              [8, 8, 8], [0, 256, 0, 256, 0, 256])
            hist = cv2.normalize(hist, hist).flatten()
            
            if prev_hist is not None:
                # 巴氏距离
                diff = cv2.compareHist(prev_hist, hist, cv2.HISTCMP_BHATTACHARYYA)
                if diff > threshold / 100:
                    frames.append({
                        "frame": frame,
                        "timestamp": frame_idx / fps,
                        "scene_change_score": diff,
                    })
            else:
                frames.append({"frame": frame, "timestamp": 0, "scene_change_score": 1.0})
            
            prev_hist = hist
            frame_idx += 1
        
        return frames
    
    def _smart_sample(self, cap, fps, total):
        """智能采样: 场景变化 + 均匀补充"""
        scene_frames = self._scene_detect(cap, fps, 25)
        
        # 如果场景帧太少，均匀补充
        if len(scene_frames) < 10:
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            interval = max(1, total // 20)  # 目标20帧
            for i in range(0, total, interval):
                cap.set(cv2.CAP_PROP_POS_FRAMES, i)
                ret, frame = cap.read()
                if ret:
                    scene_frames.append({
                        "frame": frame,
                        "timestamp": i / fps,
                        "scene_change_score": 0,
                    })
        
        # 去重 (时间戳相近的)
        return self._deduplicate(scene_frames, min_gap=2.0)
    
    # ─── 批量帧分析 ───
    def analyze_frames(self, frames, prompt, max_frames=20):
        """将关键帧送入 VLM 分析"""
        selected = frames[:max_frames]
        
        content = [{"type": "text", "text": f"""
分析以下视频关键帧 ({len(selected)} 帧):
{prompt}

每帧的时间戳标注在图片中。
"""}]
        
        for f in selected:
            _, buf = cv2.imencode('.jpg', f["frame"], 
                [cv2.IMWRITE_JPEG_QUALITY, 80])
            b64 = base64.standard_b64encode(buf).decode()
            content.append({
                "type": "image_url",
                "image_url": {"url": f"data:image/jpeg;base64,{b64}", "detail": "low"}
            })
        
        resp = self.client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": content}],
            max_tokens=2048,
        )
        return resp.choices[0].message.content` },
  { name: '视频生成', icon: '🎬', tag: 'Generation',
    code: `# ─── 视频生成: Sora / Runway / Kling ───

# ═══ 1. Sora (OpenAI) — 最强文生视频 ═══
# 目前仅 API waitlist，示例为预期接口
class SoraGenerator:
    """OpenAI Sora 视频生成 (预期API)"""
    
    async def generate(self, prompt: str, duration=5, resolution="1080p"):
        response = await client.videos.generate(
            model="sora",
            prompt=prompt,
            duration=duration,       # 5-60 秒
            resolution=resolution,   # 720p | 1080p | 4K
            aspect_ratio="16:9",     # 16:9 | 9:16 | 1:1
            style="cinematic",       # cinematic | animated | realistic
        )
        return response.url

# ═══ 2. Runway Gen-3 (商用可用) ═══
import requests

class RunwayGenerator:
    BASE_URL = "https://api.dev.runwayml.com/v1"
    
    def text_to_video(self, prompt, duration=5):
        """文字生成视频"""
        resp = requests.post(f"{self.BASE_URL}/text_to_video", headers={
            "Authorization": f"Bearer {RUNWAY_KEY}",
        }, json={
            "text_prompt": prompt,
            "duration": duration,
            "model": "gen3a_turbo",
            "ratio": "16:9",
        })
        task_id = resp.json()["id"]
        return self._wait_for_result(task_id)
    
    def image_to_video(self, image_url, prompt, duration=5):
        """图片 + 文字 → 视频 (更可控)"""
        resp = requests.post(f"{self.BASE_URL}/image_to_video", headers={
            "Authorization": f"Bearer {RUNWAY_KEY}",
        }, json={
            "model": "gen3a_turbo",
            "promptImage": image_url,
            "promptText": prompt,
            "duration": duration,
        })
        return self._wait_for_result(resp.json()["id"])
    
    def _wait_for_result(self, task_id, timeout=120):
        import time
        for _ in range(timeout // 5):
            resp = requests.get(f"{self.BASE_URL}/tasks/{task_id}", 
                headers={"Authorization": f"Bearer {RUNWAY_KEY}"})
            status = resp.json()
            if status["status"] == "SUCCEEDED":
                return status["output"][0]
            elif status["status"] == "FAILED":
                raise Exception(f"生成失败: {status.get('failure')}")
            time.sleep(5)

# ═══ 3. Kling (快手可灵) — 中文最强 ═══
# API: https://docs.qingque.cn/
# 特色: 中文理解强，人物一致性好，5秒/¥0.5

# ─── 视频生成最佳实践 ───
PROMPT_TIPS = """
好的视频Prompt结构:
1. 主体: "一个穿红裙子的女人"
2. 动作: "在雨中撑伞行走"  
3. 场景: "东京霓虹灯街道"
4. 镜头: "缓慢跟拍，景深效果"
5. 风格: "电影级画质，暖色调"
6. 细节: "雨滴溅起水花，路面反光"

避免:
❌ 太抽象: "梦幻的感觉"
❌ 太复杂: 一个Prompt包含多个场景
❌ 文字渲染: AI视频中的文字通常很差
"""

# ─── 价格对比 ───
# | 方案        | 5s视频 | 质量 | 速度    | 特色        |
# |------------|--------|------|---------|-------------|
# | Sora       | ~$0.50 | ⭐⭐⭐⭐⭐| 1-5min | 物理模拟    |
# | Runway     | ~$0.25 | ⭐⭐⭐⭐ | 30s-2m | 图生视频    |
# | Kling      | ~$0.07 | ⭐⭐⭐⭐ | 1-3min | 中文理解    |
# | Pika       | ~$0.10 | ⭐⭐⭐  | 30s    | 风格化      |
# | Stable Vid | 免费   | ⭐⭐⭐  | 自部署 | 开源可控    |` },
  { name: '视频编辑 AI', icon: '✂️', tag: 'Editing',
    code: `# ─── AI 视频编辑自动化 ───

class AIVideoEditor:
    """AI 驱动的视频编辑"""
    
    def __init__(self):
        self.analyzer = VideoAnalyzer()
    
    # ─── 1. 自动剪辑 (去废话/沉默) ───
    async def auto_cut(self, video_path: str) -> str:
        """去除沉默片段和无意义内容"""
        import subprocess
        
        # 检测静音段
        result = subprocess.run([
            "ffmpeg", "-i", video_path,
            "-af", "silencedetect=noise=-35dB:d=1.5",
            "-f", "null", "-"
        ], capture_output=True, text=True)
        
        # 解析静音区间
        silences = self._parse_silence(result.stderr)
        
        # 生成剪辑命令 (保留有声部分)
        segments = self._invert_segments(silences, self._get_duration(video_path))
        
        # FFmpeg 拼接
        concat_file = self._create_concat(video_path, segments)
        output = video_path.replace(".mp4", "_cut.mp4")
        subprocess.run([
            "ffmpeg", "-f", "concat", "-i", concat_file,
            "-c", "copy", output
        ])
        return output
    
    # ─── 2. 自动字幕 ───
    async def auto_subtitle(self, video_path: str, style="default"):
        """Whisper 转录 → SRT 字幕 → 烧录"""
        # 提取音频
        audio_path = self._extract_audio(video_path)
        
        # Whisper 转录 (带时间戳)
        transcript = client.audio.transcriptions.create(
            model="whisper-1",
            file=open(audio_path, "rb"),
            response_format="srt",  # 直接输出 SRT!
        )
        
        srt_path = video_path.replace(".mp4", ".srt")
        with open(srt_path, "w") as f:
            f.write(transcript)
        
        # 烧录字幕到视频
        styles = {
            "default": "FontSize=22,PrimaryColour=&Hffffff,Outline=2",
            "cinematic": "FontSize=18,PrimaryColour=&Hffffff,Outline=1,Shadow=1",
            "bold": "FontSize=28,Bold=1,PrimaryColour=&H00ffff,Outline=3",
        }
        
        output = video_path.replace(".mp4", "_subtitled.mp4")
        subprocess.run([
            "ffmpeg", "-i", video_path,
            "-vf", f"subtitles={srt_path}:force_style='{styles[style]}'",
            "-c:a", "copy", output
        ])
        return output
    
    # ─── 3. AI 精彩片段提取 ───
    async def extract_highlights(self, video_path: str, count=5):
        """用 LLM 找出视频中最精彩的片段"""
        # 转录全文
        transcript = await self.transcribe_with_timestamps(video_path)
        
        # LLM 分析找精彩片段
        highlights = client.chat.completions.create(
            model="gpt-4o",
            messages=[{
                "role": "user",
                "content": f"""
分析这段视频的转录文本，找出 {count} 个最精彩的片段:

{transcript}

返回 JSON:
[{{
    "start": 开始秒数,
    "end": 结束秒数,
    "title": "片段标题",
    "reason": "为什么精彩",
    "score": 1-10
}}]

精彩的标准: 有趣、有洞见、有争议、有情感高潮
"""
            }],
        )
        return json.loads(highlights.choices[0].message.content)` },
];

export default function LessonVideoAI() {
  const [topicIdx, setTopicIdx] = useState(0);
  const t = VIDEO_TOPICS[topicIdx];

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge amber">🎨 module_04 — 视频 AI</div>
      <div className="fs-hero">
        <h1>视频 AI：理解、分析、生成、编辑</h1>
        <p>
          视频是信息密度最高的模态——<strong>Gemini 原生理解视频</strong>无需抽帧、
          <strong>Sora/Runway 文生视频</strong>创造从未存在的画面、
          <strong>AI 自动剪辑</strong>让后期效率翻 10 倍。
        </p>
      </div>

      <div className="fs-section">
        <h2 className="fs-section-title">🎬 视频 AI 技术栈</h2>
        <div className="fs-pills">
          {VIDEO_TOPICS.map((t, i) => (
            <button key={i} className={`fs-btn ${i === topicIdx ? 'primary' : ''}`}
              onClick={() => setTopicIdx(i)}>
              {t.icon} {t.name}
            </button>
          ))}
        </div>
        <div className="fs-card" style={{ borderLeft: '3px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, color: '#fbbf24' }}>{t.icon} {t.name}</h3>
            <span className="fs-tag amber">{t.tag}</span>
          </div>
          <div className="fs-code-wrap">
            <div className="fs-code-head">
              <span className="fs-code-dot" style={{ background: '#ef4444' }} />
              <span className="fs-code-dot" style={{ background: '#f59e0b' }} />
              <span className="fs-code-dot" style={{ background: '#22c55e' }} />
              🐍 video_{t.tag.toLowerCase().replace(/\s/g, '_')}.py
            </div>
            <pre className="fs-code">{t.code}</pre>
          </div>
        </div>
      </div>

      <div className="fs-nav">
        <button className="fs-btn">← 语音工程</button>
        <button className="fs-btn primary">图像生成 →</button>
      </div>
    </div>
  );
}
