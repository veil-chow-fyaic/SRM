/**
 * 供应商修改记录 Hook
 * 用于获取和管理供应商的变更历史
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getSupplierChangeLogs,
  updateSupplierWithLog,
  createSupplierChangeLog
} from '../services/supplierChangeLogs'
import type { SupplierUpdate, ChangeType } from '../types/database'

/**
 * 获取供应商修改历史的 Hook
 * @param supplierId 供应商ID
 * @param limit 返回记录数量限制
 */
export function useSupplierChangeLogs(supplierId: string, limit: number = 20) {
  return useQuery({
    queryKey: ['supplierChangeLogs', supplierId, limit],
    queryFn: () => getSupplierChangeLogs(supplierId, limit),
    enabled: !!supplierId,
    staleTime: 30000, // 30秒内不重新获取
  })
}

/**
 * 更新供应商并记录日志的 Hook
 */
export function useUpdateSupplierWithLog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: {
      supplierId: string
      updates: SupplierUpdate
      changeType?: ChangeType
      changeTitle?: string
      changeDescription?: string
      authorId?: string
      authorName?: string
    }) =>
      updateSupplierWithLog(
        params.supplierId,
        params.updates,
        params.changeType,
        params.changeTitle,
        params.changeDescription,
        params.authorId,
        params.authorName
      ),
    onSuccess: (_, variables) => {
      // 使相关的缓存失效，触发重新获取
      queryClient.invalidateQueries({
        queryKey: ['supplierChangeLogs', variables.supplierId]
      })
      queryClient.invalidateQueries({
        queryKey: ['supplier', variables.supplierId]
      })
      queryClient.invalidateQueries({
        queryKey: ['suppliers']
      })
    },
  })
}

/**
 * 创建修改记录的 Hook
 */
export function useCreateSupplierChangeLog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: {
      supplierId: string
      changeType: ChangeType
      changeTitle: string
      changeDescription?: string
      oldValue?: Record<string, unknown>
      newValue?: Record<string, unknown>
      changedFields?: string[]
      authorId?: string
      authorName?: string
    }) => createSupplierChangeLog({
      supplier_id: params.supplierId,
      change_type: params.changeType,
      change_title: params.changeTitle,
      change_description: params.changeDescription,
      old_value: params.oldValue,
      new_value: params.newValue,
      changed_fields: params.changedFields,
      author_id: params.authorId,
      author_name: params.authorName
    }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['supplierChangeLogs', variables.supplierId]
      })
    },
  })
}
