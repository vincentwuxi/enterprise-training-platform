import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const AWS_CATEGORIES = [
  {
    name: '计算', icon: '⚡', color: '#FF9900',
    services: [
      { name: 'EC2', full: 'Elastic Compute Cloud', icon: '🖥️', desc: '可调整规格的虚拟机，按秒计费。选型：t3（通用）/ c6i（计算密集）/ r6i（内存密集）/ p4（GPU）' },
      { name: 'Lambda', full: 'Serverless Functions', icon: '⚡', desc: '事件驱动函数执行，无服务器管理，最大15分钟超时，128MB~10GB内存，按调用次数+时长计费' },
      { name: 'ECS/EKS', full: 'Container Services', icon: '🐳', desc: 'ECS=AWS托管容器编排，EKS=托管Kubernetes。生产推荐EKS（更标准化、可迁移）' },
    ],
    code: `# EC2 快速启动（AWS CLI）
aws ec2 run-instances \\
  --image-id ami-0abcdef1234567890 \\  # Amazon Linux 2023
  --instance-type t3.medium \\
  --key-name my-keypair \\
  --security-group-ids sg-12345678 \\
  --subnet-id subnet-12345678 \\
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=web-server}]'

# 查看实例状态
aws ec2 describe-instances --instance-ids i-1234567890abcdef0

# Lambda 部署（zip 方式）
zip function.zip handler.py
aws lambda create-function \\
  --function-name my-function \\
  --runtime python3.12 \\
  --handler handler.lambda_handler \\
  --zip-file fileb://function.zip \\
  --role arn:aws:iam::123456789012:role/lambda-role`,
  },
  {
    name: '存储', icon: '🗄️', color: '#569A31',
    services: [
      { name: 'S3', full: 'Simple Storage Service', icon: '🪣', desc: '对象存储，11个9的持久性。标准/$0.023/GB·月，Glacier归档最低$0.004/GB。可托管静态网站' },
      { name: 'EBS', full: 'Elastic Block Store', icon: '💾', desc: '块存储（类似硬盘），挂载到EC2。gp3=通用SSD(默认), io2=高IOPS(数据库), st1=吞吐优化(大文件)' },
      { name: 'EFS', full: 'Elastic File System', icon: '📁', desc: '托管 NFS 文件系统，多EC2共享挂载，适合共享配置/资产。按实际存储量计费' },
    ],
    code: `# S3 基本操作
aws s3 mb s3://my-bucket --region ap-east-1   # 创建桶

# 上传文件（大文件自动分片）
aws s3 cp ./dist/ s3://my-bucket/dist/ --recursive \\
  --cache-control "max-age=31536000" \\   # 静态资源缓存1年
  --exclude "*.html" \\
  --include "*.html" --cache-control "no-cache"  # HTML不缓存

# 配置静态网站托管
aws s3 website s3://my-bucket \\
  --index-document index.html \\
  --error-document 404.html

# 生成预签名URL（7天有效，供临时文件访问）
aws s3 presign s3://my-bucket/private-report.pdf \\
  --expires-in 604800

# S3 生命周期（自动归档节省成本）
aws s3api put-bucket-lifecycle-configuration \\
  --bucket my-bucket \\
  --lifecycle-configuration file://lifecycle.json`,
  },
  {
    name: '数据库', icon: '🗃️', color: '#3DB8CF',
    services: [
      { name: 'RDS', full: 'Relational Database Service', icon: '🗃️', desc: '托管 MySQL/PostgreSQL/Oracle 等，自动备份、多AZ高可用、只读副本。不再管 DB 服务器' },
      { name: 'Aurora', full: 'Aurora Serverless', icon: '⚡', desc: '兼容MySQL/PostgreSQL，性能5x，Serverless版本按ACU计费，可缩减至0（停用时零成本）' },
      { name: 'DynamoDB', full: 'NoSQL Key-Value DB', icon: '📊', desc: '全托管NoSQL，单位数毫秒延迟，自动扩缩容，按读写容量单位(RCU/WCU)计费' },
    ],
    code: `# RDS 创建（Aurora Serverless v2 MySQL）
aws rds create-db-cluster \\
  --db-cluster-identifier my-aurora-cluster \\
  --engine aurora-mysql \\
  --engine-version 8.0.mysql_aurora.3.04.0 \\
  --serverless-v2-scaling-configuration \\
      MinCapacity=0.5,MaxCapacity=16 \\  # 0.5~16 ACU 自动调整
  --master-username admin \\
  --manage-master-user-password \\       # 密码存 Secrets Manager
  --vpc-security-group-ids sg-xxx \\
  --db-subnet-group-name my-subnet-group

# DynamoDB 查询
import boto3
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
table = dynamodb.Table('users')
response = table.get_item(Key={'user_id': '42'})
user = response.get('Item')`,
  },
  {
    name: '网络/安全', icon: '🔒', color: '#FF4F00',
    services: [
      { name: 'VPC', full: 'Virtual Private Cloud', icon: '🏗️', desc: '私有网络空间。公有子网（有公网IP）+ 私有子网（仅内网，通过NAT Gateway出网）' },
      { name: 'IAM', full: 'Identity & Access Management', icon: '🔑', desc: '用户/角色/策略。最小权限原则：EC2 默认角色只赋予它实际需要的权限' },
      { name: 'CloudFront', full: 'CDN & DDoS Protection', icon: '🌍', desc: '全球 450+ PoP，静态资源CDN加速，配合WAF防DDoS，AWS Shield Standard免费' },
    ],
    code: `# IAM 最小权限策略示例（允许Lambda写S3）
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::my-bucket/lambda-output/*"
    }
  ]
}

# 创建 IAM 角色给 Lambda 使用
aws iam create-role \\
  --role-name lambda-s3-write-role \\
  --assume-role-policy-document file://trust-policy.json

# VPC 架构（推荐三层子网）
# 公有子网 → ALB （接受外部流量）
# 私有子网 → EC2/ECS（不直接暴露）
# 隔离子网 → RDS（完全私有，无出网路由）`,
  },
];

export default function LessonAWSCore() {
  const navigate = useNavigate();
  const [activeCat, setActiveCat] = useState(0);
  const [activeService, setActiveService] = useState(null);

  const cat = AWS_CATEGORIES[activeCat];

  return (
    <div className="lesson-cn">
      <div className="cn-badge aws">🟠 module_02 — AWS 核心</div>

      <div className="cn-hero">
        <h1>AWS 核心：EC2 / S3 / RDS / VPC / IAM 实战</h1>
        <p>AWS 拥有 200+ 服务，但 80% 的实际工作只用 20 个核心服务。掌握<strong>计算、存储、数据库、网络安全</strong>这四个类别，你就能构建大多数生产级应用。</p>
      </div>

      {/* AWS 服务地图 */}
      <div className="cn-section">
        <h2 className="cn-section-title">🗺️ AWS 核心服务地图（按类别切换）</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
          {AWS_CATEGORIES.map((c, i) => (
            <button key={c.name} onClick={() => { setActiveCat(i); setActiveService(null); }}
              style={{ flex: 1, minWidth: 120, padding: '0.75rem', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', fontWeight: 700, transition: 'all 0.2s',
                border: `1px solid ${activeCat === i ? c.color + '55' : 'rgba(255,255,255,0.07)'}`,
                background: activeCat === i ? `${c.color}12` : 'rgba(255,255,255,0.02)',
                color: activeCat === i ? c.color : '#1e4060' }}>
              <div style={{ fontSize: '1.3rem', marginBottom: '0.2rem' }}>{c.icon}</div>
              {c.name}
            </button>
          ))}
        </div>

        <div className="cn-grid-3" style={{ marginBottom: '1rem' }}>
          {cat.services.map((s, i) => (
            <div key={s.name} onClick={() => setActiveService(activeService === i ? null : i)}
              style={{ padding: '1rem', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.15s',
                border: `1px solid ${activeService === i ? cat.color + '55' : 'rgba(255,255,255,0.06)'}`,
                background: activeService === i ? `${cat.color}0d` : 'rgba(255,255,255,0.02)' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.3rem' }}>
                <span style={{ fontSize: '1.1rem' }}>{s.icon}</span>
                <span style={{ fontWeight: 800, color: cat.color, fontSize: '0.9rem' }}>{s.name}</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#1e4060', marginBottom: '0.3rem' }}>{s.full}</div>
              {activeService === i && <div style={{ fontSize: '0.78rem', color: '#7ec8e3', marginTop: '0.4rem' }}>{s.desc}</div>}
            </div>
          ))}
        </div>

        <div className="cn-code-wrapper">
          <div className="cn-code-header">
            <div className="cn-code-dot" style={{ background: '#ef4444' }} />
            <div className="cn-code-dot" style={{ background: '#f59e0b' }} />
            <div className="cn-code-dot" style={{ background: cat.color }} />
            <span style={{ marginLeft: '0.5rem', color: cat.color }}>AWS CLI — {cat.name}类服务示例</span>
          </div>
          <div className="cn-code" style={{ fontSize: '0.75rem', maxHeight: 320, overflow: 'auto' }}>{cat.code}</div>
        </div>
      </div>

      {/* Well-Architected 六大支柱 */}
      <div className="cn-section">
        <h2 className="cn-section-title">🏛️ AWS Well-Architected 六大支柱</h2>
        <div className="cn-grid-3">
          {[
            { icon: '⚙️', name: '卓越运营', desc: '监控、自动化、持续改进运营流程', color: '#22c55e' },
            { icon: '🔒', name: '安全', desc: 'IAM最小权限、加密静态/传输数据、日志审计', color: '#f87171' },
            { icon: '🔄', name: '可靠性', desc: '多AZ部署、自动恢复、容量规划', color: '#60a5fa' },
            { icon: '⚡', name: '性能效率', desc: '选择合适实例类型、缓存、CDN', color: '#fbbf24' },
            { icon: '💰', name: '成本优化', desc: '按需付费/Reserved/Spot节省成本', color: '#a78bfa' },
            { icon: '🌱', name: '可持续性', desc: '减少碳足迹，选择高效实例和区域', color: '#14b8a6' },
          ].map(p => (
            <div key={p.name} className="cn-card" style={{ textAlign: 'center', padding: '1rem', borderColor: `${p.color}20` }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>{p.icon}</div>
              <div style={{ fontWeight: 700, color: p.color, fontSize: '0.88rem', marginBottom: '0.25rem' }}>{p.name}</div>
              <div style={{ fontSize: '0.75rem', color: '#1e4060' }}>{p.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="cn-nav">
        <button className="cn-btn" onClick={() => navigate('/course/cloud-native/lesson/cloud-core')}>← 上一模块</button>
        <button className="cn-btn primary" onClick={() => navigate('/course/cloud-native/lesson/gcp-core')}>下一模块：GCP 核心 →</button>
      </div>
    </div>
  );
}
