import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const HPA_YAML = `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-deployment
  minReplicas: 2        # 最少保持 2 个副本
  maxReplicas: 20       # 最多扩容到 20 个副本
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 60   # CPU 平均利用率超过 60% 就扩容
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 70
  # 自定义指标（如请求队列长度）
  - type: External
    external:
      metric:
        name: http_requests_per_second
      target:
        type: AverageValue
        averageValue: 1000      # RPS 超 1000 扩容`;

const ROLLING_STEPS = [
  { step: '初始状态', desc: '3 个 Pod 运行 v1 版本', pods: ['v1','v1','v1'], color: '#326CE5' },
  { step: '启动更新', desc: '启动第 1 个 v2 Pod（maxSurge=1）', pods: ['v1','v1','v1','v2↑'], color: '#10b981' },
  { step: '替换旧Pod', desc: '终止第 1 个 v1（maxUnavailable=0）', pods: ['v1','v1','v2'], color: '#f59e0b' },
  { step: '继续滚动', desc: '启动第 2 个 v2', pods: ['v1','v2','v2'], color: '#10b981' },
  { step: '完成更新', desc: '全部切换至 v2，零停机完成', pods: ['v2','v2','v2'], color: '#34d399' },
];

const SCHEDULING = [
  { name: 'nodeSelector', usage: '最简单节点选择，按标签匹配', yaml: `spec:\n  nodeSelector:\n    disk: ssd           # 调度到 disk=ssd 标签的节点\n    region: us-west-2` },
  { name: 'Affinity / AntiAffinity', usage: '复杂调度规则，支持软/硬约束', yaml: `spec:\n  affinity:\n    podAntiAffinity:\n      requiredDuringScheduling...:\n      - labelSelector:\n          matchLabels:\n            app: api\n        topologyKey: kubernetes.io/hostname\n# 强制：同一节点最多只有1个api Pod（实现故障域隔离）` },
  { name: 'Taints & Tolerations', usage: '污点排斥，让 Pod 只运行在特定节点', yaml: `# 给节点打污点（防止普通 Pod 调度）\nkubectl taint nodes gpu-node-1 gpu=true:NoSchedule\n\n# Pod 设置容忍（才能调度到此节点）\nspec:\n  tolerations:\n  - key: "gpu"\n    operator: "Equal"\n    value: "true"\n    effect: "NoSchedule"` },
  { name: 'ResourceQuota', usage: '命名空间级别资源配额限制', yaml: `apiVersion: v1\nkind: ResourceQuota\nmetadata:\n  name: production-quota\n  namespace: production\nspec:\n  hard:\n    pods: "50"\n    requests.cpu: "10"\n    requests.memory: 20Gi\n    limits.cpu: "20"\n    limits.memory: 40Gi` },
];

export default function LessonK8sAdvanced() {
  const navigate = useNavigate();
  const [rollStep, setRollStep] = useState(0);
  const [scheduleTab, setScheduleTab] = useState(0);
  const [cpuUsage, setCpuUsage] = useState(45);

  const currentPods = ROLLING_STEPS[rollStep].pods;
  const hpaReplicas = cpuUsage < 60 ? 2 : Math.min(20, Math.ceil((cpuUsage / 60) * 2));

  return (
    <div className="lesson-dk">
      <div className="dk-badge">📈 module_06 — K8s 进阶</div>

      <div className="dk-hero">
        <h1>K8s 进阶：调度、弹性伸缩与滚动更新</h1>
        <p>K8s 的强大在于<strong>自动化运维</strong>：HPA 根据负载自动扩缩容，滚动更新实现零停机发布，调度策略确保 Pod 高可用分布。</p>
      </div>

      {/* HPA 模拟器 */}
      <div className="dk-section">
        <h2 className="dk-section-title">⚡ HPA 弹性伸缩模拟器</h2>
        <div className="dk-interactive">
          <h3>🎛️ 拖动 CPU 使用率，观察自动扩容</h3>
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>集群 CPU 平均使用率</label>
              <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, color: cpuUsage >= 60 ? '#f87171' : '#34d399', fontSize: '1rem' }}>{cpuUsage}%</span>
            </div>
            <input type="range" min="10" max="100" value={cpuUsage}
              onChange={e => setCpuUsage(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#0db7ed', cursor: 'pointer', height: '6px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#475569', marginTop: '0.25rem' }}>
              <span>10%（空闲）</span><span style={{ color: '#fbbf24' }}>60%（扩容阈值）</span><span>100%（过载）</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', padding: '1.25rem', background: 'rgba(13,183,237,0.06)', borderRadius: '10px', border: '1px solid rgba(13,183,237,0.2)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: cpuUsage >= 60 ? '#f87171' : '#34d399', fontFamily: 'JetBrains Mono' }}>{hpaReplicas}</div>
              <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.2rem' }}>当前 Pod 副本数</div>
              <div style={{ fontSize: '0.68rem', color: '#334155', marginTop: '0.1rem' }}>min: 2 / max: 20</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {Array.from({ length: hpaReplicas }).map((_, i) => (
                  <div key={i} style={{ width: 36, height: 36, background: 'rgba(13,183,237,0.15)', border: '1px solid rgba(13,183,237,0.4)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', transition: 'all 0.3s' }}>🫛</div>
                ))}
              </div>
              <div style={{ marginTop: '0.75rem', fontSize: '0.82rem', color: cpuUsage >= 60 ? '#fbbf24' : '#34d399' }}>
                {cpuUsage < 60 ? `✅ CPU ${cpuUsage}% < 60%，维持最小副本数` : `⬆️ CPU ${cpuUsage}% > 60%，触发扩容！已扩展至 ${hpaReplicas} 个 Pod`}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <div className="dk-term-wrapper">
              <div className="dk-term-header">
                <div className="dk-term-dot" style={{ background: '#ef4444' }} />
                <div className="dk-term-dot" style={{ background: '#f59e0b' }} />
                <div className="dk-term-dot" style={{ background: '#10b981' }} />
                <span style={{ marginLeft: '0.5rem' }}>hpa.yaml</span>
              </div>
              <div className="dk-term" style={{ fontSize: '0.73rem', maxHeight: 280, overflow: 'auto' }}>{HPA_YAML}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 滚动更新 */}
      <div className="dk-section">
        <h2 className="dk-section-title">🔄 滚动更新（Zero-Downtime Deployment）</h2>
        <div className="dk-interactive">
          <h3>
            更新步骤演示
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="dk-btn" onClick={() => setRollStep(s => Math.max(0, s - 1))} disabled={rollStep === 0}>← 上一步</button>
              <button className="dk-btn primary" onClick={() => setRollStep(s => Math.min(ROLLING_STEPS.length - 1, s + 1))} disabled={rollStep === ROLLING_STEPS.length - 1}>下一步 →</button>
              <button className="dk-btn" onClick={() => setRollStep(0)}>重置</button>
            </div>
          </h3>
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <div style={{ fontWeight: 700, color: ROLLING_STEPS[rollStep].color, fontSize: '1rem', marginBottom: '0.3rem' }}>
              步骤 {rollStep + 1}/{ROLLING_STEPS.length}：{ROLLING_STEPS[rollStep].step}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#64748b' }}>{ROLLING_STEPS[rollStep].desc}</div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', minHeight: 80, alignItems: 'center', flexWrap: 'wrap' }}>
            {currentPods.map((p, i) => (
              <div key={i} style={{ padding: '0.75rem 1rem', borderRadius: '8px', border: `2px solid ${p.startsWith('v2') ? '#10b981' : '#326CE5'}`, background: p.startsWith('v2') ? 'rgba(16,185,129,0.1)' : 'rgba(50,108,229,0.1)', fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: '0.85rem', color: p.startsWith('v2') ? '#34d399' : '#93c5fd', transition: 'all 0.4s' }}>
                Pod {p}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 调度策略 */}
      <div className="dk-section">
        <h2 className="dk-section-title">🎯 调度策略（如何决定 Pod 去哪个节点）</h2>
        <div className="dk-interactive">
          <h3>
            调度机制
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {SCHEDULING.map((s, i) => (
                <button key={s.name} className={`dk-btn ${scheduleTab === i ? 'primary' : ''}`}
                  onClick={() => setScheduleTab(i)}
                  style={{ fontSize: '0.78rem' }}>{s.name}</button>
              ))}
            </div>
          </h3>
          <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '0.75rem' }}>{SCHEDULING[scheduleTab].usage}</div>
          <div className="dk-term-wrapper">
            <div className="dk-term-header">
              <div className="dk-term-dot" style={{ background: '#ef4444' }} />
              <div className="dk-term-dot" style={{ background: '#f59e0b' }} />
              <div className="dk-term-dot" style={{ background: '#10b981' }} />
              <span style={{ marginLeft: '0.5rem' }}>scheduling.yaml</span>
            </div>
            <div className="dk-term" style={{ fontSize: '0.75rem' }}>{SCHEDULING[scheduleTab].yaml}</div>
          </div>
        </div>
      </div>

      <div className="dk-nav">
        <button className="dk-btn" onClick={() => navigate('/course/devops-mastery/lesson/k8score')}>← 上一模块</button>
        <button className="dk-btn primary" onClick={() => navigate('/course/devops-mastery/lesson/observability')}>下一模块：可观测性 →</button>
      </div>
    </div>
  );
}
