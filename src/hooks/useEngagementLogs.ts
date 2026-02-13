/**
 * 互动日志相关的 React Query Hooks
 */

// @ts-nocheck - 临时禁用类型检查
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getEngagementLogs,
  getEngagementLogsByFilters,
  getRecentEngagementLogs,
  getEngagementLogById,
  createEngagementLog,
  completeEngagementLog,
  updateEngagementLog,
  cancelEngagementLog,
  deleteEngagementLog,
  batchUpdateEngagementLogStatus,
  getPendingFollowUps,
  getEngagementStats,
  getEngagementTimeline,
  getEngagementDimensionSummary,
  searchEngagementLogs,
  subscribeToEngagementLogs,
  getAllEngagementLogs,
  searchAllEngagementLogs,
} from '../services/engagementLogs'
import type { EngagementLogUpdate, EngagementLogFilters, LogStatus } from '../types/database'

/**
 * 获取供应商的互动日志列表
 */
export function useEngagementLogs(supplierId: string, limit = 50) {
  return useQuery({
    queryKey: ['engagement-logs', supplierId, limit],
    queryFn: () => getEngagementLogs(supplierId, limit),
    enabled: !!supplierId,
    staleTime: 1000 * 60 * 2,
  })
}

/**
 * 获取特定状态的互动日志
 */
export function useEngagementLogsByStatus(
  supplierId: string,
  status: 'planned' | 'completed' | 'cancelled'
) {
  return useQuery({
    queryKey: ['engagement-logs', supplierId, 'status', status],
    queryFn: () => getEngagementLogsByStatus(supplierId, status),
    enabled: !!supplierId,
    staleTime: 1000 * 60,
  })
}

/**
 * 获取单个互动日志
 */
export function useEngagementLog(id: string) {
  return useQuery({
    queryKey: ['engagement-log', id],
    queryFn: () => getEngagementLogById(id),
    enabled: !!id,
  })
}

/**
 * 获取待跟进的日志
 */
export function usePendingFollowUps(supplierId?: string) {
  return useQuery({
    queryKey: ['engagement-logs', 'pending-follow-ups', supplierId],
    queryFn: () => getPendingFollowUps(supplierId),
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * 获取互动统计
 */
export function useEngagementStats(supplierId: string) {
  return useQuery({
    queryKey: ['engagement-stats', supplierId],
    queryFn: () => getEngagementStats(supplierId),
    enabled: !!supplierId,
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * 创建互动日志 Mutation
 */
export function useCreateEngagementLog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createEngagementLog,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['engagement-logs', variables.supplier_id] })
      queryClient.invalidateQueries({ queryKey: ['engagement-stats', variables.supplier_id] })
    },
  })
}

/**
 * 完成互动日志 Mutation
 */
export function useCompleteEngagementLog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, completionData }: { id: string; completionData: Parameters<typeof completeEngagementLog>[1] }) =>
      completeEngagementLog(id, completionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['engagement-logs'] })
      queryClient.invalidateQueries({ queryKey: ['engagement-stats'] })
    },
  })
}

/**
 * 更新互动日志 Mutation
 */
export function useUpdateEngagementLog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: EngagementLogUpdate }) =>
      updateEngagementLog(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['engagement-logs'] })
    },
  })
}

/**
 * 删除互动日志 Mutation
 */
export function useDeleteEngagementLog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteEngagementLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['engagement-logs'] })
      queryClient.invalidateQueries({ queryKey: ['engagement-stats'] })
    },
  })
}

/**
 * 订阅互动日志变更的 Hook
 */
export function useEngagementLogsSubscription(supplierId: string, callback: (payload: any) => void) {
  // 注意：需要在组件中使用 useEffect 来管理订阅
  // 这里只提供订阅函数
  return () => subscribeToEngagementLogs(supplierId, callback)
}

/**
 * 按筛选条件获取互动日志
 */
export function useEngagementLogsByFilters(filters: EngagementLogFilters) {
  return useQuery({
    queryKey: ['engagement-logs', 'filters', filters],
    queryFn: () => getEngagementLogsByFilters(filters),
    enabled: !!filters.supplierId,
    staleTime: 1000 * 60 * 2,
  })
}

/**
 * 获取最近的互动日志
 */
export function useRecentEngagementLogs(supplierId: string, days = 30) {
  return useQuery({
    queryKey: ['engagement-logs', 'recent', supplierId, days],
    queryFn: () => getRecentEngagementLogs(supplierId, days),
    enabled: !!supplierId,
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * 获取互动时间线
 */
export function useEngagementTimeline(supplierId: string, months = 6) {
  return useQuery({
    queryKey: ['engagement-logs', 'timeline', supplierId, months],
    queryFn: () => getEngagementTimeline(supplierId, months),
    enabled: !!supplierId,
    staleTime: 1000 * 60 * 10,
  })
}

/**
 * 获取互动维度汇总
 */
export function useEngagementDimensionSummary(supplierId: string) {
  return useQuery({
    queryKey: ['engagement-logs', 'dimensions', supplierId],
    queryFn: () => getEngagementDimensionSummary(supplierId),
    enabled: !!supplierId,
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * 搜索互动日志
 */
export function useSearchEngagementLogs(supplierId: string, searchTerm: string) {
  return useQuery({
    queryKey: ['engagement-logs', 'search', supplierId, searchTerm],
    queryFn: () => searchEngagementLogs(supplierId, searchTerm),
    enabled: !!supplierId && !!searchTerm && searchTerm.length > 2,
    staleTime: 1000 * 60,
  })
}

/**
 * 批量更新互动日志状态 Mutation
 */
export function useBatchUpdateEngagementLogStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: LogStatus }) =>
      batchUpdateEngagementLogStatus(ids, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['engagement-logs'] })
      queryClient.invalidateQueries({ queryKey: ['engagement-stats'] })
    },
  })
}

/**
 * 取消互动日志 Mutation
 */
export function useCancelEngagementLog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: cancelEngagementLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['engagement-logs'] })
    },
  })
}

/**
 * 获取所有互动日志（全局日志流）
 */
export function useAllEngagementLogs(limit = 50) {
  return useQuery({
    queryKey: ['engagement-logs', 'all', limit],
    queryFn: () => getAllEngagementLogs(limit),
    staleTime: 1000 * 60 * 2, // 2 分钟
    refetchInterval: 1000 * 60 * 5, // 每 5 分钟自动刷新
  })
}

/**
 * 全局搜索互动日志
 */
export function useSearchAllEngagementLogs(searchTerm: string) {
  return useQuery({
    queryKey: ['engagement-logs', 'search-all', searchTerm],
    queryFn: () => searchAllEngagementLogs(searchTerm),
    enabled: !!searchTerm && searchTerm.length > 2,
    staleTime: 1000 * 60, // 1 分钟
  })
}
