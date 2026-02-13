// @ts-nocheck
/**
 * 任务服务
 *
 * 封装所有与 tasks 表相关的 API 调用
 */

import { supabase, handleSupabaseError } from '../lib/supabase'
import type { Database } from '../types/database'

// 导出简化类型
export type Task = Database['public']['Tables']['tasks']['Row']
export type TaskInsert = Database['public']['Tables']['tasks']['Insert']
export type TaskUpdate = Database['public']['Tables']['tasks']['Update']

/**
 * 任务筛选参数
 */
export interface TaskFilters {
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  assignee_id?: string
  supplier_id?: string
  priority?: 'High' | 'Medium' | 'Low'
  task_type?: 'Approval' | 'Review' | 'Doc' | 'Follow-up' | 'Personal'
  due_before?: Date
  due_after?: Date
}

/**
 * 获取任务列表
 */
export async function getTasks(filters?: TaskFilters, limit = 50) {
  let query = supabase
    .from('tasks')
    .select('*')
    .order('due_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(limit)

  // 按状态筛选
  if (filters?.status) {
    query = query.eq('status', filters.status as any)
  }

  // 按负责人筛选
  if (filters?.assignee_id) {
    query = query.eq('assignee_id', filters.assignee_id as any)
  }

  // 按供应商筛选
  if (filters?.supplier_id) {
    query = query.eq('supplier_id', filters.supplier_id as any)
  }

  // 按优先级筛选
  if (filters?.priority) {
    query = query.eq('priority', filters.priority as any)
  }

  // 按类型筛选
  if (filters?.task_type) {
    query = query.eq('task_type', filters.task_type as any)
  }

  // 按截止日期筛选
  if (filters?.due_before) {
    query = query.lte('due_date', filters.due_before.toISOString())
  }

  if (filters?.due_after) {
    query = query.gte('due_date', filters.due_after.toISOString())
  }

  const { data, error } = await query

  if (error) {
    throw handleSupabaseError(error)
  }

  return data || []
}

/**
 * 获取待处理任务
 */
export async function getPendingTasks(assigneeId?: string) {
  return getTasks({
    status: 'pending',
    assignee_id: assigneeId,
  })
}

/**
 * 获取我的任务（包括个人和系统分配的）
 */
export async function getMyTasks(userId: string) {
  // 按 assignee_id 过滤
  let query = supabase
    .from('tasks')
    .select('*')
    .order('due_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(50)
    .eq('status', 'pending' as any)
    .eq('assignee_id', userId as any)

  const { data, error } = await query

  if (error) {
    throw handleSupabaseError(error)
  }

  return data || []
}

/**
 * 获取过期任务
 */
export async function getOverdueTasks() {
  const now = new Date()
  return getTasks({
    status: 'pending',
    due_before: now,
  })
}

/**
 * 获取单个任务
 */
export async function getTaskById(id: string): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', id as any)
    .single()

  if (error) {
    throw handleSupabaseError(error)
  }

  return data as any
}

/**
 * 创建任务
 */
export async function createTask(task: TaskInsert) {
  // 如果未指定 assignee_id，自动设置为当前登录用户（满足 RLS 策略）
  let taskData = task
  if (!task.assignee_id) {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      taskData = {
        ...task,
        assignee_id: user.id,
        assignee_name: task.assignee_name || user.user_metadata?.full_name || user.email || 'Me',
      }
    }
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert(taskData as any)
    .select()
    .single()

  if (error) {
    throw handleSupabaseError(error)
  }

  return data as Task
}

/**
 * 批量创建任务
 */
export async function batchCreateTasks(tasks: TaskInsert[]) {
  // 自动为未指定 assignee_id 的任务设置当前用户（满足 RLS 策略）
  const { data: { user } } = await supabase.auth.getUser()
  const tasksData = tasks.map(task => {
    if (!task.assignee_id && user) {
      return {
        ...task,
        assignee_id: user.id,
        assignee_name: task.assignee_name || user.user_metadata?.full_name || user.email || 'Me',
      }
    }
    return task
  })

  const { data, error } = await supabase
    .from('tasks')
    .insert(tasksData as any)
    .select()

  if (error) {
    throw handleSupabaseError(error)
  }

  return data as any
}

/**
 * 更新任务
 */
export async function updateTask(id: string, updates: TaskUpdate) {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates as any)
    .eq('id', id as any)
    .select()
    .single()

  if (error) {
    throw handleSupabaseError(error)
  }

  return data as any
}

/**
 * 完成任务
 */
export async function completeTask(id: string) {
  return updateTask(id, {
    status: 'completed',
    completed_at: new Date().toISOString(),
  })
}

/**
 * 开始任务
 */
export async function startTask(id: string) {
  return updateTask(id, {
    status: 'in_progress',
  })
}

/**
 * 取消任务
 */
export async function cancelTask(id: string, reason?: string) {
  const updates: TaskUpdate = {
    status: 'cancelled',
  }

  if (reason) {
    updates.description = reason
  }

  return updateTask(id, updates)
}

/**
 * 删除任务
 */
export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id as any)

  if (error) {
    throw handleSupabaseError(error)
  }
}

/**
 * 获取任务统计
 */
export async function getTaskStats(userId?: string) {
  // 获取待处理任务数
  const { count: pendingCount } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending' as any)
    .eq('assignee_id', userId ?? '' as any)

  // 获取高优先级任务数
  const { count: highPriorityCount } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending' as any)
    .eq('priority', 'High' as any)
    .eq('assignee_id', userId ?? '' as any)

  // 获取过期任务数
  const { count: overdueCount } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending' as any)
    .lt('due_date', new Date().toISOString())
    .eq('assignee_id', userId ?? '' as any)

  return {
    pendingCount: pendingCount ?? 0,
    highPriorityCount: highPriorityCount ?? 0,
    overdueCount: overdueCount ?? 0,
  }
}

/**
 * 订阅任务变更
 */
export function subscribeToTasks(
  userId: string,
  callback: (payload: { data: Task[]; eventType: 'INSERT' | 'UPDATE' | 'DELETE' }) => void
) {
  return supabase
    .channel(`tasks-${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `assignee_id=eq.${userId}`,
      },
      (payload) => {
        callback({
          data: payload.new as Task[],
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
        })
      }
    )
    .subscribe()
}

/**
 * 获取供应商相关任务
 */
export async function getSupplierTasks(supplierId: string) {
  return getTasks({
    supplier_id: supplierId,
  })
}

/**
 * 搜索任务
 */
export async function searchTasks(searchTerm: string) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    throw handleSupabaseError(error)
  }

  return data || []
}

/**
 * 批量更新任务状态
 */
export async function batchUpdateTaskStatus(
  ids: string[],
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .update({
      status: status as any,
      ...(status === 'completed' ? { completed_at: new Date().toISOString() } : {}),
    } as any)
    .in('id', ids as any)

  if (error) {
    throw handleSupabaseError(error)
  }
}

/**
 * 批量分配任务
 */
export async function batchAssignTasks(
  ids: string[],
  assigneeId: string,
  assigneeName: string
): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .update({
      assignee_id: assigneeId as any,
      assignee_name: assigneeName as any,
    } as any)
    .in('id', ids as any)

  if (error) {
    throw handleSupabaseError(error)
  }
}

/**
 * 获取所有待处理任务（全局）
 */
export async function getAllPendingTasks() {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('status', 'pending' as any)
    .order('priority', { ascending: false })
    .order('due_date', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    throw handleSupabaseError(error)
  }

  return data || []
}

/**
 * 按优先级分组获取待处理任务
 */
export async function getPendingTasksByPriority() {
  const allPending = await getAllPendingTasks()

  return {
    high: allPending.filter(t => (t as any).priority === 'High'),
    medium: allPending.filter(t => (t as any).priority === 'Medium'),
    low: allPending.filter(t => (t as any).priority === 'Low'),
  }
}

/**
 * 删除已完成任务（清理）
 */
export async function deleteCompletedTasks(olderThanDays = 90): Promise<number> {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('status', 'completed' as any)
    .lt('completed_at', cutoffDate.toISOString() as any)

  if (error) {
    throw handleSupabaseError(error)
  }

  // 返回删除数量（注意：delete 不返回 affected rows）
  return 0
}
