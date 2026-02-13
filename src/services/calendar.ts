// @ts-nocheck
/**
 * 日历事件管理服务
 *
 * 处理全域拜访日历的事件 CRUD 操作
 */

import { supabase, handleSupabaseError } from '../lib/supabase'

/**
 * 事件类型枚举
 */
export type EventType = 'visit' | 'qbr' | 'dinner' | 'review' | 'call' | 'other'

/**
 * 事件状态枚举
 */
export type EventStatus = 'planned' | 'completed' | 'cancelled' | 'rescheduled'

/**
 * 日历事件接口
 */
export interface CalendarEvent {
  id: string
  title: string
  event_type: EventType
  status: EventStatus
  event_date: string
  supplier_id: string | null
  participants: string[] | null
  notes: string | null
  location: string | null
  duration_minutes: number | null
  created_by: string | null
  created_at: string
  updated_at: string
}

/**
 * 日历事件创建参数
 */
export interface CalendarEventCreate {
  title: string
  event_type: EventType
  event_date: string
  supplier_id?: string
  participants?: string[]
  notes?: string
  location?: string
  duration_minutes?: number
}

/**
 * 日历事件更新参数
 */
export interface CalendarEventUpdate {
  title?: string
  event_type?: EventType
  status?: EventStatus
  event_date?: string
  supplier_id?: string
  participants?: string[]
  notes?: string
  location?: string
  duration_minutes?: number
}

/**
 * 获取日历事件列表
 *
 * @param startDate - 开始日期
 * @param endDate - 结束日期
 * @param supplierId - 可选，按供应商筛选
 * @param status - 可选，按状态筛选
 * @returns 事件列表
 */
export async function getCalendarEvents(
  startDate: string,
  endDate: string,
  supplierId?: string,
  status?: EventStatus
): Promise<CalendarEvent[]> {
  console.log('获取日历事件:', { startDate, endDate, supplierId, status })

  let query = supabase
    .from('calendar_events')
    .select('*')
    .gte('event_date', startDate)
    .lte('event_date', endDate)
    .order('event_date', { ascending: true })

  if (supplierId) {
    query = query.eq('supplier_id', supplierId)
  }

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) {
    throw handleSupabaseError(error)
  }

  console.log(`找到 ${data?.length || 0} 个日历事件`)
  return data || []
}

/**
 * 获取日历事件详情
 *
 * @param eventId - 事件 ID
 * @returns 事件详情
 */
export async function getCalendarEventById(eventId: string): Promise<CalendarEvent> {
  console.log('获取日历事件详情:', eventId)

  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('id', eventId)
    .single()

  if (error) {
    throw handleSupabaseError(error)
  }

  return data as CalendarEvent
}

/**
 * 创建日历事件
 *
 * @param event - 事件创建参数
 * @returns 创建的事件
 */
export async function createCalendarEvent(event: CalendarEventCreate): Promise<CalendarEvent> {
  console.log('创建日历事件:', event)

  const { data, error } = await supabase
    .from('calendar_events')
    .insert(event)
    .select()
    .single()

  if (error) {
    throw handleSupabaseError(error)
  }

  console.log('日历事件创建成功:', data)
  return data as CalendarEvent
}

/**
 * 更新日历事件
 *
 * @param eventId - 事件 ID
 * @param updates - 更新内容
 * @returns 更新后的事件
 */
export async function updateCalendarEvent(
  eventId: string,
  updates: CalendarEventUpdate
): Promise<CalendarEvent> {
  console.log('更新日历事件:', { eventId, updates })

  const { data, error } = await supabase
    .from('calendar_events')
    .update(updates)
    .eq('id', eventId)
    .select()
    .single()

  if (error) {
    throw handleSupabaseError(error)
  }

  console.log('日历事件更新成功:', data)
  return data as CalendarEvent
}

/**
 * 删除日历事件
 *
 * @param eventId - 事件 ID
 * @returns 是否成功
 */
export async function deleteCalendarEvent(eventId: string): Promise<boolean> {
  console.log('删除日历事件:', eventId)

  const { error } = await supabase
    .from('calendar_events')
    .delete()
    .eq('id', eventId)

  if (error) {
    throw handleSupabaseError(error)
  }

  console.log('日历事件删除成功')
  return true
}

/**
 * 批量更新事件状态
 *
 * @param eventIds - 事件 ID 数组
 * @param status - 新状态
 * @returns 更新的事件数量
 */
export async function batchUpdateEventStatus(
  eventIds: string[],
  status: EventStatus
): Promise<number> {
  console.log('批量更新事件状态:', { eventIds, status })

  const { data, error } = await supabase
    .from('calendar_events')
    .update({ status })
    .in('id', eventIds)
    .select()

  if (error) {
    throw handleSupabaseError(error)
  }

  console.log(`成功更新 ${data?.length || 0} 个事件状态`)
  return data?.length || 0
}

/**
 * 获取事件类型的显示名称
 */
export function getEventTypeName(type: EventType): string {
  const typeNames: Record<EventType, string> = {
    'visit': '供应商拜访',
    'qbr': '季度业务回顾',
    'dinner': '商务宴请',
    'review': '评审会议',
    'call': '电话会议',
    'other': '其他'
  }
  return typeNames[type] || type
}

/**
 * 获取事件状态的显示名称
 */
export function getEventStatusName(status: EventStatus): string {
  const statusNames: Record<EventStatus, string> = {
    'planned': '计划中',
    'completed': '已完成',
    'cancelled': '已取消',
    'rescheduled': '已改期'
  }
  return statusNames[status] || status
}

/**
 * 获取事件状态对应的颜色样式
 */
export function getEventStatusColor(status: EventStatus): string {
  const colors: Record<EventStatus, string> = {
    'planned': 'bg-blue-100 text-blue-700 border-blue-200',
    'completed': 'bg-green-100 text-green-700 border-green-200',
    'cancelled': 'bg-red-100 text-red-700 border-red-200',
    'rescheduled': 'bg-yellow-100 text-yellow-700 border-yellow-200'
  }
  return colors[status]
}

/**
 * 获取事件类型对应的图标
 */
export function getEventTypeIcon(type: EventType): string {
  const icons: Record<EventType, string> = {
    'visit': '🏢',
    'qbr': '📊',
    'dinner': '🍽️',
    'review': '📋',
    'call': '📞',
    'other': '📅'
  }
  return icons[type]
}

/**
 * 统一日历事件接口（包括日历事件、互动日志、个人计划）
 */
export interface UnifiedCalendarEvent {
  id: string
  title: string
  event_date: string
  event_type: string
  status: string
  supplier_id: string | null
  source: 'calendar' | 'engagement' | 'plan'
}

/**
 * 获取日历所有相关事件（日历事件 + 互动日志 + 个人计划）
 *
 * @param year - 年份
 * @param month - 月份 (0-11)
 * @returns 统一格式的事件列表
 */
export async function getCalendarAllEvents(
  year: number,
  month: number
): Promise<UnifiedCalendarEvent[]> {
  console.log('获取日历所有事件:', { year, month: month + 1 })

  try {
    const { data, error } = await supabase.rpc('get_calendar_all_events', {
      p_year: year,
      p_month: month + 1  // PostgreSQL 月份是 1-12
    })

    if (error) {
      console.error('获取日历事件失败:', error)
      return []
    }

    return (data as UnifiedCalendarEvent[]) || []
  } catch (err) {
    console.error('获取日历事件异常:', err)
    return []
  }
}
