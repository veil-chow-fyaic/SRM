/**
 * 个人计划 Hook
 * 用于管理个人计划的增删改查和日历同步
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getPersonalPlans,
  createPersonalPlan,
  updatePersonalPlan,
  deletePersonalPlan,
  syncPlanToCalendar
} from '../services/personalPlans'
import type { CreatePersonalPlanParams } from '../types/database'

/**
 * 获取个人计划列表的 Hook
 * @param startDate 开始日期 (可选)
 * @param endDate 结束日期 (可选)
 */
export function usePersonalPlans(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['personalPlans', startDate, endDate],
    queryFn: () => getPersonalPlans(startDate, endDate),
    staleTime: 60000, // 1分钟内不重新获取
  })
}

/**
 * 创建个人计划的 Hook
 */
export function useCreatePersonalPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (plan: CreatePersonalPlanParams) => createPersonalPlan(plan),
    onSuccess: () => {
      // 使相关的缓存失效
      queryClient.invalidateQueries({ queryKey: ['personalPlans'] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['calendarEvents'] })
    },
  })
}

/**
 * 更新个人计划的 Hook
 */
export function useUpdatePersonalPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: {
      planId: string
      updates: Partial<CreatePersonalPlanParams & { status?: string }>
    }) => updatePersonalPlan(params.planId, params.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personalPlans'] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['calendarEvents'] })
    },
  })
}

/**
 * 删除个人计划的 Hook
 */
export function useDeletePersonalPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (planId: string) => deletePersonalPlan(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personalPlans'] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['calendarEvents'] })
    },
  })
}

/**
 * 同步计划到日历的 Hook
 */
export function useSyncPlanToCalendar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: { taskId: string; createEvent: boolean }) =>
      syncPlanToCalendar(params.taskId, params.createEvent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendarEvents'] })
    },
  })
}
