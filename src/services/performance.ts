// @ts-nocheck
/**
 * 绩效评估管理服务
 *
 * 处理供应商绩效评估的 CRUD 操作
 * 支持多维度评分、自动计算综合得分
 */

import { supabase, handleSupabaseError } from '../lib/supabase'

/**
 * 评估周期类型
 */
export type PeriodType = 'monthly' | 'quarterly' | 'semi_annual' | 'annual'

/**
 * 维度得分记录
 */
export interface DimensionScore {
  dimensionId: string
  dimensionName: string
  score: number
  weight?: number
}

/**
 * 绩效评估接口
 */
export interface PerformanceEvaluation {
  id: string
  supplier_id: string
  evaluation_period: string
  period_type: PeriodType
  evaluator_id: string | null
  dimension_scores: Record<string, number>
  total_score: number
  auto_calculated: boolean
  notes: string | null
  strengths: string[] | null
  weaknesses: string[] | null
  improvement_areas: string[] | null
  recommended_actions: string[] | null
  evaluated_at: string
  created_at: string
  updated_at: string
}

/**
 * 绩效评估创建参数
 */
export interface PerformanceEvaluationCreate {
  supplier_id: string
  evaluation_period: string
  period_type: PeriodType
  dimension_scores: Record<string, number>
  auto_calculated?: boolean
  notes?: string
  strengths?: string[]
  weaknesses?: string[]
  improvement_areas?: string[]
  recommended_actions?: string[]
  evaluated_at?: string
}

/**
 * 绩效评估更新参数
 */
export interface PerformanceEvaluationUpdate {
  evaluation_period?: string
  period_type?: PeriodType
  dimension_scores?: Record<string, number>
  total_score?: number
  auto_calculated?: boolean
  notes?: string
  strengths?: string[]
  weaknesses?: string[]
  improvement_areas?: string[]
  recommended_actions?: string[]
  evaluated_at?: string
}

/**
 * 绩效评估统计
 */
export interface PerformanceEvaluationStats {
  total_evaluations: number
  quarterly_evaluations: number
  annual_evaluations: number
  average_score: number
  highest_score: number
  lowest_score: number
  last_evaluated_at: string | null
}

/**
 * 获取供应商的绩效评估列表
 *
 * @param supplierId - 供应商 ID
 * @param periodType - 可选，按周期类型筛选
 * @returns 评估列表
 */
export async function getPerformanceEvaluations(
  supplierId: string,
  periodType?: PeriodType
): Promise<PerformanceEvaluation[]> {
  console.log('获取绩效评估列表:', { supplierId, periodType })

  let query = supabase
    .from('performance_evaluations')
    .select('*')
    .eq('supplier_id', supplierId)
    .order('evaluated_at', { ascending: false })

  if (periodType) {
    query = query.eq('period_type', periodType)
  }

  const { data, error } = await query

  if (error) {
    throw handleSupabaseError(error)
  }

  console.log(`找到 ${data?.length || 0} 条评估记录`)
  return data || []
}

/**
 * 获取绩效评估详情
 *
 * @param evaluationId - 评估 ID
 * @returns 评估详情
 */
export async function getPerformanceEvaluationById(evaluationId: string): Promise<PerformanceEvaluation> {
  console.log('获取绩效评估详情:', evaluationId)

  const { data, error } = await supabase
    .from('performance_evaluations')
    .select('*')
    .eq('id', evaluationId)
    .single()

  if (error) {
    throw handleSupabaseError(error)
  }

  return data as PerformanceEvaluation
}

/**
 * 创建绩效评估
 *
 * @param evaluation - 评估创建参数
 * @returns 创建的评估
 */
export async function createPerformanceEvaluation(
  evaluation: PerformanceEvaluationCreate
): Promise<PerformanceEvaluation> {
  console.log('创建绩效评估:', evaluation)

  // 如果需要自动计算综合得分
  let totalScore = evaluation.auto_calculated !== false ? null : undefined

  const { data, error } = await supabase
    .from('performance_evaluations')
    .insert({
      ...evaluation,
      total_score: totalScore,
    })
    .select()
    .single()

  if (error) {
    throw handleSupabaseError(error)
  }

  console.log('绩效评估创建成功:', data)
  return data as PerformanceEvaluation
}

/**
 * 提交绩效评分（便捷方法）
 *
 * @param supplierId - 供应商 ID
 * @param dimensionScores - 维度得分数组
 * @param notes - 综合评语
 * @returns 创建的评估
 */
export async function submitPerformanceScore(
  supplierId: string,
  dimensionScores: DimensionScore[],
  notes?: string
): Promise<PerformanceEvaluation> {
  // 生成评估周期（当前季度）
  const now = new Date()
  const year = now.getFullYear()
  const quarter = Math.floor(now.getMonth() / 3) + 1
  const evaluationPeriod = `${year}-Q${quarter}`

  // 转换维度得分为对象
  const dimensionScoresObj: Record<string, number> = {}
  dimensionScores.forEach(ds => {
    dimensionScoresObj[ds.dimensionId] = ds.score
  })

  return createPerformanceEvaluation({
    supplier_id: supplierId,
    evaluation_period: evaluationPeriod,
    period_type: 'quarterly',
    dimension_scores: dimensionScoresObj,
    auto_calculated: true,
    notes,
  })
}

/**
 * 更新绩效评估
 *
 * @param evaluationId - 评估 ID
 * @param updates - 更新内容
 * @returns 更新后的评估
 */
export async function updatePerformanceEvaluation(
  evaluationId: string,
  updates: PerformanceEvaluationUpdate
): Promise<PerformanceEvaluation> {
  console.log('更新绩效评估:', { evaluationId, updates })

  const { data, error } = await supabase
    .from('performance_evaluations')
    .update(updates)
    .eq('id', evaluationId)
    .select()
    .single()

  if (error) {
    throw handleSupabaseError(error)
  }

  console.log('绩效评估更新成功:', data)
  return data as PerformanceEvaluation
}

/**
 * 删除绩效评估
 *
 * @param evaluationId - 评估 ID
 * @returns 是否成功
 */
export async function deletePerformanceEvaluation(evaluationId: string): Promise<boolean> {
  console.log('删除绩效评估:', evaluationId)

  const { error } = await supabase
    .from('performance_evaluations')
    .delete()
    .eq('id', evaluationId)

  if (error) {
    throw handleSupabaseError(error)
  }

  console.log('绩效评估删除成功')
  return true
}

/**
 * 获取供应商最新评估
 *
 * @param supplierId - 供应商 ID
 * @returns 最新评估或 null
 */
export async function getLatestEvaluation(supplierId: string): Promise<PerformanceEvaluation | null> {
  console.log('获取最新评估:', supplierId)

  const { data, error } = await supabase
    .from('performance_evaluations')
    .select('*')
    .eq('supplier_id', supplierId)
    .order('evaluated_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw handleSupabaseError(error)
  }

  return data as PerformanceEvaluation
}

/**
 * 获取绩效评估统计
 *
 * @param supplierId - 供应商 ID
 * @returns 统计信息
 */
export async function getPerformanceEvaluationStats(supplierId: string): Promise<PerformanceEvaluationStats | null> {
  console.log('获取绩效评估统计:', supplierId)

  const { data, error } = await supabase
    .from('performance_evaluation_stats')
    .select('*')
    .eq('supplier_id', supplierId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return {
        total_evaluations: 0,
        quarterly_evaluations: 0,
        annual_evaluations: 0,
        average_score: 0,
        highest_score: 0,
        lowest_score: 0,
        last_evaluated_at: null
      }
    }
    throw handleSupabaseError(error)
  }

  return data as PerformanceEvaluationStats
}

/**
 * 获取周期类型的显示名称
 */
export function getPeriodTypeDisplayName(type: PeriodType): string {
  const typeNames: Record<PeriodType, string> = {
    'monthly': '月度评估',
    'quarterly': '季度评估',
    'semi_annual': '半年度评估',
    'annual': '年度评估'
  }
  return typeNames[type] || type
}

/**
 * 根据得分获取等级
 */
export function getScoreGrade(score: number): { grade: string; color: string; label: string } {
  if (score >= 9) {
    return { grade: 'A', color: 'text-emerald-600 bg-emerald-50', label: '优秀' }
  } else if (score >= 8) {
    return { grade: 'B', color: 'text-blue-600 bg-blue-50', label: '良好' }
  } else if (score >= 7) {
    return { grade: 'C', color: 'text-yellow-600 bg-yellow-50', label: '中等' }
  } else if (score >= 6) {
    return { grade: 'D', color: 'text-orange-600 bg-orange-50', label: '及格' }
  } else {
    return { grade: 'F', color: 'text-red-600 bg-red-50', label: '不及格' }
  }
}
