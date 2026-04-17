import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['延迟优化', '流式架构', '边缘推理', 'CDN 分发'];

export default function LessonProductionEngineering() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge rose">🚀 module_08 — 生产工程</div>
      <div className="fs-hero">
        <h1>生产工程：延迟优化 / 流式架构 / 边缘推理 / CDN — 实时 AI 的系统工程</h1>
        <p>
          实时 AI 应用的核心挑战是<strong>延迟</strong>。用户对语音交互的容忍度是 500ms，
          视频流的容忍度是 100ms。本模块覆盖从端到端延迟优化、
          流式处理架构设计、边缘 AI 推理部署、
          到全球化内容分发的完整生产工程实践，
          帮你把 Demo 变成能服务百万用户的生产系统。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🚀 生产工程</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>⚡ 延迟优化</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f43f5e'}}></span> latency_optimization</div>
              <pre className="fs-code">{`# 实时 AI 延迟优化: 每毫秒都重要

# ═══ 延迟预算 ═══
latency_budgets = {
    "语音 AI 对话":   "目标 <600ms (端到端)",
    "视频直播":       "目标 <100ms (帧延迟)",
    "数字人对话":     "目标 <800ms (语音+面部)",
    "AR 叠加":        "目标 <20ms (头部追踪)",
    "游戏 AI":        "目标 <16ms (60fps)",
}

# ═══ 延迟分解与优化 ═══
# 典型语音 AI 管线:
# [采集 20ms] → [传输 50ms] → [VAD 30ms] →
# [ASR 200ms] → [LLM 300ms] → [TTS 150ms] →
# [传输 50ms] → [播放 20ms]
# = 820ms → 需要优化到 <600ms

optimization_strategies = {
    "并行化": {
        "方法": "ASR 流式输出 → LLM 边收边推",
        "效果": "减少 100-200ms (重叠 ASR+LLM)",
        "实现": "ASR 输出 partial results → LLM 预推",
    },
    "推测执行": {
        "方法": "VAD 未确认时就开始 ASR",
        "效果": "减少 VAD 等待时间 ~200ms",
        "风险": "误触发 → 浪费计算 (可接受)",
    },
    "预缓存": {
        "方法": "常见回复预生成 TTS 音频",
        "效果": "Cache Hit → 省掉 LLM+TTS ~400ms",
        "适用": "客服场景 (30% 常见问题可缓存)",
    },
    "模型优化": {
        "ASR":  "Distil-Whisper (4x 加速, 精度 -1%)",
        "LLM":  "GPT-4o-mini / Gemini Flash (快而准)",
        "TTS":  "tts-1 (vs tts-1-hd, 快 3x)",
    },
    "网络优化": {
        "WebRTC": "P2P, 比 WebSocket 少一跳",
        "边缘":   "部署在 CDN PoP 点",
        "协议":   "gRPC > HTTP/2 > HTTP/1.1",
    },
}

# ═══ 延迟测量 ═══
import time

class LatencyTracker:
    def __init__(self):
        self.checkpoints = {}
    
    def mark(self, name):
        self.checkpoints[name] = time.perf_counter_ns()
    
    def report(self):
        keys = list(self.checkpoints.keys())
        for i in range(1, len(keys)):
            dt = (self.checkpoints[keys[i]] - 
                  self.checkpoints[keys[i-1]]) / 1e6
            print(f"  {keys[i-1]} → {keys[i]}: {dt:.1f}ms")

# 使用:
# tracker.mark("audio_received")
# tracker.mark("vad_complete")
# tracker.mark("asr_complete")
# tracker.mark("llm_first_token")
# tracker.mark("tts_first_chunk")
# tracker.mark("audio_played")`}</pre>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🔄 流式架构</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#3b82f6'}}></span> streaming_architecture</div>
              <pre className="fs-code">{`# 流式架构: 实时 AI 系统的核心设计

# ═══ 为什么要流式? ═══
# 传统: 等待完整输入 → 处理 → 返回完整输出
# 流式: 边接收边处理边输出 → 首响应延迟极低

# ═══ 流式管线设计 ═══
# ┌──────┐   ┌──────┐   ┌──────┐   ┌──────┐
# │Audio │──►│ VAD  │──►│ ASR  │──►│ LLM  │──►...
# │Stream│   │Stream│   │Stream│   │Stream│
# └──────┘   └──────┘   └──────┘   └──────┘
# 每个组件: 接收流 → 处理 → 输出流
# 管线延迟 = 各组件处理延迟之和 (非等待之和!)

import asyncio
from collections import deque

class StreamPipeline:
    """流式处理管线"""
    def __init__(self):
        self.stages = []
    
    def add_stage(self, processor):
        self.stages.append(processor)
    
    async def run(self, input_stream):
        """流式执行管线"""
        current_stream = input_stream
        
        for stage in self.stages:
            current_stream = stage.process_stream(current_stream)
        
        async for output in current_stream:
            yield output

class StreamingASR:
    async def process_stream(self, audio_stream):
        """流式 ASR: 接收音频块, 输出部分文本"""
        buffer = bytearray()
        async for chunk in audio_stream:
            buffer.extend(chunk)
            if len(buffer) >= 4800:  # 300ms
                partial = self.transcribe(buffer)
                if partial:
                    yield partial
                buffer.clear()

class StreamingLLM:
    async def process_stream(self, text_stream):
        """流式 LLM: 接收文本, 流式生成"""
        prompt = ""
        async for text in text_stream:
            prompt += text
        
        # LLM 流式推理
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            stream=True,
        )
        for chunk in response:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

# ═══ 背压处理 (Backpressure) ═══
# 如果下游处理不过来 → 上游需要减速
# 否则内存会爆掉! (OOM)
backpressure_strategies = {
    "缓冲区限制": "每个阶段输出队列设上限",
    "丢帧":       "视频流: 跳过旧帧保持实时",
    "限速":       "上游检测下游速度, 动态调速",
}`}</pre>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>📡 边缘推理</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> edge_inference</div>
              <pre className="fs-code">{`# 边缘 AI 推理: 把模型部署到离用户最近的地方

# ═══ 为什么边缘推理? ═══
# 中心化: 用户(上海) → 服务器(美西) = 180ms RTT
# 边缘:   用户(上海) → 边缘节点(上海) = 5ms RTT
# 语音场景: 每次往返节省 350ms → 体验质变!

# ═══ 边缘部署方案 ═══
edge_platforms = {
    "Cloudflare Workers AI": {
        "特色": "全球 300+ PoP 点, GPU 推理",
        "模型": "Whisper / Llama / Stable Diffusion",
        "延迟": "极低 (最近 PoP)",
        "限制": "模型选择有限, 推理时长限制",
    },
    "AWS Wavelength": {
        "特色": "5G 边缘, 运营商机房",
        "模型": "自定义模型 (EC2 GPU)",
        "延迟": "极低 (<10ms 到终端)",
        "适合": "AR/VR, 实时视频",
    },
    "NVIDIA Jetson": {
        "特色": "嵌入式 GPU, 本地推理",
        "模型": "TensorRT 优化模型",
        "延迟": "最低 (本地)",
        "适合": "机器人/IoT/摄像头",
    },
    "WebGPU (浏览器端)": {
        "特色": "模型在用户浏览器中运行",
        "模型": "小型模型 (VAD/分类/嵌入)",
        "延迟": "零网络延迟",
        "限制": "模型大小受限 (GPU 内存)",
    },
}

# ═══ 混合推理架构 ═══
# 最佳实践: 边缘做预处理, 云端做重推理
hybrid_architecture = {
    "浏览器 (WebGPU)": [
        "VAD (语音检测)",
        "音频预处理 (降噪/AGC)",
        "简单分类 (意图预判)",
    ],
    "边缘节点 (CDN PoP)": [
        "ASR (语音转文字)",
        "嵌入计算 (Embedding)",
        "缓存命中 → 直接返回",
    ],
    "中心云 (GPU 集群)": [
        "LLM 推理 (复杂问题)",
        "视频生成 (GPU 密集)",
        "模型训练 / 微调",
    ],
}

# ═══ 模型优化 for 边缘 ═══
edge_optimization = {
    "量化":     "FP16 → INT8 → INT4 (1/4 大小)",
    "剪枝":     "去除不重要的权重 (30-50% 压缩)",
    "蒸馏":     "大模型知识 → 小模型 (Distil-Whisper)",
    "编译":     "TensorRT / ONNX Runtime 硬件优化",
    "WebGPU":   "ONNX → WebGPU 自动转换",
}`}</pre>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🌍 全球化分发</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> cdn_distribution</div>
              <pre className="fs-code">{`# 全球化 AI 内容分发: 让每个用户体验一致

# ═══ AI 内容 CDN 特殊需求 ═══
cdn_requirements = {
    "实时音频": "WebRTC TURN/STUN 全球节点",
    "视频流":   "低延迟 HLS/DASH 分发",
    "AI 生成物": "生成后立即缓存+分发",
    "模型文件": "几十 GB 模型在边缘节点缓存",
}

# ═══ 架构: AI 内容分发 ═══
# ┌─────────────────────────────────────────┐
# │              客户端 (全球)               │
# │  🇺🇸 美西   🇪🇺 欧洲   🇯🇵 日本   🇨🇳 中国  │
# └───┬─────────┬──────────┬──────────┬─────┘
#     │         │          │          │
# ┌───┴───┐ ┌──┴───┐  ┌───┴──┐  ┌───┴───┐
# │CDN PoP│ │CDN PoP│ │CDN PoP│ │CDN PoP│
# │+Edge  │ │+Edge  │ │+Edge  │ │+Edge  │
# │  AI   │ │  AI   │ │  AI   │ │  AI   │
# └───┬───┘ └──┬───┘  └───┬──┘  └───┬───┘
#     │        │           │         │
#     └────────┴─────┬─────┴─────────┘
#                    │
#              ┌─────┴──────┐
#              │ Origin/GPU │
#              │  Cluster   │
#              └────────────┘

# ═══ 实时通信基础设施 ═══
realtime_infra = {
    "LiveKit Cloud": {
        "功能": "WebRTC SFU 全球部署",
        "节点": "全球 50+ 区域",
        "适合": "Voice Agent / 视频通话",
    },
    "Agora (声网)": {
        "功能": "实时音视频 SDK",
        "特色": "中国+全球双覆盖",
        "适合": "中国出海产品",
    },
    "Daily.co": {
        "功能": "视频通话 + AI 集成",
        "特色": "Pipecat 开源框架配套",
        "适合": "AI 对话 + 视频",
    },
}

# ═══ 成本与运维 ═══
operations = {
    "监控": {
        "延迟追踪":   "P50/P95/P99 每区域",
        "质量指标":   "MOS 评分 (语音质量)",
        "异常检测":   "延迟突增/错误率告警",
    },
    "弹性伸缩": {
        "GPU":  "按需求动态分配 GPU 实例",
        "预热": "预测流量峰值 → 提前扩容",
        "降级": "高负载 → 降级到小模型",
    },
    "故障转移": {
        "多区域": "A 区故障 → 自动切换 B 区",
        "降级":   "GPU 不可用 → CPU 推理 (质量降)",
        "缓存":   "API 不可用 → 返回缓存结果",
    },
    "成本": {
        "语音 AI":  "~$0.02-0.10/分钟 (含 GPU+带宽)",
        "视频流":   "~$0.01/分钟/观众",
        "10万 DAU": "~$5,000-15,000/月",
    },
}`}</pre>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
