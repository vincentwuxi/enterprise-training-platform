import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['Claude Computer Use', 'Screen Agent', 'GUI 自动化', '安全边界'];

export default function LessonComputerUse() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-container">
      <div className="lesson-badge">🔌 module_05 — Computer Use</div>
      <h1 className="lesson-title">Computer Use：AI 操控整个桌面</h1>
      <p className="lesson-subtitle">
        从浏览器到整个桌面——<strong>Computer Use</strong> 让 AI 看到屏幕、移动鼠标、敲击键盘。
        Claude 的 Computer Use、OpenAI 的 Operator、开源 Screen Agent——
        这是 AI 通往通用自动化的终极形态。本模块深入原理、实战和安全边界。
      </p>

      <section className="lesson-section">
        <h2 className="section-title">🖥️ 桌面操控技术</h2>
        <div className="lesson-tabs">
          {tabs.map((t, i) => (
            <button key={i} className={`tab-btn ${active === i ? 'active' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="card-grid">
            <div className="info-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🟣 Claude Computer Use API</h3>
              <span className="card-badge">Anthropic</span>
              <div className="code-block">
                <div className="code-header">🐍 claude_computer_use.py</div>
                <pre>{`# —— Claude Computer Use: AI 操控桌面 ——
import anthropic
import subprocess
import base64

client = anthropic.Anthropic()

# Computer Use 工具定义
tools = [
    {
        "type": "computer_20250124",  # 内置工具类型
        "name": "computer",
        "display_width_px": 1920,
        "display_height_px": 1080,
        "display_number": 0
    },
    {
        "type": "text_editor_20250124",
        "name": "str_replace_editor"  # 文件编辑工具
    },
    {
        "type": "bash_20250124",
        "name": "bash"  # 命令行工具
    }
]

def take_screenshot() -> str:
    """截取屏幕截图并返回 base64"""
    subprocess.run(["screencapture", "-x", "/tmp/screen.png"])
    with open("/tmp/screen.png", "rb") as f:
        return base64.standard_b64encode(f.read()).decode()

def execute_computer_action(action: dict):
    """执行 Claude 请求的桌面操作"""
    match action["action"]:
        case "screenshot":
            return take_screenshot()
        case "mouse_move":
            # 移动鼠标到指定坐标
            x, y = action["coordinate"]
            subprocess.run(["cliclick", f"m:{x},{y}"])
        case "left_click":
            x, y = action["coordinate"]
            subprocess.run(["cliclick", f"c:{x},{y}"])
        case "type":
            # 输入文本
            text = action["text"]
            subprocess.run(["cliclick", f"t:{text}"])
        case "key":
            # 按键操作
            key = action["key"]
            subprocess.run(["cliclick", f"kp:{key}"])
        case "scroll":
            x, y = action["coordinate"]
            delta = action["delta_y"]
            # 执行滚动操作

# Agent 循环
messages = [{"role": "user", "content": [
    {"type": "text", "text": "打开 VS Code，新建一个 Python 文件，写一个 Hello World"},
    {"type": "image", "source": {
        "type": "base64",
        "media_type": "image/png",
        "data": take_screenshot()
    }}
]}]

while True:
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4096,
        tools=tools,
        messages=messages
    )
    
    # 处理 Claude 的操作请求
    for block in response.content:
        if block.type == "tool_use":
            if block.name == "computer":
                execute_computer_action(block.input)
                # 操作后截图反馈
                screenshot = take_screenshot()
                messages.append({"role": "assistant", "content": response.content})
                messages.append({"role": "user", "content": [{
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": [{"type": "image", "source": {
                        "type": "base64",
                        "media_type": "image/png",
                        "data": screenshot
                    }}]
                }]})
    
    if response.stop_reason == "end_turn":
        break`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="card-grid">
            <div className="info-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📱 Screen Agent 架构</h3>
              <span className="card-badge">Open Source</span>
              <div className="code-block">
                <div className="code-header">📋 Screen Agent 工作流</div>
                <pre>{`Screen Agent 执行流程：

┌─────────────────────────────────────────┐
│              用户任务指令                 │
│   "帮我在 Excel 中创建一个销售图表"      │
└───────────────┬─────────────────────────┘
                ▼
┌─────────────────────────────────────────┐
│          1. 屏幕截图 + OCR               │
│   ├── 截取当前屏幕 (1920x1080)          │
│   ├── OCR 提取文字区域                   │
│   ├── UI 元素检测 (按钮/菜单/输入框)     │
│   └── 元素坐标标注                       │
└───────────────┬─────────────────────────┘
                ▼
┌─────────────────────────────────────────┐
│          2. Vision LLM 决策              │
│   ├── 输入: 标注截图 + 任务目标          │
│   ├── 推理: 当前状态 → 下一步动作        │
│   └── 输出: {type, x, y, text, key}     │
└───────────────┬─────────────────────────┘
                ▼
┌─────────────────────────────────────────┐
│          3. 动作执行                      │
│   ├── click(x, y)                       │
│   ├── type("销售数据")                   │
│   ├── hotkey("ctrl", "c")               │
│   ├── scroll(0, -3)                     │
│   └── drag(x1,y1 → x2,y2)              │
└───────────────┬─────────────────────────┘
                ▼
          任务完成检测 → 循环 or 退出`}</pre>
              </div>
            </div>

            <div className="info-card">
              <h3>🧰 开源 Screen Agent 工具</h3>
              <span className="card-badge">Tools</span>
              <div className="code-block">
                <div className="code-header">📋 工具对比</div>
                <pre>{`Screen Agent 开源方案：

1. OmniParser (微软)
   ├── UI 元素检测模型
   ├── 生成可交互元素坐标
   └── 配合 GPT-4V 使用

2. SeeClick (浙大)
   ├── 视觉 GUI Grounding 模型
   ├── 自然语言 → 屏幕坐标
   └── 跨应用泛化能力强

3. UFO (微软)
   ├── Windows 桌面 Agent
   ├── 基于 UI Automation API
   └── 支持多应用协作

4. OS-Copilot
   ├── 通用桌面 Agent 框架
   ├── Linux/Mac/Windows
   └── 自学习能力`}</pre>
              </div>
            </div>

            <div className="info-card">
              <h3>⚡ Set-of-Mark Prompting</h3>
              <span className="card-badge">SoM</span>
              <div className="code-block">
                <div className="code-header">📋 SoM 原理</div>
                <pre>{`Set-of-Mark (SoM) Prompting:

传统方式:
  截图 → "点击登录按钮"
  问题: LLM 不知道按钮在哪

SoM 方式:
  截图 → 检测 UI 元素 →
  在元素上标注编号 [1][2][3]...
  → 发送标注图给 LLM
  → LLM 回答: "点击 [3]"
  → 系统知道 [3] 的坐标

优势:
  ✅ 精确定位（数字ID）
  ✅ 减少坐标错误
  ✅ Vision 模型更容易理解`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="card-grid">
            <div className="info-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🖱️ PyAutoGUI + AI 混合自动化</h3>
              <span className="card-badge">实战</span>
              <div className="code-block">
                <div className="code-header">🐍 gui_automation.py</div>
                <pre>{`# —— PyAutoGUI + GPT-4V: 智能桌面自动化 ——
import pyautogui
import base64
from openai import OpenAI

client = OpenAI()

class DesktopAgent:
    def __init__(self):
        self.history = []
    
    def screenshot(self) -> str:
        """截取屏幕并转 base64"""
        img = pyautogui.screenshot()
        img.save("/tmp/screen.png")
        with open("/tmp/screen.png", "rb") as f:
            return base64.b64encode(f.read()).decode()
    
    def execute_action(self, action: dict):
        """执行 AI 决定的桌面操作"""
        match action["type"]:
            case "click":
                pyautogui.click(action["x"], action["y"])
            case "double_click":
                pyautogui.doubleClick(action["x"], action["y"])
            case "right_click":
                pyautogui.rightClick(action["x"], action["y"])
            case "type":
                pyautogui.typewrite(action["text"], interval=0.05)
            case "hotkey":
                pyautogui.hotkey(*action["keys"])
            case "scroll":
                pyautogui.scroll(action["amount"])
            case "drag":
                pyautogui.moveTo(action["from_x"], action["from_y"])
                pyautogui.dragTo(action["to_x"], action["to_y"])
    
    async def run(self, task: str, max_steps=30):
        """执行桌面任务"""
        for step in range(max_steps):
            screen = self.screenshot()
            
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": DESKTOP_AGENT_PROMPT},
                    *self.history,
                    {"role": "user", "content": [
                        {"type": "text", "text": f"任务: {task}\\n步骤: {step+1}"},
                        {"type": "image_url", "image_url": {
                            "url": f"data:image/png;base64,{screen}"
                        }}
                    ]}
                ],
                response_format={"type": "json_object"}
            )
            
            result = json.loads(response.choices[0].message.content)
            
            if result.get("done"):
                return result.get("summary", "任务完成")
            
            self.execute_action(result["action"])
            time.sleep(1)  # 等待 UI 响应`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="card-grid">
            <div className="info-card">
              <h3>🛡️ Computer Use 安全</h3>
              <span className="card-badge" style={{ background: '#ef4444' }}>关键</span>
              <div className="code-block">
                <div className="code-header">📋 安全边界</div>
                <pre>{`Computer Use 安全红线：

⛔ 绝对禁止：
├── 访问/修改系统文件
├── 执行管理员命令
├── 发送未经确认的邮件
├── 进行支付/转账操作
├── 安装/卸载软件
└── 修改安全设置

✅ 安全措施：
├── 虚拟机/容器隔离运行
├── 只读文件系统
├── 网络白名单
├── 操作审计日志
├── 高危动作人工确认
├── 超时自动终止
└── 屏幕录制存档`}</pre>
              </div>
            </div>

            <div className="info-card">
              <h3>🏗️ 安全架构</h3>
              <span className="card-badge">Architecture</span>
              <div className="code-block">
                <div className="code-header">📋 隔离方案</div>
                <pre>{`生产级隔离架构：

方案 1: Docker 容器
├── 临时容器 (ephemeral)
├── 预装应用 + VNC
├── 每次任务新容器
└── 成本低，隔离好

方案 2: 云虚拟机
├── AWS/GCP 临时 VM
├── 完整桌面环境
├── 网络策略控制
└── 成本较高

方案 3: 沙盒进程
├── firejail / bubblewrap
├── 限制系统调用
├── 文件系统挂载控制
└── 最轻量

推荐: 方案 1 (Docker + noVNC)
├── Dockerfile 预装工具
├── 容器10分钟超时
├── 操作录屏保存
└── 网络仅允许白名单`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
