/**
 * 通知面板组件
 * 用于显示系统通知列表
 */

import { useState, useRef, useEffect } from 'react'
import { Bell, X, Check, CheckCheck, Settings, Loader2 } from 'lucide-react'
import { cn } from '../lib/utils'
import { useNotifications, useUnreadNotificationCount, useMarkNotificationRead, useMarkAllNotificationsRead } from '../hooks/useNotifications'
import {
  getNotificationIcon,
  getNotificationColor,
  getPriorityColor,
  formatNotificationTime
} from '../services/notifications'
import { useNavigate } from 'react-router-dom'

interface NotificationPanelProps {
  className?: string
}

export function NotificationPanel({ className }: NotificationPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  // 获取通知数据
  const { data: notifications = [], isLoading } = useNotifications(10)
  const { data: unreadCount = 0 } = useUnreadNotificationCount()
  const markReadMutation = useMarkNotificationRead()
  const markAllReadMutation = useMarkAllNotificationsRead()

  // 点击外部关闭面板
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // 处理点击通知
  const handleNotificationClick = (notification: any) => {
    // 标记为已读
    if (!notification.is_read) {
      markReadMutation.mutate(notification.id)
    }

    // 跳转到相关页面
    if (notification.action_url) {
      navigate(notification.action_url)
    }

    setIsOpen(false)
  }

  // 标记全部已读
  const handleMarkAllRead = () => {
    markAllReadMutation.mutate()
  }

  return (
    <div className={cn('relative', className)} ref={panelRef}>
      {/* 通知铃铛按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* 通知下拉面板 */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-900">通知</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  disabled={markAllReadMutation.isPending}
                  className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  全部已读
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-slate-100 rounded text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 通知列表 */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 text-brand-500 animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                暂无通知
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      'p-3 hover:bg-slate-50 cursor-pointer transition-colors border-l-2',
                      notification.is_read ? 'border-transparent bg-white' : 'bg-blue-50/30',
                      getPriorityColor(notification.priority)
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg flex-shrink-0">
                        {getNotificationIcon(notification.notification_type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            'font-medium text-sm truncate',
                            notification.is_read ? 'text-slate-700' : 'text-slate-900'
                          )}>
                            {notification.title}
                          </span>
                          {!notification.is_read && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                          )}
                        </div>
                        {notification.message && (
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className={cn(
                            'text-[10px] px-1.5 py-0.5 rounded',
                            getNotificationColor(notification.notification_type)
                          )}>
                            {notification.notification_type}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {formatNotificationTime(notification.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50">
            <button
              onClick={() => {
                navigate('/notifications')
                setIsOpen(false)
              }}
              className="text-xs text-slate-500 hover:text-brand-600 w-full text-center py-1"
            >
              查看全部通知
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationPanel
