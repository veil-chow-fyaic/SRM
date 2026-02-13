/**
 * 日历事件 React Query Hooks
 *
 * 提供日历事件列表查询、创建、更新、删除等功能
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getCalendarEvents,
  getCalendarEventById,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  batchUpdateEventStatus,
  type CalendarEventCreate,
  type CalendarEventUpdate,
  type EventType,
  type EventStatus
} from '../services/calendar'

/**
 * 获取日历事件列表
 */
export function useCalendarEvents(
  startDate: string | undefined,
  endDate: string | undefined,
  supplierId?: string,
  status?: EventStatus
) {
  return useQuery({
    queryKey: ['calendar-events', startDate, endDate, supplierId, status],
    queryFn: () => getCalendarEvents(startDate!, endDate!, supplierId, status),
    enabled: !!startDate && !!endDate,
    staleTime: 1000 * 60 * 2, // 2 分钟内数据视为新鲜
  })
}

/**
 * 获取日历事件详情
 */
export function useCalendarEvent(eventId: string | undefined) {
  return useQuery({
    queryKey: ['calendar-event', eventId],
    queryFn: () => getCalendarEventById(eventId!),
    enabled: !!eventId,
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * 创建日历事件 Mutation
 */
export function useCreateCalendarEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: { event: CalendarEventCreate }) => {
      return await createCalendarEvent(params.event)
    },
    onSuccess: () => {
      // 创建成功后，使日历事件缓存失效
      queryClient.invalidateQueries({
        queryKey: ['calendar-events']
      })
    },
  })
}

/**
 * 更新日历事件 Mutation
 */
export function useUpdateCalendarEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: { eventId: string; updates: CalendarEventUpdate }) => {
      return await updateCalendarEvent(params.eventId, params.updates)
    },
    onSuccess: (_data, variables) => {
      // 使详情缓存失效
      queryClient.invalidateQueries({
        queryKey: ['calendar-event', variables.eventId]
      })
      // 使列表缓存失效
      queryClient.invalidateQueries({
        queryKey: ['calendar-events']
      })
    },
  })
}

/**
 * 删除日历事件 Mutation
 */
export function useDeleteCalendarEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: { eventId: string }) => {
      return await deleteCalendarEvent(params.eventId)
    },
    onSuccess: () => {
      // 使日历事件缓存失效
      queryClient.invalidateQueries({
        queryKey: ['calendar-events']
      })
    },
  })
}

/**
 * 批量更新事件状态 Mutation
 */
export function useBatchUpdateEventStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: { eventIds: string[]; status: EventStatus }) => {
      return await batchUpdateEventStatus(params.eventIds, params.status)
    },
    onSuccess: () => {
      // 使日历事件缓存失效
      queryClient.invalidateQueries({
        queryKey: ['calendar-events']
      })
    },
  })
}

/**
 * 完成事件 Mutation（便捷方法）
 */
export function useCompleteEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: { eventId: string }) => {
      return await updateCalendarEvent(params.eventId, { status: 'completed' })
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['calendar-event', variables.eventId]
      })
      queryClient.invalidateQueries({
        queryKey: ['calendar-events']
      })
    },
  })
}

/**
 * 取消事件 Mutation（便捷方法）
 */
export function useCancelEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: { eventId: string }) => {
      return await updateCalendarEvent(params.eventId, { status: 'cancelled' })
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['calendar-event', variables.eventId]
      })
      queryClient.invalidateQueries({
        queryKey: ['calendar-events']
      })
    },
  })
}

/**
 * 事件类型类型守卫
 */
export function isValidEventType(type: string): type is EventType {
  return ['visit', 'qbr', 'dinner', 'review', 'call', 'other'].includes(type)
}

/**
 * 事件状态类型守卫
 */
export function isValidEventStatus(status: string): status is EventStatus {
  return ['planned', 'completed', 'cancelled', 'rescheduled'].includes(status)
}
