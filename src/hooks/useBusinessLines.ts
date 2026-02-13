/**
 * 业务线相关的 React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getBusinessLines,
  getBusinessLineById,
  getBusinessLinesByType,
  createBusinessLine,
  updateBusinessLine,
  deleteBusinessLine,
  addBusinessLineContact,
  updateBusinessLineContact,
  deleteBusinessLineContact,
  setPrimaryContact,
  getPrimaryContact,
  getBusinessLineContacts,
  batchCreateBusinessLines,
  batchDeleteBusinessLines,
  getBusinessLinesStats,
  subscribeToBusinessLines,
  createBusinessLineContact,
  batchCreateBusinessLineContacts,
} from '../services'

/**
 * 获取供应商的业务线列表
 */
export function useBusinessLines(supplierId: string) {
  return useQuery({
    queryKey: ['business-lines', supplierId],
    queryFn: () => getBusinessLines(supplierId),
    enabled: !!supplierId,
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * 获取单个业务线
 */
export function useBusinessLine(id: string) {
  return useQuery({
    queryKey: ['business-line', id],
    queryFn: () => getBusinessLineById(id),
    enabled: !!id,
  })
}

/**
 * 创建业务线 Mutation
 */
export function useCreateBusinessLine() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      businessLine,
      contacts,
    }: {
      businessLine: Parameters<typeof createBusinessLine>[0]
      contacts?: Parameters<typeof createBusinessLine>[1]
    }) => createBusinessLine(businessLine, contacts),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['business-lines', variables.businessLine.supplier_id] })
    },
  })
}

/**
 * 更新业务线 Mutation
 */
export function useUpdateBusinessLine() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Parameters<typeof updateBusinessLine>[1] }) =>
      updateBusinessLine(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-lines'] })
    },
  })
}

/**
 * 删除业务线 Mutation
 */
export function useDeleteBusinessLine() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteBusinessLine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-lines'] })
    },
  })
}

/**
 * 添加业务线联系人 Mutation
 */
export function useAddBusinessLineContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      businessLineId,
      contact,
    }: {
      businessLineId: string
      contact: Parameters<typeof addBusinessLineContact>[1]
    }) => addBusinessLineContact(businessLineId, contact),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-lines'] })
      queryClient.invalidateQueries({ queryKey: ['business-line'] })
    },
  })
}

/**
 * 更新业务线联系人 Mutation
 */
export function useUpdateBusinessLineContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      contactId,
      updates,
    }: {
      contactId: string
      updates: Parameters<typeof updateBusinessLineContact>[1]
    }) => updateBusinessLineContact(contactId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-lines'] })
      queryClient.invalidateQueries({ queryKey: ['business-line'] })
    },
  })
}

/**
 * 删除业务线联系人 Mutation
 */
export function useDeleteBusinessLineContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteBusinessLineContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-lines'] })
      queryClient.invalidateQueries({ queryKey: ['business-line'] })
    },
  })
}

/**
 * 设置主联系人 Mutation
 */
export function useSetPrimaryContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ businessLineId, contactId }: { businessLineId: string; contactId: string }) =>
      setPrimaryContact(businessLineId, contactId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-lines'] })
      queryClient.invalidateQueries({ queryKey: ['business-line'] })
    },
  })
}

/**
 * 获取主联系人
 */
export function usePrimaryContact(businessLineId: string) {
  return useQuery({
    queryKey: ['business-line', 'primary-contact', businessLineId],
    queryFn: () => getPrimaryContact(businessLineId),
    enabled: !!businessLineId,
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * 获取业务线的所有联系人
 */
export function useBusinessLineContacts(businessLineId: string) {
  return useQuery({
    queryKey: ['business-line', 'contacts', businessLineId],
    queryFn: () => getBusinessLineContacts(businessLineId),
    enabled: !!businessLineId,
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * 按类型筛选业务线
 */
export function useBusinessLinesByType(supplierId: string, types: string[]) {
  return useQuery({
    queryKey: ['business-lines', 'by-type', supplierId, types],
    queryFn: () => getBusinessLinesByType(supplierId, types),
    enabled: !!supplierId && types.length > 0,
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * 获取业务线统计
 */
export function useBusinessLinesStats(supplierId: string) {
  return useQuery({
    queryKey: ['business-lines', 'stats', supplierId],
    queryFn: () => getBusinessLinesStats(supplierId),
    enabled: !!supplierId,
    staleTime: 1000 * 60 * 10,
  })
}

/**
 * 批量创建业务线 Mutation
 */
export function useBatchCreateBusinessLines() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: batchCreateBusinessLines,
    onSuccess: (_, variables) => {
      const supplierId = variables?.[0]?.supplier_id
      if (supplierId) {
        queryClient.invalidateQueries({ queryKey: ['business-lines', supplierId] })
      }
    },
  })
}

/**
 * 批量删除业务线 Mutation
 */
export function useBatchDeleteBusinessLines() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: batchDeleteBusinessLines,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-lines'] })
    },
  })
}

/**
 * 创建业务线联系人 Mutation
 */
export function useCreateBusinessLineContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createBusinessLineContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-lines'] })
      queryClient.invalidateQueries({ queryKey: ['business-line'] })
    },
  })
}

/**
 * 批量创建联系人 Mutation
 */
export function useBatchCreateBusinessLineContacts() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: batchCreateBusinessLineContacts,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-lines'] })
    },
  })
}
