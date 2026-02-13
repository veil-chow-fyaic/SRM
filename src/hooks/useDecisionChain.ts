/**
 * 决策链相关的 React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getDecisionChain,
  getDecisionChainByFilters,
  getDecisionChainMemberById,
  getDecisionChainStats,
  createDecisionChainMember,
  updateDecisionChainMember,
  updateAffinity,
  updateDecisionChainResource,
  deleteDecisionChainMember,
  addDecisionChainResource,
  deleteDecisionChainResource,
  batchCreateDecisionChainMembers,
  batchUpdateAffinity,
  batchDeleteDecisionChainMembers,
  batchAddDecisionChainResources,
  type DecisionChainFilters,
} from '../services'

/**
 * 获取供应商的决策链列表
 */
export function useDecisionChain(supplierId: string) {
  return useQuery({
    queryKey: ['decision-chain', supplierId],
    queryFn: () => getDecisionChain(supplierId),
    enabled: !!supplierId,
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * 获取单个决策链成员
 */
export function useDecisionChainMember(id: string) {
  return useQuery({
    queryKey: ['decision-chain-member', id],
    queryFn: () => getDecisionChainMemberById(id),
    enabled: !!id,
  })
}

/**
 * 创建决策链成员 Mutation
 */
export function useCreateDecisionChainMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createDecisionChainMember,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['decision-chain', variables.supplier_id] })
    },
  })
}

/**
 * 更新决策链成员 Mutation
 */
export function useUpdateDecisionChainMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Parameters<typeof updateDecisionChainMember>[1] }) =>
      updateDecisionChainMember(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decision-chain'] })
    },
  })
}

/**
 * 更新亲密度 Mutation
 */
export function useUpdateAffinity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, affinity }: { id: string; affinity: number }) =>
      updateAffinity(id, affinity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decision-chain'] })
    },
  })
}

/**
 * 删除决策链成员 Mutation
 */
export function useDeleteDecisionChainMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteDecisionChainMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decision-chain'] })
    },
  })
}

/**
 * 批量创建决策链成员 Mutation
 */
export function useBatchCreateDecisionChainMembers() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: batchCreateDecisionChainMembers,
    onSuccess: (data: any) => {
      // 获取供应商 ID 并刷新
      const supplierId = data?.[0]?.supplier_id
      if (supplierId) {
        queryClient.invalidateQueries({ queryKey: ['decision-chain', supplierId] })
      }
    },
  })
}

/**
 * 添加决策链资源 Mutation
 */
export function useAddDecisionChainResource() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ decisionChainId, resource }: { decisionChainId: string; resource: Parameters<typeof addDecisionChainResource>[1] }) =>
      addDecisionChainResource(decisionChainId, resource),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decision-chain'] })
      queryClient.invalidateQueries({ queryKey: ['decision-chain-member'] })
    },
  })
}

/**
 * 删除决策链资源 Mutation
 */
export function useDeleteDecisionChainResource() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteDecisionChainResource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decision-chain'] })
      queryClient.invalidateQueries({ queryKey: ['decision-chain-member'] })
    },
  })
}

/**
 * 按筛选条件获取决策链
 */
export function useDecisionChainByFilters(filters: DecisionChainFilters) {
  return useQuery({
    queryKey: ['decision-chain', 'filters', filters],
    queryFn: () => getDecisionChainByFilters(filters),
    enabled: !!filters.supplierId,
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * 获取决策链统计
 */
export function useDecisionChainStats(supplierId: string) {
  return useQuery({
    queryKey: ['decision-chain', 'stats', supplierId],
    queryFn: () => getDecisionChainStats(supplierId),
    enabled: !!supplierId,
    staleTime: 1000 * 60 * 2,
  })
}

/**
 * 批量更新亲密度 Mutation
 */
export function useBatchUpdateAffinity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: batchUpdateAffinity,
    onSuccess: (_, variables) => {
      const supplierId = variables?.[0]?.id ? undefined : variables
      queryClient.invalidateQueries({ queryKey: ['decision-chain'] })
      queryClient.invalidateQueries({ queryKey: ['decision-chain', 'stats'] })
    },
  })
}

/**
 * 批量删除决策链成员 Mutation
 */
export function useBatchDeleteDecisionChainMembers() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: batchDeleteDecisionChainMembers,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decision-chain'] })
      queryClient.invalidateQueries({ queryKey: ['decision-chain', 'stats'] })
    },
  })
}

/**
 * 更新决策链资源 Mutation
 */
export function useUpdateDecisionChainResource() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Parameters<typeof updateDecisionChainResource>[1] }) =>
      updateDecisionChainResource(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decision-chain'] })
      queryClient.invalidateQueries({ queryKey: ['decision-chain-member'] })
    },
  })
}

/**
 * 批量添加决策链资源 Mutation
 */
export function useBatchAddDecisionChainResources() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: batchAddDecisionChainResources,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decision-chain'] })
      queryClient.invalidateQueries({ queryKey: ['decision-chain-member'] })
    },
  })
}
