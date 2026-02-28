# 部署策略与迁移指南

> 云端 vs 私有化部署对比、MCP 生态分析、迁移策略

## 部署决策概览

```mermaid
mindmap
  root((Supabase<br/>部署决策))
    开发阶段
      使用云端版本
      托管 MCP
      完整功能体验
      快速迭代
    生产环境
      评估合规要求
      评估成本预算
      评估技术能力
      选择部署方式
    工具选择
      Skills 最佳实践
      云端用托管 MCP
      私有化用 PostgreSQL MCP
      混合使用多个 MCP
```

---

## 1. Skills vs MCP 深度对比

### 1.1 本质区别

```mermaid
graph TB
    subgraph Skills["Agent Skills"]
        direction TB
        S1["静态知识库"]
        S2["提供最佳实践"]
        S3["无需连接"]
        S4["手动更新"]
    end

    subgraph MCP["MCP Servers"]
        direction TB
        M1["动态执行器"]
        M2["实际执行操作"]
        M3["需要连接服务"]
        M4["自动/手动更新"]
    end

    Skills --> S5["✅ 云端/私有化通用"]
    MCP --> M5["⚠️ 部分支持私有化"]

    style Skills fill:#3ecf8e
    style MCP fill:#f4cf4e
```

### 1.2 功能对比

| 维度 | Agent Skills | MCP Servers |
|------|-------------|-------------|
| **性质** | 静态知识库 | 动态执行器 |
| **能力** | 提供建议和指导 | 实际执行操作 |
| **依赖** | 无 | 需要连接服务 |
| **更新** | 手动更新 | 自动/手动更新 |
| **私有化支持** | ✅ 完全支持 | ⚠️ 部分支持 |
| **工具数量** | 规则文档 | 30+ 工具 |

### 1.3 Skills 适用场景

```mermaid
graph TD
    A[Supabase Skills] --> B{部署方式}
    B -->|云端| C[✅ 100% 适用]
    B -->|私有化| D[✅ 100% 适用]

    C --> E[提供最佳实践]
    D --> E

    E --> F[查询优化]
    E --> G[模式设计]
    E --> H[安全配置]
    E --> I[索引设计]
    E --> J[性能分析]

    style A fill:#3ecf8e
    style C fill:#3ecf8e
    style D fill:#3ecf8e
```

**Skills 核心价值**：
- ✅ SQL 查询优化
- ✅ 索引设计建议
- ✅ 模式设计审查
- ✅ RLS 策略指导
- ✅ 连接池配置
- ✅ 性能问题诊断

---

## 2. MCP 生态系统分析

### 2.1 MCP 架构全景

```mermaid
graph TB
    subgraph "AI 助手 (Claude Code)"
        A[用户输入]
    end

    subgraph "MCP 协议层"
        B[MCP Client]
    end

    subgraph "云端方案"
        C1[托管 MCP<br/>mcp.supabase.com]
        C2[Supabase Management API]
        C3[云端项目]
    end

    subgraph "私有化方案"
        P1[PostgREST MCP<br/>@supabase/mcp-server-postgrest]
        P2[PostgreSQL MCP<br/>@modelcontextprotocol/server-postgres]
        P3[私有化数据库]
    end

    A --> B
    B --> C1
    B --> P1
    B --> P2

    C1 --> C2
    C2 --> C3

    P1 --> P3
    P2 --> P3

    style C1 fill:#3ecf8e
    style P1 fill:#f4cf4e
    style P2 fill:#f4cf4e
```

### 2.2 MCP 服务器对比

#### 官方托管 MCP

```json
{
  "name": "Supabase 托管 MCP",
  "url": "https://mcp.supabase.com/mcp",
  "transport": "HTTP (Streamable)",
  "auth": "OAuth 浏览器登录"
}
```

**功能模块**：

| 功能组 | 工具 | 说明 |
|--------|------|------|
| **Database** | list_tables, execute_sql, apply_migration | 数据库管理 |
| **Debugging** | get_logs, get_advisors | 日志和性能 |
| **Development** | generate_typescript_types, get_project_url | 开发工具 |
| **Edge Functions** | list_functions, deploy_function | 函数部署 |
| **Docs** | search_docs | 文档搜索 |
| **Branching** | create_branch, merge_branch | 分支管理 |
| **Account** | list_projects, create_project | 项目管理 |
| **Storage** | list_buckets, update_config | 存储管理 |

**工具数量**：8 大功能组，30+ 工具

#### PostgREST MCP

```json
{
  "name": "@supabase/mcp-server-postgrest",
  "version": "0.1.0",
  "transport": "STDIO",
  "auth": "API Key"
}
```

**工具列表**：
- `postgrestRequest` - 执行 CRUD 操作
- `sqlToRest` - SQL 转 PostgREST 语法

**功能限制**：
- ❌ 无法执行原生 SQL
- ❌ 无法创建表
- ❌ 无法部署函数
- ❌ 无法查看日志

#### PostgreSQL MCP

```json
{
  "name": "@modelcontextprotocol/server-postgres",
  "transport": "STDIO",
  "auth": "连接字符串"
}
```

**工具列表**：
- `query` - 执行 SQL 查询
- `listTables` - 列出表
- `describeTable` - 描述表结构

### 2.3 MCP 支持性矩阵

| 功能/特性 | 托管 MCP | PostgREST MCP | PostgreSQL MCP |
|----------|:---------:|:-------------:|:--------------:|
| **部署要求** | 云端 Supabase | 任何 PostgREST | 任何 PostgreSQL |
| **私有化支持** | ❌ | ✅ | ✅ |
| **执行 SQL** | ✅ | ❌ | ✅ |
| **创建表** | ✅ | ❌ | ✅ |
| **CRUD 操作** | ✅ | ✅ | ✅ |
| **迁移管理** | ✅ | ❌ | ⚠️ 手动 |
| **Edge Functions** | ✅ | ❌ | ❌ |
| **日志查看** | ✅ | ❌ | ❌ |
| **性能建议** | ✅ | ❌ | ❌ |
| **分支管理** | ✅ | ❌ | ❌ |
| **文档搜索** | ✅ | ❌ | ❌ |

### 2.4 选择决策树

```mermaid
graph TD
    A[选择 MCP 服务器] --> B{部署方式}

    B -->|云端| C[托管 MCP<br/>mcp.supabase.com]
    B -->|私有化| D{需求类型}

    D -->|仅需数据 CRUD| E[PostgREST MCP]
    D -->|需要数据库管理| F[PostgreSQL MCP]
    D -->|完整功能| G[混合方案]

    C --> H[✅ 30+ 工具]
    E --> I[⚠️ 2 工具]
    F --> J[✅ 基础 SQL 工具]
    G --> K[✅ 多 MCP 组合]

    style C fill:#3ecf8e
    style G fill:#3ecf8e
    style E fill:#f4cf4e
    style F fill:#f4cf4e
```

---

## 3. 云端 vs 私有化功能差异

### 3.1 功能差异全景图

```mermaid
graph TB
    subgraph "云端独占功能"
        A1[Database Branching]
        A2[Global Edge Functions]
        A3[Supabase AI]
        A4[Dashboard 管理]
        A5[自动备份/PITR]
        A6[内置监控日志]
    end

    subgraph "私有化适配功能"
        B1[Edge Functions Beta]
        B2[手动备份]
        B3[自建监控]
        B4[手动 SSL]
    end

    subgraph "完全支持功能"
        C1[PostgreSQL 核心]
        C2[RLS 策略]
        C3[PostgREST API]
        C4[Storage 基础]
        C5[Realtime 基础]
    end

    A1 --> D[❌ 需替代方案]
    A2 --> D
    A3 --> D
    A4 --> D
    A5 --> D
    A6 --> D

    B1 --> E[⚠️ 需适配]
    B2 --> E
    B3 --> E
    B4 --> E

    C1 --> F[✅ 直接迁移]
    C2 --> F
    C3 --> F
    C4 --> F
    C5 --> F

    style A1 fill:#ff6b6b
    style B1 fill:#f4cf4e
    style C1 fill:#3ecf8e
```

### 3.2 详细对比表

| 分类 | 功能 | 云端 | 私有化 | 迁移影响 |
|------|------|:----:|:------:|:--------:|
| **数据库** | PostgreSQL | ✅ | ✅ | 无 |
| | Database Branching | ✅ | ❌ | **高** |
| | 自动备份 | ✅ | ⚠️ | **高** |
| | PITR | ✅ | ⚠️ | **高** |
| **计算** | Edge Functions | ✅ 全球 | ⚠️ 本地 | 中 |
| | 自动扩展 | ✅ | ❌ | 中 |
| **管理** | Dashboard | ✅ | ❌ | **高** |
| | 日志聚合 | ✅ | ❌ | **高** |
| | 性能监控 | ✅ | ❌ | **高** |
| **安全** | 自动 SSL | ✅ | ⚠️ | 低 |
| | DDoS 防护 | ✅ | ❌ | 中 |
| **AI** | Supabase AI | ✅ | ❌ | 中 |

### 3.3 风险评估

| 风险类别 | 云端 | 私有化 | 缓解措施 |
|---------|:----:|:------:|---------|
| **功能缺失** | 低 | 高 | 提前规划替代方案 |
| **运维成本** | 低 | 高 | 自动化运维工具 |
| **数据安全** | 中 | 低（可控） | 加密、访问控制 |
| **扩展性** | 高 | 中 | 负载均衡、读写分离 |
| **升级维护** | 自动 | 手动 | 版本管理策略 |

---

## 4. 迁移策略

### 4.1 推荐迁移路径

```mermaid
timeline
    title Supabase 云端到私有化迁移路径
    section 阶段1: 云端开发
        使用 Branching 快速迭代 : 利用 Dashboard 管理
        : 积累迁移文件
        : 使用完整 MCP 功能
    section 阶段2: 准备私有化
        搭建监控系统 : Prometheus + Grafana
        : 配置备份方案
        : 测试迁移流程
    section 阶段3: 生产迁移
        数据迁移 : 应用适配
        : 灰度上线
        : 性能验证
    section 阶段4: 运维优化
        性能调优 : 安全加固
        : 成本优化
        : 持续监控
```

### 4.2 技术准备清单

#### 云端开发阶段

```yaml
推荐使用:
  开发工具:
    - Database Branching: 快速迭代
    - Dashboard: 可视化管理
    - 托管 MCP: 完整功能

  编码规范:
    - ✅ 使用迁移文件
    - ✅ 避免硬编码云端特性
    - ✅ 提供命令行工具
    - ❌ 避免依赖 Dashboard
    - ❌ 避免依赖 Branching API
```

#### 私有化准备

```yaml
必须准备:
  备份方案:
    - pg_dump 定期脚本
    - WAL 归档配置
    - 异地备份存储

  监控方案:
    - Prometheus 指标收集
    - Grafana 可视化
    - 告警规则配置

  安全方案:
    - SSL 证书 (Let's Encrypt)
    - 防火墙规则
    - 访问控制
```

### 4.3 代码适配示例

#### ❌ 不推荐（云端依赖）

```typescript
// 直接使用 Branching API
const branch = await supabase.branches.create({
  name: 'feature-new-auth'
});

// 依赖 Dashboard 配置
// 需要手动在界面创建表
```

#### ✅ 推荐（可移植）

```sql
-- migrations/001_create_users.sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX users_email_idx ON users(email);
```

```typescript
// 使用迁移工具
async function migrate() {
  await exec('psql -f migrations/001_create_users.sql');
}
```

---

## 5. 混合部署配置方案

### 5.1 推荐的 MCP 配置

```json
{
  "mcpServers": {
    "supabase-cloud": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=YOUR_PROJECT_REF&read_only=false&features=database,debugging,development,docs,functions",
      "purpose": "云端项目完整管理"
    },
    "postgres-private": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://user:pass@private-host:5432/dbname"
      ],
      "purpose": "私有化数据库管理"
    },
    "postgrest-private": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-postgrest@latest",
        "--apiUrl",
        "http://private-host:PORT/rest/v1",
        "--apiKey",
        "your-service-role-key",
        "--schema",
        "public"
      ],
      "purpose": "私有化应用数据 CRUD"
    }
  }
}
```

### 5.2 使用场景映射

```mermaid
graph TD
    A[任务需求] --> B{环境选择}

    B -->|开发阶段| C[supabase-cloud MCP]
    B -->|生产运维| D{任务类型}

    C --> E[表结构创建]
    C --> F[Edge Functions 部署]
    C --> G[数据库分支管理]

    D -->|数据查询| H[postgrest-private]
    D -->|数据库维护| I[postgres-private]

    E --> J[完整功能支持]
    F --> J
    G --> J

    H --> K[高效 CRUD]
    I --> L[直接 SQL 操作]

    style C fill:#3ecf8e
    style H fill:#f4cf4e
    style I fill:#f4cf4e
```

### 5.3 配置优势分析

| MCP 服务器 | 主要优势 | 适用场景 | 工具数量 |
|-----------|---------|---------|:--------:|
| **supabase-cloud** | 完整功能、OAuth 认证 | 开发、测试、复杂运维 | 30+ |
| **postgres-private** | 直接 SQL、通用性强 | 数据库维护、性能优化 | 10+ |
| **postgrest-private** | 轻量级、API 兼容 | 应用数据 CRUD | 2 |

---

## 6. 最终建议

### 6.1 开发阶段

```
✅ 使用 Supabase 云端
✅ 利用 Branching 快速迭代
✅ 使用 Dashboard 可视化
✅ 使用托管 MCP 完整功能
✅ 安装 Skills 获取最佳实践
```

### 6.2 生产环境

```
如果满足以下条件，选择私有化：
- ✅ 有合规要求（数据驻留）
- ✅ 有技术团队维护
- ✅ 成本敏感
- ✅ 需要深度定制

否则，推荐：
- ✅ 继续使用云端
- ✅ 利用托管服务优势
- ✅ 专注业务开发
```

### 6.3 行动路线图

```mermaid
graph LR
    A[当前状态] --> B[短期行动]
    B --> C[中期规划]
    C --> D[长期目标]

    B --> B1[✅ 使用云端开发]
    B --> B2[✅ 安装 Skills]
    B --> B3[✅ 配置托管 MCP]

    C --> C1[⚠️ 建立迁移流程]
    C --> C2[⚠️ 积累迁移文件]
    C --> C3[⚠️ 搭建私有化环境]

    D --> D1[🎯 生产环境私有化]
    D --> D2[🎯 完整监控体系]
    D --> D3[🎯 自动化运维]

    style B1 fill:#3ecf8e
    style B2 fill:#3ecf8e
    style B3 fill:#3ecf8e
    style C1 fill:#f4cf4e
    style C2 fill:#f4cf4e
    style C3 fill:#f4cf4e
    style D1 fill:#6366f1
    style D2 fill:#6366f1
    style D3 fill:#6366f1
```

---

## 常见问题

### Q: Skills 在私有化环境中能用吗？

**A**: ✅ 完全可用。Skills 内容是通用的 PostgreSQL 最佳实践，与部署方式无关。

### Q: 私有化能用托管 MCP 吗？

**A**: ❌ 不能。托管 MCP 只支持 Supabase 云端项目。私有化需要使用 PostgreSQL MCP 或 PostgREST MCP。

### Q: 如何在私有化环境中管理迁移？

**A**: 使用 Supabase CLI + 迁移文件：

```bash
# 生成迁移文件
supabase migration new create_users_table

# 应用到私有化数据库
psql -h private-host -U user -d dbname -f supabase/migrations/xxx_create_users_table.sql
```

### Q: 什么时候应该考虑私有化？

**A**: 当你有以下需求时：
- 数据必须存储在特定地区（合规要求）
- 需要完全控制基础设施
- 长期成本敏感（大规模使用）
- 需要深度定制数据库配置

---

> **相关文档**:
> - [02-SUPABASE-SETUP](./02-SUPABASE-SETUP.md) - MCP + Skills 配置
> - [03-DATABASE-DESIGN](./03-DATABASE-DESIGN.md) - 数据库设计
> - [08-TROUBLESHOOTING](./08-TROUBLESHOOTING.md) - 故障排除
