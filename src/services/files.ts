// @ts-nocheck
/**
 * 文件管理服务
 *
 * 处理供应商相关文件的上传、下载、删除操作
 * 使用 Supabase Storage 存储文件
 */

import { supabase, handleSupabaseError } from '../lib/supabase'

/**
 * 文件类型枚举
 */
export type SupplierFileType = 'License' | 'Cert' | 'Contract' | 'Finance' | 'Other'

/**
 * 供应商文件接口
 */
export interface SupplierFile {
  id: string
  supplier_id: string
  file_name: string
  file_type: SupplierFileType
  file_size: number
  storage_path: string
  mime_type: string
  description: string | null
  uploaded_by: string | null
  created_at: string
  updated_at: string
}

/**
 * 文件上传结果
 */
export interface FileUploadResult {
  path: string
  fullPath: string
}

/**
 * 上传供应商文件
 *
 * @param supplierId - 供应商 ID
 * @param file - 文件对象
 * @param fileType - 文件类型
 * @param description - 文件描述
 * @returns 上传的文件记录
 */
export async function uploadSupplierFile(
  supplierId: string,
  file: File,
  fileType: SupplierFileType,
  description?: string
): Promise<SupplierFile> {
  console.log('开始上传文件:', { supplierId, fileName: file.name, fileType })

  // 1. 生成唯一文件名
  const fileExt = file.name.split('.').pop()
  const uniqueFileName = `${supplierId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

  try {
    // 2. 上传到 Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('supplier-docs')
      .upload(uniqueFileName, file)

    if (uploadError) {
      throw handleSupabaseError(uploadError)
    }

    console.log('文件上传成功:', uploadData)

    // 3. 创建数据库记录
    const { data, error } = await supabase
      .from('supplier_files')
      .insert({
        supplier_id: supplierId,
        file_name: file.name,
        file_type: fileType,
        file_size: file.size,
        storage_path: uploadData.path,
        mime_type: file.type || 'application/octet-stream',
        description: description || null,
      })
      .select()
      .single()

    if (error) {
      // 如果数据库插入失败，尝试删除已上传的文件
      await supabase.storage.from('supplier-docs').remove(uploadData.path)
      throw handleSupabaseError(error)
    }

    console.log('文件记录创建成功:', data)
    return data as SupplierFile

  } catch (error) {
    console.error('文件上传失败:', error)
    throw error
  }
}

/**
 * 获取供应商的文件列表
 *
 * @param supplierId - 供应商 ID
 * @param fileType - 可选，按文件类型筛选
 * @returns 文件列表
 */
export async function getSupplierFiles(
  supplierId: string,
  fileType?: SupplierFileType
): Promise<SupplierFile[]> {
  console.log('获取供应商文件列表:', { supplierId, fileType })

  let query = supabase
    .from('supplier_files')
    .select('*')
    .eq('supplier_id', supplierId)
    .order('created_at', { ascending: false })

  if (fileType) {
    query = query.eq('file_type', fileType)
  }

  const { data, error } = await query

  if (error) {
    throw handleSupabaseError(error)
  }

  console.log(`找到 ${data?.length || 0} 个文件`)
  return data || []
}

/**
 * 获取文件的下载 URL（带签名）
 *
 * @param file - 文件记录
 * @param expiresIn - 有效期（秒），默认 3600 (1小时）
 * @returns 签名的下载 URL
 */
export async function getFileDownloadUrl(
  file: SupplierFile,
  expiresIn: number = 3600
): Promise<string> {
  const { data, error } = await supabase.storage
    .from('supplier-docs')
    .createSignedUrl(file.storage_path, expiresIn)

  if (error) {
    throw handleSupabaseError(error)
  }

  return data.signedUrl
}

/**
 * 删除供应商文件
 *
 * @param fileId - 文件 ID
 * @returns 是否成功
 */
export async function deleteSupplierFile(fileId: string): Promise<boolean> {
  console.log('删除文件:', fileId)

  // 1. 获取文件信息
  const { data: file, error: fetchError } = await supabase
    .from('supplier_files')
    .select('*')
    .eq('id', fileId)
    .single()

  if (fetchError) {
    throw handleSupabaseError(fetchError)
  }

  // 2. 从数据库删除记录
  const { error: deleteError } = await supabase
    .from('supplier_files')
    .delete()
    .eq('id', fileId)

  if (deleteError) {
    throw handleSupabaseError(deleteError)
  }

  // 3. 从 Storage 删除文件
  const { error: storageError } = await supabase.storage
    .from('supplier-docs')
    .remove([file.storage_path])

  if (storageError) {
    console.warn('Storage 文件删除失败（但数据库记录已删除）:', storageError)
  }

  console.log('文件删除成功')
  return true
}

/**
 * 批量删除文件
 *
 * @param fileIds - 文件 ID 数组
 * @returns 删除的文件数量
 */
export async function batchDeleteSupplierFiles(fileIds: string[]): Promise<number> {
  console.log('批量删除文件:', fileIds.length, '个')

  let deletedCount = 0

  for (const fileId of fileIds) {
    try {
      await deleteSupplierFile(fileId)
      deletedCount++
    } catch (error) {
      console.error(`删除文件 ${fileId} 失败:`, error)
    }
  }

  return deletedCount
}

/**
 * 获取文件类型的显示名称
 */
export function getFileTypeDisplayName(fileType: SupplierFileType): string {
  const typeNames: Record<SupplierFileType, string> = {
    'License': '营业执照',
    'Cert': '认证证书',
    'Contract': '合同文件',
    'Finance': '财务文件',
    'Other': '其他文件'
  }
  return typeNames[fileType] || fileType
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}
