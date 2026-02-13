/**
 * 任务相关的 React Query Hooks
 *
 * 封装任务数据的获取和变更操作
 */

import { useQuery, useMutation, useQueryClient, type UseQueryResult } from '@tanstack/react-query'
import {
  getTasks,
  getPendingTasks,
  getMyTasks,
  getOverdueTasks,
  getTaskById,
  createTask,
  batchCreateTasks,
  updateTask,
  completeTask,
  startTask,
  cancelTask,
  deleteTask,
  getTaskStats,
  getSupplierTasks,
  searchTasks,
  batchUpdateTaskStatus,
  batchAssignTasks,
  getAllPendingTasks,
  getPendingTasksByPriority,
  deleteCompletedTasks,
  subscribeToTasks,
  type TaskFilters,
  type TaskInsert,
  type TaskUpdate,
} from '../services/tasks'

/**
 * 获取任务列表
 */
export function useTasks(filters?: TaskFilters): UseQueryResult<Awaited<ReturnType<typeof getTasks>>> {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => getTasks(filters),
    staleTime: 1000 * 60 * 5, // 5 分钟
  })
}

/**
 * 获取待处理任务
 */
export function usePendingTasks(assigneeId?: string) {
  return useQuery({
    queryKey: ['tasks', 'pending', assigneeId],
    queryFn: () => getPendingTasks(assigneeId),
    staleTime: 1000 * 60 * 2, // 2 分钟
  })
}

/**
 * 获取我的任务
 */
export function useMyTasks(userId: string) {
  return useQuery({
    queryKey: ['tasks', 'my', userId],
    queryFn: () => getMyTasks(userId),
    staleTime: 1000 * 60 * 2,
  })
}

/**
 * 获取过期任务
 */
export function useOverdueTasks() {
  return useQuery({
    queryKey: ['tasks', 'overdue'],
    queryFn: getOverdueTasks,
    staleTime: 1000 * 60, // 1 分钟
    refetchInterval: 1000 * 60, // 每分钟自动刷新
  })
}

/**
 * 获取单个任务
 */
export function useTask(id: string) {
  return useQuery({
    queryKey: ['task', id],
    queryFn: () => getTaskById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  })
}

/**
 * 获取任务统计
 */
export function useTaskStats(userId?: string) {
  return useQuery({
    queryKey: ['tasks', 'stats', userId],
    queryFn: () => getTaskStats(userId),
    staleTime: 1000 * 60,
  })
}

/**
 * 创建任务 Mutation
 */
export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

/**
 * 批量创建任务 Mutation
 */
export function useBatchCreateTasks() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: batchCreateTasks,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

/**
 * 更新任务 Mutation
 */
export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: TaskUpdate }) =>
      updateTask(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

/**
 * 完成任务 Mutation
 */
export function useCompleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: completeTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

/**
 * 开始任务 Mutation
 */
export function useStartTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: startTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

/**
 * 取消任务 Mutation
 */
export function useCancelTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      cancelTask(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

/**
 * 删除任务 Mutation
 */
export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

/**
 * 获取供应商相关任务
 */
export function useSupplierTasks(supplierId: string) {
  return useQuery({
    queryKey: ['tasks', 'supplier', supplierId],
    queryFn: () => getSupplierTasks(supplierId),
    enabled: !!supplierId,
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * 搜索任务
 */
export function useSearchTasks(searchTerm: string) {
  return useQuery({
    queryKey: ['tasks', 'search', searchTerm],
    queryFn: () => searchTasks(searchTerm),
    enabled: !!searchTerm && searchTerm.length > 2,
    staleTime: 1000 * 60,
  })
}

/**
 * 批量更新任务状态 Mutation
 */
export function useBatchUpdateTaskStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: 'pending' | 'in_progress' | 'completed' | 'cancelled' }) =>
      batchUpdateTaskStatus(ids, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['tasks', 'stats'] })
    },
  })
}

/**
 * 批量分配任务 Mutation
 */
export function useBatchAssignTasks() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ ids, assigneeId, assigneeName }: { ids: string[]; assigneeId: string; assigneeName: string }) =>
      batchAssignTasks(ids, assigneeId, assigneeName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

/**
 * 获取所有待处理任务
 */
export function useAllPendingTasks() {
  return useQuery({
    queryKey: ['tasks', 'all-pending'],
    queryFn: getAllPendingTasks,
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 2, // 每 2 分钟自动刷新
  })
}

/**
 * 按优先级分组获取待处理任务
 */
export function usePendingTasksByPriority() {
  return useQuery({
    queryKey: ['tasks', 'pending-by-priority'],
    queryFn: getPendingTasksByPriority,
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 2,
  })
}

/**
 * 删除已完成任务 Mutation
 */
export function useDeleteCompletedTasks() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (olderThanDays = 90) => deleteCompletedTasks(olderThanDays),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['tasks', 'stats'] })
    },
  })
}

/**
 * 订阅任务变更的 Hook
 */
export function useTasksSubscription(userId: string, callback: (payload: any) => void) {
  // 注意：需要在组件中使用 useEffect 来管理订阅
  // 这里只提供订阅函数
  return () => subscribeToTasks(userId, callback)
}
