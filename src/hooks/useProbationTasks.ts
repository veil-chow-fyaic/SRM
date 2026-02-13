/**
 * 考察任务 React Query Hooks
 *
 * 提供考察任务列表查询、创建、更新、删除等功能
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getProbationTasks,
  getProbationTaskById,
  createProbationTask,
  updateProbationTask,
  deleteProbationTask,
  getActiveProbationTask,
  getProbationTaskStats,
  batchCreateProbationTasks,
  type ProbationTaskCreate,
  type ProbationTaskUpdate,
  type ProbationTaskStatus
} from '../services/probationTasks'

/**
 * 获取供应商考察任务列表
 */
export function useProbationTasks(supplierId: string | undefined) {
  return useQuery({
    queryKey: ['probation-tasks', supplierId],
    queryFn: () => getProbationTasks(supplierId!),
    enabled: !!supplierId,
    staleTime: 1000 * 60 * 5, // 5 分钟内数据视为新鲜
  })
}

/**
 * 获取单个考察任务
 */
export function useProbationTask(taskId: string | undefined) {
  return useQuery({
    queryKey: ['probation-task', taskId],
    queryFn: () => getProbationTaskById(taskId!),
    enabled: !!taskId,
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * 获取活跃的考察任务（用于生命周期管理）
 */
export function useActiveProbationTask(supplierId: string | undefined) {
  return useQuery({
    queryKey: ['active-probation-task', supplierId],
    queryFn: () => getActiveProbationTask(supplierId!),
    enabled: !!supplierId,
    staleTime: 1000 * 60 * 2, // 2 分钟
  })
}

/**
 * 获取考察任务统计
 */
export function useProbationTaskStats(supplierId: string | undefined) {
  return useQuery({
    queryKey: ['probation-task-stats', supplierId],
    queryFn: () => getProbationTaskStats(supplierId!),
    enabled: !!supplierId,
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * 创建考察任务 Mutation
 */
export function useCreateProbationTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (task: ProbationTaskCreate) => {
      return await createProbationTask(task)
    },
    onSuccess: (_data, variables) => {
      // 创建成功后，使相关缓存失效
      queryClient.invalidateQueries({
        queryKey: ['probation-tasks', variables.supplier_id]
      })
      queryClient.invalidateQueries({
        queryKey: ['active-probation-task', variables.supplier_id]
      })
      queryClient.invalidateQueries({
        queryKey: ['probation-task-stats', variables.supplier_id]
      })
    },
  })
}

/**
 * 更新考察任务 Mutation
 */
export function useUpdateProbationTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: { taskId: string; updates: ProbationTaskUpdate; supplierId: string }) => {
      return await updateProbationTask(params.taskId, params.updates)
    },
    onSuccess: (_data, variables) => {
      // 使相关缓存失效
      queryClient.invalidateQueries({
        queryKey: ['probation-task', variables.taskId]
      })
      queryClient.invalidateQueries({
        queryKey: ['probation-tasks', variables.supplierId]
      })
      queryClient.invalidateQueries({
        queryKey: ['active-probation-task', variables.supplierId]
      })
      queryClient.invalidateQueries({
        queryKey: ['probation-task-stats', variables.supplierId]
      })
    },
  })
}

/**
 * 删除考察任务 Mutation
 */
export function useDeleteProbationTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: { taskId: string; supplierId: string }) => {
      return await deleteProbationTask(params.taskId)
    },
    onSuccess: (_data, variables) => {
      // 使相关缓存失效
      queryClient.invalidateQueries({
        queryKey: ['probation-tasks', variables.supplierId]
      })
      queryClient.invalidateQueries({
        queryKey: ['active-probation-task', variables.supplierId]
      })
      queryClient.invalidateQueries({
        queryKey: ['probation-task-stats', variables.supplierId]
      })
    },
  })
}

/**
 * 批量创建考察任务 Mutation
 */
export function useBatchCreateProbationTasks() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (tasks: ProbationTaskCreate[]) => {
      return await batchCreateProbationTasks(tasks)
    },
    onSuccess: (_count, variables) => {
      if (variables.length > 0) {
        const supplierId = variables[0].supplier_id
        queryClient.invalidateQueries({
          queryKey: ['probation-tasks', supplierId]
        })
        queryClient.invalidateQueries({
          queryKey: ['active-probation-task', supplierId]
        })
        queryClient.invalidateQueries({
          queryKey: ['probation-task-stats', supplierId]
        })
      }
    },
  })
}

/**
 * 更新任务状态 Mutation（便捷方法）
 */
export function useUpdateProbationTaskStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: { taskId: string; status: ProbationTaskStatus; supplierId: string }) => {
      return await updateProbationTask(params.taskId, { status: params.status })
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['probation-task', variables.taskId]
      })
      queryClient.invalidateQueries({
        queryKey: ['probation-tasks', variables.supplierId]
      })
      queryClient.invalidateQueries({
        queryKey: ['active-probation-task', variables.supplierId]
      })
      queryClient.invalidateQueries({
        queryKey: ['probation-task-stats', variables.supplierId]
      })
    },
  })
}
