/**
 * 通知 Hook
 * 用于管理通知状态
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
  createNotification
} from '../services/notifications'
import type { CreateNotificationParams } from '../services/notifications'

/**
 * 获取通知列表的 Hook
 * @param limit 返回数量限制
 * @param unreadOnly 是否只返回未读
 */
export function useNotifications(limit: number = 20, unreadOnly: boolean = false) {
  return useQuery({
    queryKey: ['notifications', limit, unreadOnly],
    queryFn: () => getNotifications(limit, unreadOnly),
    staleTime: 30000, // 30秒内不重新获取
  })
}

/**
 * 获取未读通知数量的 Hook
 */
export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: ['unreadNotificationCount'],
    queryFn: getUnreadNotificationCount,
    staleTime: 30000,
  })
}

/**
 * 标记通知为已读的 Hook
 */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (notificationId: string) => markNotificationRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount'] })
    },
  })
}

/**
 * 标记所有通知为已读的 Hook
 */
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount'] })
    },
  })
}

/**
 * 创建通知的 Hook
 */
export function useCreateNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: CreateNotificationParams) => createNotification(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount'] })
    },
  })
}
