/**
 * 绩效评估 React Query Hooks
 *
 * 提供绩效评估列表查询、创建、更新、删除等功能
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getPerformanceEvaluations,
  getPerformanceEvaluationById,
  createPerformanceEvaluation,
  updatePerformanceEvaluation,
  deletePerformanceEvaluation,
  getLatestEvaluation,
  getPerformanceEvaluationStats,
  submitPerformanceScore,
  type PerformanceEvaluationCreate,
  type PerformanceEvaluationUpdate,
  type PeriodType,
  type DimensionScore
} from '../services/performance'

/**
 * 获取供应商绩效评估列表
 */
export function usePerformanceEvaluations(supplierId: string | undefined, periodType?: PeriodType) {
  return useQuery({
    queryKey: ['performance-evaluations', supplierId, periodType],
    queryFn: () => getPerformanceEvaluations(supplierId!, periodType),
    enabled: !!supplierId,
    staleTime: 1000 * 60 * 5, // 5 分钟内数据视为新鲜
  })
}

/**
 * 获取绩效评估详情
 */
export function usePerformanceEvaluation(evaluationId: string | undefined) {
  return useQuery({
    queryKey: ['performance-evaluation', evaluationId],
    queryFn: () => getPerformanceEvaluationById(evaluationId!),
    enabled: !!evaluationId,
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * 获取最新评估
 */
export function useLatestEvaluation(supplierId: string | undefined) {
  return useQuery({
    queryKey: ['latest-performance-evaluation', supplierId],
    queryFn: () => getLatestEvaluation(supplierId!),
    enabled: !!supplierId,
    staleTime: 1000 * 60 * 10, // 10 分钟
  })
}

/**
 * 获取绩效评估统计
 */
export function usePerformanceEvaluationStats(supplierId: string | undefined) {
  return useQuery({
    queryKey: ['performance-evaluation-stats', supplierId],
    queryFn: () => getPerformanceEvaluationStats(supplierId!),
    enabled: !!supplierId,
    staleTime: 1000 * 60 * 10, // 10 分钟
  })
}

/**
 * 创建绩效评估 Mutation
 */
export function useCreatePerformanceEvaluation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: { evaluation: PerformanceEvaluationCreate }) => {
      return await createPerformanceEvaluation(params.evaluation)
    },
    onSuccess: (_data, variables) => {
      // 创建成功后，使评估列表缓存失效
      queryClient.invalidateQueries({
        queryKey: ['performance-evaluations', variables.evaluation.supplier_id]
      })
      // 使最新评估缓存失效
      queryClient.invalidateQueries({
        queryKey: ['latest-performance-evaluation', variables.evaluation.supplier_id]
      })
      // 使统计缓存失效
      queryClient.invalidateQueries({
        queryKey: ['performance-evaluation-stats', variables.evaluation.supplier_id]
      })
      // 使供应商详情缓存失效（因为 system_score 会更新）
      queryClient.invalidateQueries({
        queryKey: ['supplier-detail', variables.evaluation.supplier_id]
      })
    },
  })
}

/**
 * 提交绩效评分 Mutation（便捷方法）
 */
export function useSubmitPerformanceScore() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      supplierId: string
      dimensionScores: DimensionScore[]
      notes?: string
    }) => {
      return await submitPerformanceScore(
        params.supplierId,
        params.dimensionScores,
        params.notes
      )
    },
    onSuccess: (_data, variables) => {
      // 提交成功后，使相关缓存失效
      queryClient.invalidateQueries({
        queryKey: ['performance-evaluations', variables.supplierId]
      })
      queryClient.invalidateQueries({
        queryKey: ['latest-performance-evaluation', variables.supplierId]
      })
      queryClient.invalidateQueries({
        queryKey: ['performance-evaluation-stats', variables.supplierId]
      })
      queryClient.invalidateQueries({
        queryKey: ['supplier-detail', variables.supplierId]
      })
    },
  })
}

/**
 * 更新绩效评估 Mutation
 */
export function useUpdatePerformanceEvaluation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: { evaluationId: string; updates: PerformanceEvaluationUpdate }) => {
      return await updatePerformanceEvaluation(params.evaluationId, params.updates)
    },
    onSuccess: (_data, variables) => {
      // 使详情缓存失效
      queryClient.invalidateQueries({
        queryKey: ['performance-evaluation', variables.evaluationId]
      })
    },
  })
}

/**
 * 删除绩效评估 Mutation
 */
export function useDeletePerformanceEvaluation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: { evaluationId: string; supplierId: string }) => {
      return await deletePerformanceEvaluation(params.evaluationId)
    },
    onSuccess: (_data, variables) => {
      // 使评估列表和统计缓存失效
      queryClient.invalidateQueries({
        queryKey: ['performance-evaluations', variables.supplierId]
      })
      queryClient.invalidateQueries({
        queryKey: ['latest-performance-evaluation', variables.supplierId]
      })
      queryClient.invalidateQueries({
        queryKey: ['performance-evaluation-stats', variables.supplierId]
      })
    },
  })
}

/**
 * 周期类型类型守卫
 */
export function isValidPeriodType(type: string): type is PeriodType {
  return ['monthly', 'quarterly', 'semi_annual', 'annual'].includes(type)
}
