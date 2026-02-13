/**
 * 衍生资源 React Query Hooks
 *
 * 提供衍生资源列表查询、创建、更新、删除等功能
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getDerivativeResources,
  getDerivativeResourceById,
  createDerivativeResource,
  updateDerivativeResource,
  deleteDerivativeResource,
  getResourceStats,
  batchCreateDerivativeResources,
  type DerivativeResourceCreate,
  type DerivativeResourceUpdate,
  type ResourceType
} from '../services/resources'

/**
 * 获取供应商衍生资源列表
 */
export function useDerivativeResources(
  supplierId: string | undefined,
  memberId?: string,
  type?: ResourceType
) {
  return useQuery({
    queryKey: ['derivative-resources', supplierId, memberId, type],
    queryFn: () => getDerivativeResources(supplierId!, memberId, type),
    enabled: !!supplierId,
    staleTime: 1000 * 60 * 5, // 5 分钟内数据视为新鲜
  })
}

/**
 * 获取衍生资源详情
 */
export function useDerivativeResource(resourceId: string | undefined) {
  return useQuery({
    queryKey: ['derivative-resource', resourceId],
    queryFn: () => getDerivativeResourceById(resourceId!),
    enabled: !!resourceId,
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * 获取衍生资源统计
 */
export function useResourceStats(supplierId: string | undefined) {
  return useQuery({
    queryKey: ['resource-stats', supplierId],
    queryFn: () => getResourceStats(supplierId!),
    enabled: !!supplierId,
    staleTime: 1000 * 60 * 10, // 10 分钟
  })
}

/**
 * 创建衍生资源 Mutation
 */
export function useCreateDerivativeResource() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: { resource: DerivativeResourceCreate }) => {
      return await createDerivativeResource(params.resource)
    },
    onSuccess: (_data, variables) => {
      // 创建成功后，使资源列表缓存失效
      queryClient.invalidateQueries({
        queryKey: ['derivative-resources', variables.resource.supplier_id]
      })
      // 使统计缓存失效
      queryClient.invalidateQueries({
        queryKey: ['resource-stats', variables.resource.supplier_id]
      })
    },
  })
}

/**
 * 批量创建衍生资源 Mutation
 */
export function useBatchCreateDerivativeResources() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: { resources: DerivativeResourceCreate[] }) => {
      return await batchCreateDerivativeResources(params.resources)
    },
    onSuccess: (_count, variables) => {
      if (variables.resources.length > 0) {
        const supplierId = variables.resources[0].supplier_id
        // 使资源列表缓存失效
        queryClient.invalidateQueries({
          queryKey: ['derivative-resources', supplierId]
        })
        // 使统计缓存失效
        queryClient.invalidateQueries({
          queryKey: ['resource-stats', supplierId]
        })
      }
    },
  })
}

/**
 * 更新衍生资源 Mutation
 */
export function useUpdateDerivativeResource() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: { resourceId: string; updates: DerivativeResourceUpdate }) => {
      return await updateDerivativeResource(params.resourceId, params.updates)
    },
    onSuccess: (_data, variables) => {
      // 使详情缓存失效
      queryClient.invalidateQueries({
        queryKey: ['derivative-resource', variables.resourceId]
      })
    },
  })
}

/**
 * 删除衍生资源 Mutation
 */
export function useDeleteDerivativeResource() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: { resourceId: string; supplierId: string }) => {
      return await deleteDerivativeResource(params.resourceId)
    },
    onSuccess: (_data, variables) => {
      // 使资源列表和统计缓存失效
      queryClient.invalidateQueries({
        queryKey: ['derivative-resources', variables.supplierId]
      })
      queryClient.invalidateQueries({
        queryKey: ['resource-stats', variables.supplierId]
      })
    },
  })
}

/**
 * 资源类型类型守卫
 */
export function isValidResourceType(type: string): type is ResourceType {
  return ['Person', 'Association', 'Company', 'Government', 'Other'].includes(type)
}
