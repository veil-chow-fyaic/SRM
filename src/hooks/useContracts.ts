/**
 * 合同管理 React Query Hooks
 *
 * 提供合同列表查询、创建、更新、删除等功能
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getSupplierContracts,
  getContractById,
  createContract,
  updateContract,
  deleteContract,
  getContractStats,
  type ContractCreate,
  type ContractUpdate,
  type ContractStatus
} from '../services/contracts'

/**
 * 获取供应商合同列表
 */
export function useSupplierContracts(supplierId: string | undefined, status?: ContractStatus) {
  return useQuery({
    queryKey: ['supplier-contracts', supplierId, status],
    queryFn: () => getSupplierContracts(supplierId!, status),
    enabled: !!supplierId,
    staleTime: 1000 * 60 * 5, // 5 分钟内数据视为新鲜
  })
}

/**
 * 获取合同详情
 */
export function useContract(contractId: string | undefined) {
  return useQuery({
    queryKey: ['contract', contractId],
    queryFn: () => getContractById(contractId!),
    enabled: !!contractId,
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * 获取合同统计
 */
export function useContractStats(supplierId: string | undefined) {
  return useQuery({
    queryKey: ['contract-stats', supplierId],
    queryFn: () => getContractStats(supplierId!),
    enabled: !!supplierId,
    staleTime: 1000 * 60 * 10, // 10 分钟
  })
}

/**
 * 创建合同 Mutation
 */
export function useCreateContract() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: { contract: ContractCreate }) => {
      return await createContract(params.contract)
    },
    onSuccess: (_data, variables) => {
      // 创建成功后，使合同列表缓存失效
      queryClient.invalidateQueries({
        queryKey: ['supplier-contracts', variables.contract.supplier_id]
      })
      // 使统计缓存失效
      queryClient.invalidateQueries({
        queryKey: ['contract-stats', variables.contract.supplier_id]
      })
    },
  })
}

/**
 * 更新合同 Mutation
 */
export function useUpdateContract() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: { contractId: string; updates: ContractUpdate }) => {
      return await updateContract(params.contractId, params.updates)
    },
    onSuccess: (_data, variables) => {
      // 使详情缓存失效
      queryClient.invalidateQueries({
        queryKey: ['contract', variables.contractId]
      })
    },
  })
}

/**
 * 删除合同 Mutation
 */
export function useDeleteContract() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: { contractId: string; supplierId: string }) => {
      return await deleteContract(params.contractId)
    },
    onSuccess: (_data, variables) => {
      // 使合同列表和统计缓存失效
      queryClient.invalidateQueries({
        queryKey: ['supplier-contracts', variables.supplierId]
      })
      queryClient.invalidateQueries({
        queryKey: ['contract-stats', variables.supplierId]
      })
    },
  })
}

/**
 * 合同状态类型守卫
 */
export function isValidContractStatus(status: string): status is ContractStatus {
  return ['draft', 'active', 'expired', 'terminated', 'renewed'].includes(status)
}
