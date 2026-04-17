import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['CLI 工具', 'HTTP 服务', '嵌入式 Rust', 'Cargo 生态'];

export default function LessonRustProject() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">🦀 module_08 — 实战项目</div>
      <div className="fs-hero">
        <h1>实战项目：CLI 工具 + HTTP 服务 + 嵌入式</h1>
        <p>
          本模块将前 7 个模块的知识整合到<strong>三个真实项目</strong>中：
          用 clap + serde 构建专业 CLI 工具、用 Axum + SQLx 构建高性能 HTTP API、
          用 no_std + embedded-hal 在微控制器上跑 Rust。同时深入 Cargo 生态，
          掌握 workspace、feature flags、条件编译等工程化最佳实践。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🦀 实战项目深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🛠️ CLI 工具开发</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f74c00'}}></span> cli_tool.rs</div>
                <pre className="fs-code">{`// ═══ 项目: minigrep — 简易 grep 替代 ═══
// 功能: 在文件中搜索文本, 支持正则、大小写、彩色输出

// Cargo.toml:
// [dependencies]
// clap = { version = "4", features = ["derive"] }
// regex = "1"
// colored = "2"
// anyhow = "1"
// serde = { version = "1", features = ["derive"] }
// serde_json = "1"
// toml = "0.8"

use clap::{Parser, Subcommand};
use anyhow::{Result, Context};
use std::path::PathBuf;

/// minigrep — 在文件中搜索文本
#[derive(Parser, Debug)]
#[command(name = "minigrep", version, about, long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
    
    /// 启用详细输出
    #[arg(short, long, global = true)]
    verbose: bool,
}

#[derive(Subcommand, Debug)]
enum Commands {
    /// 搜索文本
    Search {
        /// 搜索模式 (正则表达式)
        pattern: String,
        
        /// 要搜索的文件
        #[arg(required = true)]
        files: Vec<PathBuf>,
        
        /// 忽略大小写
        #[arg(short = 'i', long)]
        ignore_case: bool,
        
        /// 显示上下文行数
        #[arg(short = 'C', long, default_value = "0")]
        context: usize,
        
        /// 输出格式
        #[arg(short, long, value_enum, default_value = "text")]
        format: OutputFormat,
    },
    /// 统计匹配数量
    Count {
        pattern: String,
        files: Vec<PathBuf>,
    },
}

#[derive(clap::ValueEnum, Clone, Debug)]
enum OutputFormat { Text, Json }

fn main() -> Result<()> {
    let cli = Cli::parse();
    
    match cli.command {
        Commands::Search { pattern, files, ignore_case, context, format } => {
            let regex = if ignore_case {
                regex::RegexBuilder::new(&pattern)
                    .case_insensitive(true)
                    .build()
            } else {
                regex::Regex::new(&pattern)
            }.context("Invalid regex pattern")?;
            
            for file in &files {
                let content = std::fs::read_to_string(file)
                    .with_context(|| format!("Failed to read {}", file.display()))?;
                
                for (line_num, line) in content.lines().enumerate() {
                    if regex.is_match(line) {
                        match format {
                            OutputFormat::Text => {
                                println!("{}:{}: {}", file.display(), line_num + 1, line);
                            }
                            OutputFormat::Json => {
                                let m = serde_json::json!({
                                    "file": file.display().to_string(),
                                    "line": line_num + 1,
                                    "content": line,
                                });
                                println!("{}", serde_json::to_string(&m)?);
                            }
                        }
                    }
                }
            }
        }
        Commands::Count { pattern, files } => {
            let regex = regex::Regex::new(&pattern)?;
            let mut total = 0;
            for file in &files {
                let content = std::fs::read_to_string(file)?;
                let count = content.lines().filter(|l| regex.is_match(l)).count();
                total += count;
                println!("{}: {count} matches", file.display());
            }
            println!("Total: {total} matches");
        }
    }
    Ok(())
}

// 使用:
// minigrep search "fn\\s+main" src/*.rs -i
// minigrep search "TODO" . -C 2 --format json
// minigrep count "unsafe" src/`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🌐 HTTP 服务 (Axum)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> axum_server.rs</div>
                <pre className="fs-code">{`// ═══ 项目: Todo API — RESTful CRUD 服务 ═══
// 技术栈: Axum + SQLx + PostgreSQL + Tower

// Cargo.toml:
// [dependencies]
// axum = "0.7"
// tokio = { version = "1", features = ["full"] }
// sqlx = { version = "0.7", features = ["runtime-tokio", "postgres"] }
// serde = { version = "1", features = ["derive"] }
// serde_json = "1"
// tower-http = { version = "0.5", features = ["cors", "trace"] }
// tracing = "0.1"
// tracing-subscriber = "0.3"
// uuid = { version = "1", features = ["v4", "serde"] }

use axum::{
    Router, Json, extract::{State, Path, Query},
    http::StatusCode, response::IntoResponse,
};
use sqlx::PgPool;
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use std::sync::Arc;

// ═══ 数据模型 ═══
#[derive(Serialize, Deserialize, sqlx::FromRow)]
struct Todo {
    id: Uuid,
    title: String,
    completed: bool,
    created_at: chrono::NaiveDateTime,
}

#[derive(Deserialize)]
struct CreateTodo {
    title: String,
}

#[derive(Deserialize)]
struct ListParams {
    completed: Option<bool>,
    limit: Option<i64>,
}

// ═══ 应用状态 ═══
struct AppState {
    db: PgPool,
}

// ═══ 路由 ═══
#[tokio::main]
async fn main() {
    tracing_subscriber::init();
    
    let pool = PgPool::connect(&std::env::var("DATABASE_URL").unwrap())
        .await.unwrap();
    
    sqlx::migrate!("./migrations").run(&pool).await.unwrap();
    
    let state = Arc::new(AppState { db: pool });
    
    let app = Router::new()
        .route("/todos", axum::routing::get(list_todos).post(create_todo))
        .route("/todos/:id", axum::routing::get(get_todo)
                                .put(update_todo)
                                .delete(delete_todo))
        .route("/health", axum::routing::get(|| async { "OK" }))
        .layer(tower_http::cors::CorsLayer::permissive())
        .layer(tower_http::trace::TraceLayer::new_for_http())
        .with_state(state);
    
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    tracing::info!("Listening on :3000");
    axum::serve(listener, app).await.unwrap();
}

// ═══ Handler 实现 ═══
async fn list_todos(
    State(state): State<Arc<AppState>>,
    Query(params): Query<ListParams>,
) -> impl IntoResponse {
    let limit = params.limit.unwrap_or(50);
    let todos = match params.completed {
        Some(completed) => {
            sqlx::query_as!(Todo,
                "SELECT * FROM todos WHERE completed = $1 ORDER BY created_at DESC LIMIT $2",
                completed, limit
            ).fetch_all(&state.db).await
        }
        None => {
            sqlx::query_as!(Todo,
                "SELECT * FROM todos ORDER BY created_at DESC LIMIT $1",
                limit
            ).fetch_all(&state.db).await
        }
    };
    
    match todos {
        Ok(todos) => Json(todos).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response(),
    }
}

async fn create_todo(
    State(state): State<Arc<AppState>>,
    Json(input): Json<CreateTodo>,
) -> impl IntoResponse {
    let todo = sqlx::query_as!(Todo,
        "INSERT INTO todos (id, title, completed, created_at) 
         VALUES ($1, $2, false, NOW()) RETURNING *",
        Uuid::new_v4(), input.title
    ).fetch_one(&state.db).await;
    
    match todo {
        Ok(todo) => (StatusCode::CREATED, Json(todo)).into_response(),
        Err(e) => (StatusCode::BAD_REQUEST, e.to_string()).into_response(),
    }
}

// ═══ 中间件: 请求日志 + 认证 ═══
// Tower 中间件生态:
// tower-http::cors      — CORS
// tower-http::trace     — 请求追踪
// tower-http::limit     — 请求限流
// tower-http::compression — Gzip/Br 压缩
// axum-extra::TypedHeader — 类型安全的 Header`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔌 嵌入式 Rust (no_std)</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> embedded.rs</div>
                <pre className="fs-code">{`// ═══ no_std — 无标准库的 Rust ═══
// 去掉 std 依赖, 可以在裸机 (bare-metal) 上运行
// → 无堆分配 (除非使用自定义分配器)
// → 无文件系统、网络、线程 API
// → 保留 core 库 (基本类型、trait、Option、Result)

#![no_std]  // 不使用标准库
#![no_main] // 不使用标准入口点

use core::panic::PanicInfo;

// 必须定义 panic handler
#[panic_handler]
fn panic(_info: &PanicInfo) -> ! {
    loop {}  // 嵌入式: 死循环
}

// ═══ embedded-hal — 硬件抽象层 ═══
// 统一的硬件 API, 不同芯片实现同一个 trait
// → 代码可以跨芯片复用!

// Cargo.toml:
// [dependencies]
// embedded-hal = "1.0"
// cortex-m = "0.7"
// cortex-m-rt = "0.7"
// stm32f4xx-hal = "0.21"  # STM32F4 HAL 实现

// ═══ LED 闪烁 (STM32F4 Discovery) ═══
use stm32f4xx_hal::{pac, prelude::*};
use cortex_m_rt::entry;

#[entry]
fn main() -> ! {
    let dp = pac::Peripherals::take().unwrap();
    let cp = cortex_m::Peripherals::take().unwrap();
    
    // 配置时钟
    let rcc = dp.RCC.constrain();
    let clocks = rcc.cfgr.sysclk(168.MHz()).freeze();
    
    // 配置 GPIO (LED 在 PD12)
    let gpiod = dp.GPIOD.split();
    let mut led = gpiod.pd12.into_push_pull_output();
    
    // 配置延时
    let mut delay = cp.SYST.delay(&clocks);
    
    loop {
        led.set_high();
        delay.delay_ms(500u32);
        led.set_low();
        delay.delay_ms(500u32);
    }
}

// ═══ UART 通信 ═══
fn uart_example() {
    // 配置 UART
    let tx_pin = gpioa.pa2.into_alternate();
    let rx_pin = gpioa.pa3.into_alternate();
    let serial = dp.USART2.serial(
        (tx_pin, rx_pin),
        115_200.bps(),
        &clocks,
    ).unwrap();
    
    let (mut tx, mut rx) = serial.split();
    
    // 发送
    for byte in b"Hello from Rust!\\r\\n" {
        nb::block!(tx.write(*byte)).unwrap();
    }
    
    // 接收
    loop {
        if let Ok(byte) = nb::block!(rx.read()) {
            nb::block!(tx.write(byte)).unwrap(); // 回显
        }
    }
}

// ═══ 嵌入式 Rust 生态 ═══
// 
// 核心:
// embedded-hal     — 硬件抽象 trait
// cortex-m         — ARM Cortex-M 支持
// cortex-m-rt      — 启动代码和中断向量表
//
// 芯片 HAL:
// stm32f4xx-hal    — STM32F4 系列
// nrf52840-hal     — Nordic nRF52840
// esp-hal          — Espressif ESP32
// rp-hal           — Raspberry Pi Pico
//
// 驱动 (基于 embedded-hal, 跨芯片!):
// bmp280           — 温湿度传感器
// ssd1306          — OLED 显示屏
// ws2812-spi       — WS2812 LED 灯带
//
// RTOS:
// embassy          — 异步嵌入式框架
// rtic             — 基于优先级的实时框架

// ═══ Embassy — 异步嵌入式 ═══
// #[embassy_executor::main]
// async fn main(spawner: Spawner) {
//     let p = embassy_stm32::init(Default::default());
//     let mut led = Output::new(p.PD12, Level::Low, Speed::Low);
//     
//     loop {
//         led.set_high();
//         Timer::after_millis(500).await;  // 异步延时!
//         led.set_low();
//         Timer::after_millis(500).await;
//     }
// }`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📦 Cargo 生态与工程化</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> cargo_ecosystem.txt</div>
                <pre className="fs-code">{`# ═══ Cargo Workspace — 多包项目 ═══
# 根 Cargo.toml:
# [workspace]
# members = [
#   "crates/core",
#   "crates/cli", 
#   "crates/server",
#   "crates/wasm",
# ]
# 
# [workspace.dependencies]
# serde = { version = "1", features = ["derive"] }
# tokio = { version = "1", features = ["full"] }
#
# 子包引用:
# [dependencies]
# serde = { workspace = true }

# ═══ Feature Flags — 条件编译 ═══
# [features]
# default = ["json"]
# json = ["dep:serde_json"]
# yaml = ["dep:serde_yaml"]
# full = ["json", "yaml", "compression"]
# compression = ["dep:flate2"]
#
# [dependencies]
# serde_json = { version = "1", optional = true }
# serde_yaml = { version = "0.9", optional = true }

# 代码中使用:
# #[cfg(feature = "json")]
# pub mod json { /* ... */ }
#
# #[cfg(feature = "yaml")]
# pub mod yaml { /* ... */ }
#
# 构建:
# cargo build --features "json,yaml"
# cargo build --all-features
# cargo build --no-default-features --features yaml

# ═══ 条件编译 ═══
# #[cfg(target_os = "linux")]       // Linux 专属
# #[cfg(target_arch = "x86_64")]    // x86_64 专属
# #[cfg(feature = "async")]         // feature 开关
# #[cfg(test)]                      // 测试模式
# #[cfg(debug_assertions)]          // debug 模式
# #[cfg(not(target_family = "wasm"))] // 非 Wasm

# ═══ 常用开发工具 ═══
cargo fmt                 # 代码格式化 (rustfmt)
cargo clippy              # Lint 检查 (500+ 规则)
cargo doc --open          # 生成文档
cargo bench               # 基准测试
cargo audit               # 安全漏洞检查
cargo deny check          # 依赖许可证检查
cargo bloat               # 二进制大小分析
cargo expand              # 展开宏代码
cargo tree                # 依赖树可视化

# ═══ 测试 ═══
# 单元测试 (在同一文件中):
# #[cfg(test)]
# mod tests {
#     use super::*;
#     
#     #[test]
#     fn test_add() {
#         assert_eq!(add(2, 3), 5);
#     }
#     
#     #[test]
#     #[should_panic(expected = "overflow")]
#     fn test_overflow() {
#         add(u32::MAX, 1);
#     }
# }
#
# 集成测试 (tests/ 目录):
# tests/integration_test.rs
# use my_crate::public_function;
# #[test]
# fn it_works() { ... }
#
# 文档测试 (自动从文档注释提取):
# /// Adds two numbers.
# /// 
# /// \`\`\`
# /// assert_eq!(my_crate::add(1, 2), 3);
# /// \`\`\`
# pub fn add(a: i32, b: i32) -> i32 { a + b }

# ═══ 发布到 crates.io ═══
# 1. cargo login <token>
# 2. 更新 Cargo.toml 元数据 (description, license, repository)
# 3. cargo publish --dry-run  (检查)
# 4. cargo publish
#
# 语义化版本:
# 0.x.y — 开发期, 随时可能 breaking change
# 1.x.y — 稳定 API
# x.MAJOR.y — Breaking changes
# x.y.MINOR — 新功能, 向后兼容
# x.y.PATCH — Bug 修复`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
