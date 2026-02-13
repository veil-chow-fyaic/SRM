// @ts-nocheck
/**
 * 考察任务服务
 *
 * 处理供应商考察期间的 probation_tasks 表 CRUD 操作
 * 用于生命周期管理中考察期供应商的任务跟踪
 */

import { supabase, handleSupabaseError } from '../lib/supabase'

/**
 * 考察任务状态枚举
 */
export type ProbationTaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed'

/**
 * 考察任务接口
 */
export interface ProbationTask {
  id: string
  supplier_id: string
  name: string
  description: string | null
  status: ProbationTaskStatus
  deadline: string
  created_at: string
}

/**
 * 考察任务创建参数
 */
export interface ProbationTaskCreate {
  supplier_id: string
  name: string
  description?: string
  status?: ProbationTaskStatus
  deadline: string
}

/**
 * 考察任务更新参数
 */
export interface ProbationTaskUpdate {
  name?: string
  description?: string
  status?: ProbationTaskStatus
  deadline?: string
}

/**
 * 获取供应商的考察任务列表
 *
 * @param supplierId - 供应商 ID
 * @returns 考察任务列表
 */
export async function getProbationTasks(supplierId: string): Promise<ProbationTask[]> {
  console.log('获取考察任务列表:', { supplierId })

  const { data, error } = await supabase
    .from('probation_tasks')
    .select('*')
    .eq('supplier_id', supplierId)
    .order('deadline', { ascending: true })

  if (error) {
    throw handleSupabaseError(error)
  }

  console.log(`找到 ${data?.length || 0} 个考察任务`)
  return data || []
}

/**
 * 获取单个考察任务
 *
 * @param taskId - 任务 ID
 * @returns 任务详情
 */
export async function getProbationTaskById(taskId: string): Promise<ProbationTask> {
  console.log('获取考察任务详情:', taskId)

  const { data, error } = await supabase
    .from('probation_tasks')
    .select('*')
    .eq('id', taskId)
    .single()

  if (error) {
    throw handleSupabaseError(error)
  }

  return data as ProbationTask
}

/**
 * 创建考察任务
 *
 * @param task - 任务创建参数
 * @returns 创建的任务
 */
export async function createProbationTask(task: ProbationTaskCreate): Promise<ProbationTask> {
  console.log('创建考察任务:', task)

  const { data, error } = await supabase
    .from('probation_tasks')
    .insert(task)
    .select()
    .single()

  if (error) {
    throw handleSupabaseError(error)
  }

  console.log('考察任务创建成功:', data)
  return data as ProbationTask
}

/**
 * 更新考察任务
 *
 * @param taskId - 任务 ID
 * @param updates - 更新内容
 * @returns 更新后的任务
 */
export async function updateProbationTask(
  taskId: string,
  updates: ProbationTaskUpdate
): Promise<ProbationTask> {
  console.log('更新考察任务:', { taskId, updates })

  const { data, error } = await supabase
    .from('probation_tasks')
    .update(updates)
    .eq('id', taskId)
    .select()
    .single()

  if (error) {
    throw handleSupabaseError(error)
  }

  console.log('考察任务更新成功:', data)
  return data as ProbationTask
}

/**
 * 删除考察任务
 *
 * @param taskId - 任务 ID
 * @returns 是否成功
 */
export async function deleteProbationTask(taskId: string): Promise<boolean> {
  console.log('删除考察任务:', taskId)

  const { error } = await supabase
    .from('probation_tasks')
    .delete()
    .eq('id', taskId)

  if (error) {
    throw handleSupabaseError(error)
  }

  console.log('考察任务删除成功')
  return true
}

/**
 * 获取供应商当前活跃的考察任务（用于生命周期管理）
 *
 * @param supplierId - 供应商 ID
 * @returns 活跃的考察任务（最新一个）
 */
export async function getActiveProbationTask(supplierId: string): Promise<ProbationTask | null> {
  console.log('获取活跃考察任务:', { supplierId })

  const { data, error } = await supabase
    .from('probation_tasks')
    .select('*')
    .eq('supplier_id', supplierId)
    .in('status', ['pending', 'in_progress'])
    .order('deadline', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw handleSupabaseError(error)
  }

  return data as ProbationTask | null
}

/**
 * 获取考察任务统计
 *
 * @param supplierId - 供应商 ID
 * @returns 统计信息
 */
export async function getProbationTaskStats(supplierId: string): Promise<{
  total: number
  pending: number
  in_progress: number
  completed: number
  failed: number
}> {
  const { data, error } = await supabase
    .from('probation_tasks')
    .select('status')
    .eq('supplier_id', supplierId)

  if (error) {
    throw handleSupabaseError(error)
  }

  const tasks = data || []

  return {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    failed: tasks.filter(t => t.status === 'failed').length,
  }
}

/**
 * 批量创建考察任务
 *
 * @param tasks - 任务创建参数数组
 * @returns 创建的任务数量
 */
export async function batchCreateProbationTasks(tasks: ProbationTaskCreate[]): Promise<number> {
  console.log('批量创建考察任务:', tasks.length)

  const { data, error } = await supabase
    .from('probation_tasks')
    .insert(tasks)
    .select()

  if (error) {
    throw handleSupabaseError(error)
  }

  console.log(`成功创建 ${data?.length || 0} 个考察任务`)
  return data?.length || 0
}

/**
 * 获取状态显示名称
 */
export function getStatusDisplayName(status: ProbationTaskStatus): string {
  const statusNames: Record<ProbationTaskStatus, string> = {
    'pending': '待处理',
    'in_progress': '进行中',
    'completed': '已完成',
    'failed': '失败'
  }
  return statusNames[status] || status
}

/**
 * 获取状态对应的颜色样式
 */
export function getStatusColorClass(status: ProbationTaskStatus): string {
  const colors: Record<ProbationTaskStatus, string> = {
    'pending': 'text-yellow-600 bg-yellow-50',
    'in_progress': 'text-blue-600 bg-blue-50',
    'completed': 'text-green-600 bg-green-50',
    'failed': 'text-red-600 bg-red-50'
  }
  return colors[status] || 'text-slate-600 bg-slate-50'
}
