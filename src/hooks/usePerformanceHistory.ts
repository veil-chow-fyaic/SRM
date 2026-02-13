/**
 * 绩效历史相关的 React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getPerformanceHistory,
  getLatestPerformanceEvaluation,
  createPerformanceEvaluation,
  updatePerformanceEvaluation,
  deletePerformanceEvaluation,
  getPerformanceTrend,
  getAverageScore,
  getPerformanceHistoryByDateRange,
  getPerformanceHistoryByPeriod,
  getPerformanceStats,
  batchCreatePerformanceEvaluations,
  subscribeToPerformanceHistory,
  getScoreDistribution,
} from '../services'

/**
 * 获取供应商的绩效历史列表
 */
export function usePerformanceHistory(supplierId: string, limit = 20) {
  return useQuery({
    queryKey: ['performance-history', supplierId, limit],
    queryFn: () => getPerformanceHistory(supplierId, limit),
    enabled: !!supplierId,
    staleTime: 1000 * 60 * 2,
  })
}

/**
 * 获取最新绩效评估
 */
export function useLatestPerformanceEvaluation(supplierId: string) {
  return useQuery({
    queryKey: ['performance-history', 'latest', supplierId],
    queryFn: () => getLatestPerformanceEvaluation(supplierId),
    enabled: !!supplierId,
    staleTime: 1000 * 60,
  })
}

/**
 * 获取绩效趋势
 */
export function usePerformanceTrend(supplierId: string, periodCount = 12) {
  return useQuery({
    queryKey: ['performance-trend', supplierId, periodCount],
    queryFn: () => getPerformanceTrend(supplierId, periodCount),
    enabled: !!supplierId,
    staleTime: 1000 * 60 * 10,
  })
}

/**
 * 获取平均绩效分数
 */
export function useAverageScore(supplierId: string) {
  return useQuery({
    queryKey: ['performance-average', supplierId],
    queryFn: () => getAverageScore(supplierId),
    enabled: !!supplierId,
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * 获取绩效统计
 */
export function usePerformanceStats(supplierId: string) {
  return useQuery({
    queryKey: ['performance-stats', supplierId],
    queryFn: () => getPerformanceStats(supplierId),
    enabled: !!supplierId,
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * 按日期范围获取绩效历史
 */
export function usePerformanceHistoryByDateRange(
  supplierId: string,
  dateFrom: string,
  dateTo: string
) {
  return useQuery({
    queryKey: ['performance-history', 'range', supplierId, dateFrom, dateTo],
    queryFn: () => getPerformanceHistoryByDateRange(supplierId, dateFrom, dateTo),
    enabled: !!supplierId && !!dateFrom && !!dateTo,
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * 按周期获取绩效历史
 */
export function usePerformanceHistoryByPeriod(supplierId: string, period: string) {
  return useQuery({
    queryKey: ['performance-history', 'period', supplierId, period],
    queryFn: () => getPerformanceHistoryByPeriod(supplierId, period),
    enabled: !!supplierId && !!period,
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * 获取分数分布
 */
export function useScoreDistribution(supplierId: string) {
  return useQuery({
    queryKey: ['performance-distribution', supplierId],
    queryFn: () => getScoreDistribution(supplierId),
    enabled: !!supplierId,
    staleTime: 1000 * 60 * 10,
  })
}

/**
 * 创建绩效评估 Mutation
 */
export function useCreatePerformanceEvaluation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createPerformanceEvaluation,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['performance-history', variables.supplier_id] })
      queryClient.invalidateQueries({ queryKey: ['performance-average', variables.supplier_id] })
      queryClient.invalidateQueries({ queryKey: ['performance-stats', variables.supplier_id] })
      queryClient.invalidateQueries({ queryKey: ['performance-trend', variables.supplier_id] })
    },
  })
}

/**
 * 更新绩效评估 Mutation
 */
export function useUpdatePerformanceEvaluation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Parameters<typeof updatePerformanceEvaluation>[1] }) =>
      updatePerformanceEvaluation(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['performance-history', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['performance-stats'] })
    },
  })
}

/**
 * 删除绩效评估 Mutation
 */
export function useDeletePerformanceEvaluation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deletePerformanceEvaluation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-history'] })
      queryClient.invalidateQueries({ queryKey: ['performance-stats'] })
    },
  })
}

/**
 * 批量创建绩效评估 Mutation
 */
export function useBatchCreatePerformanceEvaluations() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: batchCreatePerformanceEvaluations,
    onSuccess: (_, variables) => {
      const supplierId = variables?.[0]?.supplier_id
      if (supplierId) {
        queryClient.invalidateQueries({ queryKey: ['performance-history', supplierId] })
      }
    },
  })
}
