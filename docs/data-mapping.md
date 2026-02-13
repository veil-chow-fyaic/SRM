# 数据模型映射文档
<!--
  WHAT: 前端 mock 数据结构 → 后端数据库表结构映射
  WHY: 理解数据转换逻辑，确保前后端数据一致性
  WHEN: 2026-02-10
-->

## 概述

本文档详细说明前端 `mockData.ts` 中的数据模型与 Supabase 数据库表结构的映射关系。

---

## 核心映射表

### 1. suppliers 表（供应商主表）

| mockData.ts 字段 | database 字段 | 类型 | 转换说明 |
|------------------|---------------|------|----------|
| `id: string` | `id: uuid` | UUID | 字符串 → UUID，自动生成 |
| `code: string` | `code: varchar` | varchar | 直接映射 |
| `name: string` | `name: varchar` | varchar | 直接映射 |
| - | `local_name: varchar` | varchar | 新增字段（中文名） |
| - | `logo_text: varchar` | varchar | 新增字段（用于显示） |
| `tier: enum` | `tier: varchar` | varchar | 枚举 → 字符串 |
| `status: enum` | `status: varchar` | varchar | 枚举 → 字符串 |
| - | `stage: varchar` | varchar | 新增字段（生命周期） |
| - | `category: varchar` | varchar | 新增字段（分类） |
| - | `location: varchar` | varchar | 新增字段（位置） |
| `address?: string` | `address: text` | text | 可选 → 可为 null |
| - | `contact_phone: varchar` | varchar | 新增字段 |
| `website?: string` | `website: varchar` | varchar | 可选 → 可为 null |
| `structure?: string` | `structure: text` | text | 可选 → 可为 null |
| `financial.interval` | `financial_interval: varchar` | varchar | 嵌套对象扁平化 |
| `financial.anchor` | `financial_anchor: varchar` | varchar | 嵌套对象扁平化 |
| `financial.period` | `financial_period: int4` | integer | 嵌套对象扁平化 |
| `systemScore?: number` | `system_score: numeric` | numeric | 可选 → 可为 null |
| `performanceConfig?.evaluationPeriod` | `evaluation_period: varchar` | varchar | 嵌套对象扁平化 |
| `portalAccess.demandBroadcast` | `portal_demand_broadcast: boolean` | boolean | 嵌套对象扁平化 |
| `portalAccess.empowermentCenter` | `portal_empowerment_center: boolean` | boolean | 嵌套对象扁平化 |
| `portalAccess.ticketSystem` | `portal_ticket_system: boolean` | boolean | 嵌套对象扁平化 |
| `portalAccess.performanceView` | `portal_performance_view: boolean` | boolean | 嵌套对象扁平化 |
| `tags?: string[]` | `tags: text[]` | text[] | 直接映射（PostgreSQL 数组） |
| `scarceResources?: string[]` | `scarce_resources: text[]` | text[] | 重命名，数组类型 |

### 2. business_lines 表（业务线）

| mockData.ts 字段 | database 字段 | 类型 | 关系 |
|------------------|---------------|------|------|
| `businessLines[].type` | `type: varchar` | varchar | 一对多关系 |
| `businessLines[].description` | `description: text` | text | 可选 |
| `businessLines[].carriers[]` | `carriers: text[]` | text[] | PostgreSQL 数组 |
| `businessLines[].routes[]` | `routes: text[]` | text[] | PostgreSQL 数组 |
| - | `supplier_id: uuid` | uuid | 外键 → suppliers.id |
| - | `created_at: timestamptz` | timestamp | 自动生成 |

### 3. business_line_contacts 表（业务线联系人）

| mockData.ts 字段 | database 字段 | 类型 | 关系 |
|------------------|---------------|------|------|
| `businessLines[].contact.name` | `name: varchar` | varchar | 从 businessLines 分离 |
| `businessLines[].contact.title` | `title: varchar` | varchar | 可选 |
| `businessLines[].contact.phone` | `phone: varchar` | varchar | 可选 |
| `businessLines[].contact.email` | `email: varchar` | varchar | 可选 |
| - | `business_line_id: uuid` | uuid | 外键 → business_lines.id |
| - | `is_primary: boolean` | boolean | 是否主联系人 |

### 4. decision_chain 表（决策链）

| mockData.ts 字段 | database 字段 | 类型 | 说明 |
|------------------|---------------|------|------|
| `id: number` | `id: uuid` | uuid | number → UUID |
| `name: string` | `name: varchar` | varchar | 直接映射 |
| `title?: string` | `title: varchar` | varchar | 可选 |
| `layer: enum` | `layer: varchar` | varchar | Decision/Execution/Operation |
| `role: enum` | `role: varchar` | varchar | Decision Maker/Influencer/Executor |
| `affinity: number` | `affinity: int4` | integer | 1-5 亲密度 |
| `phone?: string` | `phone: varchar` | varchar | 可选 |
| `email?: string` | `email: varchar` | varchar | 可选 |
| `tags?: string[]` | `tags: text[]` | text[] | PostgreSQL 数组 |
| `conquestRecord?: string` | `conquest_record: text` | text | 重命名 |
| - | `supplier_id: uuid` | uuid | 外键 |

### 5. decision_chain_resources 表（决策链关联资源）

| mockData.ts 字段 | database 字段 | 类型 | 关系 |
|------------------|---------------|------|------|
| `resources[].id: string` | `id: uuid` | uuid | 自动生成 |
| `resources[].name: string` | `name: varchar` | varchar | 直接映射 |
| `resources[].type: enum` | `type: varchar` | varchar | Association/Person/Company/Official |
| `resources[].desc?: string` | `description: text` | text | 重命名 |
| - | `decision_chain_id: uuid` | uuid | 外键 → decision_chain.id |

### 6. engagement_logs 表（互动日志 - PACD 双维）

| mockData.ts 字段 | database 字段 | 类型 | 说明 |
|------------------|---------------|------|------|
| `id: number` | `id: uuid` | uuid | number → UUID |
| `status: enum` | `status: varchar` | varchar | planned/completed/cancelled |
| `type: enum` | `log_type: varchar` | varchar | QBR/Regular/Visit/Call/Email |
| - | `planned_date: date` | date | 新增字段 |
| `title: string` | `title: varchar` | varchar | 直接映射 |
| - | `goal: text` | text | P 阶段：目标 |
| `participants?: string` | `participants: text` | text | 参与人 |
| `rating?: number` | `rating: int4` | integer | 1-5 评分 |
| `outcome?: string` | `outcome: text` | text | A 阶段：成果 |
| `dimensions.basic` | `dimension_basic: text` | text | C 阶段：基本信息 |
| `dimensions.business` | `dimension_business: text` | text | C 阶段：业务特点 |
| `dimensions.decision` | `dimension_decision: text` | text | C 阶段：决策链特点 |
| `dimensions.derivative` | `dimension_derivative: text` | text | C 阶段：衍生资源 |
| `nextSteps?: string` | `next_steps: text` | text | D 阶段：下一步 |
| - | `action_remarks: text` | text | D 阶段：行动备注 |
| `tags?: string[]` | `tags: text[]` | text[] | PostgreSQL 数组 |
| - | `author_id: uuid` | uuid | 作者 ID |
| `author?: string` | `author_name: varchar` | varchar | 作者名称 |
| - | `supplier_id: uuid` | uuid | 外键 |

### 7. performance_history 表（绩效历史）

| mockData.ts 字段 | database 字段 | 类型 | 说明 |
|------------------|---------------|------|------|
| - | `id: uuid` | uuid | 自动生成 |
| `date: string` | `evaluation_date: date` | date | 重命名 |
| `period: string` | `period: varchar` | varchar | 如 "2023 Q4" |
| `score: number` | `score: numeric` | numeric | 0-100 |
| `rater?: string` | `rater_name: varchar` | varchar | 重命名 |
| - | `rater_id: uuid` | uuid | 评估人 ID |
| `comment?: string` | `comment: text` | text | 可选 |
| - | `supplier_id: uuid` | uuid | 外键 |

### 8. performance_dimensions 表（绩效配置维度）

| mockData.ts 字段 | database 字段 | 类型 | 说明 |
|------------------|---------------|------|------|
| `performanceConfig.dimensions[].id: string` | `dimension_id: varchar` | varchar | 重命名 |
| `performanceConfig.dimensions[].name: string` | `name: varchar` | varchar | 直接映射 |
| `performanceConfig.dimensions[].weight: number` | `weight: int4` | integer | 0-100 |
| - | `id: uuid` | uuid | 自动生成 |
| - | `supplier_id: uuid` | uuid | 外键 |

### 9. tasks 表（任务）

| mockData.ts 字段 | database 字段 | 类型 | 说明 |
|------------------|---------------|------|------|
| `id: number` | `id: uuid` | uuid | number → UUID |
| `title: string` | `title: varchar` | varchar | 直接映射 |
| - | `description: text` | text | 新增字段 |
| `type: enum` | `task_type: varchar` | varchar | Approval/Review/Doc/Follow-up/Personal |
| - | `priority: varchar` | varchar | High/Medium/Low |
| - | `supplier_id: uuid` | uuid | 外键（可选） |
| - | `target_tab: varchar` | varchar | 目标标签页 |
| - | `action_param: varchar` | varchar | 动作参数 |
| `status: enum` | `status: varchar` | varchar | pending/in_progress/completed/cancelled |
| `dueDate?: string` | `due_date: date` | date | 重命名 |
| - | `assignee_id: uuid` | uuid | 分配给谁 |
| `assignee?: string` | `assignee_name: varchar` | varchar | 分配人名称 |
| - | `source: varchar` | varchar | System/Personal |
| - | `created_at: timestamptz` | timestamp | 自动生成 |
| - | `updated_at: timestamptz` | timestamp | 自动更新 |
| - | `completed_at: timestamptz` | timestamp | 完成时间 |

### 10. calendar_events 表（日历事件）

| mockData.ts 字段 | database 字段 | 类型 | 说明 |
|------------------|---------------|------|------|
| - | `id: uuid` | uuid | 自动生成 |
| - | `title: varchar` | varchar | 事件标题 |
| - | `event_date: date` | date | 事件日期 |
| - | `event_type: varchar` | varchar | visit/meeting/call/task/other |
| - | `status: varchar` | varchar | planned/completed/cancelled |
| - | `supplier_id: uuid` | uuid | 外键（可选） |
| - | `notes: text` | text | 备注 |

### 11. risk_alerts 表（风险预警）

| mockData.ts 字段 | database 字段 | 类型 | 说明 |
|------------------|---------------|------|------|
| - | `id: uuid` | uuid | 自动生成 |
| - | `supplier_id: uuid` | uuid | 外键（可选） |
| - | `alert_type: varchar` | varchar | 预警类型 |
| - | `severity: varchar` | varchar | High/Medium/Low |
| - | `title: varchar` | varchar | 预警标题 |
| - | `description: text` | text | 描述 |
| - | `trigger_metric: varchar` | varchar | 触发指标 |
| - | `trigger_value: numeric` | numeric | 触发值 |
| - | `threshold_value: numeric` | numeric | 阈值 |
| - | `status: varchar` | varchar | active/resolved/ignored |

### 12. probation_tasks 表（考察任务）

| mockData.ts 字段 | database 字段 | 类型 | 说明 |
|------------------|---------------|------|------|
| - | `id: uuid` | uuid | 自动生成 |
| - | `supplier_id: uuid` | uuid | 外键 |
| - | `name: varchar` | varchar | 任务名称 |
| - | `description: text` | text | 描述 |
| - | `status: varchar` | varchar | pending/in_progress/completed/failed |
| - | `deadline: date` | date | 截止日期 |

### 13. system_settings 表（系统配置）

| mockData.ts 字段 | database 字段 | 类型 | 说明 |
|------------------|---------------|------|------|
| - | `id: uuid` | uuid | 自动生成 |
| - | `supplier_id: uuid` | uuid | 外键（可选，为 null 表示全局配置） |
| - | `setting_type: varchar` | varchar | 配置类型 |
| - | `setting_key: varchar` | varchar | 配置键 |
| - | `setting_value: text` | text | 配置值（JSON 字符串） |

### 14. lifecycle_events 表（生命周期事件）

| mockData.ts 字段 | database 字段 | 类型 | 说明 |
|------------------|---------------|------|------|
| - | `id: uuid` | uuid | 自动生成 |
| - | `supplier_id: uuid` | uuid | 外键 |
| - | `event_type: varchar` | varchar | 事件类型 |
| - | `from_stage: varchar` | varchar | 原阶段 |
| - | `to_stage: varchar` | varchar | 目标阶段 |
| - | `from_tier: varchar` | varchar | 原层级 |
| - | `to_tier: varchar` | varchar | 目标层级 |
| - | `reason: text` | text | 变更原因 |
| - | `changed_by: uuid` | uuid | 操作人 |

### 15. audit_logs 表（审计日志）

| mockData.ts 字段 | database 字段 | 类型 | 说明 |
|------------------|---------------|------|------|
| - | `id: uuid` | uuid | 自动生成 |
| - | `table_name: varchar` | varchar | 表名 |
| - | `record_id: uuid` | uuid | 记录 ID |
| - | `action: varchar` | varchar | INSERT/UPDATE/DELETE |
| - | `old_data: jsonb` | jsonb | 旧数据 |
| - | `new_data: jsonb` | jsonb | 新数据 |
| - | `changed_by: uuid` | uuid | 操作人 |
| - | `changed_at: timestamptz` | timestamp | 变更时间 |

---

## 枚举类型映射

### Supplier Tier（供应商层级）
```typescript
// mockData.ts
tier: 'strategic' | 'core' | 'backup' | 'probation' | 'blacklisted'

// database
tier: varchar CHECK (tier IN ('strategic', 'core', 'backup', 'probation', 'blacklisted'))
```

### Supplier Status（供应商状态）
```typescript
// mockData.ts
status: 'active' | 'inactive' | 'blacklisted'

// database
status: varchar CHECK (status IN ('active', 'inactive', 'blacklisted'))
```

### Financial Interval（账期）
```typescript
// mockData.ts
interval: 'monthly' | 'semi_monthly' | 'weekly' | 'per_shipment'

// database
financial_interval: varchar CHECK (financial_interval IN ('monthly', 'semi_monthly', 'weekly', 'per_shipment'))
```

### Financial Anchor（锚点）
```typescript
// mockData.ts
anchor: 'etd' | 'eta' | 'gate_in' | 'invoice_date'

// database
financial_anchor: varchar CHECK (financial_anchor IN ('etd', 'eta', 'gate_in', 'invoice_date'))
```

---

## 数据转换示例

### 创建供应商时的转换

```typescript
// 前端输入（来自 CreateSupplierModal）
const frontendData = {
  id: 'SUP-2024-001',
  name: 'Shanghai Matson Navigation',
  localName: '上海美森',
  code: 'V-MSK-SH',
  tier: 'probation',
  financial: {
    interval: 'monthly',
    anchor: 'etd',
    period: 30
  },
  portalAccess: {
    demandBroadcast: true,
    empowermentCenter: true,
    ticketSystem: true,
    performanceView: false
  },
  tags: ['美西航线'],
  businessLines: [
    {
      type: '海运',
      description: '美西快船',
      contact: {
        name: 'Jason Li',
        phone: '+86 139 1111 2222'
      }
    }
  ]
}

// 后端存储（Supabase）
const databaseData = {
  code: 'SUP-2024-001',
  name: 'Shanghai Matson Navigation',
  local_name: '上海美森',
  logo_text: 'S', // 自动生成
  tier: 'probation',
  status: 'active', // 默认值
  stage: 'leads', // 默认值
  financial_interval: 'monthly',
  financial_anchor: 'etd',
  financial_period: 30,
  portal_demand_broadcast: true,
  portal_empowerment_center: true,
  portal_ticket_system: true,
  portal_performance_view: false,
  tags: ['美西航线'],
  // business_lines 需要单独插入
}

// business_lines 表
const businessLineData = {
  supplier_id: '<generated-uuid>',
  type: '海运',
  description: '美西快船',
  carriers: [],
  routes: [],
}

// business_line_contacts 表
const contactData = {
  business_line_id: '<generated-business-line-uuid>',
  name: 'Jason Li',
  phone: '+86 139 1111 2222',
  is_primary: true,
}
```

### 读取供应商时的转换

```typescript
// 从数据库读取
const databaseRow = {
  id: 'uuid-123',
  code: 'SUP-2024-001',
  name: 'Shanghai Matson Navigation',
  local_name: '上海美森',
  logo_text: 'S',
  tier: 'probation',
  status: 'active',
  financial_interval: 'monthly',
  financial_anchor: 'etd',
  financial_period: 30,
  portal_demand_broadcast: true,
  // ... 其他字段
}

// 转换为前端格式
const frontendData = {
  id: 'uuid-123',
  code: 'SUP-2024-001',
  name: 'Shanghai Matson Navigation',
  localName: '上海美森',
  logoText: 'S',
  tier: 'probation',
  status: 'active',
  financial: {
    interval: 'monthly',
    anchor: 'etd',
    period: 30,
  },
  portalAccess: {
    demandBroadcast: true,
    empowermentCenter: false,
    ticketSystem: false,
    performanceView: false,
  },
  // ... 其他字段
}
```

---

## 关键设计决策

### 1. 嵌套对象扁平化
**决策**: 将前端嵌套对象扁平化到数据库
**原因**: PostgreSQL 不支持嵌套对象，扁平化更高效
**示例**: `financial.interval` → `financial_interval`

### 2. 数组字段
**决策**: 使用 PostgreSQL 数组类型 `text[]`
**原因**: 避免创建额外的关联表，简化查询
**示例**: `tags`, `scarce_resources`, `carriers`, `routes`

### 3. UUID 主键
**决策**: 使用 UUID 而非自增 ID
**原因**: 分布式友好，客户端可生成
**示例**: `id: uuid` 默认 `uuid_generate_v4()`

### 4. 时间戳
**决策**: 使用 `timestamptz`（带时区）
**原因**: 避免时区混乱
**示例**: `created_at`, `updated_at`

### 5. 可选字段
**决策**: 使用 `nullable` 而非默认值
**原因**: 区分"未设置"和"默认值"
**示例**: `address`, `website`, `contact_phone`

---

## 待添加的类型定义

### business_line_contacts 表类型

```typescript
// 需要添加到 src/types/database.ts

export type BusinessLineContact = {
  id: string
  business_line_id: string
  name: string
  title: string | null
  phone: string | null
  email: string | null
  is_primary: boolean | null
}

export type BusinessLineContactInsert = Omit<BusinessLineContact, 'id'> & {
  id?: string
}

export type BusinessLineContactUpdate = Partial<Omit<BusinessLineContactInsert, 'id'>>
```
