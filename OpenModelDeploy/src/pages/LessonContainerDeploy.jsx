import React, { useState } from 'react';
import './LessonCommon.css';

/* ─────────────────────────────────────────────
   Module 07 — 容器化编排
   Docker + K8s / GPU 调度 / 弹性伸缩
   ───────────────────────────────────────────── */

export default function LessonContainerDeploy() {
  const [tab, setTab] = useState('docker');

  return (
    <div className="lesson-deploy">
      <div className="dp-badge blue">🚀 module_07 — 容器化编排</div>

      <div className="dp-hero">
        <h1>容器化编排：GPU 推理的 Docker + K8s 实战</h1>
        <p>
          生产部署 LLM 不是 `python serve.py` 然后不管了——你需要
          <strong>容器化、GPU 调度、自动伸缩、健康检查、优雅关闭</strong>。
          本模块从 Dockerfile 到 Kubernetes GPU 集群的完整生产配置。
        </p>
      </div>

      <div className="dp-pills">
        <button className={`dp-btn ${tab === 'docker' ? 'primary' : 'blue'}`} onClick={() => setTab('docker')}>🐳 Docker</button>
        <button className={`dp-btn ${tab === 'compose' ? 'primary' : 'blue'}`} onClick={() => setTab('compose')}>📦 Compose</button>
        <button className={`dp-btn ${tab === 'k8s' ? 'primary' : 'blue'}`} onClick={() => setTab('k8s')}>☸️ K8s GPU</button>
        <button className={`dp-btn ${tab === 'hpa' ? 'primary' : 'blue'}`} onClick={() => setTab('hpa')}>📈 弹性伸缩</button>
      </div>

      {tab === 'docker' && (
        <div className="dp-section">
          <h2 className="dp-section-title">🐳 vLLM 生产级 Dockerfile</h2>
          <div className="dp-code-wrap">
            <div className="dp-code-head">
              <span className="dp-code-dot" style={{ background: '#ef4444' }} />
              <span className="dp-code-dot" style={{ background: '#f59e0b' }} />
              <span className="dp-code-dot" style={{ background: '#22c55e' }} />
              🐳 Dockerfile
            </div>
            <pre className="dp-code">{`# ─── 多阶段构建 ───
FROM vllm/vllm-openai:latest AS base

# 设置环境变量
ENV MODEL_ID="meta-llama/Llama-3.1-8B-Instruct"
ENV HF_HOME=/models
ENV VLLM_USAGE_SOURCE=production

# 下载模型 (构建时缓存)
FROM base AS model-downloader
ARG HF_TOKEN
RUN pip install huggingface_hub && \\
    python -c "from huggingface_hub import snapshot_download; \\
    snapshot_download('$MODEL_ID', local_dir='/models/model')"

# 运行时镜像
FROM base AS runtime
COPY --from=model-downloader /models /models

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \\
  CMD curl -f http://localhost:8000/health || exit 1

EXPOSE 8000

# 生产启动命令
ENTRYPOINT ["python", "-m", "vllm.entrypoints.openai.api_server"]
CMD [ \\
  "--model", "/models/model", \\
  "--host", "0.0.0.0", \\
  "--port", "8000", \\
  "--max-model-len", "8192", \\
  "--gpu-memory-utilization", "0.92", \\
  "--max-num-seqs", "128", \\
  "--enable-prefix-caching", \\
  "--disable-log-requests" \\
]`}</pre>
          </div>
          <div className="dp-code-wrap" style={{ marginTop: '1rem' }}>
            <div className="dp-code-head">
              <span className="dp-code-dot" style={{ background: '#ef4444' }} />
              <span className="dp-code-dot" style={{ background: '#f59e0b' }} />
              <span className="dp-code-dot" style={{ background: '#22c55e' }} />
              🖥️ 构建并运行
            </div>
            <pre className="dp-code">{`# 构建
docker build -t llm-server:latest \\
  --build-arg HF_TOKEN=$HF_TOKEN .

# 运行 (NVIDIA GPU)
docker run -d --name llm \\
  --gpus '"device=0"' \\
  --shm-size 1g \\
  -p 8000:8000 \\
  --restart unless-stopped \\
  -v $PWD/model_cache:/models \\
  llm-server:latest

# 验证 
curl http://localhost:8000/v1/models
curl http://localhost:8000/health`}</pre>
          </div>
        </div>
      )}

      {tab === 'compose' && (
        <div className="dp-section">
          <h2 className="dp-section-title">📦 Docker Compose 多服务部署</h2>
          <div className="dp-code-wrap">
            <div className="dp-code-head">
              <span className="dp-code-dot" style={{ background: '#ef4444' }} />
              <span className="dp-code-dot" style={{ background: '#f59e0b' }} />
              <span className="dp-code-dot" style={{ background: '#22c55e' }} />
              📄 docker-compose.yml
            </div>
            <pre className="dp-code">{`version: "3.8"
services:
  # ─── LLM 推理服务 ───
  vllm:
    image: vllm/vllm-openai:latest
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
    volumes:
      - model_cache:/root/.cache/huggingface
    environment:
      - HF_TOKEN=\${HF_TOKEN}
    command: >
      --model meta-llama/Llama-3.1-8B-Instruct
      --host 0.0.0.0 --port 8000
      --max-model-len 8192
      --gpu-memory-utilization 0.92
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped

  # ─── Nginx 反向代理 + 负载均衡 ───
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      vllm:
        condition: service_healthy

  # ─── Prometheus 指标收集 ───
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  # ─── Grafana 仪表板 ───
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin

volumes:
  model_cache:`}</pre>
          </div>
        </div>
      )}

      {tab === 'k8s' && (
        <div className="dp-section">
          <h2 className="dp-section-title">☸️ Kubernetes GPU 部署</h2>
          <div className="dp-code-wrap">
            <div className="dp-code-head">
              <span className="dp-code-dot" style={{ background: '#ef4444' }} />
              <span className="dp-code-dot" style={{ background: '#f59e0b' }} />
              <span className="dp-code-dot" style={{ background: '#22c55e' }} />
              📄 k8s/llm-deployment.yaml
            </div>
            <pre className="dp-code">{`apiVersion: apps/v1
kind: Deployment
metadata:
  name: llm-server
  labels:
    app: llm-server
spec:
  replicas: 2              # 2 个副本
  selector:
    matchLabels:
      app: llm-server
  template:
    metadata:
      labels:
        app: llm-server
    spec:
      containers:
      - name: vllm
        image: vllm/vllm-openai:latest
        args:
          - "--model"
          - "meta-llama/Llama-3.1-8B-Instruct"
          - "--host"
          - "0.0.0.0"
          - "--port"
          - "8000"
          - "--gpu-memory-utilization"
          - "0.92"
          - "--max-model-len"
          - "8192"
        ports:
        - containerPort: 8000
        resources:
          limits:
            nvidia.com/gpu: 1      # 每 Pod 1 GPU
            memory: "32Gi"
          requests:
            nvidia.com/gpu: 1
            memory: "16Gi"
            cpu: "4"
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 120   # 模型加载需要时间
          periodSeconds: 10
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 180
          periodSeconds: 30
        env:
        - name: HF_TOKEN
          valueFrom:
            secretKeyRef:
              name: hf-secret
              key: token
        volumeMounts:
        - name: model-cache
          mountPath: /root/.cache/huggingface
        - name: shm
          mountPath: /dev/shm
      volumes:
      - name: model-cache
        persistentVolumeClaim:
          claimName: model-pvc
      - name: shm             # 共享内存 (PyTorch 需要)
        emptyDir:
          medium: Memory
          sizeLimit: 2Gi
      tolerations:             # 容忍 GPU 节点污点
      - key: nvidia.com/gpu
        operator: Exists
        effect: NoSchedule
      nodeSelector:
        cloud.google.com/gke-accelerator: nvidia-l4
---
apiVersion: v1
kind: Service
metadata:
  name: llm-service
spec:
  type: ClusterIP
  ports:
  - port: 80
    targetPort: 8000
  selector:
    app: llm-server`}</pre>
          </div>
        </div>
      )}

      {tab === 'hpa' && (
        <div className="dp-section">
          <h2 className="dp-section-title">📈 GPU 弹性伸缩</h2>
          <div className="dp-code-wrap">
            <div className="dp-code-head">
              <span className="dp-code-dot" style={{ background: '#ef4444' }} />
              <span className="dp-code-dot" style={{ background: '#f59e0b' }} />
              <span className="dp-code-dot" style={{ background: '#22c55e' }} />
              📄 k8s/hpa.yaml
            </div>
            <pre className="dp-code">{`# ─── KEDA ScaledObject (推荐用于 GPU 工作负载) ───
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: llm-scaler
spec:
  scaleTargetRef:
    name: llm-server
  minReplicaCount: 1         # 最少 1 个 Pod
  maxReplicaCount: 8         # 最多 8 个 Pod
  triggers:
  - type: prometheus
    metadata:
      serverAddress: http://prometheus:9090
      metricName: vllm_pending_requests
      query: |
        sum(vllm_num_requests_waiting{job="llm-server"})
      threshold: "10"        # 等待队列 >10 → 扩容
  - type: prometheus
    metadata:
      serverAddress: http://prometheus:9090
      metricName: vllm_gpu_utilization
      query: |
        avg(vllm_gpu_cache_usage_perc{job="llm-server"})
      threshold: "0.85"      # GPU KV Cache >85% → 扩容

# ─── 关键决策 ───
# 1. GPU 弹性伸缩 ≠ CPU 弹性伸缩
#    - GPU Pod 启动慢 (模型加载 1-5 min)
#    - 建议保留足够 buffer (minReplica 设高些)
#    - 使用 PVC 缓存模型避免重复下载
#
# 2. 冷启动优化方案:
#    - 预热 Pod (readinessProbe 确保模型加载完成)
#    - 模型缓存到 NFS/EFS 共享存储
#    - 使用 GPU 时间片共享 (MIG on A100)
#
# 3. 缩容策略:
#    - stabilizationWindowSeconds: 300 (5 min 稳定期)
#    - 禁止在有活跃请求时缩容
#    - 优雅关闭: preStop hook 等待推理完成`}</pre>
          </div>
          <div className="dp-grid-2" style={{ marginTop: '1rem' }}>
            <div className="dp-alert success">
              <strong>✅ 伸缩指标推荐</strong><br/>
              • 等待队列长度 (首选)<br/>• GPU KV Cache 利用率<br/>• P95 延迟<br/>• 请求成功率
            </div>
            <div className="dp-alert danger">
              <strong>🚫 避免用这些指标</strong><br/>
              • CPU 利用率 (GPU 推理 CPU 空闲)<br/>• 内存使用率 (模型加载后恒定)<br/>• QPS (不反映负载)
            </div>
          </div>
        </div>
      )}

      <div className="dp-nav">
        <button className="dp-btn">← 推理即服务</button>
        <button className="dp-btn green">生产架构 →</button>
      </div>
    </div>
  );
}
