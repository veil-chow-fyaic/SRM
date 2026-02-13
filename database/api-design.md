# SRM API 接口设计文档

## 概述

基于 Supabase 自动生成的 REST API，本文档定义了 SRM 系统所需的所有接口操作。

## 基础信息

- **Base URL**: `https://your-project.supabase.co`
- **REST API**: `/rest/v1/*`
- **GraphQL**: `/graphql/v1` (可选)
- **Realtime**: `/realtime/v1`

## 认证

使用 Supabase Auth:
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})
```

## 通用响应格式

```typescript
// 成功响应
{
  data: T | T[],
  error: null,
  status: 200,
  statusText: 'OK'
}

// 错误响应
{
  data: null,
  error: {
    message: string,
    details: string,
    hint: string,
    code: string
  },
  status: 400,
  statusText: 'Bad Request'
}
```

---

## 1. 供应商接口 (suppliers)

### 1.1 获取供应商列表
```typescript
// 基础查询
GET /rest/v1/suppliers?select=*

// 按层级筛选
GET /rest/v1/suppliers?tier=eq.strategic&select=*

// 按状态筛选
GET /rest/v1/suppliers?status=eq.active&select=*

// 按生命周期阶段筛选
GET /rest/v1/suppliers?stage=eq.probation&select=*

// 模糊搜索
GET /rest/v1/suppliers?name=ilike.*${query}*&select=*

// 分页
GET /rest/v1/suppliers?select=*&order=created_at.desc&limit=20&offset=0
```

**Supabase JS 示例**:
```typescript
const { data, error } = await supabase
  .from('suppliers')
  .select('*')
  .eq('tier', 'strategic')
  .order('created_at', { ascending: false })
  .range(0, 19)
```

### 1.2 获取供应商详情
```typescript
GET /rest/v1/suppliers?id=eq.{uuid}&select=*
```

**Supabase JS 示例**:
```typescript
const { data, error } = await supabase
  .from('suppliers')
  .select(`
    *,
    business_lines (*),
    decision_chain (*),
    engagement_logs (*),
    performance_history (*)
  `)
  .eq('id', uuid)
  .single()
```

### 1.3 创建供应商
```typescript
POST /rest/v1/suppliers
Content-Type: application/json

{
  "code": "V-MSK-SH",
  "name": "Shanghai Matson Navigation",
  "local_name": "美森轮船（上海）有限公司",
  "tier": "probation",
  "status": "active",
  "stage": "leads",
  "category": "Ocean Carrier",
  "location": "Shanghai, China",
  "financial_interval": "monthly",
  "financial_anchor": "etd",
  "financial_period": 30,
  "tags": ["美线庄家", "快船资源"],
  "created_by": "user_uuid"
}
```

### 1.4 更新供应商
```typescript
PATCH /rest/v1/suppliers?id=eq.{uuid}
Content-Type: application/json

{
  "tier": "strategic",
  "system_score": 92.5
}
```

### 1.5 删除供应商
```typescript
DELETE /rest/v1/suppliers?id=eq.{uuid}
```

---

## 2. 业务线接口 (business_lines)

### 2.1 获取供应商业务线
```typescript
GET /rest/v1/business_lines?supplier_id=eq.{uuid}&select=*
```

**Supabase JS 示例**:
```typescript
const { data, error } = await supabase
  .from('business_lines')
  .select(`
    *,
    business_line_contacts (*)
  `)
  .eq('supplier_id', uuid)
```

### 2.2 创建业务线
```typescript
POST /rest/v1/business_lines
Content-Type: application/json

{
  "supplier_id": "uuid",
  "type": "海运 (Ocean Freight)",
  "description": "美西快船庄家",
  "carriers": ["Matson", "COSCO"],
  "routes": ["North America", "Europe"]
}
```

---

## 3. 决策链接口 (decision_chain)

### 3.1 获取决策链成员
```typescript
GET /rest/v1/decision_chain?supplier_id=eq.{uuid}&select=*
```

**带关联资源**:
```typescript
GET /rest/v1/decision_chain?supplier_id=eq.{uuid}&select=*,decision_chain_resources(*)
```

### 3.2 创建决策链成员
```typescript
POST /rest/v1/decision_chain
Content-Type: application/json

{
  "supplier_id": "uuid",
  "name": "Jason Li",
  "title": "Ocean Dept. Manager",
  "layer": "Decision",
  "role": "Decision Maker",
  "affinity": 3,
  "phone": "+86 139 1111 2222",
  "email": "jason.li@matson.com",
  "tags": ["看重长期规划", "高尔夫爱好者"]
}
```

### 3.3 更新亲密度
```typescript
PATCH /rest/v1/decision_chain?id=eq.{uuid}
Content-Type: application/json

{
  "affinity": 4
}
```

---

## 4. 互动日志接口 (engagement_logs)

### 4.1 获取互动日志
```typescript
GET /rest/v1/engagement_logs?supplier_id=eq.{uuid}&select=*&order=planned_date.desc
```

### 4.2 创建互动日志（PACD 模型）
```typescript
POST /rest/v1/engagement_logs
Content-Type: application/json

{
  "supplier_id": "uuid",
  "status": "planned",
  "log_type": "QBR",
  "planned_date": "2024-03-15",
  "title": "Q1 季度业务回顾会议",
  "goal": "锁定 Q2 舱位增量",
  "participants": "Tommy, Jason Li, Alice Wang",
  "rating": 5,
  "outcome": "达成 Q2 舱位增量协议",
  "dimension_basic": "核对营业执照有效期",
  "dimension_business": "回顾 Q1 货量表现",
  "dimension_decision": "Jason 提到越南新航线计划",
  "dimension_derivative": "引荐行业协会副会长",
  "next_steps": "跟进 Q2 合同签署",
  "tags": ["车队外包"],
  "author_name": "Tommy"
}
```

### 4.3 更新日志状态（计划→完成）
```typescript
PATCH /rest/v1/engagement_logs?id=eq.{uuid}
Content-Type: application/json

{
  "status": "completed",
  "rating": 5,
  "outcome": "实际成果..."
}
```

---

## 5. 绩效接口 (performance_history, performance_dimensions)

### 5.1 获取绩效历史
```typescript
GET /rest/v1/performance_history?supplier_id=eq.{uuid}&select=*&order=evaluation_date.desc
```

### 5.2 提交绩效评估
```typescript
// 1. 创建绩效历史记录
POST /rest/v1/performance_history
Content-Type: application/json

{
  "supplier_id": "uuid",
  "evaluation_date": "2024-03-31",
  "period": "2024 Q1",
  "score": 92.5,
  "rater_name": "Tommy",
  "comment": "整体表现优秀"
}

// 2. 更新供应商系统评分
PATCH /rest/v1/suppliers?id=eq.{uuid}
Content-Type: application/json

{
  "system_score": 92.5
}
```

### 5.3 获取绩效配置
```typescript
GET /rest/v1/performance_dimensions?supplier_id=eq.{uuid}&select=*
```

---

## 6. 任务接口 (tasks)

### 6.1 获取任务列表
```typescript
// 我的任务
GET /rest/v1/tasks?assignee_id=eq.{uuid}&select=*&order=due_date.asc

// 按状态筛选
GET /rest/v1/tasks?status=eq.pending&select=*

// 按优先级筛选
GET /rest/v1/tasks?priority=eq.High&select=*
```

### 6.2 创建任务
```typescript
POST /rest/v1/tasks
Content-Type: application/json

{
  "title": "审核宁波港通准入申请",
  "task_type": "Approval",
  "priority": "High",
  "supplier_id": "uuid",
  "target_tab": "asset",
  "action_param": "verify",
  "due_date": "2024-03-15",
  "assignee_name": "Tommy",
  "source": "System"
}
```

### 6.3 完成任务
```typescript
PATCH /rest/v1/tasks?id=eq.{uuid}
Content-Type: application/json

{
  "status": "completed",
  "completed_at": "2024-03-10T10:00:00Z"
}
```

---

## 7. 风险预警接口 (risk_alerts)

### 7.1 获取活跃风险
```typescript
GET /rest/v1/risk_alerts?status=eq.active&select=*&order=created_at.desc
```

### 7.2 创建风险预警
```typescript
POST /rest/v1/risk_alerts
Content-Type: application/json

{
  "supplier_id": "uuid",
  "alert_type": "资质过期",
  "severity": "High",
  "title": "NVOCC 资质即将过期",
  "description": "15天后过期",
  "trigger_metric": "cert_expiry_date"
}
```

---

## 8. 生命周期接口 (lifecycle_events, probation_tasks)

### 8.1 获取生命周期事件
```typescript
GET /rest/v1/lifecycle_events?supplier_id=eq.{uuid}&select=*&order=created_at.desc
```

### 8.2 获取考察任务
```typescript
GET /rest/v1/probation_tasks?supplier_id=eq.{uuid}&select=*
```

### 8.3 创建考察任务
```typescript
POST /rest/v1/probation_tasks
Content-Type: application/json

{
  "supplier_id": "uuid",
  "name": "Trial Shipment: 10x40HQ to LAX",
  "description": "考察期试单任务",
  "status": "in_progress",
  "deadline": "2024-03-15"
}
```

---

## 9. 日历事件接口 (calendar_events)

### 9.1 获取月度日历
```typescript
GET /rest/v1/calendar_events?event_date=gte.${startDate}&event_date=lte.${endDate}&select=*
```

**Supabase JS 示例**:
```typescript
const { data, error } = await supabase
  .from('calendar_events')
  .select('*')
  .gte('event_date', '2024-03-01')
  .lte('event_date', '2024-03-31')
  .order('event_date')
```

---

## 10. 复杂查询（RPC 函数）

以下是需要创建的自定义 RPC 函数：

### 10.1 get_supplier_summary
获取供应商汇总信息（包括统计数据）

```sql
CREATE OR REPLACE FUNCTION get_supplier_summary(supplier_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'supplier', s.*,
    'business_lines', (SELECT json_agg(*) FROM business_lines WHERE supplier_id = s.id),
    'decision_chain_count', (SELECT COUNT(*) FROM decision_chain WHERE supplier_id = s.id),
    'engagement_logs_count', (SELECT COUNT(*) FROM engagement_logs WHERE supplier_id = s.id),
    'performance_history', (SELECT json_agg(*) FROM performance_history WHERE supplier_id = s.id ORDER BY evaluation_date DESC LIMIT 10),
    'active_tasks', (SELECT json_agg(*) FROM tasks WHERE supplier_id = s.id AND status = 'pending'),
    'risk_alerts', (SELECT json_agg(*) FROM risk_alerts WHERE supplier_id = s.id AND status = 'active')
  ) INTO result
  FROM suppliers s
  WHERE s.id = supplier_uuid;

  RETURN result;
END;
$$ LANGUAGE plpgsql;
```

**调用**:
```typescript
const { data, error } = await supabase.rpc('get_supplier_summary', {
  supplier_uuid: uuid
})
```

### 10.2 search_suppliers
全文搜索供应商

```sql
CREATE OR REPLACE FUNCTION search_suppliers(search_query TEXT)
RETURNS SETOF suppliers AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM suppliers
  WHERE name % search_query
     OR local_name % search_query
     OR code % search_query
  ORDER BY SIMILARITY(name, search_query) DESC;
END;
$$ LANGUAGE plpgsql;
```

**调用**:
```typescript
const { data, error } = await supabase.rpc('search_suppliers', {
  search_query: 'Matson'
})
```

### 10.3 calculate_performance_score
计算加权绩效分数

```sql
CREATE OR REPLACE FUNCTION calculate_performance_score(supplier_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
  total_score DECIMAL;
BEGIN
  SELECT SUM(ph.score * pd.weight / 100.0)
  INTO total_score
  FROM performance_history ph
  CROSS JOIN performance_dimensions pd
  WHERE ph.supplier_id = supplier_uuid
    AND pd.supplier_id = supplier_uuid
    AND ph.period = (
      SELECT MAX(period)
      FROM performance_history
      WHERE supplier_id = supplier_uuid
    )
    AND ph.evaluation_date = (
      SELECT MAX(evaluation_date)
      FROM performance_history
      WHERE supplier_id = supplier_uuid
    );

  RETURN COALESCE(total_score, 0);
END;
$$ LANGUAGE plpgsql;
```

---

## 11. Realtime 订阅

### 11.1 订阅供应商变更
```typescript
const channel = supabase
  .channel('suppliers-changes')
  .on('postgres_changes', {
    event: '*',  // INSERT, UPDATE, DELETE
    schema: 'public',
    table: 'suppliers',
    filter: 'tier=eq.strategic'
  }, (payload) => {
    console.log('供应商数据变更:', payload)
  })
  .subscribe()
```

### 11.2 订阅任务变更
```typescript
const channel = supabase
  .channel('my-tasks')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'tasks',
    filter: 'assignee_id=eq.{user_uuid}'
  }, (payload) => {
    console.log('任务变更:', payload)
  })
  .subscribe()
```

---

## 12. 文件存储 (Storage)

### 12.1 上传供应商 Logo
```typescript
const { data, error } = await supabase.storage
  .from('supplier-logos')
  .upload(`${supplierId}/logo.png`, file)
```

### 12.2 获取公共 URL
```typescript
const { data } = supabase.storage
  .from('supplier-logos')
  .getPublicUrl(`${supplierId}/logo.png`)
```

---

## 错误处理

### 常见错误码
- `23505`: 唯一约束冲突（如 code 重复）
- `23503`: 外键约束冲突
- `23514`: 检查约束冲突
- `PGRST116`: 记录不存在

### 错误处理示例
```typescript
const { data, error } = await supabase
  .from('suppliers')
  .insert({ ...newSupplier })

if (error) {
  if (error.code === '23505') {
    // 供应商代码已存在
    alert('供应商代码已存在，请使用其他代码')
  } else {
    // 其他错误
    console.error('创建失败:', error.message)
  }
}
```

---

## 分页和排序

### 分页
```typescript
// 方式 1: range()
const { data } = await supabase
  .from('suppliers')
  .select('*')
  .range(0, 19)  // 前 20 条

// 方式 2: limit() + offset()
const { data } = await supaplase
  .from('suppliers')
  .select('*', { count: 'exact' })
  .limit(20)
  .offset(page * 20)
```

### 排序
```typescript
const { data } = await supabase
  .from('suppliers')
  .select('*')
  .order('created_at', { ascending: false })
  .order('name', { ascending: true })  // 多字段排序
```

---

## 前端集成建议

### 1. 创建 Supabase 客户端单例
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 2. 替换 mockData.ts
```typescript
// src/data/suppliers.ts
import { supabase } from '../lib/supabase'

export async function getSuppliers() {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .order('name')

  if (error) throw error
  return data
}

export async function getSupplierById(id: string) {
  const { data, error } = await supabase
    .from('suppliers')
    .select(`
      *,
      business_lines (*),
      decision_chain (*)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}
```

### 3. 使用 React Query（推荐）
```typescript
// src/hooks/useSuppliers.ts
import { useQuery } from '@tanstack/react-query'
import { getSuppliers } from '../data/suppliers'

export function useSuppliers() {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: getSuppliers
  })
}
```
