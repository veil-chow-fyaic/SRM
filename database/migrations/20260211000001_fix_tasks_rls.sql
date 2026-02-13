-- 修复 Tasks 表的 RLS 策略 - 实现用户任务隔离
-- 创建时间: 2026-02-11
-- 目的: 确保用户只能看到自己的任务，不能看到别人的任务

-- =====================================================
-- 1. 删除旧的过于宽松的策略
-- =====================================================
DROP POLICY IF EXISTS "Allow authenticated access on tasks" ON public.tasks;

-- =====================================================
-- 2. 创建新的用户隔离策略
-- =====================================================

-- 策略 1: 用户可以看到自己被分配的任务
CREATE POLICY "Users can view own tasks"
ON public.tasks
FOR SELECT
TO public
USING (
  auth.role() = 'authenticated'
  AND (
    -- 任务分配给当前用户
    assignee_id = auth.uid()
    OR
    -- 或者是系统任务（无分配人）- 所有用户可见
    assignee_id IS NULL
  )
);

-- 策略 2: 用户可以创建任务（分配给自己或其他人）
CREATE POLICY "Users can insert tasks"
ON public.tasks
FOR INSERT
TO public
WITH CHECK (
  auth.role() = 'authenticated'
  -- 创建任务时必须指定 assignee_id
  AND assignee_id IS NOT NULL
);

-- 策略 3: 用户可以更新自己的任务
CREATE POLICY "Users can update own tasks"
ON public.tasks
FOR UPDATE
TO public
USING (
  auth.role() = 'authenticated'
  AND assignee_id = auth.uid()
)
WITH CHECK (
  auth.role() = 'authenticated'
  AND assignee_id = auth.uid()
);

-- 策略 4: 用户可以删除自己的任务
CREATE POLICY "Users can delete own tasks"
ON public.tasks
FOR DELETE
TO public
USING (
  auth.role() = 'authenticated'
  AND assignee_id = auth.uid()
);

-- =====================================================
-- 3. 确保现有数据有 assignee_id
-- =====================================================

-- 为没有 assignee_id 的现有任务设置默认值
-- 注意：这里需要根据实际情况调整
UPDATE public.tasks
SET assignee_id = (
  -- 尝试使用创建者ID（如果有的话）
  -- 或者设置为系统用户ID
  '917add94-f793-40a7-b5d4-27b7fba29c4a'::uuid  -- 使用现有测试用户ID
)
WHERE assignee_id IS NULL;

-- =====================================================
-- 4. 创建索引以提高查询性能
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id
ON public.tasks(assignee_id)
WHERE assignee_id IS NOT NULL;

-- =====================================================
-- 5. 验证策略
-- =====================================================

-- 查看创建的策略
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies
WHERE tablename = 'tasks'
ORDER BY policyname;

-- 测试查询（应该只返回当前用户的任务）
-- SELECT * FROM public.tasks WHERE assignee_id = auth.uid();
