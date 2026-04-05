import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LessonCommon.css';

const IAC_TOOLS = [
  {
    name: 'Terraform', icon: '🏗️', color: '#7B42BC', provider: 'HashiCorp',
    desc: '最流行的 IaC 工具，HCL 声明式语言，支持 1000+ Provider（AWS/GCP/Azure/Kubernetes...）',
    code: `# main.tf — Terraform 创建 AWS EC2 + RDS
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  # 状态文件存 S3（团队共享）
  backend "s3" {
    bucket = "my-terraform-state"
    key    = "prod/terraform.tfstate"
    region = "ap-east-1"
  }
}

provider "aws" {
  region = var.aws_region
}

# VPC
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.5.1"
  name    = "prod-vpc"
  cidr    = "10.0.0.0/16"
  azs     = ["ap-east-1a", "ap-east-1b", "ap-east-1c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]
  enable_nat_gateway = true
}

# EC2 应用服务器
resource "aws_instance" "web" {
  count         = var.instance_count
  ami           = data.aws_ami.amazon_linux.id
  instance_type = var.instance_type

  vpc_security_group_ids = [aws_security_group.web.id]
  subnet_id              = module.vpc.private_subnets[count.index % 2]

  tags = {
    Name        = "web-\${count.index + 1}"
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

# Terraform 核心命令
# terraform init     # 初始化（下载 Provider）
# terraform plan     # 预览变更（必须审查！）
# terraform apply    # 执行变更
# terraform destroy  # 销毁资源（生产慎用）`,
  },
  {
    name: 'AWS CDK', icon: '🔧', color: '#FF9900', provider: 'AWS',
    desc: '用真正的编程语言（Python/TypeScript/Java）定义 AWS 基础设施，最终生成 CloudFormation',
    code: `# app.py — AWS CDK Python 示例
from aws_cdk import (
    App, Stack, Duration,
    aws_ec2 as ec2,
    aws_ecs as ecs,
    aws_ecs_patterns as ecs_patterns,
    aws_rds as rds,
)
from constructs import Construct

class ECommerceStack(Stack):
    def __init__(self, scope: Construct, id: str, **kwargs):
        super().__init__(scope, id, **kwargs)

        # VPC（CDK 自动创建多AZ子网）
        vpc = ec2.Vpc(self, "ProdVPC",
            max_azs=2,
            nat_gateways=1,
        )

        # Fargate 服务（容器化应用，无需管理EC2）
        cluster = ecs.Cluster(self, "Cluster", vpc=vpc)
        service = ecs_patterns.ApplicationLoadBalancedFargateService(
            self, "APIService",
            cluster=cluster,
            memory_limit_mib=512,
            cpu=256,
            task_image_options=ecs_patterns.ApplicationLoadBalancedTaskImageOptions(
                image=ecs.ContainerImage.from_registry("my-api:latest"),
                environment={"ENV": "production"},
            ),
            desired_count=3,
        )

        # 自动扩缩容规则
        scaling = service.service.auto_scale_task_count(max_capacity=20)
        scaling.scale_on_cpu_utilization("CPUScaling",
            target_utilization_percent=70,
            scale_in_cooldown=Duration.seconds(60),
        )

        # RDS Aurora Serverless v2
        db = rds.DatabaseCluster(self, "Database",
            engine=rds.DatabaseClusterEngine.aurora_mysql(
                version=rds.AuroraMysqlEngineVersion.VER_3_04_0
            ),
            serverless_v2_min_capacity=0.5,
            serverless_v2_max_capacity=16,
            vpc=vpc,
        )

app = App()
ECommerceStack(app, "ECommerceProd", env={"region": "ap-east-1"})
app.synth()`,
  },
  {
    name: 'Pulumi', icon: '💫', color: '#8A3FC9', provider: '开源',
    desc: '与 CDK 类似，但支持 AWS/GCP/Azure 多云，且有更好的测试和生态支持',
    code: `# __main__.py — Pulumi Python（多云示例）
import pulumi
import pulumi_aws as aws
import pulumi_gcp as gcp

# AWS 部分：S3 存储静态资源
bucket = aws.s3.Bucket("assets",
    website=aws.s3.BucketWebsiteArgs(
        index_document="index.html",
    ),
)

# GCP 部分：Cloud Run 应用服务
service = gcp.cloudrun.Service("api",
    location="asia-east1",
    template=gcp.cloudrun.ServiceTemplateArgs(
        spec=gcp.cloudrun.ServiceTemplateSpecArgs(
            containers=[gcp.cloudrun.ServiceTemplateSpecContainerArgs(
                image="gcr.io/my-project/api:latest",
                resources=gcp.cloudrun.ServiceTemplateSpecContainerResourcesArgs(
                    limits={"memory": "512Mi", "cpu": "1"},
                ),
            )],
        ),
    ),
)

# 导出关键输出
pulumi.export("bucket_url", bucket.website_endpoint)
pulumi.export("api_url", service.statuses[0].url)

# 测试 Pulumi 程序（可以写单元测试）
# pulumi up --preview    # 预览变更
# pulumi up              # 执行
# pulumi stack output    # 查看输出`,
  },
];

const IAC_BEST_PRACTICES = [
  { tip: '状态文件存远端（S3/GCS）并开启版本控制，绝不存本地', level: '🔴 必须' },
  { tip: '评审 terraform plan / pulumi preview 输出，理解每个变更再 apply', level: '🔴 必须' },
  { tip: '用 workspace 或目录分隔 dev/staging/prod 环境，切勿共享状态文件', level: '🔴 必须' },
  { tip: '密钥/密码用 AWS Secrets Manager 或 GCP Secret Manager，不要在 IaC 代码中硬编码', level: '🔴 必须' },
  { tip: '给所有资源打标签（Environment/Team/CostCenter），便于成本分析', level: '⚠️ 强烈建议' },
  { tip: '用模块（modules）封装可复用的基础设施块（如 VPC/ECS服务）', level: '⚠️ 强烈建议' },
  { tip: '在 CI/CD 中运行 plan 并需要人工审批才能 apply 到 prod', level: '⚠️ 强烈建议' },
  { tip: '用 checkov 或 tfsec 扫描 Terraform 代码中的安全隐患', level: '💡 推荐' },
];

export default function LessonIaC() {
  const navigate = useNavigate();
  const [activeTool, setActiveTool] = useState(0);

  const tool = IAC_TOOLS[activeTool];

  return (
    <div className="lesson-cn">
      <div className="cn-badge purple">🏗️ module_06 — 基础设施即代码</div>

      <div className="cn-hero">
        <h1>基础设施即代码：Terraform / CDK / Pulumi</h1>
        <p>IaC 让基础设施变得<strong>可版本控制、可审查、可重复创建</strong>。人工点云控制台是一次性的——IaC 是可重复的生产力。</p>
      </div>

      {/* 三大工具对比 */}
      <div className="cn-section">
        <h2 className="cn-section-title">🛠️ 三大 IaC 工具对比（点击切换）</h2>
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          {IAC_TOOLS.map((t, i) => (
            <button key={t.name} onClick={() => setActiveTool(i)}
              style={{ flex: 1, minWidth: 140, padding: '0.875rem', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', fontWeight: 800, transition: 'all 0.2s',
                border: `1px solid ${activeTool === i ? t.color + '60' : 'rgba(255,255,255,0.07)'}`,
                background: activeTool === i ? `${t.color}10` : 'rgba(255,255,255,0.02)',
                color: activeTool === i ? t.color : '#1e4060' }}>
              <div style={{ fontSize: '1.4rem', marginBottom: '0.2rem' }}>{t.icon}</div>
              {t.name}
              <div style={{ fontSize: '0.68rem', opacity: 0.7 }}>{t.provider}</div>
            </button>
          ))}
        </div>

        <div style={{ fontSize: '0.82rem', color: '#1e4060', marginBottom: '0.75rem', padding: '0.6rem 0.875rem', background: 'rgba(14,165,233,0.04)', borderRadius: '8px' }}>
          💡 {tool.desc}
        </div>
        <div className="cn-code-wrapper">
          <div className="cn-code-header">
            <div className="cn-code-dot" style={{ background: '#ef4444' }} />
            <div className="cn-code-dot" style={{ background: '#f59e0b' }} />
            <div className="cn-code-dot" style={{ background: tool.color }} />
            <span style={{ marginLeft: '0.5rem', color: tool.color }}>{tool.icon} {tool.name} — 示例代码</span>
          </div>
          <div className="cn-code" style={{ fontSize: '0.75rem', maxHeight: 400, overflow: 'auto' }}>{tool.code}</div>
        </div>
      </div>

      {/* IaC 工具对比表 */}
      <div className="cn-section">
        <h2 className="cn-section-title">⚖️ IaC 工具选型对比</h2>
        <div className="cn-card">
          <table className="cn-table">
            <thead><tr><th>对比维度</th><th>🟣 Terraform</th><th>🟠 AWS CDK</th><th>💫 Pulumi</th></tr></thead>
            <tbody>
              {[
                ['语言', 'HCL（专有DSL）', 'Python/TS/Java/Go', 'Python/TS/Go/Java'],
                ['多云支持', '✅ 1000+ Provider', '❌ 仅 AWS', '✅ AWS/GCP/Azure'],
                ['学习曲线', '中等（学HCL）', '低（已会Python）', '低（已会Python）'],
                ['生态成熟度', '⭐⭐⭐⭐⭐ 最成熟', '⭐⭐⭐⭐ 成熟', '⭐⭐⭐ 增长中'],
                ['状态管理', 'tfstate 文件', 'CloudFormation', 'Pulumi Service/S3'],
                ['测试能力', '有限（terratest）', '单元测试友好', '原生单元测试'],
                ['适合团队', '运维/多云团队', '纯 AWS 开发团队', '开发者主导团队'],
              ].map(([d, t, c, p]) => (
                <tr key={d}>
                  <td style={{ fontWeight: 700, color: '#fbbf24', fontSize: '0.82rem' }}>{d}</td>
                  <td style={{ fontSize: '0.78rem', color: '#b070ff' }}>{t}</td>
                  <td style={{ fontSize: '0.78rem', color: '#FF9900' }}>{c}</td>
                  <td style={{ fontSize: '0.78rem', color: '#8A3FC9' }}>{p}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 最佳实践 */}
      <div className="cn-section">
        <h2 className="cn-section-title">📋 IaC 8条最佳实践</h2>
        <div className="cn-card">
          {IAC_BEST_PRACTICES.map((p, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.75rem', padding: '0.6rem 0', borderBottom: i < IAC_BEST_PRACTICES.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
              <span style={{ fontSize: '0.78rem', minWidth: 80, flexShrink: 0,
                color: p.level.includes('必须') ? '#f87171' : p.level.includes('强烈') ? '#fbbf24' : '#22c55e' }}>{p.level}</span>
              <span style={{ fontSize: '0.82rem', color: '#1e4060' }}>{p.tip}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="cn-nav">
        <button className="cn-btn" onClick={() => navigate('/course/cloud-native/lesson/container-cloud')}>← 上一模块</button>
        <button className="cn-btn primary" onClick={() => navigate('/course/cloud-native/lesson/cost-obs')}>下一模块：成本优化与可观测性 →</button>
      </div>
    </div>
  );
}
