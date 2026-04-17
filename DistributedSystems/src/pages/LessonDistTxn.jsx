import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['2PC / 3PC', 'Saga 模式', 'TCC / AT', '实战选型'];

export default function LessonDistTxn() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">🌐 module_04 — 分布式事务</div>
      <div className="fs-hero">
        <h1>分布式事务：2PC / 3PC / Saga / TCC</h1>
        <p>
          跨多个数据库或服务的事务是分布式系统最棘手的问题之一。
          <strong>2PC</strong> 提供原子性但有阻塞问题，
          <strong>Saga</strong> 通过补偿实现最终一致，
          <strong>TCC</strong> 在业务层实现事务语义。
          理解每种方案的权衡才能在实际系统中做出正确选择。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🌐 分布式事务深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔗 两阶段提交 / 三阶段提交</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#0ea5e9'}}></span> 2pc_3pc.txt</div>
                <pre className="fs-code">{`═══ 两阶段提交 (2PC) ═══

  角色: 协调者 (Coordinator) + 参与者 (Participants)

  Phase 1: Prepare (投票)
    协调者 → 所有参与者: "准备提交?"
    参与者:
      → 执行事务操作 (但不提交)
      → 写 redo/undo 日志
      → 回复: YES (可以提交) 或 NO (不行)

  Phase 2: Commit / Abort (提交)
    如果所有参与者都 YES:
      协调者 → 所有参与者: "提交!"
      参与者: 提交事务, 释放锁, 回复 ACK
    如果有任何 NO:
      协调者 → 所有参与者: "回滚!"
      参与者: 回滚事务, 释放锁

═══ 2PC 的核心问题 ═══

  1. 阻塞问题:
     Phase 1 参与者已 YES 但协调者崩溃
     → 参与者持有锁, 不知道提交还是回滚
     → 必须等待协调者恢复! (可能很久)
     → 这段时间资源被锁定, 其他事务阻塞

  2. 协调者单点故障:
     → 协调者崩溃 = 整个事务卡住
     → 需要持久化 WAL + 恢复机制

  3. 数据不一致风险:
     Phase 2 协调者发送 Commit 后部分参与者崩溃
     → 已提交的和未提交的不一致
     → 需要恢复后重试

  4. 性能:
     → 2 轮通信 + 持久化日志
     → 持有锁的时间跨越两轮
     → 高延迟, 低吞吐

═══ XA 协议 (2PC 的标准实现) ═══

  XA 是 X/Open 组织定义的分布式事务接口:
    xa_start()   — 开始事务分支
    xa_end()     — 结束事务分支
    xa_prepare() — Phase 1
    xa_commit()  — Phase 2 (提交)
    xa_rollback()— Phase 2 (回滚)
  
  支持 XA 的数据库:
    MySQL (InnoDB), PostgreSQL, Oracle
  
  Java: JTA (Java Transaction API)
    → Atomikos, Bitronix, Narayana

  性能问题:
    → MySQL XA: 每次 prepare 都要 fsync
    → 吞吐降低 10x 以上
    → 生产环境极少使用

═══ 三阶段提交 (3PC) ═══

  在 2PC 的 Prepare 和 Commit 之间增加 PreCommit:

  Phase 1: CanCommit (轻量询问)
  Phase 2: PreCommit (执行但不提交)
  Phase 3: DoCommit (正式提交)

  优势:
    → 非阻塞: 参与者超时后可根据状态自行决定
    → Phase 2 超时 → 回滚 (安全的)
    → Phase 3 超时 → 提交 (因为 PreCommit 已确认)

  劣势:
    → 3 轮通信, 更慢
    → 网络分区时仍可能不一致
    → 实际很少使用 (Paxos 比 3PC 更好)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔄 Saga 模式</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#6366f1'}}></span> saga.txt</div>
                <pre className="fs-code">{`═══ Saga 核心思想 (Garcia-Molina, 1987) ═══

  将长事务拆分为一系列本地事务:
    T₁ → T₂ → T₃ → ... → Tₙ
  
  每个本地事务有对应的补偿事务:
    C₁ ← C₂ ← C₃ ← ... ← Cₙ
  
  如果 Tₖ 失败:
    执行 Cₖ₋₁, Cₖ₋₂, ..., C₁ (反向补偿)

═══ 电商下单示例 ═══

  T1: 创建订单 (订单服务)
  T2: 扣减库存 (库存服务)
  T3: 扣减余额 (支付服务)
  T4: 发送通知 (通知服务)

  如果 T3 (扣款) 失败:
    C2: 恢复库存
    C1: 取消订单

  注意: T4 (发通知) 通常不需要补偿
       → 发一条 "订单取消" 通知即可

═══ 编排式 (Choreography) vs 协调式 (Orchestration) ═══

  编排式 (事件驱动):
    → 每个服务监听事件, 执行后发布新事件
    → 订单创建 → [事件] → 库存扣减 → [事件] → ...
    
    优点: 松耦合, 无中心协调
    缺点: 难以理解整体流程, 调试困难, 循环依赖

  协调式 (中心编排器):
    → Saga 协调器管理整个流程
    → 协调器 → 调用订单服务 → 调用库存服务 → ...
    
    优点: 流程清晰, 易于管理和监控
    缺点: 协调器是单点, 耦合集中

  推荐: 
    → 3-5 个步骤 → 编排式
    → >5 个步骤, 复杂逻辑 → 协调式

═══ Saga 的设计挑战 ═══

  1. 隔离性缺失:
     Saga 不提供隔离! 中间状态对外可见
     
     脏读问题:
       T1: 创建订单 (状态: PENDING)
       T2: 扣减库存 ← 此时另一事务看到库存已减!
       T3: 扣款失败 → 补偿 C2 恢复库存
       → 另一事务看到不一致的中间状态!

     语义锁 (Semantic Lock):
       → 在业务层实现 "锁"
       → 订单状态: PENDING → 不允许修改
       → 完成后: CONFIRMED

  2. 补偿的复杂性:
     → 补偿事务必须是幂等的
     → 有些操作不可补偿 (发邮件, 调外部 API)
     → 需要设计 "可补偿" 和 "不可补偿" 阶段

  3. 并发控制:
     → 交换律: 能否重排操作?
     → 重试安全: 补偿可能也失败!
     → 超时处理: 到底是成功了还是失败了?

═══ 框架与工具 ═══

  Temporal (temporal.io):
    → 最流行的 Saga 编排框架
    → 代码即工作流, 自动持久化状态
    → Go / Java / TypeScript / Python
    → Uber 内部项目 Cadence 的开源版

  Seata (阿里):
    → AT / TCC / Saga / XA 模式
    → Java 生态, 配合 Spring Cloud`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📋 TCC / AT 模式</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> tcc_at.txt</div>
                <pre className="fs-code">{`═══ TCC (Try-Confirm-Cancel) ═══

  业务层的 2PC:

  Try (尝试):
    → 预留资源, 冻结状态
    → 库存: 可用 100 → 可用 90, 冻结 10
    → 余额: 可用 1000 → 可用 800, 冻结 200

  Confirm (确认):
    → 所有 Try 成功 → 正式提交
    → 库存: 冻结 10 → 删除 (已出库)
    → 余额: 冻结 200 → 删除 (已扣款)
    → 必须幂等!

  Cancel (取消):
    → 任一 Try 失败 → 回滚所有
    → 库存: 冻结 10 → 恢复到可用
    → 余额: 冻结 200 → 恢复到可用
    → 必须幂等!

  TCC vs 2PC:
    → TCC 在业务层实现, 不依赖数据库
    → Try 阶段短暂持有业务锁, 不锁数据库行
    → 更灵活, 但侵入业务代码

═══ TCC 的注意事项 ═══

  空回滚:
    → Try 还没执行, Cancel 先到
    → Cancel 必须能处理 "没有 Try" 的情况
    → 检查: 如果没有冻结记录 → 直接返回成功

  悬挂 (Suspension):
    → Cancel 先执行, Try 后到
    → Try 必须检查是否已 Cancel
    → 如果已 Cancel → 拒绝 Try

  幂等性:
    → Confirm 和 Cancel 都可能重试
    → 用事务 ID 做去重

═══ AT 模式 (Automatic Transaction) ═══

  Seata 的特色:
    → 自动生成 undo log, 无需业务侵入
    → 拦截 SQL → 生成前镜像 (beforeImage)
    → 执行 SQL → 生成后镜像 (afterImage)
    → 回滚时: 用前镜像恢复

  执行过程:
    Phase 1:
      → 拦截 SQL: UPDATE account SET balance = balance - 200
      → 查询前镜像: SELECT balance FROM account → 1000
      → 执行 SQL
      → 查询后镜像: SELECT balance FROM account → 800
      → 保存 undo_log: {before: 1000, after: 800}
      → 本地提交! (锁释放)

    Phase 2 (Commit):
      → 删除 undo_log (异步清理)

    Phase 2 (Rollback):
      → 校验: 当前值 == afterImage? (800)
      → 回滚: UPDATE account SET balance = 1000
      → 删除 undo_log

  优势:
    → 几乎无业务侵入 (只需加注解)
    → Phase 1 立即释放锁 (性能好)
  
  代价:
    → 有脏读风险 (Phase 1 已提交)
    → 全局锁开销 (Seata 的全局锁)
    → 回滚可能失败 (数据已被其他事务修改)

═══ 对比总结 ═══

          │ 2PC/XA   │ TCC      │ Saga     │ AT
  ────────┼──────────┼──────────┼──────────┼────────
  一致性  │ 强       │ 强       │ 最终     │ 最终
  性能    │ 差       │ 好       │ 好       │ 好
  侵入性  │ 低       │ 高       │ 中       │ 低
  隔离性  │ 有       │ 有       │ 无       │ 弱
  复杂度  │ 低       │ 高       │ 中       │ 低
  回滚    │ 自动     │ 手动     │ 补偿     │ 自动
  适用    │ 同库     │ 资金     │ 长事务   │ 通用`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🎯 实战选型指南</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#10b981'}}></span> selection_guide.txt</div>
                <pre className="fs-code">{`═══ 选型决策树 ═══

  Q1: 能否在单个数据库内解决?
    → 是: 用数据库事务! 不需要分布式事务!
    → 否: 继续

  Q2: 需要强一致性 (ACID) 吗?
    → 是: 用 2PC/XA (同库) 或 TCC (跨服务)
    → 否: 继续

  Q3: 操作时间长吗? (秒级以上)
    → 是: 用 Saga (长事务, 异步)
    → 否: 继续

  Q4: 能否接受业务代码侵入?
    → 是: TCC (最灵活)
    → 否: AT (自动化)

═══ 场景推荐 ═══

  场景 1: 转账 (A → B)
    → 同库: 数据库事务 (最优!)
    → 跨库: TCC (预冻结金额)
    → 为什么不用 Saga: 没有隔离性, 并发转账可能超扣

  场景 2: 电商下单 (订单+库存+支付)
    → 推荐: Saga (编排式) + 语义锁
    → 原因: 跨多服务, 时间较长, 可补偿

  场景 3: 跨数据库写入 (MySQL → PostgreSQL)
    → XA/2PC: 如果两个库都支持 XA
    → AT (Seata): 更轻量

  场景 4: 微服务 API 组合
    → Saga + 事件驱动
    → 最终一致性 + 幂等消费

═══ 消息表模式 (Outbox Pattern) ═══

  最实用的最终一致性方案:
  
  原理:
    1. 业务操作 + 消息记录在同一个本地事务中
       BEGIN;
         UPDATE account SET balance = balance - 100;
         INSERT INTO outbox (event) VALUES ('deducted');
       COMMIT;
    
    2. 异步进程读取 outbox 表, 发送到 MQ
    3. 消费者处理消息 (幂等)
    4. 标记 outbox 记录为已发送

  优势:
    → 不依赖分布式事务框架
    → 利用数据库事务保证原子性
    → 消息不会丢失 (在数据库中!)
    → 简单可靠

  实现:
    → Debezium CDC: 监听 binlog 自动发送
    → 自研轮询: 定时扫描 outbox 表

═══ 分布式事务的反模式 ═══

  1. 过度使用分布式事务
     → 90% 的场景不需要! 重新设计领域边界
     → DDD: 聚合根内保证一致性, 聚合间最终一致

  2. 忽略幂等性
     → 任何重试场景 (网络超时) 都需要幂等
     → 使用 idempotency key + 去重表

  3. 补偿操作未考虑并发
     → 补偿时数据可能已被其他事务修改
     → 需要乐观锁或版本号

  4. 不记录事务日志
     → 分布式事务必须可审计、可追踪
     → 链路追踪 + 事务状态机持久化`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
