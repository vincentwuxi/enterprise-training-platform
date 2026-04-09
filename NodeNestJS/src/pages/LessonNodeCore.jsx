import { useState } from 'react';
import './LessonCommon.css';

const CODE_EVENTLOOP = `// ━━━━ Node.js Event Loop 深度解析 ━━━━
// libuv 提供跨平台异步 I/O，Event Loop 是 Node.js 单线程的核心

// Event Loop 6 个阶段（顺序执行）：
// 1. timers        → 执行 setTimeout / setInterval 到期回调
// 2. pending I/O   → 执行上一轮推迟的 I/O 回调
// 3. idle/prepare  → 内部使用
// 4. poll          → 获取新的 I/O 事件（阻塞等待或立即返回）
// 5. check         → 执行 setImmediate 回调
// 6. close         → 执行关闭事件回调（socket.destroy）

// 微任务队列（在每个阶段之间执行）：
// 优先级：process.nextTick > Promise.then > queueMicrotask

// ━━━━ 执行顺序示例 ━━━━
console.log('1: 同步代码');

setTimeout(() => console.log('5: setTimeout'), 0);
setImmediate(() => console.log('6: setImmediate'));

Promise.resolve().then(() => console.log('3: Promise.then'));
process.nextTick(() => console.log('2: nextTick'));

queueMicrotask(() => console.log('4: queueMicrotask'));

console.log('1.5: 同步代码继续');

// 输出顺序：1 → 1.5 → 2(nextTick) → 3(Promise) → 4(microtask)
//           → 5(setTimeout) → 6(setImmediate)

// ━━━━ 常见陷阱：阻塞 Event Loop ━━━━
// ❌ 错误：CPU 密集型操作阻塞 Event Loop
app.get('/bad', (req, res) => {
  // 同步执行 10 秒 → 期间所有请求都被阻塞！
  const result = heavyCpuWork(1e10);
  res.json(result);
});

// ✅ 正确：使用 Worker Threads 处理 CPU 密集型任务
app.get('/good', async (req, res) => {
  const result = await runInWorker(heavyCpuWork, 1e10);
  res.json(result);
});`;

const CODE_STREAMS = `// ━━━━ Node.js Streams：高效处理大数据 ━━━━
// Streams = 不把数据全部载入内存，分块处理
// 4 种类型：Readable / Writable / Duplex / Transform

import { createReadStream, createWriteStream } from 'fs';
import { createGzip } from 'zlib';
import { pipeline } from 'stream/promises';
import { Transform } from 'stream';

// ━━━━ 示例 1：文件压缩（管道链）━━━━
async function compressFile(src: string, dest: string) {
  await pipeline(
    createReadStream(src),      // 读取源文件
    createGzip(),               // 压缩
    createWriteStream(dest),    // 写入目标
  );
  console.log('压缩完成！');
}
// 无论文件多大，内存始终只占用 chunk 大小（默认 16KB）

// ━━━━ 示例 2：自定义 Transform Stream ━━━━
class CsvToJsonTransform extends Transform {
  private headers: string[] = [];
  private isFirstLine = true;

  _transform(chunk: Buffer, encoding: string, callback: Function) {
    const lines = chunk.toString().split('\\n');
    for (const line of lines) {
      if (!line.trim()) continue;
      const values = line.split(',');
      if (this.isFirstLine) {
        this.headers = values;
        this.isFirstLine = false;
        continue;
      }
      const obj = Object.fromEntries(
        this.headers.map((h, i) => [h.trim(), values[i]?.trim()])
      );
      this.push(JSON.stringify(obj) + '\\n');
    }
    callback();
  }
}

// 使用：1GB 的 CSV 文件实时转为 JSON，内存始终 < 1MB
await pipeline(
  createReadStream('huge-data.csv'),
  new CsvToJsonTransform(),
  createWriteStream('output.json'),
);

// ━━━━ 示例 3：HTTP 流式响应 ━━━━
// NestJS 中流式返回大文件（避免内存溢出）
import { StreamableFile } from '@nestjs/common';

@Get('download/:id')
async downloadFile(@Param('id') id: string): Promise<StreamableFile> {
  const fileStream = createReadStream(\`./uploads/\${id}\`);
  return new StreamableFile(fileStream, {
    type: 'application/octet-stream',
    disposition: \`attachment; filename="\${id}"\`,
  });
}`;

const CODE_WORKER = `// ━━━━ Worker Threads：CPU 密集型任务并行化 ━━━━
// Node.js 是单线程，Worker Threads 提供真正的多线程能力
// 适合：图像处理/加密/数学计算/JSON 解析大文件

// worker.ts（工作线程代码）
import { parentPort, workerData } from 'worker_threads';

function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const result = fibonacci(workerData.n);
parentPort?.postMessage(result);

// main.ts（主线程）
import { Worker } from 'worker_threads';

function runFibonacci(n: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const worker = new Worker('./worker.js', { workerData: { n } });
    worker.on('message', resolve);
    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0) reject(new Error(\`Worker exited with code \${code}\`));
    });
  });
}

// Worker Pool 模式（复用 Worker，避免频繁创建）
// 推荐库：piscina（最成熟的 Worker Pool）
import Piscina from 'piscina';

const pool = new Piscina({
  filename: './worker.js',
  maxThreads: 4,              // CPU 核心数
  idleTimeout: 30000,         // 30s 空闲后销毁
});

app.get('/calc/:n', async (req, res) => {
  const result = await pool.run({ n: parseInt(req.params.n) });
  res.json({ result });
});

// ━━━━ Cluster 模式（多进程 vs Worker Threads）━━━━
// Cluster：复制整个进程，适合 I/O 密集型服务器
// Worker Threads：共享内存，适合 CPU 密集型计算
import cluster from 'cluster';
import os from 'os';

if (cluster.isPrimary) {
  // 主进程：为每个 CPU 核心 fork 一个工作进程
  for (let i = 0; i < os.cpus().length; i++) {
    cluster.fork();
  }
} else {
  // 工作进程：运行 Express/NestJS 应用
  startServer();
}`;

export default function LessonNodeCore() {
  const [tab, setTab] = useState('eventloop');

  const tabs = [
    { key: 'eventloop', label: '⚡ Event Loop 深度', code: CODE_EVENTLOOP },
    { key: 'streams',   label: '🌊 Streams 流处理',  code: CODE_STREAMS },
    { key: 'worker',    label: '🧵 Worker Threads',   code: CODE_WORKER },
  ];
  const t = tabs.find(x => x.key === tab) ?? {};

  return (
    <div className="nn-lesson">
      <div className="nn-hero">
        <div className="nn-badge">// MODULE 01 · NODE.JS CORE</div>
        <h1>Node.js 核心深度</h1>
        <p>学 NestJS 前必须理解 Node.js 的底层机制。<strong>Event Loop 决定了异步的执行顺序；Streams 决定了大数据处理的内存效率；Worker Threads 决定了 CPU 密集任务的并发能力</strong>——这三项是区分初中级 Node.js 工程师的核心能力。</p>
      </div>

      <div className="nn-section">
        <div className="nn-section-title">🔑 三大核心机制</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {tabs.map(tb => (
            <button key={tb.key} className={`nn-btn ${tab === tb.key ? 'active' : ''}`} onClick={() => setTab(tb.key)}>{tb.label}</button>
          ))}
        </div>
        <div className="nn-code-wrap">
          <div className="nn-code-head">
            <div className="nn-code-dot" style={{ background: '#ef4444' }} />
            <div className="nn-code-dot" style={{ background: '#f59e0b' }} />
            <div className="nn-code-dot" style={{ background: '#10b981' }} />
            <span style={{ marginLeft: '0.5rem' }}>{tab}.ts</span>
          </div>
          <div className="nn-code">{t.code}</div>
        </div>
      </div>

      <div className="nn-section">
        <div className="nn-section-title">📊 Node.js 核心概念速查</div>
        <div className="nn-card" style={{ overflowX: 'auto' }}>
          <table className="nn-table">
            <thead><tr><th>概念</th><th>用途</th><th>常见误区</th></tr></thead>
            <tbody>
              {[
                ['process.nextTick', '当前操作完成后、下一个 I/O 前执行', '滥用会饿死 I/O（无限 nextTick 循环）'],
                ['Promise.then', 'Microtask（优先级低于 nextTick）', '和 nextTick 的执行顺序经常搞混'],
                ['setImmediate', 'poll 阶段结束后执行（check 阶段）', '和 setTimeout(fn,0) 顺序不确定'],
                ['Stream backpressure', 'Writable 来不及消费时暂停 Readable', '忽略 backpressure 会导致内存泄漏'],
                ['Worker Threads', '真正的多线程，共享 SharedArrayBuffer', '不能共享非 Transferable 对象'],
                ['Cluster', '多进程模型，每个进程独立内存', '适合 HTTP 服务，不适合共享状态'],
              ].map(([concept, usage, trap], i) => (
                <tr key={i}>
                  <td><span className="nn-tag teal">{concept}</span></td>
                  <td style={{ color: 'var(--nn-muted)', fontSize: '0.83rem' }}>{usage}</td>
                  <td style={{ color: 'var(--nn-muted)', fontSize: '0.83rem' }}>⚠️ {trap}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="nn-tip">
          💡 <strong>React 工程师上手 Node.js 的心智转变</strong>：前端 JavaScript 的 Promise/async-await 在 Node.js 中完全一致，但要新增理解 Event Loop 阶段和 Streams——这两个概念在浏览器端几乎不会遇到。
        </div>
      </div>

      <div className="nn-section">
        <div className="nn-section-title">📈 关键性能数据</div>
        <div className="nn-grid-4">
          {[
            { v: '~70k', l: 'Node.js HTTP 请求/秒（单进程）' },
            { v: '16KB', l: 'Stream 默认 chunk 大小' },
            { v: '4.1GB', l: 'Node.js 32bit 内存上限（改用 64bit）' },
            { v: 'N核', l: 'Worker/Cluster 推荐等于 CPU 核心数' },
          ].map((s, i) => (
            <div key={i} className="nn-metric">
              <div className="nn-metric-val" style={{ fontSize: '1.3rem' }}>{s.v}</div>
              <div className="nn-metric-label">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
