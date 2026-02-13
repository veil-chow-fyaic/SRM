/**
 * 个人计划服务
 * 用于管理用户的个人计划和日历同步
 */

// @ts-nocheck - 临时禁用类型检查，等待 Supabase 类型生成更新
import { supabase } from '../lib/supabase'
import type {
  PersonalPlan,
  CreatePersonalPlanParams,
  SyncPlanToCalendarResult,
  PlanType
} from '../types/database'

/**
 * 获取用户的个人计划列表
 * @param startDate 开始日期 (可选)
 * @param endDate 结束日期 (可选)
 */
export async function getPersonalPlans(
  startDate?: string,
  endDate?: string
): Promise<PersonalPlan[]> {
  try {
    const { data, error } = await supabase.rpc('get_personal_plans', {
      p_start_date: startDate || null,
      p_end_date: endDate || null
    })

    if (error) {
      console.error('获取个人计划失败:', error)
      return []
    }

    return (data as PersonalPlan[]) || []
  } catch (err) {
    console.error('获取个人计划异常:', err)
    return []
  }
}

/**
 * 创建个人计划
 * @param plan 计划数据
 */
export async function createPersonalPlan(
  plan: CreatePersonalPlanParams
): Promise<PersonalPlan | null> {
  try {
    // 获取当前登录用户，用于 RLS 策略
    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: plan.title,
        description: plan.description || null,
        plan_type: plan.plan_type || 'task',
        priority: plan.priority || 'Medium',
        due_date: plan.due_date || null,
        start_time: plan.start_time || null,
        end_time: plan.end_time || null,
        location: plan.location || null,
        supplier_id: plan.supplier_id || null,
        assignee_id: user?.id || null,
        assignee_name: user?.user_metadata?.full_name || user?.email || 'Me',
        source: 'Personal',
        status: 'pending',
        sync_to_calendar: plan.sync_to_calendar ?? true
      })
      .select()
      .single()

    if (error) {
      console.error('创建个人计划失败:', error)
      return null
    }

    // 如果需要同步到日历，自动同步
    if (plan.sync_to_calendar && data) {
      await syncPlanToCalendar(data.id, true)
    }

    return data as PersonalPlan
  } catch (err) {
    console.error('创建个人计划异常:', err)
    return null
  }
}

/**
 * 更新个人计划
 * @param planId 计划ID
 * @param updates 更新数据
 */
export async function updatePersonalPlan(
  planId: string,
  updates: Partial<CreatePersonalPlanParams & { status?: string }>
): Promise<PersonalPlan | null> {
  try {
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    }

    if (updates.title !== undefined) updateData.title = updates.title
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.plan_type !== undefined) updateData.plan_type = updates.plan_type
    if (updates.priority !== undefined) updateData.priority = updates.priority
    if (updates.due_date !== undefined) updateData.due_date = updates.due_date
    if (updates.start_time !== undefined) updateData.start_time = updates.start_time
    if (updates.end_time !== undefined) updateData.end_time = updates.end_time
    if (updates.location !== undefined) updateData.location = updates.location
    if (updates.status !== undefined) {
      updateData.status = updates.status
      if (updates.status === 'completed') {
        updateData.completed_at = new Date().toISOString()
      }
    }

    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', planId)
      .select()
      .single()

    if (error) {
      console.error('更新个人计划失败:', error)
      return null
    }

    // 如果已同步到日历，更新日历事件
    if (data.sync_to_calendar) {
      await syncPlanToCalendar(planId, true)
    }

    return data as PersonalPlan
  } catch (err) {
    console.error('更新个人计划异常:', err)
    return null
  }
}

/**
 * 删除个人计划
 * @param planId 计划ID
 */
export async function deletePersonalPlan(planId: string): Promise<boolean> {
  try {
    // 先删除关联的日历事件
    await syncPlanToCalendar(planId, false)

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', planId)

    if (error) {
      console.error('删除个人计划失败:', error)
      return false
    }

    return true
  } catch (err) {
    console.error('删除个人计划异常:', err)
    return false
  }
}

/**
 * 同步计划到日历
 * @param taskId 任务ID
 * @param createEvent 是否创建/更新事件（false 表示删除）
 */
export async function syncPlanToCalendar(
  taskId: string,
  createEvent: boolean
): Promise<SyncPlanToCalendarResult> {
  try {
    const { data, error } = await supabase.rpc('sync_plan_to_calendar', {
      p_task_id: taskId,
      p_create_event: createEvent
    })

    if (error) {
      console.error('同步计划到日历失败:', error)
      return {
        success: false,
        error: error.message
      }
    }

    return data as SyncPlanToCalendarResult
  } catch (err) {
    console.error('同步计划到日历异常:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : '未知错误'
    }
  }
}

/**
 * 获取计划类型的中文标签
 */
export function getPlanTypeLabel(planType: PlanType): string {
  const labels: Record<PlanType, string> = {
    visit: '拜访',
    meeting: '会议',
    call: '电话',
    task: '任务',
    reminder: '提醒',
    other: '其他'
  }
  return labels[planType] || planType
}

/**
 * 获取计划类型的颜色
 */
export function getPlanTypeColor(planType: PlanType): string {
  const colors: Record<PlanType, string> = {
    visit: 'bg-purple-100 text-purple-700 border-purple-200',
    meeting: 'bg-blue-100 text-blue-700 border-blue-200',
    call: 'bg-green-100 text-green-700 border-green-200',
    task: 'bg-amber-100 text-amber-700 border-amber-200',
    reminder: 'bg-red-100 text-red-700 border-red-200',
    other: 'bg-slate-100 text-slate-700 border-slate-200'
  }
  return colors[planType] || colors.other
}

/**
 * 获取计划类型的图标名称
 */
export function getPlanTypeIcon(planType: PlanType): string {
  const icons: Record<PlanType, string> = {
    visit: '🗺️',
    meeting: '👥',
    call: '📞',
    task: '✅',
    reminder: '⏰',
    other: '📌'
  }
  return icons[planType] || icons.other
}
