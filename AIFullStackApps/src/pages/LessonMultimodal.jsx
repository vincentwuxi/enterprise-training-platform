import React, { useState } from 'react';
import './LessonCommon.css';

/* ─────────────────────────────────────────────
   Module 06 — 多模态应用
   图像理解 / 语音交互 / 视频分析
   ───────────────────────────────────────────── */

const MODALITIES = [
  { name: '图像理解', icon: '🖼️', tag: 'Vision',
    useCases: ['产品图片描述生成', 'OCR + 智能提取', '图表/报表分析', '缺陷检测'],
    code: `# ─── 图像理解: GPT-4o Vision ───
from openai import OpenAI
import base64, httpx

client = OpenAI()

# 方式 1: URL 图片
def analyze_image_url(image_url: str, prompt: str):
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{
            "role": "user",
            "content": [
                {"type": "text", "text": prompt},
                {"type": "image_url", "image_url": {"url": image_url}},
            ],
        }],
        max_tokens=1024,
    )
    return response.choices[0].message.content

# 方式 2: Base64 上传
def analyze_image_file(file_path: str, prompt: str):
    with open(file_path, "rb") as f:
        b64 = base64.standard_b64encode(f.read()).decode()
    
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{
            "role": "user",
            "content": [
                {"type": "text", "text": prompt},
                {"type": "image_url", "image_url": {
                    "url": f"data:image/jpeg;base64,{b64}",
                    "detail": "high"  # high | low | auto
                }},
            ],
        }],
    )
    return response.choices[0].message.content

# ─── 实战: 发票 OCR + 结构化提取 ───
INVOICE_PROMPT = """
分析这张发票图片，提取以下信息并返回 JSON:
{
  "vendor": "供应商名称",
  "invoice_number": "发票号码",
  "date": "开票日期",
  "items": [{"name": "品名", "qty": 数量, "price": 单价}],
  "total": 合计金额,
  "tax": 税额
}
"""
result = analyze_image_file("invoice.jpg", INVOICE_PROMPT)

# ─── 实战: 图表数据提取 ───
CHART_PROMPT = """
分析这个图表:
1. 图表类型是什么？
2. 提取所有数据点
3. 描述趋势和关键发现
4. 以 CSV 格式输出数据
"""` },
  { name: '语音交互', icon: '🎤', tag: 'Speech',
    useCases: ['语音助手', '会议转录 + 摘要', '多语言翻译', '语音客服'],
    code: `# ─── 语音交互: Whisper + TTS ───
from openai import OpenAI
from pathlib import Path

client = OpenAI()

# ─── 语音转文字 (STT) ───
def speech_to_text(audio_path: str, language="zh") -> str:
    """Whisper 语音识别"""
    with open(audio_path, "rb") as f:
        transcript = client.audio.transcriptions.create(
            model="whisper-1",
            file=f,
            language=language,
            response_format="verbose_json",  # 带时间戳
            timestamp_granularities=["segment"],
        )
    return transcript

# ─── 文字转语音 (TTS) ───
def text_to_speech(text: str, voice="nova", output="output.mp3"):
    """OpenAI TTS 语音合成"""
    response = client.audio.speech.create(
        model="tts-1-hd",        # tts-1 (快) | tts-1-hd (高质量)
        voice=voice,              # alloy|echo|fable|onyx|nova|shimmer
        input=text,
        speed=1.0,                # 0.25 - 4.0
    )
    response.stream_to_file(output)

# ─── 实战: 语音对话助手 ───
import sounddevice as sd
import numpy as np

async def voice_chat():
    """完整语音对话循环"""
    while True:
        # 1. 录音
        audio = record_audio(duration=10)
        save_wav(audio, "input.wav")
        
        # 2. STT
        text = speech_to_text("input.wav")
        print(f"🎤 用户: {text.text}")
        
        # 3. LLM 处理
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "你是语音助手，回答简洁。"},
                {"role": "user", "content": text.text},
            ],
        )
        reply = response.choices[0].message.content
        print(f"🤖 助手: {reply}")
        
        # 4. TTS 播放
        text_to_speech(reply, output="reply.mp3")
        play_audio("reply.mp3")

# ─── 实战: 会议转录 + 摘要 ───
async def meeting_summary(audio_path: str):
    # 转录 (带时间戳)
    transcript = speech_to_text(audio_path)
    
    # 结构化摘要
    summary = client.chat.completions.create(
        model="gpt-4o",
        messages=[{
            "role": "user",
            "content": f"""将以下会议记录生成结构化摘要:
{transcript.text}

格式:
## 参与者
## 议题
## 关键决策
## 行动项 (谁/做什么/截止日期)
"""
        }],
    )
    return summary.choices[0].message.content` },
  { name: '视频分析', icon: '🎬', tag: 'Video',
    useCases: ['视频内容审核', '视频摘要', '教学视频章节', '监控异常检测'],
    code: `# ─── 视频分析: 关键帧提取 + 理解 ───
import cv2
import base64
from openai import OpenAI

client = OpenAI()

def extract_keyframes(video_path: str, interval=30) -> list:
    """每 N 秒提取一帧"""
    cap = cv2.VideoCapture(video_path)
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    frames = []
    frame_count = 0
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        
        if frame_count % (fps * interval) == 0:
            # 转 base64
            _, buffer = cv2.imencode('.jpg', frame, 
                [cv2.IMWRITE_JPEG_QUALITY, 85])
            b64 = base64.standard_b64encode(buffer).decode()
            frames.append({
                "timestamp": frame_count // fps,
                "base64": b64,
            })
        frame_count += 1
    
    cap.release()
    return frames

def analyze_video(video_path: str, prompt: str):
    """分析视频内容"""
    frames = extract_keyframes(video_path, interval=30)
    
    # 构建多图消息
    content = [{"type": "text", "text": f"""
分析以下视频的关键帧 ({len(frames)} 帧，每30秒一帧)。
{prompt}
"""}]
    
    for frame in frames[:20]:  # 最多 20 帧
        content.append({
            "type": "image_url",
            "image_url": {
                "url": f"data:image/jpeg;base64,{frame['base64']}",
                "detail": "low"
            }
        })
    
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": content}],
        max_tokens=2048,
    )
    return response.choices[0].message.content

# ─── 实战: 视频摘要 + 章节生成 ───
result = analyze_video("lecture.mp4", """
1. 生成视频内容摘要
2. 按主题划分章节，标注时间戳
3. 提取关键知识点
4. 生成思维导图结构
""")` },
  { name: 'Gemini 原生多模态', icon: '💎', tag: 'Native',
    useCases: ['音视频直接理解', '长文档分析', '代码截图解析', '实时视频流'],
    code: `# ─── Gemini: 原生多模态 (无需预处理) ───
import google.generativeai as genai

genai.configure(api_key="xxx")
model = genai.GenerativeModel("gemini-2.0-flash")

# ─── 直接传入文件 (无需 base64) ───
# 支持: 图片、音频、视频、PDF、代码文件

# 1. 视频直接分析 (无需抽帧!!)
video_file = genai.upload_file("meeting.mp4")
response = model.generate_content([
    video_file,
    "分析这个会议视频，列出议题、决策和行动项"
])
print(response.text)

# 2. 音频直接理解 (无需 Whisper)
audio_file = genai.upload_file("podcast.mp3")
response = model.generate_content([
    audio_file,
    "转录这段播客并生成结构化摘要"
])

# 3. PDF 理解 (无需解析库)
pdf_file = genai.upload_file("report.pdf")
response = model.generate_content([
    pdf_file,
    "提取这份财报的关键财务数据，返回 JSON"
])

# 4. 多文件混合分析
response = model.generate_content([
    genai.upload_file("q3_report.pdf"),
    genai.upload_file("q3_chart.png"),
    genai.upload_file("q3_meeting.mp3"),
    """综合以上三个文件:
    1. PDF 财报数据
    2. 图表趋势
    3. 会议讨论

    生成一份综合分析报告。"""
])

# 5. 长上下文 (200万 tokens!)
# Gemini 支持超长上下文，可以:
# - 一次分析整本书
# - 分析数小时的代码仓库
# - 处理几十页的文档集合` },
];

export default function LessonMultimodal() {
  const [modIdx, setModIdx] = useState(0);
  const m = MODALITIES[modIdx];

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge cyan">🧩 module_06 — 多模态应用</div>
      <div className="fs-hero">
        <h1>多模态应用：图像、语音、视频的 AI 理解</h1>
        <p>
          AI 不只是处理文字——<strong>GPT-4o 看图表</strong>、<strong>Whisper 听会议</strong>、
          <strong>Gemini 直接理解视频</strong>。本模块教你构建能<strong>"看、听、说"</strong>
          的全感知应用，每个模态都有完整的生产代码。
        </p>
      </div>

      <div className="fs-section">
        <h2 className="fs-section-title">🌈 四大模态能力</h2>
        <div className="fs-pills">
          {MODALITIES.map((mod, i) => (
            <button key={i} className={`fs-btn ${i === modIdx ? 'primary' : ''}`}
              onClick={() => setModIdx(i)}>
              {mod.icon} {mod.name}
            </button>
          ))}
        </div>
        <div className="fs-card" style={{ borderLeft: '3px solid #06b6d4' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h3 style={{ margin: 0, color: '#22d3ee' }}>{m.icon} {m.name}</h3>
            <span className="fs-tag cyan">{m.tag}</span>
          </div>
          <div className="fs-grid-2" style={{ marginBottom: '1rem' }}>
            <div className="fs-alert info">
              <strong>📋 典型用例</strong>
              {m.useCases.map((u, i) => <div key={i}>• {u}</div>)}
            </div>
          </div>
          <div className="fs-code-wrap">
            <div className="fs-code-head">
              <span className="fs-code-dot" style={{ background: '#ef4444' }} />
              <span className="fs-code-dot" style={{ background: '#f59e0b' }} />
              <span className="fs-code-dot" style={{ background: '#22c55e' }} />
              🐍 multimodal_{m.tag.toLowerCase()}.py
            </div>
            <pre className="fs-code">{m.code}</pre>
          </div>
        </div>
      </div>

      {/* model comparison */}
      <div className="fs-section">
        <h2 className="fs-section-title">📊 多模态模型对比</h2>
        <div className="fs-card">
          <table className="fs-table">
            <thead><tr><th>模型</th><th>图像</th><th>音频</th><th>视频</th><th>PDF</th><th>最长上下文</th><th>价格</th></tr></thead>
            <tbody>
              {[
                ['GPT-4o', '✅ 强', '✅ Whisper', '❌ 需抽帧', '❌ 需解析', '128K', '$$$'],
                ['Claude 3.5', '✅ 强', '❌', '❌ 需抽帧', '✅ 原生', '200K', '$$$'],
                ['Gemini 2.0', '✅ 强', '✅ 原生', '✅ 原生', '✅ 原生', '2M (!)', '$$'],
                ['Qwen2-VL', '✅ 开源', '❌', '✅ 部分', '❌', '32K', '免费'],
              ].map(([model, ...caps], i) => (
                <tr key={i}>
                  <td><strong style={{ color: '#a78bfa' }}>{model}</strong></td>
                  {caps.map((c, j) => <td key={j} style={{ color: '#94a3b8', fontSize: '0.82rem' }}>{c}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="fs-nav">
        <button className="fs-btn">← AI 工作流</button>
        <button className="fs-btn amber">AI SaaS 平台 →</button>
      </div>
    </div>
  );
}
