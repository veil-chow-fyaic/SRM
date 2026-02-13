/**
 * 通知服务
 * 用于管理系统通知
 */

// @ts-nocheck - 临时禁用类型检查，等待 Supabase 类型生成更新
import { supabase } from '../lib/supabase'

// 通知类型
export type NotificationType = 'system' | 'alert' | 'task' | 'supplier' | 'info'
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent'

// 通知接口
export interface Notification {
  id: string
  title: string
  message: string | null
  notification_type: NotificationType
  related_id: string | null
  related_type: string | null
  is_read: boolean
  read_at: string | null
  priority: NotificationPriority
  action_url: string | null
  created_at: string
}

// 创建通知参数
export interface CreateNotificationParams {
  title: string
  message?: string
  notification_type?: NotificationType
  related_id?: string
  related_type?: string
  priority?: NotificationPriority
  action_url?: string
}

/**
 * 获取通知列表
 * @param limit 返回数量限制
 * @param unreadOnly 是否只返回未读
 */
export async function getNotifications(
  limit: number = 20,
  unreadOnly: boolean = false
): Promise<Notification[]> {
  try {
    const { data, error } = await supabase.rpc('get_notifications', {
      p_limit: limit,
      p_unread_only: unreadOnly
    })

    if (error) {
      console.error('获取通知失败:', error)
      return []
    }

    return (data as Notification[]) || []
  } catch (err) {
    console.error('获取通知异常:', err)
    return []
  }
}

/**
 * 获取未读通知数量
 */
export async function getUnreadNotificationCount(): Promise<number> {
  try {
    const { data, error } = await supabase.rpc('get_unread_notification_count')

    if (error) {
      console.error('获取未读数量失败:', error)
      return 0
    }

    return data || 0
  } catch (err) {
    console.error('获取未读数量异常:', err)
    return 0
  }
}

/**
 * 标记通知为已读
 * @param notificationId 通知ID
 */
export async function markNotificationRead(notificationId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('mark_notification_read', {
      p_notification_id: notificationId
    })

    if (error) {
      console.error('标记已读失败:', error)
      return false
    }

    return data || false
  } catch (err) {
    console.error('标记已读异常:', err)
    return false
  }
}

/**
 * 标记所有通知为已读
 */
export async function markAllNotificationsRead(): Promise<number> {
  try {
    const { data, error } = await supabase.rpc('mark_all_notifications_read')

    if (error) {
      console.error('标记全部已读失败:', error)
      return 0
    }

    return data || 0
  } catch (err) {
    console.error('标记全部已读异常:', err)
    return 0
  }
}

/**
 * 创建通知
 * @param params 通知参数
 */
export async function createNotification(params: CreateNotificationParams): Promise<Notification | null> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        title: params.title,
        message: params.message || null,
        notification_type: params.notification_type || 'info',
        related_id: params.related_id || null,
        related_type: params.related_type || null,
        priority: params.priority || 'normal',
        action_url: params.action_url || null
      })
      .select()
      .single()

    if (error) {
      console.error('创建通知失败:', error)
      return null
    }

    return data as Notification
  } catch (err) {
    console.error('创建通知异常:', err)
    return null
  }
}

/**
 * 获取通知类型图标
 */
export function getNotificationIcon(type: NotificationType): string {
  const icons: Record<NotificationType, string> = {
    system: '⚙️',
    alert: '⚠️',
    task: '📋',
    supplier: '🏢',
    info: 'ℹ️'
  }
  return icons[type] || icons.info
}

/**
 * 获取通知类型颜色
 */
export function getNotificationColor(type: NotificationType): string {
  const colors: Record<NotificationType, string> = {
    system: 'bg-slate-100 text-slate-700',
    alert: 'bg-red-100 text-red-700',
    task: 'bg-blue-100 text-blue-700',
    supplier: 'bg-green-100 text-green-700',
    info: 'bg-purple-100 text-purple-700'
  }
  return colors[type] || colors.info
}

/**
 * 获取优先级颜色
 */
export function getPriorityColor(priority: NotificationPriority): string {
  const colors: Record<NotificationPriority, string> = {
    low: 'border-slate-200',
    normal: 'border-slate-200',
    high: 'border-amber-300',
    urgent: 'border-red-400'
  }
  return colors[priority] || colors.normal
}

/**
 * 格式化时间
 */
export function formatNotificationTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  if (hours < 24) return `${hours} 小时前`
  if (days < 7) return `${days} 天前`

  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}
