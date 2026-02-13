/**
 * 经营统计服务
 * 用于获取经营看板和异常预警的统计数据
 */

// @ts-nocheck - 临时禁用类型检查，等待 Supabase 类型生成更新
import { supabase } from '../lib/supabase'

// 经营统计数据接口
export interface BusinessStats {
  active_suppliers: number
  core_suppliers: number
  strategic_suppliers: number
  total_suppliers: number
  avg_payment_period: number
  core_coverage: number
}

// 异常预警数据接口
export interface AlertStats {
  high_risk_count: number
  medium_risk_count: number
  low_score_count: number
  pending_reviews: number
}

/**
 * 获取经营统计数据
 */
export async function getBusinessStats(): Promise<BusinessStats | null> {
  try {
    const { data, error } = await supabase.rpc('get_business_stats')

    if (error) {
      console.error('获取经营统计失败:', error)
      return null
    }

    // RPC 返回数组，取第一个元素
    const row = Array.isArray(data) ? data[0] : data
    return row as BusinessStats
  } catch (err) {
    console.error('获取经营统计异常:', err)
    return null
  }
}

/**
 * 获取异常预警统计
 */
export async function getAlertStats(): Promise<AlertStats | null> {
  try {
    const { data, error } = await supabase.rpc('get_alert_stats')

    if (error) {
      console.error('获取异常预警统计失败:', error)
      return null
    }

    // RPC 返回数组，取第一个元素
    const row = Array.isArray(data) ? data[0] : data
    return row as AlertStats
  } catch (err) {
    console.error('获取异常预警统计异常:', err)
    return null
  }
}
