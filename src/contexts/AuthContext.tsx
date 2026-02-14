// @ts-nocheck
/**
 * Auth Context - 用户认证状态管理
 *
 * 提供全局的认证状态和认证方法
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from 'react'
import { supabase } from '../lib/supabase'
import type { Profile, ProfileUpdate } from '../types/database'

// Supabase User 类型定义（简化版）
interface User {
  id: string
  email: string | null
  email_confirmed_at: string | null
  created_at: string
  updated_at: string | null
  user_metadata: {
    full_name?: string
    [key: string]: unknown
  }
}

// Supabase Session 类型定义（简化版）
interface Session {
  user: User
  access_token: string
  refresh_token: string
  expires_at: number | null
  expires_in: number | null
  token_type: string
}

interface AuthErrorLike {
  message?: string
  code?: string
}

function mapSignInError(error: unknown): Error {
  const authError = (error || {}) as AuthErrorLike
  const rawMessage = String(authError.message || '').toLowerCase()
  const rawCode = String(authError.code || '').toLowerCase()

  if (
    rawCode.includes('email_not_confirmed') ||
    rawMessage.includes('email not confirmed') ||
    (rawMessage.includes('email') && rawMessage.includes('confirm'))
  ) {
    return new Error('邮箱尚未完成验证，请先查收确认邮件并点击链接后再登录。')
  }

  if (rawMessage.includes('invalid login credentials')) {
    return new Error('邮箱或密码错误，请检查后重试。')
  }

  if (rawMessage.includes('too many requests')) {
    return new Error('请求过于频繁，请稍后再试。')
  }

  if (authError.message) {
    return new Error(authError.message)
  }

  return new Error('登录失败，请稍后重试。')
}

/**
 * 注册结果类型
 */
interface SignUpResult {
  success: boolean
  needsEmailConfirmation: boolean
  message: string
}

/**
 * Auth Context 状态类型
 */
interface AuthContextType {
  /** 当前登录用户 */
  user: User | null
  /** 用户档案信息 */
  profile: Profile | null
  /** 是否正在加载认证状态 */
  loading: boolean
  /** 用户注册 */
  signUp: (email: string, password: string, name: string) => Promise<SignUpResult>
  /** 用户登录 */
  signIn: (email: string, password: string) => Promise<void>
  /** 用户登出 */
  signOut: () => Promise<void>
  /** 更新用户档案 */
  updateProfile: (updates: ProfileUpdate) => Promise<void>
  /** 刷新用户档案 */
  refreshProfile: () => Promise<void>
}

// 创建 Context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Auth Provider 组件
 *
 * 提供认证状态和认证方法给子组件
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  /**
   * 获取用户档案信息
   */
  const fetchProfile = useCallback(async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('获取用户档案失败:', error)
        return false
      }

      setProfile(data)
      return true
    } catch (err) {
      console.error('获取用户档案异常:', err)
      return false
    }
  }, [])

  /**
   * 初始化认证状态
   *
   * 使用标准 Supabase 认证流程
   */
  useEffect(() => {
    let mounted = true
    let authSubscription: { unsubscribe: () => void } | null = null

    const initializeAuth = async () => {
      // 标准 Supabase 认证流程
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (import.meta.env.DEV && !(event === 'INITIAL_SESSION' && !session?.user)) {
          console.log('[AuthContext] Auth state changed:', event, session?.user?.id)
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
          if (session?.user && mounted) {
            setUser(session.user)
            // 异步获取 profile，不阻塞 loading 状态
            fetchProfile(session.user.id).catch(err => {
              console.error('[AuthContext] 获取用户档案失败:', err)
            })
          }
        } else if (event === 'SIGNED_OUT') {
          if (mounted) {
            setUser(null)
            setProfile(null)
          }
        }

        // 任何 auth state change 事件后都设置为非 loading 状态
        if (mounted) {
          setLoading(false)
        }
      })

      authSubscription = subscription
    }

    initializeAuth()

    return () => {
      mounted = false
      if (authSubscription) {
        authSubscription.unsubscribe()
      }
    }
  }, [fetchProfile])

  /**
   * 用户注册
   */
  const signUp = async (email: string, password: string, name: string): Promise<SignUpResult> => {
    setLoading(true)
    try {
      const emailRedirectTo =
        import.meta.env.VITE_AUTH_REDIRECT_URL || 'https://fuyo-srm.netlify.app/login'

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo,
          data: {
            full_name: name,
          },
        },
      })

      setLoading(false)

      if (error) {
        throw error
      }

      if (!data.user) {
        return {
          success: false,
          needsEmailConfirmation: false,
          message: '注册失败，请稍后重试'
        }
      }

      // 检查是否需要邮箱确认
      if (!data.session) {
        // 邮箱确认模式
        return {
          success: true,
          needsEmailConfirmation: true,
          message: '注册成功！确认邮件已发送到您的邮箱，请查收并点击链接激活账号。'
        }
      }

      // 自动登录模式（邮箱未启用确认）
      if (data.user?.id) {
        await fetchProfile(data.user.id)
      }

      return {
        success: true,
        needsEmailConfirmation: false,
        message: '注册成功！正在为您设置账号...'
      }
    } catch (err) {
      setLoading(false)
      // 返回错误信息而不是抛出异常
      return {
        success: false,
        needsEmailConfirmation: false,
        message: err instanceof Error ? err.message : '注册失败，请稍后重试'
      }
    }
  }

  /**
   * 用户登录
   */
  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      if (!data.user) {
        throw new Error('登录失败，请检查用户名和密码')
      }

      // 登录成功后获取 profile
      await fetchProfile(data.user.id)
    } catch (err) {
      throw mapSignInError(err)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 用户登出
   */
  const signOut = async () => {
    setLoading(true)
    try {
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 更新用户档案
   */
  const updateProfile = async (updates: ProfileUpdate) => {
    if (!user) {
      throw new Error('用户未登录')
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        throw error
      }

      setProfile(data)
    } catch (err) {
      console.error('更新用户档案失败:', err)
      throw err
    }
  }

  /**
   * 刷新用户档案
   */
  const refreshProfile = async () => {
    if (!user) {
      throw new Error('用户未登录')
    }

    await fetchProfile(user.id)
  }

  const value: AuthContextType = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * useAuth Hook
 *
 * 用于在组件中访问认证状态和方法
 *
 * @example
 * ```tsx
 * const { user, signIn, signOut, loading } = useAuth()
 *
 * if (loading) return <div>加载中...</div>
 * if (!user) return <LoginButton />
 * return <WelcomeMessage name={profile?.full_name} />
 * ```
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

/**
 * useUser Hook
 *
 * 获取当前用户信息的便捷 Hook
 *
 * @returns 当前用户，如果未登录则返回 null
 */
export function useUser(): User | null {
  const { user } = useAuth()
  return user
}

/**
 * useProfile Hook
 *
 * 获取当前用户档案的便捷 Hook
 *
 * @returns 当前用户档案，如果未登录则返回 null
 */
export function useProfile(): Profile | null {
  const { profile } = useAuth()
  return profile
}

/**
 * useRequireAuth Hook
 *
 * 确保用户已登录，如果未登录则可以抛出错误或返回提示
 *
 * @param options - 配置选项
 * @returns 当前用户
 * @throws 如果用户未登录
 *
 * @example
 * ```tsx
 * const user = useRequireAuth()
 * // 如果未登录，这里不会执行
 * ```
 */
export function useRequireAuth(options?: { redirectTo?: string }): User {
  const { user, loading } = useAuth()

  if (loading) {
    throw new Promise(() => {}) // 挂起组件，等待加载完成
  }

  if (!user) {
    if (options?.redirectTo) {
      window.location.href = options.redirectTo
    }
    throw new Error('用户未登录')
  }

  return user
}
