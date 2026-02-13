// @ts-nocheck
/**
 * 互动日志服务
 *
 * 封装所有与 engagement_logs 表相关的 API 调用
 * 实现 PACD 双维日志系统
 */

import { supabase, handleSupabaseError } from '../lib/supabase'
import type {
  EngagementLog,
  EngagementLogInsert,
  EngagementLogUpdate,
  LogStatus,
  LogType
} from '../types/database'

/**
 * 筛选参数接口
 */
export interface EngagementLogFilters {
  supplierId: string
  status?: LogStatus | LogStatus[]
  logType?: LogType | LogType[]
  dateFrom?: string
  dateTo?: string
  limit?: number
}

/**
 * 获取供应商的互动日志列表
 */
export async function getEngagementLogs(supplierId: string, limit = 50) {
  const { data, error } = await supabase
    .from('engagement_logs')
    .select('*')
    .eq('supplier_id', supplierId)
    .order('planned_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw handleSupabaseError(error)
  }

  return data || []
}

/**
 * 获取特定状态的互动日志
 */
export async function getEngagementLogsByStatus(
  supplierId: string,
  status: 'planned' | 'completed' | 'cancelled'
) {
  const { data, error } = await supabase
    .from('engagement_logs')
    .select('*')
    .eq('supplier_id', supplierId)
    .eq('status', status)
    .order('planned_date', { ascending: true })

  if (error) {
    throw handleSupabaseError(error)
  }

  return data || []
}

/**
 * 获取单个互动日志
 */
export async function getEngagementLogById(id: string): Promise<EngagementLog> {
  const { data, error } = await supabase
    .from('engagement_logs')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw handleSupabaseError(error)
  }

  return data
}

/**
 * 创建互动日志（PACD 模型）
 *
 * P - Plan: 计划阶段
 * A - Action: 执行阶段
 * C - Content: 内容阶段（双维维护）
 * D - Delivery: 交付阶段
 */
export async function createEngagementLog(log: EngagementLogInsert) {
  const { data, error } = await supabase
    .from('engagement_logs')
    .insert(log)
    .select()
    .single()

  if (error) {
    throw handleSupabaseError(error)
  }

  return data
}

/**
 * 更新互动日志状态
 * 用于将计划中的日志标记为完成
 */
export async function completeEngagementLog(
  id: string,
  completionData: {
    rating?: number
    outcome?: string
    dimension_basic?: string
    dimension_business?: string
    dimension_decision?: string
    dimension_derivative?: string
    next_steps?: string
  }
) {
  const { data, error } = await supabase
    .from('engagement_logs')
    .update({
      status: 'completed',
      ...completionData,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw handleSupabaseError(error)
  }

  return data
}

/**
 * 更新互动日志
 */
export async function updateEngagementLog(
  id: string,
  updates: EngagementLogUpdate
) {
  const { data, error } = await supabase
    .from('engagement_logs')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw handleSupabaseError(error)
  }

  return data
}

/**
 * 删除互动日志
 */
export async function deleteEngagementLog(id: string): Promise<void> {
  const { error } = await supabase
    .from('engagement_logs')
    .delete()
    .eq('id', id)

  if (error) {
    throw handleSupabaseError(error)
  }
}

/**
 * 获取近期需要跟进的日志（已完成但有待办事项）
 */
export async function getPendingFollowUps(supplierId?: string) {
  let query = supabase
    .from('engagement_logs')
    .select('*')
    .eq('status', 'completed')
    .not('next_steps', 'is', null)
    .order('created_at', { ascending: false })
    .limit(20)

  if (supplierId) {
    query = query.eq('supplier_id', supplierId)
  }

  const { data, error } = await query

  if (error) {
    throw handleSupabaseError(error)
  }

  return data || []
}

/**
 * 获取统计信息
 */
export async function getEngagementStats(supplierId: string) {
  // 获取总次数
  const { count: totalCount } = await supabase
    .from('engagement_logs')
    .select('*', { count: 'exact', head: true })
    .eq('supplier_id', supplierId)

  // 获取已完成次数
  const { count: completedCount } = await supabase
    .from('engagement_logs')
    .select('*', { count: 'exact', head: true })
    .eq('supplier_id', supplierId)
    .eq('status', 'completed')

  // 获取平均评分
  const { data: ratings } = await supabase
    .from('engagement_logs')
    .select('rating')
    .eq('supplier_id', supplierId)
    .eq('status', 'completed')
    .not('rating', 'is', null)

  const avgRating = ratings && ratings.length > 0
    ? ratings.reduce((sum, r) => sum + (r.rating ?? 0), 0) / ratings.length
    : null

  return {
    totalCount: totalCount ?? 0,
    completedCount: completedCount ?? 0,
    avgRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
  }
}

/**
 * 订阅互动日志变更
 */
export function subscribeToEngagementLogs(
  supplierId: string,
  callback: (payload: { data: EngagementLog[]; eventType: 'INSERT' | 'UPDATE' | 'DELETE' }) => void
) {
  return supabase
    .channel(`engagement-logs-${supplierId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'engagement_logs',
        filter: `supplier_id=eq.${supplierId}`,
      },
      (payload) => {
        callback({
          data: payload.new as EngagementLog[],
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
        })
      }
    )
    .subscribe()
}

/**
 * 按筛选条件获取互动日志
 */
export async function getEngagementLogsByFilters(filters: EngagementLogFilters) {
  let query = supabase
    .from('engagement_logs')
    .select('*')
    .eq('supplier_id', filters.supplierId)

  // 按状态筛选
  if (filters.status) {
    if (Array.isArray(filters.status)) {
      query = query.in('status', filters.status)
    } else {
      query = query.eq('status', filters.status)
    }
  }

  // 按类型筛选
  if (filters.logType) {
    if (Array.isArray(filters.logType)) {
      query = query.in('log_type', filters.logType)
    } else {
      query = query.eq('log_type', filters.logType)
    }
  }

  // 按日期范围筛选
  if (filters.dateFrom) {
    query = query.gte('planned_date', filters.dateFrom)
  }
  if (filters.dateTo) {
    query = query.lte('planned_date', filters.dateTo)
  }

  // 排序和限制
  query = query
    .order('planned_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(filters.limit || 50)

  const { data, error } = await query

  if (error) {
    throw handleSupabaseError(error)
  }

  return data || []
}

/**
 * 获取最近的互动日志
 */
export async function getRecentEngagementLogs(supplierId: string, days = 30) {
  const { data, error } = await supabase
    .from('engagement_logs')
    .select('*')
    .eq('supplier_id', supplierId)
    .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    throw handleSupabaseError(error)
  }

  return data || []
}

/**
 * 批量更新互动日志状态
 */
export async function batchUpdateEngagementLogStatus(
  ids: string[],
  status: LogStatus
): Promise<void> {
  const { error } = await supabase
    .from('engagement_logs')
    .update({ status })
    .in('id', ids)

  if (error) {
    throw handleSupabaseError(error)
  }
}

/**
 * 取消计划的互动日志
 */
export async function cancelEngagementLog(
  id: string,
  reason?: string
): Promise<EngagementLog> {
  const { data, error } = await supabase
    .from('engagement_logs')
    .update({
      status: 'cancelled',
      action_remarks: reason || 'Cancelled by user',
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw handleSupabaseError(error)
  }

  return data
}

/**
 * 获取供应商的互动时间线
 * 返回按日期分组的互动记录
 */
export async function getEngagementTimeline(supplierId: string, months = 6) {
  const { data, error } = await supabase
    .from('engagement_logs')
    .select('*')
    .eq('supplier_id', supplierId)
    .gte('created_at', new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: true })

  if (error) {
    throw handleSupabaseError(error)
  }

  const logs = data || []

  // 按月份分组
  const timeline: Record<string, EngagementLog[]> = {}
  logs.forEach(log => {
    const date = new Date(log.created_at || '')
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    if (!timeline[key]) timeline[key] = []
    timeline[key].push(log)
  })

  return timeline
}

/**
 * 获取互动维度汇总
 * 统计各维度（basic, business, decision, derivative）的记录数
 */
export async function getEngagementDimensionSummary(supplierId: string) {
  const { data, error } = await supabase
    .from('engagement_logs')
    .select('dimension_basic, dimension_business, dimension_decision, dimension_derivative')
    .eq('supplier_id', supplierId)
    .eq('status', 'completed')
    .not('dimension_basic', 'is', null)

  if (error) {
    throw handleSupabaseError(error)
  }

  const logs = data || []

  return {
    total: logs.length,
    withBasicInfo: logs.filter(l => l.dimension_basic && l.dimension_basic.trim().length > 0).length,
    withBusinessInfo: logs.filter(l => l.dimension_business && l.dimension_business.trim().length > 0).length,
    withDecisionInfo: logs.filter(l => l.dimension_decision && l.dimension_decision.trim().length > 0).length,
    withDerivativeInfo: logs.filter(l => l.dimension_derivative && l.dimension_derivative.trim().length > 0).length,
  }
}

/**
 * 搜索互动日志
 */
export async function searchEngagementLogs(
  supplierId: string,
  searchTerm: string
) {
  const { data, error } = await supabase
    .from('engagement_logs')
    .select('*')
    .eq('supplier_id', supplierId)
    .or(`title.ilike.%${searchTerm}%,outcome.ilike.%${searchTerm}%,dimension_basic.ilike.%${searchTerm}%,dimension_business.ilike.%${searchTerm}%`)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    throw handleSupabaseError(error)
  }

  return data || []
}

/**
 * 获取所有互动日志（全局日志流，不限定供应商）
 */
export async function getAllEngagementLogs(limit = 50) {
  const { data, error } = await supabase
    .from('engagement_logs')
    .select(`
      *,
      supplier:supplier_id(name, code)
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw handleSupabaseError(error)
  }

  return data || []
}

/**
 * 全局搜索互动日志（跨所有供应商）
 */
export async function searchAllEngagementLogs(searchTerm: string, limit = 50) {
  const { data, error } = await supabase
    .from('engagement_logs')
    .select(`
      *,
      supplier:supplier_id(name, code)
    `)
    .or(`title.ilike.%${searchTerm}%,outcome.ilike.%${searchTerm}%,dimension_basic.ilike.%${searchTerm}%,dimension_business.ilike.%${searchTerm}%,dimension_decision.ilike.%${searchTerm}%,dimension_derivative.ilike.%${searchTerm}%`)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw handleSupabaseError(error)
  }

  return data || []
}
