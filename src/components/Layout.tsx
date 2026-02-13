/**
 * Layout 组件 - 主布局
 *
 * 包含侧边栏和顶部导航，使用 Outlet 渲染子路由
 */

import React, { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Settings,
  ChevronRight,
  UserPlus,
  Crown,
  Ban,
  LifeBuoy,
  TrendingUp,
  TrendingDown,
  LogOut,
  User,
} from 'lucide-react'
import { cn } from '../lib/utils'
import { useAuth } from '../contexts/AuthContext'
import { GlobalSearch } from './GlobalSearch'
import { useBusinessStats } from '../hooks/useBusinessStats'
import logo from '../assets/logo.png'

type MenuItem = {
  label: string
  icon: React.ElementType
  path?: string
  children?: { label: string; path: string }[]
}

export function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, profile, signOut } = useAuth()
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])

  // 获取经营统计数据
  const { data: businessStats } = useBusinessStats()

  const menuStructure: MenuItem[] = [
    { label: '驾驶舱', icon: LayoutDashboard, path: '/' },
    {
      label: '潜在供应商',
      icon: UserPlus,
      path: '/supplier-profile?type=potential',
    },
    {
      label: '合作供应商',
      icon: Users,
      path: '/supplier-profile?type=active',
    },
    {
      label: '战略供应商',
      icon: Crown,
      path: '/supplier-profile?type=strategic',
    },
    { label: '黑名单', icon: Ban, path: '/supplier-profile?type=blacklist' },
    { label: '业务配置', icon: Settings, path: '/settings' },
    {
      label: '支持中心',
      icon: LifeBuoy,
      children: [{ label: 'ODC审计', path: '/support/odc-audit' }],
    },
  ]

  const toggleMenu = (label: string) => {
    setExpandedMenus((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    )
  }

  const isPathActive = (path?: string) => {
    if (!path) return false
    if (path === '/' && location.pathname === '/') return true
    if (path !== '/' && location.pathname.startsWith(path)) return true
    return false
  }

  // 处理登出
  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (err) {
      console.error('登出失败:', err)
    }
  }

  // 获取用户显示名称
  const getUserDisplayName = () => {
    if (profile?.full_name) {
      // 获取姓名的首字母或前两个字
      return profile.full_name.substring(0, 2).toUpperCase()
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase()
    }
    return 'U'
  }

  const getUserName = () => {
    return profile?.full_name || user?.email?.split('@')[0] || '用户'
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-10 overflow-y-auto custom-scrollbar">
        <div className="h-16 flex items-center px-6 border-b border-slate-100 shrink-0 sticky top-0 bg-white z-20">
          <img src={logo} alt="Didadi SRM" className="h-8 w-auto" />
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          {menuStructure.map((item) => {
            const hasChildren = item.children && item.children.length > 0
            const isExpanded = expandedMenus.includes(item.label)
            const isActive =
              isPathActive(item.path) ||
              (hasChildren && item.children?.some((child) => isPathActive(child.path)))

            return (
              <div key={item.label}>
                <button
                  onClick={() => (hasChildren ? toggleMenu(item.label) : navigate(item.path!))}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors group',
                    isActive && !hasChildren
                      ? 'bg-brand-50 text-brand-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon
                      className={cn(
                        'w-5 h-5',
                        isActive ? 'text-brand-500' : 'text-slate-400 group-hover:text-slate-500'
                      )}
                    />
                    {item.label}
                  </div>
                  {hasChildren && (
                    <ChevronRight
                      className={cn('w-4 h-4 text-slate-400 transition-transform', isExpanded && 'rotate-90')}
                    />
                  )}
                </button>

                {hasChildren && isExpanded && (
                  <div className="ml-9 mt-1 space-y-0.5 border-l border-slate-100 pl-2">
                    {item.children?.map((child) => {
                      const isChildActive = isPathActive(child.path)
                      return (
                        <button
                          key={child.path}
                          onClick={() => navigate(child.path)}
                          className={cn(
                            'w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors',
                            isChildActive
                              ? 'text-brand-600 bg-brand-50/50 font-medium'
                              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                          )}
                        >
                          {child.label}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* User Info & Sign Out */}
        <div className="p-4 border-t border-slate-100 shrink-0">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-xs">
              {getUserDisplayName()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{getUserName()}</p>
              <p className="text-xs text-slate-500 truncate">{profile?.role || '用户'}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="登出"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen flex flex-col">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4 text-slate-500 text-sm">
              <span className="text-slate-900 font-bold text-lg">
                {menuStructure.find(
                  (m) =>
                    m.path === location.pathname ||
                    m.children?.some((c) => c.path === location.pathname)
                )?.label?.split(' (')[0] || 'SRM 系统'}
              </span>
            </div>

            {/* Dashboard Stats Injection */}
            {location.pathname === '/' && (
              <div className="ml-6 flex items-center border border-slate-200 rounded-lg p-1.5 gap-4 bg-white shadow-sm">
                <div className="px-2 py-1 bg-slate-100 rounded text-xs font-bold text-slate-600 self-stretch flex items-center">
                  经营看板
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-start">
                    <p className="text-[10px] text-slate-400 leading-none mb-1">合作供应商</p>
                    <div className="flex items-center gap-1.5 leading-none">
                      <span className="text-sm font-bold text-slate-900">
                        {businessStats?.active_suppliers || 0}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-medium flex items-center bg-emerald-50 px-1 py-0.5 rounded">
                        <TrendingUp className="w-2 h-2 mr-0.5" /> 活跃
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-start">
                    <p className="text-[10px] text-slate-400 leading-none mb-1">核心+战略</p>
                    <div className="flex items-center gap-1.5 leading-none">
                      <span className="text-sm font-bold text-slate-900">
                        {(businessStats?.core_suppliers || 0) + (businessStats?.strategic_suppliers || 0)}
                      </span>
                      <span className="text-[10px] text-blue-600 font-medium flex items-center bg-blue-50 px-1 py-0.5 rounded">
                        家
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-start">
                    <p className="text-[10px] text-slate-400 leading-none mb-1">核心覆盖率</p>
                    <div className="flex items-center gap-1.5 leading-none">
                      <span className="text-sm font-bold text-slate-900">
                        {businessStats?.core_coverage?.toFixed(1) || 0}%
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-start">
                    <p className="text-[10px] text-slate-400 leading-none mb-1">平均账期</p>
                    <div className="flex items-center gap-1.5 leading-none">
                      <span className="text-sm font-bold text-slate-900">
                        {businessStats?.avg_payment_period || 0}
                        <span className="text-[10px] font-normal text-slate-400 ml-0.5">天</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* 全局搜索 */}
            <GlobalSearch />
          </div>
        </header>

        {/* Page Content - 使用 Outlet 渲染子路由 */}
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
