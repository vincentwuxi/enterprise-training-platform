import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

/* 冷启动模拟器 */
function ColdStartSimulator() {
  const [platform, setPlatform] = useState('lambda_py');
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState('idle'); // idle|coldstart|warm|done
  const [elapsed, setElapsed] = useState(0);
  const [warmCount, setWarmCount] = useState(0);
  const [log, setLog] = useState([]);
  const timerRef = useRef(null);

  const PLATFORMS = {
    lambda_py:   { label: 'Lambda (Python 3.12)',  coldMs: 400,  warmMs: 15,  color: '#FF9900', note: '适中冷启动，Python 包加载快' },
    lambda_java: { label: 'Lambda (Java 17)',       coldMs: 2800, warmMs: 8,   color: '#f97316', note: 'JVM 冷启动较慢，可用SnapStart优化' },
    cloudrun_py: { label: 'Cloud Run (Python)',     coldMs: 600,  warmMs: 12,  color: '#4285F4', note: '容器冷启动偏慢，min-instances=1可消除' },
    cf_js:       { label: 'Cloudflare Workers (JS)',coldMs: 5,    warmMs: 2,   color: '#f97316', note: 'V8 隔离，冷启动几乎为零（无容器）' },
    vercel:      { label: 'Vercel Functions (Node)',coldMs: 100,  warmMs: 10,  color: '#e2e8f0', note: 'Edge Runtime 冷启动极短' },
  };

  const p = PLATFORMS[platform];

  const simulate = async () => {
    setRunning(true);
    setPhase('coldstart');
    setElapsed(0);
    setLog([]);
    setWarmCount(0);

    const startTime = Date.now();
    setLog(l => [...l, `[${elapsed}ms] 🧊 触发冷启动...`]);

    // 冷启动阶段
    const coldInterval = setInterval(() => {
      const e = Date.now() - startTime;
      setElapsed(e);
      if (e >= p.coldMs) {
        clearInterval(coldInterval);
        setPhase('warm');
        setLog(l => [...l, `[${p.coldMs}ms] ✅ 冷启动完成，函数实例已就绪`]);
        setLog(l => [...l, `[${p.coldMs + p.warmMs}ms] ✅ 请求处理完成 (${p.warmMs}ms业务逻辑)`]);

        // 后续热请求
        let warmIdx = 0;
        const warmInterval = setInterval(() => {
          warmIdx++;
          setWarmCount(warmIdx);
          const t = p.coldMs + warmIdx * (p.warmMs + 50);
          setLog(l => [...l, `[${t}ms] ⚡ 热请求 #${warmIdx} 完成 (${p.warmMs}ms)`]);
          setElapsed(t);
          if (warmIdx >= 4) {
            clearInterval(warmInterval);
            setPhase('done');
            setRunning(false);
          }
        }, p.warmMs + 200);
      }
    }, 50);
  };

  const coldPct = phase === 'idle' ? 0 : phase === 'coldstart' ? Math.min((elapsed / p.coldMs) * 100, 100) : 100;

  return (
    <div className="cn-interactive">
      <h3>
        🧊 Serverless 冷启动模拟器
        <select value={platform} onChange={e => { setPlatform(e.target.value); setPhase('idle'); setElapsed(0); setLog([]); }}
          style={{ background: '#00050f', border: '1px solid rgba(14,165,233,0.3)', color: '#38bdf8', borderRadius: '6px', padding: '0.3rem 0.5rem', fontSize: '0.78rem', cursor: 'pointer' }}>
          {Object.entries(PLATFORMS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </h3>

      <div style={{ marginBottom: '0.875rem', fontSize: '0.78rem', color: '#1e4060' }}>💡 {p.note}</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.875rem' }}>
        <div style={{ padding: '0.875rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ fontSize: '0.7rem', color: '#1e4060', marginBottom: '0.3rem' }}>冷启动耗时</div>
          <div style={{ fontWeight: 900, fontSize: '1.8rem', color: phase === 'coldstart' ? '#f87171' : '#22c55e' }}>{phase === 'coldstart' ? elapsed : p.coldMs}ms</div>
          <div className="cn-meter" style={{ marginTop: '0.3rem' }}>
            <div className="cn-meter-fill" style={{ width: `${coldPct}%`, background: phase === 'coldstart' ? '#f87171' : '#22c55e' }} />
          </div>
        </div>
        <div style={{ padding: '0.875rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ fontSize: '0.7rem', color: '#1e4060', marginBottom: '0.3rem' }}>热请求耗时</div>
          <div style={{ fontWeight: 900, fontSize: '1.8rem', color: '#38bdf8' }}>{p.warmMs}ms</div>
          <div style={{ fontSize: '0.68rem', color: '#22c55e' }}>热请求 ×{warmCount} 完成</div>
        </div>
      </div>

      <div style={{ marginBottom: '0.75rem' }}>
        <button className="cn-btn primary" onClick={simulate} disabled={running}>
          {running ? '⏳ 模拟中…' : '▶ 模拟请求（含冷启动）'}
        </button>
      </div>

      {log.length > 0 && (
        <div style={{ background: '#00050f', borderRadius: '6px', padding: '0.75rem', fontFamily: 'JetBrains Mono', fontSize: '0.72rem', maxHeight: 130, overflow: 'auto' }}>
          {log.map((l, i) => <div key={i} style={{ color: l.includes('🧊') ? '#f87171' : l.includes('✅') ? '#22c55e' : '#38bdf8', marginBottom: '0.1rem' }}>{l}</div>)}
        </div>
      )}
    </div>
  );
}

const EVENT_TRIGGERS = [
  { trigger: 'HTTP/REST 请求', aws: 'API Gateway + Lambda', gcp: 'Cloud Run / Cloud Functions HTTP', icon: '🌐', color: '#38bdf8' },
  { trigger: '消息队列事件', aws: 'SQS → Lambda', gcp: 'Pub/Sub → Cloud Functions', icon: '📨', color: '#a78bfa' },
  { trigger: '对象存储事件', aws: 'S3 Event → Lambda', gcp: 'GCS Event → Cloud Functions', icon: '🪣', color: '#22c55e' },
  { trigger: '数据库流', aws: 'DynamoDB Streams / RDS Events', gcp: 'Firestore triggers', icon: '🗃️', color: '#fbbf24' },
  { trigger: '定时调度', aws: 'EventBridge (cron)', gcp: 'Cloud Scheduler', icon: '⏰', color: '#f97316' },
  { trigger: '消息总线', aws: 'EventBridge Event Bus', gcp: 'Eventarc', icon: '🚌', color: '#FF9900' },
];

const SERVERLESS_CODE = `# AWS Lambda — Python 处理器示例
import json
import boto3
from aws_lambda_powertools import Logger, Tracer, Metrics
from aws_lambda_powertools.metrics import MetricUnit

logger = Logger()          # 结构化日志
tracer = Tracer()          # X-Ray 分布式追踪
metrics = Metrics()        # CloudWatch 指标

@logger.inject_lambda_context
@tracer.capture_lambda_handler
@metrics.log_metrics
def handler(event: dict, context) -> dict:
    """处理 SQS 消息：用户下单后发送邮件通知"""
    logger.info("收到事件", extra={"records_count": len(event['Records'])})

    for record in event['Records']:
        order = json.loads(record['body'])

        # 业务逻辑
        send_order_email(order['user_email'], order['order_id'])
        metrics.add_metric(name="EmailSent", unit=MetricUnit.Count, value=1)

        logger.info("邮件发送成功", extra={"order_id": order['order_id']})

    return {"statusCode": 200, "body": "OK"}

# Lambda 环境变量（从 Secrets Manager 动取）
import os
EMAIL_API_KEY = os.environ['EMAIL_API_KEY']  # 在 SAM/CDK 中注入`;

export default function LessonServerless() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('code');

  return (
    <div className="lesson-cn">
      <div className="cn-badge purple">⚡ module_04 — Serverless</div>

      <div className="cn-hero">
        <h1>Serverless：Lambda / Cloud Functions / 事件驱动架构</h1>
        <p>Serverless 让你<strong>只关注代码逻辑，彻底不管服务器</strong>。事件驱动把耦合的单体拆成松散的函数链——一次 S3 上传可以触发压缩、水印、通知三个独立函数。</p>
      </div>

      {/* 冷启动模拟器 */}
      <ColdStartSimulator />

      {/* 事件触发器全景 */}
      <div className="cn-section">
        <h2 className="cn-section-title">🔌 事件触发器一览（AWS vs GCP）</h2>
        <div className="cn-card">
          {EVENT_TRIGGERS.map(t => (
            <div key={t.trigger} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ fontSize: '1rem', minWidth: 24 }}>{t.icon}</span>
              <div style={{ minWidth: 130, fontWeight: 700, color: t.color, fontSize: '0.8rem' }}>{t.trigger}</div>
              <div style={{ flex: 1, display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span className="cn-tag aws">{t.aws}</span>
                <span className="cn-tag gcp">{t.gcp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lambda 核心代码 */}
      <div className="cn-section">
        <h2 className="cn-section-title">💻 生产级 Lambda 代码示例</h2>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <button className={`cn-btn ${activeTab === 'code' ? 'primary' : ''}`} onClick={() => setActiveTab('code')}>⚙️ Lambda Handler</button>
          <button className={`cn-btn ${activeTab === 'arch' ? 'active' : ''}`} onClick={() => setActiveTab('arch')}>🏗️ 典型架构示意</button>
        </div>
        {activeTab === 'code' ? (
          <div className="cn-code-wrapper">
            <div className="cn-code-header">
              <div className="cn-code-dot" style={{ background: '#ef4444' }} /><div className="cn-code-dot" style={{ background: '#f59e0b' }} /><div className="cn-code-dot" style={{ background: '#FF9900' }} />
              <span style={{ marginLeft: '0.5rem', color: '#FF9900' }}>handler.py — AWS Lambda Powertools 风格</span>
            </div>
            <div className="cn-code" style={{ fontSize: '0.75rem', maxHeight: 380, overflow: 'auto' }}>{SERVERLESS_CODE}</div>
          </div>
        ) : (
          <div className="cn-card">
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.73rem', color: '#1e4060', lineHeight: '2', whiteSpace: 'pre' }}>{`
用户下单触发事件驱动链（去耦合）：

  [用户下单]
      │ POST /orders              HTTP 触发
      ▼
  [API Gateway]
      │ 调用
      ▼
  [Lambda: CreateOrder]──────► [DynamoDB: orders 表]
      │ 发布消息                       │
      ▼                               │ DynamoDB Stream 触发
  [SQS: order-events]                 ▼
      ├── [Lambda: SendEmail]  ← 邮件通知（解耦）
      ├── [Lambda: UpdateInventory]  ← 库存扣减
      └── [Lambda: Analytics]  ← 数据上报 BigQuery

优点：
✅ 每个函数独立部署/伸缩
✅ 单函数故障不影响其他
✅ 按实际调用量付费`}</div>
          </div>
        )}
      </div>

      {/* Serverless 选型指南 */}
      <div className="cn-section">
        <h2 className="cn-section-title">📋 Serverless 适用场景判断</h2>
        <div className="cn-grid-2">
          <div className="cn-card" style={{ borderColor: 'rgba(34,197,94,0.2)' }}>
            <h3 style={{ color: '#22c55e' }}>✅ 适合 Serverless</h3>
            {['事件驱动的异步处理（文件处理/通知）', '访问量波动大或不可预测', '定时任务（每天凌晨执行报表）', '原型验证/低流量 API（省成本）', '边缘函数（CDN层逻辑处理）'].map(i => (
              <div key={i} style={{ fontSize: '0.82rem', color: '#1e4060', marginBottom: '0.2rem' }}>• {i}</div>
            ))}
          </div>
          <div className="cn-card" style={{ borderColor: 'rgba(248,113,113,0.2)' }}>
            <h3 style={{ color: '#f87171' }}>❌ 不适合 Serverless</h3>
            {['低延迟要求（冷启动不可接受）', '长时间运行任务（超 15 分钟）', 'WebSocket 实时连接（生命周期长）', '有状态服务（需本地文件/内存状态）', '高并发固定流量（EC2 反而更便宜）'].map(i => (
              <div key={i} style={{ fontSize: '0.82rem', color: '#1e4060', marginBottom: '0.2rem' }}>• {i}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="cn-nav">
        <button className="cn-btn" onClick={() => navigate('/course/cloud-native/lesson/gcp-core')}>← 上一模块</button>
        <button className="cn-btn primary" onClick={() => navigate('/course/cloud-native/lesson/container-cloud')}>下一模块：容器云 EKS/GKE →</button>
      </div>
    </div>
  );
}
