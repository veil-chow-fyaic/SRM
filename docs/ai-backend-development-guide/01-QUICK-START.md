# 5分钟快速开始

> 最小可运行示例，快速体验 Supabase + Coding Agent 开发模式

## 开发流程概览

```mermaid
flowchart LR
    A[创建项目] --> B[配置环境]
    B --> C[定义表结构]
    C --> D[创建 RPC]
    D --> E[前端调用]

    style A fill:#28a745,color:#fff
    style E fill:#e83e0b,color:#fff
```

## Step 1: 创建 Supabase 项目 (1分钟)

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 点击 "New Project"
3. 记录以下信息:

```
Project URL: https://xxx.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 2: 配置前端环境 (1分钟)

```bash
# 安装依赖
npm install @supabase/supabase-js @tanstack/react-query
```

创建 `.env.local`:

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

创建 `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

## Step 3: 创建数据表 (1分钟)

在 Supabase SQL Editor 中执行:

```sql
-- 创建示例表
CREATE TABLE todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 启用 RLS
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- 允许所有人访问 (演示用，生产环境需更严格)
CREATE POLICY "Allow all" ON todos FOR ALL USING (true);
```

## Step 4: 创建 RPC 函数 (1分钟)

```sql
CREATE OR REPLACE FUNCTION get_todos_stats()
RETURNS JSON
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN json_build_object(
    'total', (SELECT COUNT(*) FROM todos),
    'completed', (SELECT COUNT(*) FROM todos WHERE completed = true)
  );
END;
$$ LANGUAGE plpgsql;
```

## Step 5: 前端调用 (1分钟)

```typescript
// src/services/todoService.ts
import { supabase } from '../lib/supabase'

export async function getTodos() {
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getTodoStats() {
  const { data, error } = await supabase.rpc('get_todos_stats')
  if (error) throw error
  return data
}
```

```typescript
// src/hooks/useTodos.ts
import { useQuery } from '@tanstack/react-query'
import { getTodos, getTodoStats } from '../services/todoService'

export function useTodos() {
  return useQuery({
    queryKey: ['todos'],
    queryFn: getTodos,
  })
}

export function useTodoStats() {
  return useQuery({
    queryKey: ['todos', 'stats'],
    queryFn: getTodoStats,
  })
}
```

```tsx
// 组件中使用
function TodoList() {
  const { data: todos, isLoading } = useTodos()
  const { data: stats } = useTodoStats()

  if (isLoading) return <div>加载中...</div>

  return (
    <div>
      <p>总计: {stats?.total} | 完成: {stats?.completed}</p>
      <ul>
        {todos?.map(todo => (
          <li key={todo.id}>{todo.title}</li>
        ))}
      </ul>
    </div>
  )
}
```

## 验证成功

如果看到数据显示，恭喜你完成了快速开始！

## 下一步

- [02-SUPABASE-SETUP](./02-SUPABASE-SETUP.md) - 详细配置 MCP 和环境
- [03-DATABASE-DESIGN](./03-DATABASE-DESIGN.md) - 学习数据库设计最佳实践
- [04-RPC-FUNCTIONS](./04-RPC-FUNCTIONS.md) - 深入 RPC 函数开发

---

> **提示**: 生产环境务必配置严格的 RLS 策略，参见 [03-DATABASE-DESIGN](./03-DATABASE-DESIGN.md#rls-策略配置)
