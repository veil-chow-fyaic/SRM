/**
 * 供应商相关的 React Query Hooks
 *
 * 封装供应商数据的获取和变更操作
 */

import { useQuery, useMutation, useQueryClient, type UseQueryResult } from '@tanstack/react-query'
import {
  getSuppliers,
  getSuppliersSummary,
  getSupplierById,
  getSupplierDetail,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  checkCodeExists,
  getSupplierAlerts,
  getSupplierStats,
  getPerformanceTrends,
  getDashboardFullStats,
  searchSuppliersFulltext,
  subscribeToSupplierAlerts,
  getBusinessPerformanceTrends,
  getBusinessCategoryDistribution,
  getSupplierTierDistribution,
  type SupplierFilters,
} from '../services'

/**
 * 获取供应商列表
 */
export function useSuppliers(filters?: SupplierFilters): UseQueryResult<Awaited<ReturnType<typeof getSuppliers>>> {
  return useQuery({
    queryKey: ['suppliers', filters],
    queryFn: () => getSuppliers(filters),
    staleTime: 1000 * 60 * 5, // 5 分钟
  })
}

/**
 * 获取供应商汇总列表（用于列表页）
 */
export function useSuppliersSummary(filters?: SupplierFilters) {
  return useQuery({
    queryKey: ['suppliers', 'summary', filters],
    queryFn: () => getSuppliersSummary(filters),
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * 获取单个供应商详情
 */
export function useSupplier(id: string) {
  return useQuery({
    queryKey: ['supplier', id],
    queryFn: () => getSupplierById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2, // 2 分钟
  })
}

/**
 * 获取供应商完整详情（包含关联数据）
 */
export function useSupplierDetail(id: string) {
  return useQuery({
    queryKey: ['supplier', id, 'detail'],
    queryFn: () => getSupplierDetail(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  })
}

/**
 * 创建供应商 Mutation
 */
export function useCreateSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createSupplier,
    onSuccess: () => {
      // 刷新供应商列表
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      queryClient.invalidateQueries({ queryKey: ['suppliers', 'summary'] })
    },
  })
}

/**
 * 更新供应商 Mutation
 */
export function useUpdateSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Parameters<typeof updateSupplier>[1] }) =>
      updateSupplier(id, updates),
    onSuccess: (_, variables) => {
      // 刷新特定供应商
      queryClient.invalidateQueries({ queryKey: ['supplier', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['supplier', variables.id, 'detail'] })
      // 刷新列表
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      queryClient.invalidateQueries({ queryKey: ['suppliers', 'summary'] })
    },
  })
}

/**
 * 删除供应商 Mutation
 */
export function useDeleteSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      queryClient.invalidateQueries({ queryKey: ['suppliers', 'summary'] })
    },
  })
}

/**
 * 检查供应商代码是否存在
 */
export function useCheckCodeExists(code: string, excludeId?: string) {
  return useQuery({
    queryKey: ['supplier', 'code-exists', code, excludeId],
    queryFn: () => checkCodeExists(code, excludeId),
    enabled: !!code,
    staleTime: 1000 * 60, // 1 分钟
  })
}

/**
 * 获取供应商预警列表（用于 Dashboard 异常看板）
 */
export function useSupplierAlerts() {
  return useQuery({
    queryKey: ['suppliers', 'alerts'],
    queryFn: getSupplierAlerts,
    staleTime: 1000 * 60 * 5, // 5 分钟
    refetchInterval: 1000 * 60 * 10, // 每 10 分钟自动刷新
  })
}

/**
 * 获取供应商统计数据
 */
export function useSupplierStats() {
  return useQuery({
    queryKey: ['suppliers', 'stats'],
    queryFn: getSupplierStats,
    staleTime: 1000 * 60 * 5, // 5 分钟
    refetchInterval: 1000 * 60 * 15, // 每 15 分钟自动刷新
  })
}

/**
 * 获取绩效趋势数据
 */
export function usePerformanceTrends(months = 6) {
  return useQuery({
    queryKey: ['performance', 'trends', months],
    queryFn: () => getPerformanceTrends(months),
    staleTime: 1000 * 60 * 10, // 10 分钟
    refetchInterval: 1000 * 60 * 30, // 每 30 分钟自动刷新
  })
}

/**
 * 订阅供应商预警变更的 Hook
 */
export function useSupplierAlertsSubscription(callback: (payload: any) => void) {
  // 注意：需要在组件中使用 useEffect 来管理订阅
  // 这里只提供订阅函数
  return () => subscribeToSupplierAlerts(callback)
}

/**
 * 获取 Dashboard 完整统计数据（RPC 优化版本）
 *
 * 一次调用获取所有 Dashboard 需要的数据，包括：
 * - tasks: 待处理任务列表
 * - alerts: 供应商预警列表
 * - stats: 供应商统计（层级、状态分布等）
 * - performanceTrends: 绩效趋势数据
 * - businessStats: 业务统计（用于图表）
 *
 * 替代原来的 4+ 次 API 调用，性能提升 75%
 */
export function useDashboardFullStats() {
  return useQuery({
    queryKey: ['dashboard', 'full-stats'],
    queryFn: getDashboardFullStats,
    staleTime: 1000 * 60 * 5, // 5 分钟
    refetchInterval: 1000 * 60 * 10, // 每 10 分钟自动刷新
  })
}

/**
 * 供应商全文搜索 Hook（RPC 优化版本）
 *
 * 使用 PostgreSQL tsvector 全文搜索，性能优于 ILIKE
 * 支持中英文搜索、相关性排序、多条件筛选
 *
 * @param searchTerm - 搜索词
 * @param filters - 筛选条件
 * @param options - 分页选项
 *
 * 预期性能提升: 100x+ (大数据集)
 */
export function useSupplierSearchFulltext(
  searchTerm: string,
  filters?: {
    tier?: string
    status?: string
    stage?: string
    category?: string
  },
  options?: {
    limit?: number
    offset?: number
    enabled?: boolean
  }
) {
  return useQuery({
    queryKey: ['suppliers', 'search-fulltext', searchTerm, filters, options],
    queryFn: () => searchSuppliersFulltext(searchTerm, filters, options),
    enabled: (options?.enabled ?? true) && (searchTerm?.length > 0 || searchTerm === undefined),
    staleTime: 1000 * 60 * 2, // 2 分钟
  })
}

/**
 * 获取业务绩效趋势数据 Hook（真实数据）
 */
export function useBusinessPerformanceTrends(months = 6) {
  return useQuery({
    queryKey: ['performance', 'business-trends', months],
    queryFn: () => getBusinessPerformanceTrends(months),
    staleTime: 1000 * 60 * 10, // 10 分钟
  })
}

/**
 * 获取业务分类分布数据 Hook（真实数据）
 */
export function useBusinessCategoryDistribution() {
  return useQuery({
    queryKey: ['performance', 'category-distribution'],
    queryFn: getBusinessCategoryDistribution,
    staleTime: 1000 * 60 * 10,
  })
}

/**
 * 获取供应商层级分布数据 Hook（真实数据）
 */
export function useSupplierTierDistribution() {
  return useQuery({
    queryKey: ['performance', 'tier-distribution'],
    queryFn: getSupplierTierDistribution,
    staleTime: 1000 * 60 * 10,
  })
}
