import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['database/sql', 'GORM', 'Redis 缓存', 'MongoDB'];

export default function LessonGoDatabase() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">🐹 module_07 — 数据库与缓存</div>
      <div className="fs-hero">
        <h1>数据库与缓存：GORM / sqlx / Redis / MongoDB</h1>
        <p>
          Go 的 <code>database/sql</code> 提供了统一的关系型数据库抽象，
          配合 GORM (ORM) 或 sqlx (SQL-first) 可以高效操作 PostgreSQL/MySQL。
          Redis 作为缓存层提供亚毫秒级响应，MongoDB 适合灵活文档存储。
          本模块从连接池管理到事务隔离级别，覆盖生产级数据库操作的全部要点。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🐹 数据库深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🗃️ database/sql 与 sqlx</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#00add8'}}></span> database.go</div>
                <pre className="fs-code">{`package main

import (
    "context"
    "database/sql"
    "time"
    _ "github.com/lib/pq"              // PostgreSQL 驱动
    "github.com/jmoiron/sqlx"          // sqlx 扩展
)

// ═══ 标准库 database/sql ═══
func setupDB() (*sql.DB, error) {
    db, err := sql.Open("postgres",
        "host=localhost port=5432 user=app dbname=mydb sslmode=disable")
    if err != nil {
        return nil, err
    }
    
    // 连接池配置 (生产必须!)
    db.SetMaxOpenConns(25)           // 最大打开连接
    db.SetMaxIdleConns(10)           // 最大空闲连接
    db.SetConnMaxLifetime(5 * time.Minute)  // 连接最大存活时间
    db.SetConnMaxIdleTime(1 * time.Minute)  // 空闲最大时间
    
    // 验证连接
    if err := db.PingContext(context.Background()); err != nil {
        return nil, err
    }
    return db, nil
}

// ═══ CRUD 操作 ═══
type User struct {
    ID    int64  \`db:"id"\`
    Name  string \`db:"name"\`
    Email string \`db:"email"\`
}

// 查询单行
func getUser(db *sql.DB, id int64) (*User, error) {
    var u User
    err := db.QueryRowContext(context.Background(),
        "SELECT id, name, email FROM users WHERE id = $1", id,
    ).Scan(&u.ID, &u.Name, &u.Email)
    
    if err == sql.ErrNoRows {
        return nil, fmt.Errorf("user %d not found", id)
    }
    return &u, err
}

// 查询多行
func listUsers(db *sql.DB) ([]User, error) {
    rows, err := db.QueryContext(context.Background(),
        "SELECT id, name, email FROM users ORDER BY id LIMIT 100")
    if err != nil { return nil, err }
    defer rows.Close()  // 必须关闭!
    
    var users []User
    for rows.Next() {
        var u User
        if err := rows.Scan(&u.ID, &u.Name, &u.Email); err != nil {
            return nil, err
        }
        users = append(users, u)
    }
    return users, rows.Err()  // 检查迭代错误!
}

// ═══ sqlx — 更好的 API ═══
func sqlxDemo() {
    db := sqlx.MustConnect("postgres", dsn)
    
    // Get: 单行映射到结构体
    var user User
    db.GetContext(ctx, &user,
        "SELECT * FROM users WHERE id = $1", 1)
    
    // Select: 多行映射到切片
    var users []User
    db.SelectContext(ctx, &users,
        "SELECT * FROM users WHERE name LIKE $1", "%alice%")
    
    // NamedQuery: 命名参数
    rows, _ := db.NamedQueryContext(ctx,
        "SELECT * FROM users WHERE name = :name",
        map[string]any{"name": "Alice"})
    
    // In 查询
    query, args, _ := sqlx.In(
        "SELECT * FROM users WHERE id IN (?)", []int{1, 2, 3})
    query = db.Rebind(query)
    db.SelectContext(ctx, &users, query, args...)
}

// ═══ 事务 ═══
func transferMoney(db *sql.DB, from, to int64, amount float64) error {
    tx, err := db.BeginTx(context.Background(), &sql.TxOptions{
        Isolation: sql.LevelSerializable,  // 隔离级别
    })
    if err != nil { return err }
    
    // defer + recover 保证回滚
    defer func() {
        if p := recover(); p != nil {
            tx.Rollback()
            panic(p)
        }
    }()
    
    _, err = tx.Exec("UPDATE accounts SET balance = balance - $1 WHERE id = $2", amount, from)
    if err != nil {
        tx.Rollback()
        return err
    }
    
    _, err = tx.Exec("UPDATE accounts SET balance = balance + $1 WHERE id = $2", amount, to)
    if err != nil {
        tx.Rollback()
        return err
    }
    
    return tx.Commit()
}

// ═══ SQL 注入防护 ═══
// ✅ 参数化查询: db.Query("SELECT * FROM users WHERE id = $1", id)
// ❌ 字符串拼接: db.Query("SELECT * FROM users WHERE id = " + id)`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🏗️ GORM</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#8b5cf6'}}></span> gorm.go</div>
                <pre className="fs-code">{`package main

import (
    "gorm.io/gorm"
    "gorm.io/driver/postgres"
)

// ═══ GORM 模型定义 ═══
type User struct {
    gorm.Model           // ID, CreatedAt, UpdatedAt, DeletedAt
    Name     string      \`gorm:"size:100;not null;index"\`
    Email    string      \`gorm:"uniqueIndex;size:200"\`
    Age      int         \`gorm:"default:0"\`
    Profile  Profile     // Has One
    Orders   []Order     // Has Many
    Tags     []Tag       \`gorm:"many2many:user_tags"\`  // Many to Many
}

type Profile struct {
    ID     uint
    UserID uint
    Bio    string
    Avatar string
}

type Order struct {
    ID     uint
    UserID uint
    Amount float64
    Status string \`gorm:"type:varchar(20);default:'pending'"\`
}

// ═══ 初始化 ═══
func setupGORM() *gorm.DB {
    db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
        Logger: logger.Default.LogMode(logger.Info),
    })
    if err != nil { panic(err) }
    
    // 自动迁移
    db.AutoMigrate(&User{}, &Profile{}, &Order{})
    
    // 连接池 (底层用 database/sql)
    sqlDB, _ := db.DB()
    sqlDB.SetMaxOpenConns(25)
    sqlDB.SetMaxIdleConns(10)
    
    return db
}

// ═══ CRUD ═══
func gormCRUD(db *gorm.DB) {
    // 创建
    user := User{Name: "Alice", Email: "alice@go.dev", Age: 25}
    db.Create(&user)  // user.ID 自动填充
    
    // 批量创建
    users := []User{{Name: "Bob"}, {Name: "Carol"}}
    db.CreateInBatches(users, 100)  // 每批 100 条
    
    // 查询
    var u User
    db.First(&u, 1)                           // 主键查询
    db.Where("name = ?", "Alice").First(&u)   // 条件查询
    
    var all []User
    db.Where("age > ?", 18).
        Order("created_at desc").
        Limit(10).Offset(0).
        Find(&all)
    
    // 预加载关联
    db.Preload("Profile").Preload("Orders").Find(&u)
    
    // 更新
    db.Model(&u).Update("Name", "Alice Updated")
    db.Model(&u).Updates(map[string]any{
        "name": "Alice V2",
        "age":  26,
    })
    
    // 删除 (软删除: 设 DeletedAt)
    db.Delete(&u)
    // 永久删除
    db.Unscoped().Delete(&u)
}

// ═══ 高级查询 ═══
func advancedQueries(db *gorm.DB) {
    // Scopes: 可复用的查询条件
    func Paginate(page, size int) func(db *gorm.DB) *gorm.DB {
        return func(db *gorm.DB) *gorm.DB {
            offset := (page - 1) * size
            return db.Offset(offset).Limit(size)
        }
    }
    
    db.Scopes(Paginate(1, 20)).Find(&users)
    
    // 原生 SQL
    db.Raw("SELECT * FROM users WHERE age > ?", 18).Scan(&users)
    
    // 事务
    db.Transaction(func(tx *gorm.DB) error {
        if err := tx.Create(&order).Error; err != nil {
            return err  // 自动回滚
        }
        if err := tx.Model(&account).
            Update("balance", gorm.Expr("balance - ?", amount)).Error; err != nil {
            return err  // 自动回滚
        }
        return nil  // 自动提交
    })
}

// ═══ GORM vs sqlx 选择 ═══
// GORM: 适合 CRUD 密集、关联查询多的项目
//       → 快速开发, 自动迁移, 关联预加载
//       → 复杂查询时性能不如原生 SQL
//
// sqlx: 适合性能敏感、SQL 控制精细的项目
//       → SQL 直接写, 性能最优
//       → 无自动迁移, 需要手动管理 schema`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>⚡ Redis 缓存</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#ef4444'}}></span> redis.go</div>
                <pre className="fs-code">{`package main

import (
    "context"
    "time"
    "github.com/redis/go-redis/v9"
)

// ═══ Redis 客户端 ═══
func setupRedis() *redis.Client {
    rdb := redis.NewClient(&redis.Options{
        Addr:         "localhost:6379",
        Password:     "",
        DB:           0,
        PoolSize:     10,         // 连接池大小
        MinIdleConns: 3,          // 最小空闲连接
        DialTimeout:  5 * time.Second,
        ReadTimeout:  3 * time.Second,
        WriteTimeout: 3 * time.Second,
    })
    
    if err := rdb.Ping(context.Background()).Err(); err != nil {
        panic(err)
    }
    return rdb
}

// ═══ 基本操作 ═══
func redisBasics(rdb *redis.Client) {
    ctx := context.Background()
    
    // String
    rdb.Set(ctx, "key", "value", 10*time.Minute)  // 带过期时间
    val, err := rdb.Get(ctx, "key").Result()
    if err == redis.Nil {
        fmt.Println("key not found")
    }
    
    // Hash
    rdb.HSet(ctx, "user:1", map[string]any{
        "name": "Alice", "age": 25,
    })
    name, _ := rdb.HGet(ctx, "user:1", "name").Result()
    all, _ := rdb.HGetAll(ctx, "user:1").Result()
    
    // List
    rdb.LPush(ctx, "queue", "task1", "task2")
    task, _ := rdb.RPop(ctx, "queue").Result()
    
    // Set
    rdb.SAdd(ctx, "tags", "go", "redis", "cache")
    members, _ := rdb.SMembers(ctx, "tags").Result()
    
    // Sorted Set (排行榜)
    rdb.ZAdd(ctx, "leaderboard", redis.Z{Score: 100, Member: "Alice"})
    rdb.ZAdd(ctx, "leaderboard", redis.Z{Score: 85, Member: "Bob"})
    top, _ := rdb.ZRevRangeWithScores(ctx, "leaderboard", 0, 9).Result()
}

// ═══ 缓存模式 ═══

// Cache-Aside (旁路缓存): 最常用
func GetUser(ctx context.Context, rdb *redis.Client, db *gorm.DB, id int64) (*User, error) {
    key := fmt.Sprintf("user:%d", id)
    
    // 1. 查缓存
    data, err := rdb.Get(ctx, key).Bytes()
    if err == nil {
        var user User
        json.Unmarshal(data, &user)
        return &user, nil
    }
    
    // 2. 缓存未命中, 查数据库
    var user User
    if err := db.First(&user, id).Error; err != nil {
        return nil, err
    }
    
    // 3. 写入缓存 (带过期和随机抖动防缓存雪崩)
    ttl := 10*time.Minute + time.Duration(rand.Intn(60))*time.Second
    data, _ = json.Marshal(user)
    rdb.Set(ctx, key, data, ttl)
    
    return &user, nil
}

// ═══ 分布式锁 ═══
func acquireLock(rdb *redis.Client, key string, ttl time.Duration) (bool, error) {
    return rdb.SetNX(context.Background(), "lock:"+key, "1", ttl).Result()
}

func releaseLock(rdb *redis.Client, key string) {
    // Lua 脚本保证原子性
    script := redis.NewScript(\`
        if redis.call("get", KEYS[1]) == ARGV[1] then
            return redis.call("del", KEYS[1])
        else
            return 0
        end
    \`)
    script.Run(context.Background(), rdb, []string{"lock:" + key}, "1")
}

// ═══ Pipeline — 批量操作 ═══
func pipeline(rdb *redis.Client) {
    pipe := rdb.Pipeline()
    for i := 0; i < 100; i++ {
        pipe.Set(context.Background(), fmt.Sprintf("key:%d", i), i, 0)
    }
    pipe.Exec(context.Background())  // 一次网络往返!
}`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🍃 MongoDB</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#4db33d'}}></span> mongodb.go</div>
                <pre className="fs-code">{`package main

import (
    "context"
    "go.mongodb.org/mongo-driver/bson"
    "go.mongodb.org/mongo-driver/bson/primitive"
    "go.mongodb.org/mongo-driver/mongo"
    "go.mongodb.org/mongo-driver/mongo/options"
)

// ═══ 连接 MongoDB ═══
func setupMongo() *mongo.Client {
    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()
    
    client, _ := mongo.Connect(ctx, options.Client().
        ApplyURI("mongodb://localhost:27017").
        SetMaxPoolSize(50),
    )
    
    client.Ping(ctx, nil)
    return client
}

// ═══ 文档模型 ═══
type Article struct {
    ID        primitive.ObjectID \`bson:"_id,omitempty"\`
    Title     string             \`bson:"title"\`
    Content   string             \`bson:"content"\`
    Tags      []string           \`bson:"tags"\`
    Author    Author             \`bson:"author"\`  // 嵌入文档
    Views     int                \`bson:"views"\`
    CreatedAt time.Time          \`bson:"created_at"\`
}

type Author struct {
    Name  string \`bson:"name"\`
    Email string \`bson:"email"\`
}

// ═══ CRUD ═══
func mongoCRUD(client *mongo.Client) {
    coll := client.Database("mydb").Collection("articles")
    ctx := context.Background()
    
    // 插入
    article := Article{
        Title: "Go + MongoDB",
        Tags:  []string{"go", "mongodb"},
        Author: Author{Name: "Alice"},
        CreatedAt: time.Now(),
    }
    result, _ := coll.InsertOne(ctx, article)
    id := result.InsertedID.(primitive.ObjectID)
    
    // 查询
    var found Article
    coll.FindOne(ctx, bson.M{"_id": id}).Decode(&found)
    
    // 条件查询
    filter := bson.M{
        "tags": bson.M{"$in": []string{"go"}},
        "views": bson.M{"$gte": 100},
    }
    cursor, _ := coll.Find(ctx, filter, options.Find().
        SetSort(bson.D{{"created_at", -1}}).
        SetLimit(10),
    )
    
    var articles []Article
    cursor.All(ctx, &articles)
    
    // 更新
    coll.UpdateOne(ctx,
        bson.M{"_id": id},
        bson.M{"$inc": bson.M{"views": 1}},  // 原子自增
    )
    
    // 删除
    coll.DeleteOne(ctx, bson.M{"_id": id})
}

// ═══ 聚合管道 ═══
func aggregation(coll *mongo.Collection) {
    pipeline := mongo.Pipeline{
        // 筛选
        {{"$match", bson.M{"tags": "go"}}},
        // 分组
        {{"$group", bson.M{
            "_id":         "$author.name",
            "total_views": bson.M{"$sum": "$views"},
            "count":       bson.M{"$sum": 1},
        }}},
        // 排序
        {{"$sort", bson.M{"total_views": -1}}},
        // 限制
        {{"$limit", 10}},
    }
    
    cursor, _ := coll.Aggregate(context.Background(), pipeline)
    var results []bson.M
    cursor.All(context.Background(), &results)
}

// ═══ 索引管理 ═══
func createIndexes(coll *mongo.Collection) {
    coll.Indexes().CreateMany(context.Background(), []mongo.IndexModel{
        {Keys: bson.D{{"email", 1}}, Options: options.Index().SetUnique(true)},
        {Keys: bson.D{{"tags", 1}}},
        {Keys: bson.D{{"created_at", -1}}},
        // 文本索引
        {Keys: bson.D{{"title", "text"}, {"content", "text"}}},
        // TTL 索引: 自动过期
        {Keys: bson.D{{"expire_at", 1}},
         Options: options.Index().SetExpireAfterSeconds(0)},
    })
}

// ═══ 数据库选型建议 ═══
// PostgreSQL: 复杂查询/事务/关系数据 (默认选择)
// MySQL:      Web 应用/读多写少/成熟生态
// Redis:      缓存/session/排行榜/分布式锁
// MongoDB:    灵活 schema/嵌入文档/日志/内容管理`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
