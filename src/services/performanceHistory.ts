// @ts-nocheck
/**
 * 绩效历史服务
 *
 * 封装所有与 performance_history 表相关的 API 调用
 */

import { supabase, handleSupabaseError } from '../lib/supabase'
import type { PerformanceHistory, PerformanceHistoryInsert } from '../types/database'

/**
 * 获取供应商的绩效历史列表
 */
export async function getPerformanceHistory(supplierId: string, limit = 20) {
  const { data, error } = await supabase
    .from('performance_history')
    .select('*')
    .eq('supplier_id', supplierId)
    .order('evaluation_date', { ascending: false })
    .limit(limit)

  if (error) {
    throw handleSupabaseError(error)
  }

  return data || []
}

/**
 * 获取最近的绩效评估
 */
export async function getLatestPerformanceEvaluation(supplierId: string) {
  const { data, error } = await supabase
    .from('performance_history')
    .select('*')
    .eq('supplier_id', supplierId)
    .order('evaluation_date', { ascending: false })
    .limit(1)
    .single()

  // 如果没有记录，返回 null 而不是抛出错误
  if (error) {
    return null
  }

  return data
}

/**
 * 创建绩效评估记录
 */
export async function createPerformanceHistoryRecord(evaluation: PerformanceHistoryInsert) {
  const { data, error } = await supabase
    .from('performance_history')
    .insert(evaluation)
    .select()
    .single()

  if (error) {
    throw handleSupabaseError(error)
  }

  return data
}

/**
 * 更新绩效评估记录
 */
export async function updatePerformanceHistoryRecord(
  id: string,
  updates: Partial<PerformanceHistoryInsert>
) {
  const { data, error } = await supabase
    .from('performance_history')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw handleSupabaseError(error)
  }

  return data
}

/**
 * 删除绩效评估记录
 */
export async function deletePerformanceHistoryRecord(id: string): Promise<void> {
  const { error } = await supabase
    .from('performance_history')
    .delete()
    .eq('id', id)

  if (error) {
    throw handleSupabaseError(error)
  }
}

/**
 * 获取绩效趋势（用于图表展示）
 */
export async function getPerformanceTrend(
  supplierId: string,
  periodCount = 12
): Promise<{ period: string; score: number }[]> {
  const { data, error } = await supabase
    .from('performance_history')
    .select('period, score')
    .eq('supplier_id', supplierId)
    .order('evaluation_date', { ascending: false })
    .limit(periodCount)

  if (error) {
    throw handleSupabaseError(error)
  }

  // 反转数组以按时间正序排列
  return (data || []).reverse().map(({ period, score }) => ({
    period: period || '',
    score: score || 0,
  }))
}

/**
 * 计算平均绩效分数
 */
export async function getAverageScore(supplierId: string): Promise<number | null> {
  const { data } = await supabase
    .from('performance_history')
    .select('score')
    .eq('supplier_id', supplierId)

  if (!data || data.length === 0) {
    return null
  }

  const sum = data.reduce((acc, curr) => acc + (curr.score || 0), 0)
  return Math.round((sum / data.length) * 100) / 100
}

/**
 * 按日期范围筛选绩效历史
 */
export async function getPerformanceHistoryByDateRange(
  supplierId: string,
  dateFrom: string,
  dateTo: string
) {
  const { data, error } = await supabase
    .from('performance_history')
    .select('*')
    .eq('supplier_id', supplierId)
    .gte('evaluation_date', dateFrom)
    .lte('evaluation_date', dateTo)
    .order('evaluation_date', { ascending: true })

  if (error) {
    throw handleSupabaseError(error)
  }

  return data || []
}

/**
 * 按周期筛选绩效历史
 */
export async function getPerformanceHistoryByPeriod(
  supplierId: string,
  period: string // 例如 '2023-Q4', '2024-01'
) {
  const { data, error } = await supabase
    .from('performance_history')
    .select('*')
    .eq('supplier_id', supplierId)
    .eq('period', period)
    .order('evaluation_date', { ascending: false })

  if (error) {
    throw handleSupabaseError(error)
  }

  return data || []
}

/**
 * 获取绩效统计信息
 */
export async function getPerformanceStats(supplierId: string) {
  // 获取所有记录
  const { data: allRecords } = await supabase
    .from('performance_history')
    .select('score, period, evaluation_date')

  if (!allRecords) {
    return {
      totalEvaluations: 0,
      averageScore: 0,
      highestScore: 0,
      lowestScore: 0,
      lastEvaluationDate: null,
      recentTrend: 'stable',
    }
  }

  const scores = allRecords.map(r => r.score || 0)
  const sortedScores = [...scores].sort((a, b) => a - b)
  const avgScore = scores.length > 0
    ? Math.round((scores.reduce((sum, s) => sum + s, 0) / scores.length) * 100) / 100
    : 0

  // 计算趋势（最近3次 vs 之前3次）
  let trend: 'improving' | 'stable' | 'declining' = 'stable'
  if (allRecords.length >= 6) {
    const recent3 = scores.slice(0, 3)
    const previous3 = scores.slice(3, 6)
    const recentAvg = recent3.reduce((sum, s) => sum + s, 0) / 3
    const previousAvg = previous3.reduce((sum, s) => sum + s, 0) / 3
    if (recentAvg > previousAvg + 5) trend = 'improving'
    else if (recentAvg < previousAvg - 5) trend = 'declining'
  }

  return {
    totalEvaluations: allRecords.length,
    averageScore: avgScore,
    highestScore: sortedScores[sortedScores.length - 1] || 0,
    lowestScore: sortedScores[0] || 0,
    lastEvaluationDate: allRecords[0]?.evaluation_date || null,
    recentTrend: trend,
  }
}

/**
 * 批量创建绩效评估记录
 */
export async function batchCreatePerformanceEvaluations(
  evaluations: PerformanceHistoryInsert[]
): Promise<number> {
  const { data, error } = await supabase
    .from('performance_history')
    .insert(evaluations)
    .select()

  if (error) {
    throw handleSupabaseError(error)
  }

  return data?.length || 0
}

/**
 * 订阅绩效历史变更（Realtime）
 */
export function subscribeToPerformanceHistory(
  supplierId: string,
  callback: (payload: {
    data: PerformanceHistory[]
    eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  }) => void
) {
  return supabase
    .channel(`performance-history-${supplierId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'performance_history',
        filter: `supplier_id=eq.${supplierId}`,
      },
      (payload) => {
        callback({
          data: payload.new as PerformanceHistory[],
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
        })
      }
    )
    .subscribe()
}

/**
 * 获取绩效分数分布
 * 用于统计不同分数段的评估次数
 */
export async function getScoreDistribution(supplierId: string) {
  const { data, error } = await supabase
    .from('performance_history')
    .select('score')

  if (error) {
    throw handleSupabaseError(error)
  }

  const scores = (data || []).map(r => r.score || 0)

  return {
    excellent: scores.filter(s => s >= 90).length,
    good: scores.filter(s => s >= 70 && s < 90).length,
    average: scores.filter(s => s >= 50 && s < 70).length,
    poor: scores.filter(s => s < 50).length,
  }
}
