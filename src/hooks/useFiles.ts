/**
 * 文件管理 React Query Hooks
 *
 * 提供文件列表查询、上传、删除等功能
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getSupplierFiles,
  uploadSupplierFile,
  deleteSupplierFile,
  getFileDownloadUrl,
  type SupplierFile,
  type SupplierFileType
} from '../services/files'

/**
 * 获取供应商文件列表
 */
export function useSupplierFiles(supplierId: string | undefined) {
  return useQuery({
    queryKey: ['supplier-files', supplierId],
    queryFn: () => getSupplierFiles(supplierId!),
    enabled: !!supplierId,
    staleTime: 1000 * 60 * 5, // 5 分钟内数据视为新鲜
  })
}

/**
 * 上传文件 Mutation
 */
export function useUploadFile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      supplierId: string
      file: File
      fileType: SupplierFileType
      description?: string
    }) => {
      return await uploadSupplierFile(
        params.supplierId,
        params.file,
        params.fileType,
        params.description
      )
    },
    onSuccess: (_data, variables) => {
      // 上传成功后，使文件列表缓存失效，触发重新加载
      queryClient.invalidateQueries({
        queryKey: ['supplier-files', variables.supplierId]
      })
    },
  })
}

/**
 * 删除文件 Mutation
 */
export function useDeleteFile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      supplierId: string
      fileId: string
    }) => {
      return await deleteSupplierFile(params.fileId)
    },
    onSuccess: (_, variables) => {
      // 删除成功后，使文件列表缓存失效
      queryClient.invalidateQueries({
        queryKey: ['supplier-files', variables.supplierId]
      })
    },
  })
}

/**
 * 获取文件下载 URL
 */
export function useFileDownloadUrl() {
  return useMutation({
    mutationFn: async (file: SupplierFile) => {
      return await getFileDownloadUrl(file)
    },
  })
}
