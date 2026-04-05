import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const GCP_SERVICES = [
  {
    name: '计算', icon: '⚡', color: '#4285F4',
    items: [
      { s: 'Compute Engine (GCE)', d: '虚拟机，自定义CPU/内存，比AWS EC2更灵活的定价。抢占式VM可节省60-91%' },
      { s: 'Cloud Run', d: '全托管容器运行平台，部署即生效，自动扩缩容至0，生产首选的Serverless容器方案' },
      { s: 'GKE (Autopilot)', d: '托管Kubernetes，Autopilot模式自动管理节点，按Pod资源付费，无需管理节点池' },
    ],
    code: `# Cloud Run 部署（最简单的云原生部署方式）
# 1. 构建并推送镜像到 Artifact Registry
gcloud builds submit --tag gcr.io/PROJECT_ID/my-app

# 2. 一键部署到 Cloud Run
gcloud run deploy my-app \\
  --image gcr.io/PROJECT_ID/my-app \\
  --platform managed \\
  --region asia-east1 \\
  --min-instances 0 \\       # 可缩减到0（节省成本）
  --max-instances 100 \\     # 最大100个实例
  --memory 512Mi \\
  --cpu 1 \\
  --allow-unauthenticated   # 允许公开访问

# Cloud Run 支持：HTTP/HTTPS、WebSocket、gRPC
# 冷启动优化：min-instances=1 保留热实例`,
  },
  {
    name: '存储', icon: '🗄️', color: '#DB4437',
    items: [
      { s: 'Cloud Storage (GCS)', d: '对象存储，同S3类似。含多区域（Multi-Region）级别支持全球复制，Standard/Nearline/Coldline/Archive四级' },
      { s: 'Persistent Disk', d: '块存储，挂载到GCE。SSD适合数据库，Balanced(HDD+SSD混合)适合一般应用' },
      { s: 'Filestore', d: 'NFS托管文件系统，适合需要共享文件系统的GKE工作负载' },
    ],
    code: `# GCS 操作（gsutil 和 gcloud storage）
gsutil mb -l asia-east1 gs://my-bucket      # 创建桶
gsutil cp ./dist gs://my-bucket -r           # 上传目录
gsutil rsync -r -d ./dist gs://my-bucket     # 增量同步

# 设置公开访问（网站托管）
gsutil iam ch allUsers:objectViewer gs://my-bucket

# 从 Python 访问 GCS
from google.cloud import storage
client = storage.Client()
bucket = client.bucket("my-bucket")
blob = bucket.blob("report.pdf")
blob.upload_from_filename("report.pdf")

# 生成签名URL（1小时有效）
url = blob.generate_signed_url(
    expiration=datetime.timedelta(hours=1),
    method="GET",
)`,
  },
  {
    name: 'BigQuery', icon: '📊', color: '#F4B400',
    items: [
      { s: 'BigQuery', d: '全托管数据仓库，PB级查询秒级返回，按查询扫描数据量收费（$5/TB扫描），首1TB/月免费' },
      { s: 'Pub/Sub', d: '全托管消息队列（类似Kafka），100%在线SLA，每月前10GB免费，支持推送/拉取模式' },
      { s: 'Dataflow', d: '基于Apache Beam的流批一体处理，自动Shuffle，无需管理集群' },
    ],
    code: `-- BigQuery：查询10亿行用时<1秒
SELECT
  EXTRACT(YEAR FROM order_date) AS year,
  category,
  SUM(amount) AS total_sales,
  COUNT(DISTINCT user_id) AS unique_buyers,
  AVG(amount) AS avg_order_value
FROM \`my-project.ecommerce.orders\`
WHERE order_date >= '2024-01-01'
  AND status = 'completed'
GROUP BY 1, 2
ORDER BY total_sales DESC
LIMIT 100;

-- 查询费用估算（在 SQL 前加 --dry_run）
-- 本次查询扫描: 2.3 GB (~$0.0115)

# Pub/Sub：发布消息（Python）
from google.cloud import pubsub_v1
publisher = pubsub_v1.PublisherClient()
topic_path = publisher.topic_path("my-project", "orders")

data = json.dumps({"order_id": 42, "status": "paid"}).encode()
future = publisher.publish(topic_path, data,
    source="checkout-service")  # 自定义属性
print(f"Published: {future.result()}")`,
  },
  {
    name: 'ML/AI', icon: '🤖', color: '#0F9D58',
    items: [
      { s: 'Vertex AI', d: '端到端ML平台，训练/部署/监控。AutoML可无代码训练模型，Model Garden集成Gemini/Claude等' },
      { s: 'Cloud Vision/NLP', d: '预训练AI API：图像识别、OCR、实体抽取、情感分析，调API即用无需训练' },
      { s: 'Speech-to-Text', d: '语音转文字API，支持125+语言，实时流式识别，精度业界领先' },
    ],
    code: `# Vertex AI：调用 Gemini 1.5 Pro
import vertexai
from vertexai.generative_models import GenerativeModel

vertexai.init(project="my-project", location="us-central1")
model = GenerativeModel("gemini-1.5-pro")

response = model.generate_content([
    "分析以下用户评论的情感倾向，并指出关键问题：",
    "物流太慢了，等了10天才到。包装还不错，但东西质量差强人意。",
])
print(response.text)

# Cloud Vision API：图像分析
from google.cloud import vision
client = vision.ImageAnnotatorClient()
image = vision.Image()
image.source.image_uri = "gs://my-bucket/product.jpg"

response = client.label_detection(image=image)
for label in response.label_annotations:
    print(f"{label.description}: {label.score:.2%}")`,
  },
];

const AWS_VS_GCP = [
  ['虚拟机', 'EC2（270+机型）', 'GCE（自定义CPU/内存更灵活）'],
  ['对象存储', 'S3（最成熟）', 'GCS（定价略低）'],
  ['托管K8s', 'EKS（$0.10/小时）', 'GKE（Autopilot更省心）'],
  ['Serverless容器', 'AWS Fargate', 'Cloud Run（冷启动更快）'],
  ['数据仓库', 'Redshift', 'BigQuery（即开即用，无集群管理）'],
  ['ML平台', 'SageMaker', 'Vertex AI（Gemini集成）'],
  ['消息队列', 'SQS/SNS/Kinesis', 'Pub/Sub（更简单的API）'],
  ['全球覆盖', '更多区域（31个）', '更好的亚太表现'],
];

export default function LessonGCPCore() {
  const navigate = useNavigate();
  const [activeCat, setActiveCat] = useState(0);

  const cat = GCP_SERVICES[activeCat];

  return (
    <div className="lesson-cn">
      <div className="cn-badge gcp">🔵 module_03 — GCP 核心</div>

      <div className="cn-hero">
        <h1>GCP 核心：GCE / GCS / BigQuery / Pub・Sub</h1>
        <p>GCP 在<strong>数据分析（BigQuery）、机器学习（Vertex AI）、容器（Cloud Run/GKE）</strong>上有独特优势。双云战略中，GCP 常承担数据智能层。</p>
      </div>

      {/* GCP 服务地图 */}
      <div className="cn-section">
        <h2 className="cn-section-title">🗺️ GCP 核心服务地图</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
          {GCP_SERVICES.map((c, i) => (
            <button key={c.name} onClick={() => setActiveCat(i)}
              style={{ flex: 1, minWidth: 120, padding: '0.75rem', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', fontWeight: 700, transition: 'all 0.2s',
                border: `1px solid ${activeCat === i ? c.color + '55' : 'rgba(255,255,255,0.07)'}`,
                background: activeCat === i ? `${c.color}12` : 'rgba(255,255,255,0.02)',
                color: activeCat === i ? c.color : '#1e4060' }}>
              <div style={{ fontSize: '1.3rem', marginBottom: '0.2rem' }}>{c.icon}</div>
              {c.name}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.875rem' }}>
          {cat.items.map(s => (
            <div key={s.s} style={{ display: 'flex', gap: '0.75rem', padding: '0.65rem 0.875rem', borderRadius: '8px', border: `1px solid rgba(255,255,255,0.05)`, background: 'rgba(255,255,255,0.02)' }}>
              <code style={{ fontFamily: 'JetBrains Mono', color: cat.color, fontSize: '0.78rem', minWidth: 160 }}>{s.s}</code>
              <span style={{ fontSize: '0.78rem', color: '#1e4060' }}>{s.d}</span>
            </div>
          ))}
        </div>

        <div className="cn-code-wrapper">
          <div className="cn-code-header">
            <div className="cn-code-dot" style={{ background: '#ef4444' }} />
            <div className="cn-code-dot" style={{ background: '#f59e0b' }} />
            <div className="cn-code-dot" style={{ background: cat.color }} />
            <span style={{ marginLeft: '0.5rem', color: cat.color }}>GCP — {cat.name}类服务示例</span>
          </div>
          <div className="cn-code" style={{ fontSize: '0.75rem', maxHeight: 340, overflow: 'auto' }}>{cat.code}</div>
        </div>
      </div>

      {/* AWS vs GCP */}
      <div className="cn-section">
        <h2 className="cn-section-title">⚖️ AWS vs GCP：同类服务对比选型</h2>
        <div className="cn-card">
          <table className="cn-table">
            <thead><tr><th>功能</th><th>🟠 AWS</th><th>🔵 GCP</th></tr></thead>
            <tbody>
              {AWS_VS_GCP.map(([f, a, g]) => (
                <tr key={f}>
                  <td style={{ fontWeight: 700, color: '#fbbf24', fontSize: '0.82rem' }}>{f}</td>
                  <td style={{ fontSize: '0.8rem', color: '#FF9900' }}>{a}</td>
                  <td style={{ fontSize: '0.8rem', color: '#74a9ff' }}>{g}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: '0.875rem', padding: '0.75rem', background: 'rgba(14,165,233,0.05)', borderRadius: '8px', fontSize: '0.82rem', color: '#1e4060' }}>
            💡 <strong style={{ color: '#38bdf8' }}>选型建议</strong>：如果已重度使用 AWS，继续用 AWS。新项目或 AI/数据密集型选 GCP。大型企业可双云：AWS 跑业务，GCP 跑数据分析。
          </div>
        </div>
      </div>

      <div className="cn-nav">
        <button className="cn-btn" onClick={() => navigate('/course/cloud-native/lesson/aws-core')}>← 上一模块</button>
        <button className="cn-btn primary" onClick={() => navigate('/course/cloud-native/lesson/serverless')}>下一模块：Serverless 架构 →</button>
      </div>
    </div>
  );
}
