-- 用户任务隔离测试脚本
-- 用于验证不同用户只能看到自己的任务

-- =====================================================
-- 测试场景 1: 创建测试用户和任务
-- =====================================================

-- 假设有两个测试用户（实际用户ID需要替换）
-- user_a_id = '917add94-f793-40a7-b5d4-27b7fba29c4a'  -- veil@aaa-china.net
-- user_b_id = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'  -- 另一个用户

-- 创建用户 A 的任务
INSERT INTO public.tasks (
  title,
  description,
  assignee_id,
  status,
  priority
) VALUES (
  '用户A的任务 - 审核供应商',
  '请审核长荣海运的资质',
  '917add94-f793-40a7-b5d4-27b7fba29c4a',
  'pending',
  'High'
);

-- 创建系统任务（所有用户可见）
INSERT INTO public.tasks (
  title,
  description,
  assignee_id,
  status,
  priority
) VALUES (
  '系统通知 - 新功能上线',
  '供应商画像功能已更新',
  NULL,  -- assignee_id 为 NULL 表示系统任务
  'pending',
  'Medium'
);

-- =====================================================
-- 测试场景 2: 验证 RLS 策略
-- =====================================================

-- 以用户 A 身份查询
-- SELECT * FROM public.tasks;
-- 预期结果:
--  1. 用户A的任务
--  2. 系统任务（assignee_id IS NULL）

-- 以用户 B 身份查询
-- SELECT * FROM public.tasks;
-- 预期结果:
--  1. 系统任务（assignee_id IS NULL）
--  2. 看不到用户A的任务

-- =====================================================
-- 测试场景 3: 验证写入权限
-- =====================================================

-- 用户 A 可以创建任务
INSERT INTO public.tasks (
  title,
  assignee_id,
  status
) VALUES (
  '用户新建的任务',
  '917add94-f793-40a7-b5d4-27b7fba29c4a',  -- 分配给自己
  'pending'
);

-- 用户 A 尝试更新用户 B 的任务（应该失败）
-- UPDATE public.tasks SET status = 'completed' WHERE id = 'user-b-task-id';
-- 预期结果: 无行被更新（RLS 阻止）

-- =====================================================
-- 查询验证
-- =====================================================

-- 查看所有任务（管理员视图）
SELECT
  id,
  title,
  assignee_id,
  CASE
    WHEN assignee_id IS NULL THEN '系统任务（所有人可见）'
    ELSE '个人任务'
  END as task_type,
  status
FROM public.tasks
ORDER BY
  assignee_id NULLS LAST,
  created_at DESC;

-- 统计每个用户的任务数
SELECT
  COALESCE(assignee_id, '系统任务') as user_id,
  COUNT(*) as task_count
FROM public.tasks
GROUP BY assignee_id
ORDER BY task_count DESC;

-- =====================================================
-- 清理测试数据（可选）
-- =====================================================

-- DELETE FROM public.tasks WHERE title LIKE '用户A%';
-- DELETE FROM public.tasks WHERE title LIKE '系统通知%';
