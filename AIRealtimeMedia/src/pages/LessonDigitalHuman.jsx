import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['数字人原理', '面部驱动', 'HeyGen/D-ID', '直播数字人'];

export default function LessonDigitalHuman() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge purple">🧑‍💻 module_03 — AI 数字人</div>
      <div className="fs-hero">
        <h1>AI 数字人：面部驱动 / Lip Sync / HeyGen / D-ID — 虚拟分身工程</h1>
        <p>
          AI 数字人已从实验室走向生产：<strong>HeyGen 数字人视频</strong>实现分钟级生成，
          <strong>D-ID</strong> 提供 API 级实时数字人，<strong>SadTalker/MuseTalk</strong>
          开源方案持续突破。本模块覆盖数字人技术原理 (面部关键点/Lip Sync/表情迁移)、
          商业 API 实战、以及直播数字人的低延迟架构和合规要求。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🧑‍💻 AI 数字人</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🧬 数字人技术原理</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> digital_human_fundamentals</div>
              <pre className="fs-code">{`# AI 数字人: 技术栈全景

# ═══ 什么是 AI 数字人? ═══
# 以真人或虚拟形象为基础, 由 AI 驱动的可交互角色
# 可以说话 (TTS)、做表情 (面部驱动)、做动作 (身体驱动)

# ═══ 技术分层 ═══
tech_stack = {
    "形象层": {
        "2D 数字人": "单张照片 + 面部动画 (轻量)",
        "2.5D":      "多角度照片 + 头部运动 (折中)",
        "3D 数字人": "3D 建模 + 骨骼动画 (高质量)",
        "NeRF/3DGS": "神经渲染, 照片级真实感",
    },
    "驱动层": {
        "音频驱动": "语音 → 口型 + 表情 (Audio2Face)",
        "文本驱动": "文本 → TTS → 口型 + 表情",
        "视频驱动": "参考视频 → 表情/动作迁移",
        "实时驱动": "摄像头 → 实时面捕 → 驱动数字人",
    },
    "交互层": {
        "单向播报": "预录或实时生成视频 (直播/客服)",
        "对话交互": "Voice Agent + 数字人 (实时对话)",
        "场景交互": "VR/AR 中与数字人互动",
    },
}

# ═══ 核心技术 ═══
core_technologies = {
    "面部关键点检测": {
        "MediaPipe Face Mesh": "468 个关键点, 实时",
        "DLIB 68 点":          "经典方案, 轻量",
        "InsightFace":         "人脸识别+关键点 (工业级)",
    },
    "Lip Sync (口型同步)": {
        "Wav2Lip":     "音频→口型, 效果好但分辨率受限",
        "SadTalker":   "音频→头部运动+口型 (开源首选)",
        "MuseTalk":    "高质量实时口型, 腾讯开源",
        "AniPortrait": "腾讯, 音频驱动肖像动画",
    },
    "表情迁移": {
        "First Order Motion": "单张照片 + 表情迁移",
        "LivePortrait":       "面部重演, 表情控制",
        "Face2Face":          "经典面部替换",
    },
}

# ═══ 2D vs 3D 数字人选型 ═══
# 2D: 低成本, 快速部署, 适合直播/客服
# 3D: 高质量, 多角度, 适合虚拟主播/游戏/训练
# NeRF/3DGS: 照片级真实, 但计算成本高`}</pre>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🎭 面部驱动技术</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#ef4444'}}></span> face_driving</div>
              <pre className="fs-code">{`# 面部驱动: 从音频/视频到逼真面部动画

# ═══ SadTalker 实战 (开源首选) ═══
# 输入: 一张照片 + 一段音频
# 输出: 说话的头像视频

# 安装
# pip install sadtalker
# 下载预训练模型

from sadtalker import SadTalker

talker = SadTalker(
    checkpoint_dir="checkpoints/",
    device="cuda"
)

# 生成说话视频
result = talker.generate(
    source_image="avatar.png",
    driven_audio="speech.wav",
    result_dir="output/",
    still=False,              # 是否保持头部静止
    expression_scale=1.0,     # 表情强度
    enhancer="gfpgan",        # 面部增强
)
# 输出: output/avatar_speech.mp4

# ═══ MuseTalk (实时口型) ═══
# 腾讯开源, 专注高质量实时 Lip Sync
# 延迟 ~50ms (可用于直播!)

from musetalk import MuseTalkModel

model = MuseTalkModel.from_pretrained("musetalk/musetalk")

# 实时口型生成
def generate_lipsync_frame(
    face_image,      # 静态面部
    audio_features,  # 音频特征 (mel spectrogram)
):
    """每帧生成口型"""
    face_with_lip = model.infer(
        face_image, 
        audio_features,
    )
    return face_with_lip  # 带口型的面部图像

# ═══ LivePortrait (面部重演) ═══
# 快手开源, 表情+姿态控制
live_portrait_features = {
    "表情控制":    "从参考视频提取表情 → 驱动目标面部",
    "姿态控制":    "头部旋转/倾斜/点头 参数化控制",
    "眨眼控制":    "自然眨眼频率 (避免恐怖谷)",
    "嘴型控制":    "与 TTS 同步的精确嘴型",
}

# ═══ 质量评估 ═══
quality_metrics = {
    "FID":          "生成质量 (越低越好)",
    "Lip Sync Score": "口型与音频匹配度",
    "FVD":          "视频质量 (越低越好)",
    "人工评分":      "自然度/恐怖谷/满意度",
}`}</pre>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>🏢 HeyGen / D-ID 商业实战</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#3b82f6'}}></span> commercial_api</div>
              <pre className="fs-code">{`# 商业数字人 API: 快速落地方案

# ═══ HeyGen ═══
# 估值 $5B+, 数字人视频生成领导者
heygen_features = {
    "视频翻译":   "保持口型的多语言视频翻译",
    "数字人克隆": "5分钟视频 → 生成数字分身",
    "API 集成":   "REST API, 支持批量生成",
    "模板系统":   "数百个预置数字人+场景模板",
    "实时交互":   "Interactive Avatar (对话式)",
}

# HeyGen API 实战
import requests

# 1. 创建视频
response = requests.post(
    "https://api.heygen.com/v2/video/generate",
    headers={"X-Api-Key": HEYGEN_API_KEY},
    json={
        "video_inputs": [{
            "character": {
                "type": "avatar",
                "avatar_id": "josh_lite3_20230714",
            },
            "voice": {
                "type": "text",
                "input_text": "欢迎来到我们的产品发布会",
                "voice_id": "zh-CN-YunxiNeural",
            },
            "background": {
                "type": "color",
                "value": "#1a1a2e",
            }
        }],
        "dimension": {"width": 1920, "height": 1080},
    }
)
video_id = response.json()["data"]["video_id"]

# 2. 轮询视频状态
status = requests.get(
    f"https://api.heygen.com/v1/video_status.get?video_id={video_id}",
    headers={"X-Api-Key": HEYGEN_API_KEY}
)
# 完成后获取视频 URL

# ═══ D-ID ═══
# 更专注 API 集成和实时交互
did_features = {
    "Talks API":        "文本/音频 → 说话视频",
    "Streams API":      "实时数字人对话 (低延迟)",
    "Agent API":        "数字人 + LLM 对话 Agent",
    "自定义形象":       "上传照片创建数字人",
}

# D-ID 实时对话数字人
# 创建流式会话
stream = requests.post(
    "https://api.d-id.com/talks/streams",
    headers={"Authorization": f"Basic {DID_API_KEY}"},
    json={
        "source_url": "https://my-avatar.jpg",
        "script": {
            "type": "text",
            "provider": {"type": "microsoft", "voice_id": "zh-CN"},
        },
    }
)

# ═══ 成本对比 ═══
# HeyGen: $24/月 (Creator) → 15分钟视频
# D-ID:   $5.9/月 → 10分钟视频
# 自部署:  GPU 成本 ~$2/小时 → 自由生成`}</pre>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-card" style={{ marginTop: '1rem' }}>
            <h3>📺 直播数字人</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> livestream_avatar</div>
              <pre className="fs-code">{`# 直播数字人: 24/7 自动带货/客服

# ═══ 直播数字人架构 ═══
# ┌────────────┐    ┌─────────────┐   ┌────────────┐
# │ 弹幕/评论  │ ──►│ LLM Agent   │──►│ TTS + 数字人│
# │ (用户交互) │    │ (理解+回复)  │   │ (视频生成)  │
# └────────────┘    └──────┬──────┘   └──────┬─────┘
#                          │                  │
#                   ┌──────┴──────┐    ┌─────┴──────┐
#                   │ 商品知识库   │    │ RTMP 推流   │
#                   │ + 话术库    │    │ 到直播平台   │
#                   └─────────────┘    └────────────┘

# ═══ 实现方案 ═══
livestream_solutions = {
    "方案A — 预录循环 + 实时应答": {
        "基础": "预录数字人视频循环播放 (话术)",
        "交互": "弹幕触发 LLM → TTS → 实时口型覆盖",
        "延迟": "低 (<2s)",
        "成本": "最低 (1 GPU)",
    },
    "方案B — 全实时生成": {
        "基础": "LLM 持续生成对话内容",
        "驱动": "MuseTalk 实时口型 + 表情",
        "延迟": "中 (2-5s)",
        "成本": "中 (需要好 GPU)",
    },
    "方案C — 商业方案": {
        "平台": "硅基智能/闪剪/腾讯智影",
        "特色": "一键开播, 不需要技术团队",
        "成本": "¥几百-几千/月",
    },
}

# ═══ 关键技术细节 ═══
key_details = {
    "推流": {
        "协议": "RTMP → 直播平台 (抖音/快手/淘宝)",
        "编码": "H.264, 1080p, 30fps",
        "工具": "OBS + 虚拟摄像头 or FFmpeg",
    },
    "弹幕监听": {
        "抖音": "抖音开放平台 WebSocket API",
        "快手": "快手直播 SDK",
        "通用": "屏幕 OCR 识别弹幕 (hack)",
    },
    "话术管理": {
        "开场白": "定时触发 (每 5 分钟)",
        "商品介绍": "按时间表轮换",
        "互动回复": "弹幕关键词匹配 + LLM 生成",
        "引导下单": "检测购买意图 → 切换话术",
    },
}

# ═══ 合规与风险 ═══
compliance = {
    "《互联网信息服务深度合成管理规定》": {
        "要求": "AI 生成内容必须标识",
        "实施": "视频添加 '虚拟主播' 水印/提示",
    },
    "平台规则": {
        "抖音": "需在直播间标注 'AI 主播'",
        "淘宝": "特定品类允许, 高风险品类禁止",
    },
    "风险": {
        "虚假宣传": "AI 话术可能夸大商品",
        "消费者投诉": "发现是 AI → 信任危机",
        "法律责任": "AI 数字人的承诺是否有法律效力?",
    },
}`}</pre>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
