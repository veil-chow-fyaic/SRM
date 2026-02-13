# 服务层实现指南
<!--
  WHAT: 服务层模块的标准实现模板和指南
  WHY: 确保所有服务模块的一致性和完整性
  WHEN: 2026-02-10
-->

## 服务层标准结构

每个服务模块应包含以下部分：

### 1. 类型导入
```typescript
import { supabase, handleSupabaseError, isNotFoundError } from '../lib/supabase'
import type {
  TableName,
  TableNameInsert,
  TableNameUpdate
} from '../types/database'
```

### 2. 筛选参数接口
```typescript
export interface TableNameFilters {
  field1?: string
  field2?: string[]
  search?: string
}
```

### 3. CRUD 操作

#### 获取列表（带筛选）
```typescript
export async function getTableNames(filters?: TableNameFilters): Promise<TableName[]> {
  let query = supabase
    .from('table_name')
    .select('*')
    .order('created_at', { ascending: false })

  // 应用筛选
  if (filters?.field1) {
    query = query.eq('field1', filters.field1)
  }

  if (filters?.field2 && Array.isArray(filters.field2)) {
    query = query.in('field2', filters.field2)
  }

  // 模糊搜索
  if (filters?.search) {
    query = query.or(`field1.ilike.%${filters.search}%,field2.ilike.%${filters.search}%`)
  }

  const { data, error } = await query

  if (error) {
    throw handleSupabaseError(error)
  }

  return data || []
}
```

#### 获取单个
```typescript
export async function getTableNameById(id: string): Promise<TableName> {
  const { data, error } = await supabase
    .from('table_name')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw handleSupabaseError(error)
  }

  return data
}
```

#### 创建
```typescript
export async function createTableName(item: TableNameInsert): Promise<TableName> {
  const { data, error } = await supabase
    .from('table_name')
    .insert(item)
    .select()
    .single()

  if (error) {
    throw handleSupabaseError(error)
  }

  return data
}
```

#### 更新
```typescript
export async function updateTableName(
  id: string,
  updates: TableNameUpdate
): Promise<TableName> {
  const { data, error } = await supabase
    .from('table_name')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw handleSupabaseError(error)
  }

  return data
}
```

#### 删除
```typescript
export async function deleteTableName(id: string): Promise<void> {
  const { error } = await supabase
    .from('table_name')
    .delete()
    .eq('id', id)

  if (error) {
    throw handleSupabaseError(error)
  }
}
```

#### 批量操作
```typescript
export async function batchUpdateTableNames(
  ids: string[],
  updates: Partial<TableNameUpdate>
): Promise<void> {
  const { error } = await supabase
    .from('table_name')
    .update(updates)
    .in('id', ids)

  if (error) {
    throw handleSupabaseError(error)
  }
}
```

#### Realtime 订阅
```typescript
export function subscribeToTableNames(
  callback: (payload: {
    data: TableName[]
    eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  }) => void
) {
  return supabase
    .channel('table_name-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'table_name',
      },
      (payload) => {
        callback({
          data: payload.new as TableName[],
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
        })
      }
    )
    .subscribe()
}
```

### 4. 关联数据处理

#### 获取带关联数据
```typescript
export async function getTableNameWithRelations(id: string) {
  // 获取主数据
  const { data: mainData, error: mainError } = await supabase
    .from('table_name')
    .select('*')
    .eq('id', id)
    .single()

  if (mainError) {
    throw handleSupabaseError(mainError)
  }

  // 获取关联数据
  const { data: relatedData = [] } = await supabase
    .from('related_table')
    .select('*')
    .eq('foreign_key', id)

  return {
    ...mainData,
    related: relatedData,
  }
}
```

---

## 各服务模块实现清单

### decisionChain.ts
- [x] 基础 CRUD
- [ ] 获取带资源的决策链
- [ ] 批量更新亲密度
- [ ] 按层级筛选

### engagementLogs.ts
- [x] 基础 CRUD
- [ ] 按状态筛选
- [ ] 按日期范围筛选
- [ ] 获取统计（已完成/平均评分）

### businessLines.ts
- [x] 基础 CRUD
- [ ] 获取带联系人的业务线
- [ ] 创建业务线和联系人（事务）

### performanceHistory.ts
- [x] 基础 CRUD
- [ ] 获取供应商绩效历史
- [ ] 计算平均分
- [ ] 按周期筛选

### tasks.ts
- [x] 基础 CRUD
- [ ] 按状态筛选
- [ ] 按到期日筛选
- [ ] 完成任务

### businessLineContacts.ts
- [ ] 基础 CRUD（新增）
- [ ] 获取业务线联系人
- [ ] 设置主联系人

### performanceDimensions.ts
- [ ] 基础 CRUD（新增）
- [ ] 获取供应商绩效配置
- [ ] 批量更新维度

### riskAlerts.ts
- [ ] 基础 CRUD（新增）
- [ ] 按严重程度筛选
- [ ] 标记已解决

### systemSettings.ts
- [ ] 基础 CRUD（新增）
- [ ] 获取供应商配置
- [ ] 获取全局配置

### calendarEvents.ts
- [ ] 基础 CRUD（新增）
- [ ] 按日期范围筛选
- [ ] 获取日历数据

### probationTasks.ts
- [ ] 基础 CRUD（新增）
- [ ] 按状态筛选
- [ ] 更新任务状态

---

## React Query Hooks 模板

### useTableNames.ts 模板

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getTableNames,
  getTableNameById,
  createTableName,
  updateTableName,
  deleteTableName,
  type TableNameFilters,
} from '../services'

/**
 * 获取列表
 */
export function useTableNames(filters?: TableNameFilters) {
  return useQuery({
    queryKey: ['table_names', filters],
    queryFn: () => getTableNames(filters),
    staleTime: 1000 * 60 * 5, // 5 分钟
  })
}

/**
 * 获取单个
 */
export function useTableName(id: string) {
  return useQuery({
    queryKey: ['table_name', id],
    queryFn: () => getTableNameById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2, // 2 分钟
  })
}

/**
 * 创建 Mutation
 */
export function useCreateTableName() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTableName,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['table_names'] })
    },
  })
}

/**
 * 更新 Mutation
 */
export function useUpdateTableName() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      updateTableName(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['table_name', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['table_names'] })
    },
  })
}

/**
 * 删除 Mutation
 */
export function useDeleteTableName() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteTableName,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['table_names'] })
    },
  })
}
```

---

## 命名约定

### 文件命名
- 服务文件：小驼峰，复数 `suppliers.ts`, `decisionChain.ts`
- Hooks 文件：`use` 前缀 + 复数 `useSuppliers.ts`

### 函数命名
| 操作 | 命名模式 | 示例 |
|------|----------|------|
| 获取列表 | `get{TableNames}` | `getSuppliers` |
| 获取单个 | `get{TableName}ById` | `getSupplierById` |
| 获取详情（含关联） | `get{TableName}Detail` | `getSupplierDetail` |
| 创建 | `create{TableName}` | `createSupplier` |
| 更新 | `update{TableName}` | `updateSupplier` |
| 删除 | `delete{TableName}` | `deleteSupplier` |
| 批量操作 | `batch{Operation}{TableNames}` | `batchUpdateSuppliers` |

### Hooks 命名
| 操作 | 命名模式 | 示例 |
|------|----------|------|
| 获取列表 | `use{TableNames}` | `useSuppliers` |
| 获取单个 | `use{TableName}` | `useSupplier` |
| 创建 | `useCreate{TableName}` | `useCreateSupplier` |
| 更新 | `useUpdate{TableName}` | `useUpdateSupplier` |
| 删除 | `useDelete{TableName}` | `useDeleteSupplier` |

---

## Query Key 规范

```typescript
// 列表查询
['table_names'] // 无筛选
['table_names', filters] // 有筛选

// 单条查询
['table_name', id] // 通过 ID 查询
['table_name', id, 'detail'] // 详情（含关联）

// 关联查询
['table_name', id, 'related'] // 关联数据
```

---

## 缓存策略

| 数据类型 | staleTime | 理由 |
|----------|-----------|------|
| 列表数据 | 5 分钟 | 不常变化，可容忍延迟 |
| 详情数据 | 2 分钟 | 可能被编辑，较短缓存 |
| 统计数据 | 1 分钟 | 需要较新数据 |
| 用户操作 | 立即失效 | mutation 后立即 invalidate |

---

## 错误处理

### 统一错误处理
```typescript
import { supabase, handleSupabaseError } from '../lib/supabase'

// 所有服务函数都应该使用 handleSupabaseError
try {
  const { data, error } = await supabase.from('...').select('*')
  if (error) throw handleSupabaseError(error)
  return data
} catch (error) {
  // handleSupabaseError 已经处理了
  throw error
}
```

### 404 处理
```typescript
import { isNotFoundError } from '../lib/supabase'

const item = await getTableNameById(id)
if (isNotFoundError(item)) {
  // 处理不存在的情况
}
```

---

## 实现优先级

### P0 - 立即实现
1. **decisionChain.ts** - 完善（带资源关联）
2. **engagementLogs.ts** - 完善（带统计）
3. **businessLines.ts** - 完善（带联系人）

### P1 - 尽快实现
4. **performanceHistory.ts** - 完善
5. **tasks.ts** - 完善
6. **systemSettings.ts** - 新增

### P2 - 后续实现
7. **businessLineContacts.ts** - 新增
8. **performanceDimensions.ts** - 新增
9. **riskAlerts.ts** - 新增
10. **calendarEvents.ts** - 新增
11. **probationTasks.ts** - 新增
