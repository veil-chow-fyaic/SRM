/**
 * ProtectedRoute - 受保护路由组件
 *
 * 用于保护需要认证才能访问的页面
 */

import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  /** 重定向路径，默认为 /login */
  redirectTo?: string
}

/**
 * 受保护路由组件
 *
 * 如果用户未登录，重定向到登录页
 * 如果用户已登录，渲染子组件
 *
 * @example
 * ```tsx
 * <ProtectedRoute>
 *   <DashboardPage />
 * </ProtectedRoute>
 * ```
 */
export function ProtectedRoute({
  children,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()

  // 显示加载状态
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4" />
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  // 未登录，重定向到登录页
  if (!user) {
    return <Navigate to={redirectTo} replace />
  }

  // 已登录，渲染子组件
  return <>{children}</>
}

/**
 * PublicRoute - 公共路由组件
 *
 * 如果用户已登录，重定向到指定页面（通常为首页）
 * 如果用户未登录，渲染子组件（登录/注册页）
 *
 * @example
 * ```tsx
 * <PublicRoute redirectTo="/">
 *   <LoginPage />
 * </PublicRoute>
 * ```
 */
interface PublicRouteProps {
  children: React.ReactNode
  /** 重定向路径，默认为 / */
  redirectTo?: string
}

export function PublicRoute({
  children,
  redirectTo = '/',
}: PublicRouteProps) {
  const { user, loading } = useAuth()

  // 显示加载状态
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4" />
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  // 已登录，重定向到首页
  if (user) {
    return <Navigate to={redirectTo} replace />
  }

  // 未登录，渲染子组件
  return <>{children}</>
}
