// @ts-nocheck
/**
 * Supabase 客户端配置
 *
 * 与 Supabase 后端通信的单例客户端
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

// 从环境变量获取 Supabase 配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? 'https://tdrbuwshyebmjqljggww.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkcmJ1d3NoeWVibWpxbGpnZ3d3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1OTY1NTYsImV4cCI6MjA4NjE3MjU1Nn0.sCLu2Zc4BmtAMvf_BeeZLRa6NfN_2KAMQO4HrZD9Bqg'

/**
 * Supabase 客户端单例
 *
 * 使用方式：
 * ```ts
 * import { supabase } from '@/lib/supabase'
 *
 * const { data, error } = await supabase
 *   .from('suppliers')
 *   .select('*')
 * ```
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce', // 使用 PKCE 流程提高安全性
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      // 可以添加自定义请求头
      // 'x-application-name': 'srm-frontend',
    },
  },
  // 开发环境启用详细日志
  debug: import.meta.env.DEV,
})

/**
 * Supabase Realtime 客户端
 * 用于订阅实时数据变更
 */
export const supabaseRealtime = supabase.channel('srm-realtime')

/**
 * 辅助函数：处理 Supabase 错误
 */
export function handleSupabaseError(error: unknown): Error {
  if (error instanceof Error) {
    return error
  }

  if (typeof error === 'object' && error !== null) {
    const err = error as { message?: string; details?: string; hint?: string }
    return new Error(err.message || err.details || err.hint || '未知错误')
  }

  return new Error(String(error))
}

/**
 * 辅助函数：检查是否为约束冲突错误
 */
export function isConstraintError(error: unknown): boolean {
  if (typeof error === 'object' && error !== null) {
    const err = error as { code?: string }
    return err.code === '23505' // unique_violation
      || err.code === '23503' // foreign_key_violation
      || err.code === '23514' // check_violation
  }
  return false
}

/**
 * 辅助函数：检查是否为记录不存在错误
 */
export function isNotFoundError(error: unknown): boolean {
  if (typeof error === 'object' && error !== null) {
    const err = error as { code?: string }
    return err.code === 'PGRST116' // PostgREST 的"记录不存在"错误码
  }
  return false
}

// 导出类型供使用
export type { Database }
