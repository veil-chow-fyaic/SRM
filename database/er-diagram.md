# SRM 数据库 ER 图说明

## 实体关系概览

```
┌─────────────────────┐
│     suppliers       │
│  ─────────────────  │
│  id (PK)           │
│  code (UK)         │
│  name              │
│  tier              │
│  status            │
│  stage             │
│  system_score      │
│  ...               │
└─────────┬───────────┘
          │
          ├── 1:N ──┬──────────────────────┐
          │         │                      │
          ▼         ▼                      ▼
    ┌──────────┐  ┌──────────────────┐  ┌──────────────┐
    │ business_ │  │  decision_chain  │  │ engagement_  │
    │  lines   │  │  ──────────────  │  │   logs      │
    └──────────┘  │  id (PK)         │  └──────────────┘
                  │  supplier_id (FK)│
                  │  name             │
                  │  layer            │
                  │  role             │
                  │  affinity 1-5     │
                  └─────┬──────────────┘
                        │
                        └── 1:N ──┬────────────────┐
                                  │                │
                                  ▼                ▼
                          ┌──────────────┐  ┌──────────┐
                          │ decision_    │  │ perfor-  │
                          │ chain_       │  │ mance_  │
                          │ resources    │  │ history │
                          └──────────────┘  └──────────┘
```

## 表关系详解

### 核心关系
1. **suppliers** ← 1:N → **business_lines**: 一个供应商有多条业务线
2. **suppliers** ← 1:N → **decision_chain**: 一个供应商有多个决策链成员
3. **suppliers** ← 1:N → **engagement_logs**: 一个供应商有多次互动记录
4. **suppliers** ← 1:N → **performance_history**: 一个供应商有多条绩效记录
5. **suppliers** ← 1:N → **tasks**: 供应商可能关联多个任务
6. **suppliers** ← 1:N → **risk_alerts**: 供应商可能有多个风险预警

### 次级关系
1. **business_lines** ← 1:N → **business_line_contacts**: 每条业务线有多个联系人
2. **decision_chain** ← 1:N → **decision_chain_resources**: 每个决策链成员关联多个资源

### 关联关系（可选）
1. **suppliers** ← 1:N → **probation_tasks**: 考察期任务
2. **suppliers** ← 1:N → **calendar_events**: 日历事件
3. **suppliers** ← 1:N → **lifecycle_events**: 生命周期流转记录
4. **suppliers** ← 1:N → **audit_logs**: 操作审计（通过 record_id 关联）

## 关键设计决策

### 1. 决策链与资源分离
- `decision_chain` 存储人员信息
- `decision_chain_resources` 存储人员关联的资源
- 支持"经营人就是经营资源"的设计理念

### 2. 双维日志维护
- `engagement_logs` 表包含 4 个维度字段：
  - `dimension_basic`: 基本信息变更
  - `dimension_business`: 主营业务特点
  - `dimension_decision`: 决策链特点
  - `dimension_derivative`: 衍生资源
- 实现设计哲学中的"双维动态维护"

### 3. 灵活的业务线设计
- `business_lines` 表使用 PostgreSQL 数组类型：
  - `carriers TEXT[]`: 承运人列表
  - `routes TEXT[]`: 航线列表
- 每条业务线可以有独立的联系人 (`business_line_contacts`)

### 4. 生命周期管理
- `suppliers.stage`: 生命周期阶段 (leads/probation/active/blacklist)
- `suppliers.tier`: 供应商等级 (strategic/core/backup/probation/blacklisted)
- `lifecycle_events`: 记录所有流转历史

### 5. 熔断保护
- `suppliers.scarce_resources TEXT[]`: 稀缺资源列表
- 在应用层检查：拉黑前判断是否有稀缺资源

### 6. 全文搜索
- 使用 `pg_trgm` 扩展创建索引
- 支持 `name` 和 `local_name` 的模糊搜索

## 数据完整性

### 外键约束
- 所有子表都有 `ON DELETE CASCADE` 或 `ON DELETE SET NULL`
- 确保数据一致性

### 检查约束
- `tier`: 只能是预定义的 5 个值
- `status`: active/inactive/blacklisted
- `stage`: leads/probation/active/blacklist
- `affinity`: 1-5 之间
- `score`: 0-100 之间

### 唯一约束
- `suppliers.code`: 供应商代码唯一
- `performance_dimensions(supplier_id, dimension_id)`: 每个供应商的评估维度唯一

## 性能优化

### 索引策略
1. **高频查询字段**: tier, status, stage
2. **外键字段**: 所有 supplier_id
3. **日期字段**: planned_date, evaluation_date, due_date, event_date
4. **全文搜索**: name, local_name (使用 gin 索引)

### 视图
- `supplier_summary`: 供应商汇总视图
- 预聚合常用数据，减少 JOIN

## RLS 策略（待实现）
- 根据多租户需求设计
- 用户只能看到自己有权限的供应商
- 审计日志只对管理员可见
