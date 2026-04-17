import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['Protobuf 基础', 'gRPC 四种模式', '拦截器与元数据', '服务治理'];

export default function LessonGoGRPC() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">🐹 module_06 — gRPC 微服务</div>
      <div className="fs-hero">
        <h1>gRPC 微服务：Protobuf / 流式 RPC / 拦截器</h1>
        <p>
          gRPC 是 Google 开源的高性能 RPC 框架，使用 <strong>Protocol Buffers</strong> 进行高效序列化，
          支持 HTTP/2 多路复用、流式传输和双向通信。Go 是 gRPC 的一等公民——
          protoc 生成强类型代码，拦截器实现认证/日志/限流等横切关注点。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🐹 gRPC 深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📋 Protocol Buffers</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#00add8'}}></span> user.proto</div>
                <pre className="fs-code">{`// ═══ Proto3 定义 ═══
syntax = "proto3";

package user.v1;

option go_package = "github.com/myapp/gen/user/v1;userv1";

// ═══ 消息定义 ═══
message User {
  int64 id = 1;           // 字段编号 (不是值!)
  string name = 2;
  string email = 3;
  UserRole role = 4;
  repeated string tags = 5;       // 数组
  optional string bio = 6;        // 可选字段
  google.protobuf.Timestamp created_at = 7;
  map<string, string> metadata = 8;  // Map
}

enum UserRole {
  USER_ROLE_UNSPECIFIED = 0;  // 必须有 0 值
  USER_ROLE_ADMIN = 1;
  USER_ROLE_MEMBER = 2;
}

// 嵌套消息
message Address {
  string street = 1;
  string city = 2;
}

// ═══ 服务定义 ═══
service UserService {
  // 一元 RPC (Unary)
  rpc GetUser(GetUserRequest) returns (GetUserResponse);
  rpc CreateUser(CreateUserRequest) returns (User);
  
  // 服务端流 (Server Streaming)
  rpc ListUsers(ListUsersRequest) returns (stream User);
  
  // 客户端流 (Client Streaming)
  rpc BatchCreateUsers(stream CreateUserRequest) returns (BatchResult);
  
  // 双向流 (Bidirectional Streaming)
  rpc Chat(stream ChatMessage) returns (stream ChatMessage);
}

message GetUserRequest { int64 id = 1; }
message GetUserResponse { User user = 1; }
message ListUsersRequest {
  int32 page_size = 1;
  string page_token = 2;
}

// ═══ Protobuf 编码 ═══
// 字段编号 1-15: 1 字节编码 (常用字段!)
// 字段编号 16-2047: 2 字节编码
// → 高频字段分配 1-15, 低频字段分配 16+
//
// 向后兼容规则:
// → 不要改变已有字段的编号!
// → 新增可选字段用新编号
// → 删除字段用 reserved 标记
// → 不要改变字段类型
// reserved 2, 15, 9 to 11;
// reserved "old_field";

// ═══ 代码生成 ═══
// protoc --go_out=. --go_opt=paths=source_relative \\
//        --go-grpc_out=. --go-grpc_opt=paths=source_relative \\
//        proto/user.proto
//
// 或使用 buf:
// buf generate  (推荐! 管理依赖更方便)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔄 gRPC 四种模式</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> grpc_server.go</div>
                <pre className="fs-code">{`package main

import (
    "context"
    "net"
    "google.golang.org/grpc"
    pb "github.com/myapp/gen/user/v1"
)

// ═══ 服务端实现 ═══
type userServer struct {
    pb.UnimplementedUserServiceServer  // 嵌入以实现向前兼容
    repo UserRepository
}

// 1. 一元 RPC (Unary)
func (s *userServer) GetUser(
    ctx context.Context,
    req *pb.GetUserRequest,
) (*pb.GetUserResponse, error) {
    user, err := s.repo.FindByID(ctx, req.Id)
    if err != nil {
        return nil, status.Errorf(codes.NotFound, "user %d not found", req.Id)
    }
    return &pb.GetUserResponse{User: toProto(user)}, nil
}

// 2. 服务端流 (Server Streaming)
func (s *userServer) ListUsers(
    req *pb.ListUsersRequest,
    stream pb.UserService_ListUsersServer,
) error {
    users, err := s.repo.ListAll(stream.Context())
    if err != nil {
        return status.Error(codes.Internal, err.Error())
    }
    
    for _, user := range users {
        if err := stream.Send(toProto(&user)); err != nil {
            return err
        }
    }
    return nil
}

// 3. 客户端流 (Client Streaming)
func (s *userServer) BatchCreateUsers(
    stream pb.UserService_BatchCreateUsersServer,
) error {
    var count int32
    for {
        req, err := stream.Recv()
        if err == io.EOF {
            return stream.SendAndClose(&pb.BatchResult{Count: count})
        }
        if err != nil { return err }
        
        s.repo.Create(stream.Context(), fromProto(req))
        count++
    }
}

// 4. 双向流 (Bidirectional Streaming)
func (s *userServer) Chat(
    stream pb.UserService_ChatServer,
) error {
    for {
        msg, err := stream.Recv()
        if err == io.EOF { return nil }
        if err != nil { return err }
        
        reply := &pb.ChatMessage{
            Content: "Echo: " + msg.Content,
        }
        if err := stream.Send(reply); err != nil {
            return err
        }
    }
}

// ═══ 启动服务器 ═══
func main() {
    lis, _ := net.Listen("tcp", ":50051")
    
    server := grpc.NewServer()
    pb.RegisterUserServiceServer(server, &userServer{})
    
    // 启用反射 (grpcurl/grpcui 调试用)
    reflection.Register(server)
    
    log.Printf("gRPC server on :50051")
    server.Serve(lis)
}

// ═══ 客户端使用 ═══
func client() {
    conn, _ := grpc.Dial("localhost:50051",
        grpc.WithTransportCredentials(insecure.NewCredentials()),
    )
    defer conn.Close()
    
    client := pb.NewUserServiceClient(conn)
    
    // 一元调用
    resp, err := client.GetUser(context.Background(),
        &pb.GetUserRequest{Id: 1},
    )
}`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🔌 拦截器与元数据</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#06b6d4'}}></span> interceptor.go</div>
                <pre className="fs-code">{`package main

import (
    "google.golang.org/grpc"
    "google.golang.org/grpc/metadata"
)

// ═══ 一元拦截器 (中间件) ═══

// 服务端日志拦截器
func loggingInterceptor(
    ctx context.Context,
    req any,
    info *grpc.UnaryServerInfo,
    handler grpc.UnaryHandler,
) (any, error) {
    start := time.Now()
    
    // 调用实际处理函数
    resp, err := handler(ctx, req)
    
    duration := time.Since(start)
    log.Printf("gRPC %s | %v | %v", info.FullMethod, duration, err)
    
    return resp, err
}

// 认证拦截器
func authInterceptor(
    ctx context.Context,
    req any,
    info *grpc.UnaryServerInfo,
    handler grpc.UnaryHandler,
) (any, error) {
    // 从元数据中提取 token
    md, ok := metadata.FromIncomingContext(ctx)
    if !ok {
        return nil, status.Error(codes.Unauthenticated, "no metadata")
    }
    
    tokens := md.Get("authorization")
    if len(tokens) == 0 {
        return nil, status.Error(codes.Unauthenticated, "no token")
    }
    
    // 验证 token
    userID, err := validateToken(tokens[0])
    if err != nil {
        return nil, status.Error(codes.Unauthenticated, "invalid token")
    }
    
    // 将 userID 注入 context
    ctx = context.WithValue(ctx, "user_id", userID)
    return handler(ctx, req)
}

// ═══ 注册拦截器 ═══
func setupServer() *grpc.Server {
    return grpc.NewServer(
        grpc.ChainUnaryInterceptor(
            loggingInterceptor,
            authInterceptor,
            recoveryInterceptor,
        ),
        grpc.ChainStreamInterceptor(
            streamLoggingInterceptor,
        ),
    )
}

// ═══ 客户端拦截器 ═══
func setupClient() *grpc.ClientConn {
    conn, _ := grpc.Dial("localhost:50051",
        grpc.WithUnaryInterceptor(func(
            ctx context.Context,
            method string,
            req, reply any,
            cc *grpc.ClientConn,
            invoker grpc.UnaryInvoker,
            opts ...grpc.CallOption,
        ) error {
            // 自动注入 token
            ctx = metadata.AppendToOutgoingContext(ctx,
                "authorization", "Bearer "+getToken(),
            )
            return invoker(ctx, method, req, reply, cc, opts...)
        }),
    )
    return conn
}

// ═══ 元数据 (Metadata) ═══
// 类似 HTTP Header, Key-Value Pair
func metadataDemo(ctx context.Context) {
    // 客户端发送
    md := metadata.New(map[string]string{
        "x-request-id": "abc123",
        "authorization": "Bearer token",
    })
    ctx = metadata.NewOutgoingContext(ctx, md)
    
    // 服务端接收
    md, _ = metadata.FromIncomingContext(ctx)
    reqID := md.Get("x-request-id")
    
    // 服务端发送响应头
    grpc.SendHeader(ctx, metadata.Pairs(
        "x-trace-id", "xyz789",
    ))
}

// ═══ 错误处理 ═══
// gRPC 状态码:
// codes.OK             — 成功
// codes.NotFound       — 未找到 (HTTP 404)
// codes.InvalidArgument — 参数错误 (HTTP 400)
// codes.PermissionDenied — 权限不足 (HTTP 403)
// codes.Unauthenticated — 未认证 (HTTP 401)
// codes.Internal       — 内部错误 (HTTP 500)
// codes.Unavailable    — 服务不可用 (HTTP 503)
// codes.DeadlineExceeded — 超时 (HTTP 504)

// 带详细信息的错误:
// st := status.New(codes.InvalidArgument, "invalid email")
// st, _ = st.WithDetails(&errdetails.BadRequest{
//     FieldViolations: []*errdetails.BadRequest_FieldViolation{{
//         Field: "email", Description: "invalid format",
//     }},
// })
// return nil, st.Err()`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🏗️ 服务治理</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> service_mesh.go</div>
                <pre className="fs-code">{`// ═══ gRPC 健康检查 ═══
// google.golang.org/grpc/health/grpc_health_v1
import "google.golang.org/grpc/health"

func setupHealthCheck(server *grpc.Server) {
    healthServer := health.NewServer()
    grpc_health_v1.RegisterHealthServer(server, healthServer)
    
    // 设置服务状态
    healthServer.SetServingStatus("user.v1.UserService",
        grpc_health_v1.HealthCheckResponse_SERVING)
}

// K8s 探针配置:
// livenessProbe:
//   grpc:
//     port: 50051
// readinessProbe:
//   grpc:
//     port: 50051

// ═══ 负载均衡 ═══
// gRPC 客户端内置负载均衡:
// conn, _ := grpc.Dial(
//     "dns:///user-service.default.svc.cluster.local:50051",
//     grpc.WithDefaultServiceConfig(\`{
//         "loadBalancingConfig": [{"round_robin":{}}]
//     }\`),
// )
//
// 策略:
// → pick_first: 默认, 只用第一个地址
// → round_robin: 轮询
// → 自定义: 实现 balancer.Builder

// ═══ 重试策略 ═══
// 客户端配置:
// grpc.WithDefaultServiceConfig(\`{
//     "methodConfig": [{
//         "name": [{"service": "user.v1.UserService"}],
//         "retryPolicy": {
//             "maxAttempts": 3,
//             "initialBackoff": "0.1s",
//             "maxBackoff": "1s",
//             "backoffMultiplier": 2,
//             "retryableStatusCodes": ["UNAVAILABLE", "DEADLINE_EXCEEDED"]
//         }
//     }]
// }\`)

// ═══ gRPC-Gateway — REST → gRPC 转换 ═══
// 在 proto 中添加 HTTP 注解:
// import "google/api/annotations.proto";
//
// service UserService {
//   rpc GetUser(GetUserRequest) returns (User) {
//     option (google.api.http) = {
//       get: "/v1/users/{id}"
//     };
//   }
//   rpc CreateUser(CreateUserRequest) returns (User) {
//     option (google.api.http) = {
//       post: "/v1/users"
//       body: "*"
//     };
//   }
// }
//
// → 自动生成 REST 代理!
// → 客户端可以用 curl 调用

// ═══ 连接管理 ═══
// gRPC 使用 HTTP/2:
// → 单连接多路复用 (multiplexing)
// → 一个连接可以并行发送多个 RPC
// → 自动 keep-alive 和重连
//
// 连接池配置:
// grpc.WithKeepaliveParams(keepalive.ClientParameters{
//     Time:                10 * time.Second,  // ping 间隔
//     Timeout:             3 * time.Second,   // ping 超时
//     PermitWithoutStream: true,
// })

// ═══ 可观测性 ═══
// OpenTelemetry 集成:
// import "go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc"
//
// server := grpc.NewServer(
//     grpc.StatsHandler(otelgrpc.NewServerHandler()),
// )
//
// → 自动追踪每个 RPC 调用
// → 自动记录延迟、错误率指标
// → 与 Jaeger/Prometheus 集成`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
