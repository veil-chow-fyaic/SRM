# SRM 前后端集成指南

## 概述

本文档说明如何将 SRM 前端项目从 mock 数据迁移到 Supabase 后端。

---

## 一、环境准备

### 1.1 创建 Supabase 项目

1. 访问 [supabase.com](https://supabase.com)
2. 创建新项目
3. 获取项目 URL 和 anon key

### 1.2 安装依赖

```bash
npm install @supabase/supabase-js
```

### 1.2 配置环境变量

创建 `.env.local` 文件:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

更新 `.gitignore`:
```
.env.local
.env.*.local
```

---

## 二、数据库初始化

### 2.1 执行 Schema SQL

1. 在 Supabase Dashboard 中打开 SQL Editor
2. 执行 `database/schema.sql` 中的所有 SQL

### 2.2 插入初始数据

```sql
-- 插入示例供应商
INSERT INTO suppliers (code, name, local_name, tier, status, stage, category, location)
VALUES
  ('V-MSK-SH', 'Shanghai Matson Navigation', '美森轮船（上海）有限公司', 'strategic', 'active', 'active', 'Ocean Carrier', 'Shanghai, China'),
  ('V-COS-CN', 'COSCO SHIPPING Lines', '中远海运集装箱运输有限公司', 'core', 'active', 'active', 'Ocean Carrier', 'Shanghai, China');
```

---

## 三、Supabase 客户端配置

### 3.1 创建客户端

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
})

// 类型定义
export type Database = {
  public: {
    Tables: {
      suppliers: {
        Row: { /* ... */ }
        Insert: { /* ... */ }
        Update: { /* ... */ }
      }
      // ... 其他表
    }
  }
}
```

### 3.2 类型定义（从数据库生成）

```bash
# 安装 Supabase CLI
npm install -g supabase

# 生成类型
supabase gen types typescript --project-id your-project-id > src/types/database.ts
```

---

## 四、数据服务层改造

### 4.1 创建 API 服务

```typescript
// src/services/suppliers.ts
import { supabase } from '../lib/supabase'
import type { Supplier } from '../types/database'

export interface SupplierFilters {
  tier?: string
  status?: string
  stage?: string
  search?: string
}

export async function getSuppliers(filters?: SupplierFilters): Promise<Supplier[]> {
  let query = supabase
    .from('suppliers')
    .select('*')

  if (filters?.tier) {
    query = query.eq('tier', filters.tier)
  }
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,local_name.ilike.%${filters.search}%`)
  }

  const { data, error } = await query.order('name')

  if (error) throw error
  return data || []
}

export async function getSupplierById(id: string): Promise<Supplier> {
  const { data, error } = await supabase
    .from('suppliers')
    .select(`
      *,
      business_lines (*),
      decision_chain (*),
      engagement_logs (*)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createSupplier(supplier: Partial<Supplier>): Promise<Supplier> {
  const { data, error } = await supabase
    .from('suppliers')
    .insert(supplier)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateSupplier(id: string, updates: Partial<Supplier>): Promise<Supplier> {
  const { data, error } = await supabase
    .from('suppliers')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteSupplier(id: string): Promise<void> {
  const { error } = await supabase
    .from('suppliers')
    .delete()
    .eq('id', id)

  if (error) throw error
}
```

### 4.2 决策链服务

```typescript
// src/services/decisionChain.ts
import { supabase } from '../lib/supabase'

export type DecisionChainMember = Database['public']['Tables']['decision_chain']['Row']

export async function getDecisionChain(supplierId: string) {
  const { data, error } = await supabase
    .from('decision_chain')
    .select('*, decision_chain_resources(*)')
    .eq('supplier_id', supplierId)
    .order('layer')

  if (error) throw error
  return data || []
}

export async function createDecisionChainMember(member: Partial<DecisionChainMember>) {
  const { data, error } = await supabase
    .from('decision_chain')
    .insert(member)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateAffinity(id: string, affinity: number) {
  const { data, error } = await supabase
    .from('decision_chain')
    .update({ affinity })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}
```

### 4.3 互动日志服务

```typescript
// src/services/engagementLogs.ts
import { supabase } from '../lib/supabase'

export type EngagementLog = Database['public']['Tables']['engagement_logs']['Row']

export async function getEngagementLogs(supplierId: string) {
  const { data, error } = await supabase
    .from('engagement_logs')
    .select('*')
    .eq('supplier_id', supplierId)
    .order('planned_date', { ascending: false })

  if (error) throw error
  return data || []
}

export async function createEngagementLog(log: Partial<EngagementLog>) {
  const { data, error } = await supabase
    .from('engagement_logs')
    .insert(log)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateEngagementLog(id: string, updates: Partial<EngagementLog>) {
  const { data, error } = await supabase
    .from('engagement_logs')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}
```

---

## 五、状态管理决策

### 5.1 当前状态

- 无全局状态管理库
- 使用组件级 `useState`
- 数据通过 props drilling

### 5.2 后端集成后的选项

#### 选项 A: 保持现状 + React Query（推荐）
```typescript
// 使用 React Query 管理服务端状态
// 不改变现有状态管理模式
// 只添加数据获取和缓存层
```

**优点**:
- 最小改动
- 自动缓存、重新验证、加载状态
- 优秀的 DevTools

#### 选项 B: 引入 Zustand
```typescript
// 创建全局 store
// 管理跨页面状态
```

**优点**:
- 简单的 API
- 跨页面状态共享
- TypeScript 友好

### 5.3 推荐：React Query + 局部状态

```typescript
// 安装 React Query
npm install @tanstack/react-query

// src/main.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 分钟
      gcTime: 1000 * 60 * 10, // 10 分钟
    }
  }
})

root.render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
)
```

```typescript
// src/hooks/useSuppliers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSuppliers, createSupplier, updateSupplier } from '../services/suppliers'

export function useSuppliers(filters?: SupplierFilters) {
  return useQuery({
    queryKey: ['suppliers', filters],
    queryFn: () => getSuppliers(filters)
  })
}

export function useCreateSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createSupplier,
    onSuccess: () => {
      // 刷新供应商列表
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
    }
  })
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Supplier> }) =>
      updateSupplier(id, updates),
    onSuccess: (_, variables) => {
      // 刷新特定供应商
      queryClient.invalidateQueries({ queryKey: ['supplier', variables.id] })
      // 刷新列表
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
    }
  })
}
```

---

## 六、页面改造示例

### 6.1 SupplierList 改造

**改造前**:
```typescript
const [suppliersList, setSuppliersList] = useState<SupplierSummary[]>(initialSuppliers);
```

**改造后**:
```typescript
import { useSuppliers } from '../hooks/useSuppliers'

export function SupplierList() {
  const [searchParams] = useSearchParams()
  const activeType = searchParams.get('type') || 'all'

  // 映射 URL 类型到数据库查询
  const filters = useMemo(() => {
    switch (activeType) {
      case 'strategic': return { tier: 'strategic' }
      case 'active': return { tier: ['core', 'backup'] }  // 需要服务层支持
      case 'potential': return { tier: 'probation' }
      case 'blacklist': return { tier: 'blacklisted' }
      default: return {}
    }
  }, [activeType])

  const { data: suppliers = [], isLoading, error } = useSuppliers(filters)

  if (isLoading) return <div>加载中...</div>
  if (error) return <div>加载失败: {error.message}</div>

  // ... 渲染逻辑
}
```

### 6.2 SupplierDetail 改造

```typescript
import { useSupplierDetail, useUpdateSupplier } from '../hooks/useSuppliers'
import { useDecisionChain } from '../hooks/useDecisionChain'

export function SupplierDetail() {
  const { id } = useParams()

  // 获取供应商详情
  const { data: supplier, isLoading } = useSupplierDetail(id)

  // 获取决策链
  const { data: decisionChain = [] } = useDecisionChain(id)

  // 更新 mutation
  const updateSupplier = useUpdateSupplier()

  const handleUpdate = async (updates: Partial<Supplier>) => {
    await updateSupplier.mutateAsync({ id, updates })
  }

  if (isLoading) return <div>加载中...</div>

  // ... 渲染逻辑
}
```

### 6.3 SystemSettings 改造

```typescript
import { useSuppliers } from '../hooks/useSuppliers'

export function SystemSettings() {
  const { data: suppliers = [], isLoading } = useSuppliers()

  // 实时保存使用 useMutation
  const updateSupplier = useUpdateSupplier()

  const handleFinancialChange = (field: string, value: any) => {
    updateSupplier.mutate({
      id: selectedId,
      updates: { financial: { ...supplier.financial, [field]: value } }
    })
  }

  // ... 渲染逻辑
}
```

---

## 七、错误处理

### 7.1 错误边界

```typescript
// src/components/ErrorBoundary.tsx
export class ErrorBoundary extends Component<Props, State> {
  // ...
}
```

### 7.2 错误处理组件

```typescript
// src/components/ErrorMessage.tsx
export function ErrorMessage({ error }: { error: Error }) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
      <p className="font-bold">操作失败</p>
      <p className="text-sm">{error.message}</p>
    </div>
  )
}
```

### 7.3 全局错误处理

```typescript
// src/lib/supabase.ts
export const supabase = createClient(url, key, {
  global: {
    headers: {
      // 自定义头部
    }
  },
  db: {
    schema: 'public'
  },
  auth: {
    // 认证配置
  },
  realtime: {
    // 实时配置
  }
})

// 添加错误处理
supabase.channel('errors')
  .on('postgres_errors', (payload) => {
    console.error('Database error:', payload)
  })
  .subscribe()
```

---

## 八、加载状态处理

### 8.1 加载骨架屏

```typescript
// src/components/SupplierSkeleton.tsx
export function SupplierSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-slate-200 rounded w-1/2"></div>
    </div>
  )
}
```

### 8.2 使用示例

```typescript
const { data, isLoading } = useSuppliers()

if (isLoading) {
  return <SupplierSkeleton />
}
```

---

## 九、迁移步骤

### Phase 1: 基础设施 (1 天)
- [ ] 创建 Supabase 项目
- [ ] 执行数据库 Schema
- [ ] 配置环境变量
- [ ] 创建 Supabase 客户端

### Phase 2: 服务层 (2 天)
- [ ] 创建所有 API 服务
- [ ] 创建类型定义
- [ ] 测试 API 连接

### Phase 3: 状态管理 (1 天)
- [ ] 安装 React Query
- [ ] 创建 hooks
- [ ] 配置 QueryClient

### Phase 4: 页面迁移 (5 天)
- [ ] SupplierList
- [ ] SupplierDetail
- [ ] SystemSettings
- [ ] PerformanceAppraisal
- [ ] LifecycleManagement
- [ ] Dashboard

### Phase 5: 测试与优化 (2 天)
- [ ] 功能测试
- [ ] 性能优化
- [ ] 错误处理完善

### Phase 6: 上线准备 (1 天)
- [ ] 清理 mock 数据
- [ ] 删除未使用代码
- [ ] 文档更新

---

## 十、常见问题

### Q1: 如何处理本地开发和生产环境？
使用不同的 Supabase 项目和 `.env` 文件。

### Q2: 如何处理认证？
使用 Supabase Auth，参考官方文档。

### Q3: 如何实现实时更新？
使用 Supabase Realtime，订阅表变更。

### Q4: 如何处理文件上传？
使用 Supabase Storage。

### Q5: 如何优化性能？
- 使用 React Query 缓存
- 实现分页
- 使用数据库索引
- 避免过度获取
