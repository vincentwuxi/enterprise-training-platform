import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['单元测试', 'Table-Driven 测试', 'Mock 与集成测试', 'Benchmark 与 Fuzzing'];

export default function LessonGoTesting() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">🐹 module_05 — 测试与质量</div>
      <div className="fs-hero">
        <h1>测试与质量：单元测试 / Benchmark / Fuzzing / 覆盖率</h1>
        <p>
          Go 内置了<strong>完整的测试框架</strong>——不需要第三方库就能写单元测试、
          基准测试和模糊测试。<code>go test</code> 是 Go 工具链的一等公民。
          Table-driven 测试是 Go 社区的标准模式，结合 <code>testify</code> 和 <code>gomock</code>
          可以构建企业级的测试体系。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🐹 测试深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🧪 单元测试基础</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#00add8'}}></span> calculator_test.go</div>
                <pre className="fs-code">{`package calculator

import (
    "testing"
)

// ═══ 测试函数: Test + 大写开头 ═══
// 文件: xxx_test.go (只在 go test 时编译)

func TestAdd(t *testing.T) {
    result := Add(2, 3)
    if result != 5 {
        t.Errorf("Add(2, 3) = %d; want 5", result)
    }
}

// ═══ t.Run — 子测试 ═══
func TestDivide(t *testing.T) {
    t.Run("normal", func(t *testing.T) {
        result, err := Divide(10, 2)
        if err != nil {
            t.Fatal(err) // Fatal 立即停止此测试
        }
        if result != 5 {
            t.Errorf("got %f, want 5", result)
        }
    })
    
    t.Run("division by zero", func(t *testing.T) {
        _, err := Divide(10, 0)
        if err == nil {
            t.Error("expected error for division by zero")
        }
    })
}

// ═══ TestMain — 全局 setup/teardown ═══
func TestMain(m *testing.M) {
    // 全局 setup
    db := setupTestDB()
    
    // 运行所有测试
    code := m.Run()
    
    // 全局 teardown
    db.Close()
    os.Exit(code)
}

// ═══ Helper 函数 ═══
func assertEqual(t *testing.T, got, want int) {
    t.Helper()  // 标记为 helper, 错误报告指向调用方
    if got != want {
        t.Errorf("got %d, want %d", got, want)
    }
}

// ═══ 跳过测试 ═══
func TestSlow(t *testing.T) {
    if testing.Short() {
        t.Skip("skipping slow test in short mode")
    }
    // 耗时测试...
}
// go test -short  → 跳过慢测试

// ═══ 并行测试 ═══
func TestParallel(t *testing.T) {
    t.Parallel()  // 与其他 Parallel 测试并行运行
    // ...
}

// ═══ go test 命令 ═══
// go test ./...           — 测试所有包
// go test -v              — 详细输出
// go test -run TestAdd    — 运行匹配的测试
// go test -count=1        — 禁用缓存
// go test -race           — 竞争检测
// go test -cover          — 覆盖率
// go test -coverprofile=c.out && go tool cover -html=c.out
// go test -timeout 30s    — 超时`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📋 Table-Driven 测试</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#00758d'}}></span> table_test.go</div>
                <pre className="fs-code">{`package validator

import "testing"

// ═══ Table-Driven 测试 — Go 标准模式 ═══
func TestValidateEmail(t *testing.T) {
    tests := []struct {
        name  string   // 测试名称
        email string   // 输入
        valid bool     // 期望结果
    }{
        {"valid email", "user@example.com", true},
        {"valid with dots", "first.last@example.com", true},
        {"valid with plus", "user+tag@example.com", true},
        {"missing @", "userexample.com", false},
        {"missing domain", "user@", false},
        {"empty string", "", false},
        {"spaces", "user @example.com", false},
        {"double @", "user@@example.com", false},
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            got := ValidateEmail(tt.email)
            if got != tt.valid {
                t.Errorf("ValidateEmail(%q) = %v, want %v",
                    tt.email, got, tt.valid)
            }
        })
    }
}

// ═══ testify — 优雅的断言 ═══
// go get github.com/stretchr/testify
import (
    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/require"
)

func TestUserService(t *testing.T) {
    // assert: 失败继续执行
    assert.Equal(t, 200, resp.StatusCode)
    assert.Contains(t, body, "success")
    assert.NoError(t, err)
    assert.Nil(t, result)
    assert.True(t, isValid)
    
    // require: 失败立即停止 (严重错误)
    require.NoError(t, err, "database connection failed")
    // 后续代码只在 err == nil 时执行
    
    // 集合断言
    assert.ElementsMatch(t, expected, actual)
    assert.Len(t, results, 3)
    assert.Empty(t, errors)
    
    // JSON 断言
    assert.JSONEq(t, \`{"name":"Go"}\`, string(body))
}

// ═══ 测试 Fixtures ═══
// testdata/ 目录: go test 不会编译此目录
// 存放测试用的 JSON、SQL、配置文件等

func TestParseConfig(t *testing.T) {
    data, err := os.ReadFile("testdata/valid_config.json")
    require.NoError(t, err)
    
    config, err := ParseConfig(data)
    require.NoError(t, err)
    
    assert.Equal(t, "production", config.Env)
}

// ═══ Golden Files (快照测试) ═══
func TestRender(t *testing.T) {
    got := RenderTemplate(data)
    
    golden := filepath.Join("testdata", t.Name()+".golden")
    
    if *update {  // -update flag
        os.WriteFile(golden, []byte(got), 0644)
    }
    
    want, _ := os.ReadFile(golden)
    assert.Equal(t, string(want), got)
}`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🎭 Mock 与集成测试</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> mock_test.go</div>
                <pre className="fs-code">{`package service

import (
    "testing"
    "github.com/stretchr/testify/mock"
)

// ═══ 接口 Mock ═══
// 1. 在消费端定义接口
type UserRepository interface {
    FindByID(id int) (*User, error)
    Save(user *User) error
}

// 2. 实现 Mock
type MockUserRepo struct {
    mock.Mock  // 嵌入 testify/mock
}

func (m *MockUserRepo) FindByID(id int) (*User, error) {
    args := m.Called(id)
    if args.Get(0) == nil {
        return nil, args.Error(1)
    }
    return args.Get(0).(*User), args.Error(1)
}

func (m *MockUserRepo) Save(user *User) error {
    args := m.Called(user)
    return args.Error(0)
}

// 3. 测试中使用
func TestUserService_GetUser(t *testing.T) {
    repo := new(MockUserRepo)
    
    // 设置期望
    repo.On("FindByID", 1).Return(
        &User{ID: 1, Name: "Alice"}, nil,
    )
    
    svc := NewUserService(repo)
    user, err := svc.GetUser(1)
    
    assert.NoError(t, err)
    assert.Equal(t, "Alice", user.Name)
    repo.AssertExpectations(t)  // 验证所有期望被调用
}

func TestUserService_NotFound(t *testing.T) {
    repo := new(MockUserRepo)
    repo.On("FindByID", 999).Return(nil, ErrNotFound)
    
    svc := NewUserService(repo)
    _, err := svc.GetUser(999)
    
    assert.ErrorIs(t, err, ErrNotFound)
}

// ═══ gomock (代码生成 Mock) ═══
// go install go.uber.org/mock/mockgen@latest
// mockgen -source=repository.go -destination=mock_repository.go

// ═══ httptest — HTTP 测试 ═══
import "net/http/httptest"

func TestHealthHandler(t *testing.T) {
    // 创建请求
    req := httptest.NewRequest("GET", "/health", nil)
    w := httptest.NewRecorder()
    
    // 调用 handler
    healthHandler(w, req)
    
    // 断言响应
    resp := w.Result()
    assert.Equal(t, http.StatusOK, resp.StatusCode)
    
    body, _ := io.ReadAll(resp.Body)
    assert.Equal(t, "OK", string(body))
}

// ═══ 测试服务器 ═══
func TestAPIIntegration(t *testing.T) {
    // 启动测试服务器
    server := httptest.NewServer(setupRouter())
    defer server.Close()
    
    // 发送真实 HTTP 请求
    resp, err := http.Get(server.URL + "/api/users")
    require.NoError(t, err)
    defer resp.Body.Close()
    
    assert.Equal(t, 200, resp.StatusCode)
}

// ═══ testcontainers — 真实数据库测试 ═══
// 用 Docker 启动临时数据库
// import "github.com/testcontainers/testcontainers-go"
// 
// func setupPostgres(t *testing.T) string {
//     ctx := context.Background()
//     container, _ := postgres.Run(ctx,
//         "postgres:16",
//         postgres.WithDatabase("test"),
//     )
//     t.Cleanup(func() { container.Terminate(ctx) })
//     return container.MustConnectionString(ctx)
// }`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⚡ Benchmark 与 Fuzzing</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> bench_fuzz_test.go</div>
                <pre className="fs-code">{`package main

import (
    "testing"
)

// ═══ Benchmark — 性能基准测试 ═══
func BenchmarkAdd(b *testing.B) {
    for i := 0; i < b.N; i++ {
        Add(2, 3)
    }
}
// go test -bench=. -benchmem
// BenchmarkAdd-8    1000000000    0.29 ns/op    0 B/op    0 allocs/op

// ═══ 对比基准 ═══
func BenchmarkConcat(b *testing.B) {
    b.Run("plus", func(b *testing.B) {
        for i := 0; i < b.N; i++ {
            s := ""
            for j := 0; j < 100; j++ {
                s += "x"
            }
        }
    })
    
    b.Run("builder", func(b *testing.B) {
        for i := 0; i < b.N; i++ {
            var sb strings.Builder
            for j := 0; j < 100; j++ {
                sb.WriteString("x")
            }
            _ = sb.String()
        }
    })
    
    b.Run("buffer", func(b *testing.B) {
        for i := 0; i < b.N; i++ {
            var buf bytes.Buffer
            for j := 0; j < 100; j++ {
                buf.WriteString("x")
            }
            _ = buf.String()
        }
    })
}
// 结果:
// BenchmarkConcat/plus-8      50000   25000 ns/op   5200 B/op  99 allocs
// BenchmarkConcat/builder-8  500000    2500 ns/op    512 B/op   4 allocs
// BenchmarkConcat/buffer-8   300000    3200 ns/op    640 B/op   5 allocs
// → strings.Builder 最快, 最少分配!

// ═══ benchstat — 统计比较 ═══
// go test -bench=. -count=5 > old.txt
// (修改代码)
// go test -bench=. -count=5 > new.txt
// benchstat old.txt new.txt
//
// name     old time/op  new time/op  delta
// Add-8    0.29ns       0.15ns       -48.28%

// ═══ Fuzzing — 模糊测试 (Go 1.18+) ═══
func FuzzParseJSON(f *testing.F) {
    // 提供种子语料 (seed corpus)
    f.Add([]byte(\`{"name":"test"}\`))
    f.Add([]byte(\`{"id":42}\`))
    f.Add([]byte(\`[]\`))
    f.Add([]byte(\`null\`))
    
    // Fuzzer 自动生成输入
    f.Fuzz(func(t *testing.T, data []byte) {
        var result map[string]any
        err := json.Unmarshal(data, &result)
        if err != nil {
            return  // 无效输入: 跳过
        }
        
        // 验证不变量
        output, err := json.Marshal(result)
        if err != nil {
            t.Fatalf("Marshal failed after successful Unmarshal: %v", err)
        }
        
        // 往返测试: Unmarshal → Marshal → Unmarshal
        var result2 map[string]any
        if err := json.Unmarshal(output, &result2); err != nil {
            t.Fatalf("Round-trip failed: %v", err)
        }
    })
}
// go test -fuzz FuzzParseJSON -fuzztime 30s
//
// 找到崩溃时, 保存到 testdata/fuzz/FuzzParseJSON/
// 之后 go test 自动回归测试

// ═══ 覆盖率 ═══
// go test -coverprofile=coverage.out ./...
// go tool cover -html=coverage.out      ← 浏览器查看
// go tool cover -func=coverage.out      ← 终端查看
//
// CI 中设置最低覆盖率:
// go test -coverprofile=c.out ./...
// coverage=$(go tool cover -func=c.out | grep total | awk '{print $3}')
// if [ "$coverage" != "80.0%" ]; then exit 1; fi`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
