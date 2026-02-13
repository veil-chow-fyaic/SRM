/**
 * 日历事件相关的 React Query Hooks
 *
 * 封装日历事件数据的获取和变更操作
 */

import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getCalendarEvents,
  getCalendarAllEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  batchUpdateEventStatus,
  type CalendarEvent,
  type CalendarEventCreate,
  type UnifiedCalendarEvent,
  type EventStatus,
  type EventType
} from '../services/calendar'

// 重新导出类型供外部使用
export type { EventType, EventStatus, CalendarEvent, CalendarEventCreate, UnifiedCalendarEvent }

/**
 * 获取指定月份的日历事件
 */
export function useCalendarEvents(year: number, month: number) {
  const startDate = new Date(year, month, 1)
  const endDate = new Date(year, month + 1, 0, 23, 59, 59)

  return useQuery({
    queryKey: ['calendar-events', year, month],
    queryFn: () => getCalendarEvents(
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    ),
    enabled: !isNaN(startDate.getTime()) && !isNaN(endDate.getTime()),
    staleTime: 1000 * 60 * 5, // 5 分钟
  })
}

/**
 * 创建日历事件 Mutation
 */
export function useCreateCalendarEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createCalendarEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
    },
  })
}

/**
 * 更新日历事件 Mutation
 */
export function useUpdateCalendarEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventId, updates }: { eventId: string; updates: Parameters<typeof updateCalendarEvent>[1] }) =>
      updateCalendarEvent(eventId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
    },
  })
}

/**
 * 删除日历事件 Mutation
 */
export function useDeleteCalendarEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteCalendarEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
    },
  })
}

/**
 * 批量更新事件状态 Mutation
 */
export function useBatchUpdateEventStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventIds, status }: { eventIds: string[]; status: EventStatus }) =>
      batchUpdateEventStatus(eventIds, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
    },
  })
}

/**
 * 按日期分组事件 (用于日历显示)
 * 现在包含：日历事件 + 互动日志 + 个人计划
 */
export function useEventsByDate(year: number, month: number) {
  // 使用统一的 RPC 函数获取所有事件
  const { data: allEvents, isLoading } = useQuery({
    queryKey: ['calendar-all-events', year, month],
    queryFn: () => getCalendarAllEvents(year, month),
    staleTime: 1000 * 60 * 5, // 5 分钟
  })

  const eventsByDate = React.useMemo(() => {
    if (!allEvents) return {}

    return allEvents.reduce((acc, event) => {
      const date = new Date(event.event_date)
      const day = date.getDate()

      if (!acc[day]) {
        acc[day] = []
      }

      acc[day].push({
        id: event.id,
        title: event.title,
        type: event.event_type as EventType,
        status: event.status as EventStatus,
        supplierId: event.supplier_id,
        source: event.source
      })

      return acc
    }, {} as Record<number, Array<{
      id: string
      title: string
      type: EventType
      status: EventStatus
      supplierId: string | null
      source: string
    }>>)
  }, [allEvents])

  return { eventsByDate, isLoading, events: allEvents }
}
