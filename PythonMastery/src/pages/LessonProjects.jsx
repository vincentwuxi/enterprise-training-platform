import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const PROJECTS = [
  {
    id: 'scraper',
    icon: '🕷️',
    name: '智能爬虫',
    desc: '用 requests + BeautifulSoup 抓取网页数据，保存为结构化 CSV',
    stack: ['requests', 'BeautifulSoup4', 'pandas'],
    difficulty: '⭐⭐',
    code: `import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
import logging

logging.basicConfig(level=logging.INFO)

class WebScraper:
    def __init__(self, base_url: str, delay: float = 1.0):
        self.base_url = base_url
        self.delay = delay  # 礼貌爬虫：请求间隔
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "Mozilla/5.0 (Educational Bot)"
        })

    def fetch(self, url: str) -> BeautifulSoup | None:
        try:
            resp = self.session.get(url, timeout=10)
            resp.raise_for_status()
            time.sleep(self.delay)
            return BeautifulSoup(resp.text, "html.parser")
        except requests.RequestException as e:
            logging.error(f"请求失败 {url}: {e}")
            return None

    def scrape_books(self, pages: int = 3) -> list[dict]:
        results = []
        for page in range(1, pages + 1):
            url = f"{self.base_url}/catalogue/page-{page}.html"
            soup = self.fetch(url)
            if not soup:
                continue

            for article in soup.select("article.product_pod"):
                title = article.select_one("h3 a")["title"]
                price = article.select_one(".price_color").text.strip()
                rating = article.select_one(".star-rating")["class"][1]
                results.append({
                    "title": title,
                    "price": float(price.replace("£", "")),
                    "rating": rating
                })
            logging.info(f"第 {page} 页: 抓取 {len(results)} 本书")

        return results

if __name__ == "__main__":
    scraper = WebScraper("http://books.toscrape.com")
    books = scraper.scrape_books(pages=3)
    df = pd.DataFrame(books)
    df.to_csv("books.csv", index=False, encoding="utf-8")
    print(df.groupby("rating")["price"].mean())`,
  },
  {
    id: 'api',
    icon: '🚀',
    name: 'RESTful API 服务',
    desc: '用 FastAPI 构建高性能 REST API，含数据验证、数据库、文档自动生成',
    stack: ['FastAPI', 'uvicorn', 'pydantic', 'SQLAlchemy'],
    difficulty: '⭐⭐⭐',
    code: `from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
import uvicorn

app = FastAPI(
    title="Task Manager API",
    description="高性能任务管理服务",
    version="1.0.0"
)

# Pydantic 模型（自动验证 + 文档）
class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    priority: int = Field(default=1, ge=1, le=5)

class TaskResponse(TaskCreate):
    id: int
    created_at: datetime
    completed: bool = False

    class Config:
        from_attributes = True

# 模拟数据库（实际用 SQLAlchemy + PostgreSQL）
db: dict[int, dict] = {}
next_id = 1

@app.post("/tasks", response_model=TaskResponse, status_code=201)
async def create_task(task: TaskCreate):
    global next_id
    new_task = {
        "id": next_id,
        "created_at": datetime.utcnow(),
        **task.model_dump()
    }
    db[next_id] = new_task
    next_id += 1
    return new_task

@app.get("/tasks/{task_id}", response_model=TaskResponse)
async def get_task(task_id: int):
    if task_id not in db:
        raise HTTPException(status_code=404, detail="任务不存在")
    return db[task_id]

@app.get("/tasks", response_model=list[TaskResponse])
async def list_tasks(priority: Optional[int] = None):
    tasks = list(db.values())
    if priority:
        tasks = [t for t in tasks if t["priority"] == priority]
    return tasks

@app.patch("/tasks/{task_id}/complete")
async def complete_task(task_id: int):
    if task_id not in db:
        raise HTTPException(status_code=404, detail="任务不存在")
    db[task_id]["completed"] = True
    return {"message": "任务已完成"}

if __name__ == "__main__":
    # 访问 http://localhost:8000/docs 查看自动生成的 API 文档
    uvicorn.run(app, host="0.0.0.0", port=8000)`,
  },
  {
    id: 'automation',
    icon: '🤖',
    name: '办公自动化',
    desc: '用 Python 自动化处理 Excel/Word/Email，解放双手',
    stack: ['openpyxl', 'python-docx', 'smtplib', 'schedule'],
    difficulty: '⭐⭐',
    code: `import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.chart import BarChart, Reference
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
import smtplib
import schedule
import time

def generate_report(filename: str):
    """自动生成带格式的 Excel 报告"""
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "月度销售报告"

    # 设置标题样式
    header_fill = PatternFill(fgColor="1A56DB", fill_type="solid")
    headers = ["产品", "1月", "2月", "3月", "总计"]
    for col, h in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col, value=h)
        cell.font = Font(color="FFFFFF", bold=True)
        cell.fill = header_fill
        cell.alignment = Alignment(horizontal="center")

    # 填充数据
    data = [
        ("Python 课程", 150, 230, 310),
        ("Linux 课程", 80, 120, 180),
        ("SEO 服务", 200, 180, 250),
    ]
    for row_idx, (product, *sales) in enumerate(data, 2):
        ws.cell(row=row_idx, column=1, value=product)
        for col_idx, sale in enumerate(sales, 2):
            ws.cell(row=row_idx, column=col_idx, value=sale)
        # 自动计算总计
        ws.cell(row=row_idx, column=5, value=f"=SUM(B{row_idx}:D{row_idx})")

    # 插入柱状图
    chart = BarChart()
    chart.title = "季度销售趋势"
    data_ref = Reference(ws, min_col=2, max_col=4, min_row=1, max_row=4)
    chart.add_data(data_ref, titles_from_data=True)
    ws.add_chart(chart, "A6")

    wb.save(filename)
    print(f"报告已生成: {filename}")

def send_email(to: str, subject: str, body: str, attachment: str = None):
    """发送带附件的邮件"""
    msg = MIMEMultipart()
    msg["From"] = "report@company.com"
    msg["To"] = to
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "html"))

    if attachment:
        with open(attachment, "rb") as f:
            part = MIMEBase("application", "octet-stream")
            part.set_payload(f.read())
            encoders.encode_base64(part)
            part.add_header("Content-Disposition", f"attachment; filename={attachment}")
            msg.attach(part)

    # 实际使用请替换为真实 SMTP 配置
    # with smtplib.SMTP_SSL("smtp.gmail.com", 465) as s:
    #     s.login(user, password)
    #     s.send_message(msg)
    print(f"邮件已发送至: {to}")

# 定时任务：每月1日自动发送报告
def monthly_task():
    report_file = "monthly_report.xlsx"
    generate_report(report_file)
    send_email(
        to="manager@company.com",
        subject="月度销售报告",
        body="<h2>本月销售报告请查收附件。</h2>",
        attachment=report_file
    )

schedule.every().month.at("08:00").do(monthly_task)
# while True:
#     schedule.run_pending()
#     time.sleep(60)`,
  },
];

export default function LessonProjects() {
  const navigate = useNavigate();
  const [activeProject, setActiveProject] = useState(0);

  return (
    <div className="lesson-py">
      <div className="py-badge">🏗️ module_08 — 实战项目</div>

      <div className="py-hero">
        <h1>实战项目：爬虫、API 与自动化脚本</h1>
        <p>学习编程最快的方式是构建真实项目。这三个项目覆盖了 <strong>Python 开发者最常遇到的真实场景</strong>，每一行代码都有实际用途。</p>
      </div>

      {/* 项目选择 */}
      <div className="py-section">
        <h2 className="py-section-title">🎯 三个实战项目（选择查看完整代码）</h2>
        <div className="py-grid-3" style={{ marginBottom: '1rem' }}>
          {PROJECTS.map((p, i) => (
            <div key={p.id}
              onClick={() => setActiveProject(i)}
              style={{
                padding: '1.1rem', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s',
                background: activeProject === i ? 'rgba(26,86,219,0.12)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${activeProject === i ? 'rgba(26,86,219,0.4)' : 'rgba(255,255,255,0.07)'}`,
              }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{p.icon}</div>
              <div style={{ fontWeight: 700, color: activeProject === i ? '#60a5fa' : '#e2e8f0', marginBottom: '0.3rem' }}>{p.name}</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5, marginBottom: '0.5rem' }}>{p.desc}</div>
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                {p.stack.map(s => <span key={s} className="py-tag blue" style={{ fontFamily: 'JetBrains Mono', fontSize: '0.68rem' }}>{s}</span>)}
              </div>
              <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: '#fbbf24' }}>难度：{p.difficulty}</div>
            </div>
          ))}
        </div>

        <div className="py-interactive" style={{ borderColor: 'rgba(26,86,219,0.3)' }}>
          <h3 style={{ color: '#60a5fa' }}>{PROJECTS[activeProject].icon} {PROJECTS[activeProject].name} — 完整代码</h3>
          <div className="py-editor-header">
            <div className="py-editor-dot" style={{ background: '#ef4444' }} />
            <div className="py-editor-dot" style={{ background: '#f59e0b' }} />
            <div className="py-editor-dot" style={{ background: '#10b981' }} />
            <span style={{ marginLeft: '0.5rem' }}>{PROJECTS[activeProject].id}.py</span>
          </div>
          <div className="py-editor" style={{ maxHeight: '500px', overflow: 'auto' }}>{PROJECTS[activeProject].code}</div>
        </div>
      </div>

      {/* Python 最佳实践 */}
      <div className="py-section">
        <h2 className="py-section-title">📐 写出工业级 Python 的 10 个原则</h2>
        <div className="py-steps">
          {[
            { title: 'Type Hints 全覆盖', desc: '函数参数和返回值加类型注解，用 mypy 静态检查，减少运行时错误' },
            { title: '异常处理精准化', desc: '不要 bare except，明确捕获具体异常类，在合适层级处理而非每层都 try-catch' },
            { title: '使用 logging 而非 print', desc: '生产代码用 logging 模块，支持级别、文件输出、格式化，便于运维排查' },
            { title: '遵循 PEP 8 + Black 格式化', desc: '代码风格统一，用 black 自动格式化，用 ruff/flake8 检查，减少 code review 摩擦' },
            { title: '编写单元测试（pytest）', desc: '核心逻辑必须有测试覆盖，测试是最好的文档，也是重构的安全网' },
            { title: '使用环境变量管理配置', desc: '密钥/配置不硬编码，用 python-dotenv 读取 .env 文件，不同环境不同配置' },
            { title: '依赖固定版本', desc: '使用 requirements.txt 或 pyproject.toml 固定版本，避免"在我机器上能跑"的问题' },
            { title: '函数单一职责', desc: '每个函数只做一件事，超过 50 行考虑拆分，参数超过 5 个考虑用 dataclass 封装' },
            { title: '善用 comprehension 和生成器', desc: '[x for x in lst if cond] 比 for 循环更 Pythonic，生成器节省内存' },
            { title: '文档字符串（Docstring）', desc: '公开 API 必须有 docstring，说明参数、返回值、示例，用 sphinx 自动生成文档' },
          ].map((p, i) => (
            <div key={i} className="py-step">
              <div className="py-step-num">{i + 1}</div>
              <div className="py-step-content">
                <h4>{p.title}</h4>
                <p>{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 课程完成 */}
      <div className="py-section">
        <div className="py-card" style={{ background: 'linear-gradient(135deg, rgba(26,86,219,0.1), rgba(96,165,250,0.06))', borderColor: 'rgba(26,86,219,0.3)' }}>
          <h3 style={{ color: '#60a5fa', fontSize: '1.1rem' }}>🎓 恭喜！你已掌握的 Python 技能</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.5rem', marginTop: '1rem' }}>
            {[
              '✅ Python 数据类型、控制流与 f-string',
              '✅ 函数参数、装饰器、闭包与 LEGB 作用域',
              '✅ OOP：继承、多态与魔术方法',
              '✅ 文件 I/O、JSON、CSV 与正则表达式',
              '✅ 30+ 标准库核心用法',
              '✅ threading / multiprocessing / asyncio 并发',
              '✅ NumPy 向量化 + Pandas 数据处理',
              '✅ 爬虫、RESTful API、办公自动化实战',
            ].map(s => (
              <div key={s} style={{ fontSize: '0.875rem', color: '#94a3b8' }}>{s}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="py-nav">
        <button className="py-btn" onClick={() => navigate('/course/python-mastery/lesson/datascience')}>← 上一模块</button>
        <button className="py-btn primary" onClick={() => navigate('/course/python-mastery')}>📚 返回课程目录</button>
      </div>
    </div>
  );
}
