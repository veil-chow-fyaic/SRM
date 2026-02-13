// @ts-nocheck
/**
 * 衍生资源管理服务
 *
 * 处理供应商决策链成员的衍生资源 CRUD 操作
 * 衍生资源: 决策链成员背后的社会关系、协会、人脉等
 */

import { supabase, handleSupabaseError } from '../lib/supabase'

/**
 * 资源类型枚举
 */
export type ResourceType = 'Person' | 'Association' | 'Company' | 'Government' | 'Other'

/**
 * 价值等级枚举
 */
export type ValueLevel = 'critical' | 'high' | 'medium' | 'low'

/**
 * 衍生资源接口
 */
export interface DerivativeResource {
  id: string
  supplier_id: string
  decision_chain_member_id: string | null
  resource_name: string
  resource_type: ResourceType
  description: string | null
  value_level: ValueLevel | null
  last_verified: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

/**
 * 衍生资源创建参数
 */
export interface DerivativeResourceCreate {
  supplier_id: string
  decision_chain_member_id?: string
  resource_name: string
  resource_type: ResourceType
  description?: string
  value_level?: ValueLevel
  last_verified?: string
  notes?: string
}

/**
 * 衍生资源更新参数
 */
export interface DerivativeResourceUpdate {
  resource_name?: string
  resource_type?: ResourceType
  description?: string
  value_level?: ValueLevel
  last_verified?: string
  notes?: string
}

/**
 * 资源统计信息
 */
export interface ResourceStats {
  total_resources: number
  person_resources: number
  association_resources: number
  company_resources: number
  critical_resources: number
  high_value_resources: number
}

/**
 * 获取供应商的衍生资源列表
 *
 * @param supplierId - 供应商 ID
 * @param memberId - 可选，按决策链成员筛选
 * @param type - 可选，按资源类型筛选
 * @returns 资源列表
 */
export async function getDerivativeResources(
  supplierId: string,
  memberId?: string,
  type?: ResourceType
): Promise<DerivativeResource[]> {
  console.log('获取衍生资源列表:', { supplierId, memberId, type })

  let query = supabase
    .from('derivative_resources')
    .select('*')
    .eq('supplier_id', supplierId)
    .order('created_at', { ascending: false })

  if (memberId) {
    query = query.eq('decision_chain_member_id', memberId)
  }

  if (type) {
    query = query.eq('resource_type', type)
  }

  const { data, error } = await query

  if (error) {
    throw handleSupabaseError(error)
  }

  console.log(`找到 ${data?.length || 0} 个衍生资源`)
  return data || []
}

/**
 * 获取资源详情
 *
 * @param resourceId - 资源 ID
 * @returns 资源详情
 */
export async function getDerivativeResourceById(resourceId: string): Promise<DerivativeResource> {
  console.log('获取衍生资源详情:', resourceId)

  const { data, error } = await supabase
    .from('derivative_resources')
    .select('*')
    .eq('id', resourceId)
    .single()

  if (error) {
    throw handleSupabaseError(error)
  }

  return data as DerivativeResource
}

/**
 * 创建衍生资源
 *
 * @param resource - 资源创建参数
 * @returns 创建的资源
 */
export async function createDerivativeResource(resource: DerivativeResourceCreate): Promise<DerivativeResource> {
  console.log('创建衍生资源:', resource)

  const { data, error } = await supabase
    .from('derivative_resources')
    .insert(resource)
    .select()
    .single()

  if (error) {
    throw handleSupabaseError(error)
  }

  console.log('衍生资源创建成功:', data)
  return data as DerivativeResource
}

/**
 * 更新衍生资源
 *
 * @param resourceId - 资源 ID
 * @param updates - 更新内容
 * @returns 更新后的资源
 */
export async function updateDerivativeResource(
  resourceId: string,
  updates: DerivativeResourceUpdate
): Promise<DerivativeResource> {
  console.log('更新衍生资源:', { resourceId, updates })

  const { data, error } = await supabase
    .from('derivative_resources')
    .update(updates)
    .eq('id', resourceId)
    .select()
    .single()

  if (error) {
    throw handleSupabaseError(error)
  }

  console.log('衍生资源更新成功:', data)
  return data as DerivativeResource
}

/**
 * 删除衍生资源
 *
 * @param resourceId - 资源 ID
 * @returns 是否成功
 */
export async function deleteDerivativeResource(resourceId: string): Promise<boolean> {
  console.log('删除衍生资源:', resourceId)

  const { error } = await supabase
    .from('derivative_resources')
    .delete()
    .eq('id', resourceId)

  if (error) {
    throw handleSupabaseError(error)
  }

  console.log('衍生资源删除成功')
  return true
}

/**
 * 获取供应商衍生资源统计
 *
 * @param supplierId - 供应商 ID
 * @returns 统计信息
 */
export async function getResourceStats(supplierId: string): Promise<ResourceStats | null> {
  console.log('获取衍生资源统计:', supplierId)

  const { data, error } = await supabase
    .from('derivative_resource_stats')
    .select('*')
    .eq('supplier_id', supplierId)
    .single()

  if (error) {
    // 如果没有统计数据，返回默认值
    if (error.code === 'PGRST116') {
      return {
        total_resources: 0,
        person_resources: 0,
        association_resources: 0,
        company_resources: 0,
        critical_resources: 0,
        high_value_resources: 0
      }
    }
    throw handleSupabaseError(error)
  }

  return data as ResourceStats
}

/**
 * 批量创建衍生资源
 *
 * @param resources - 资源创建参数数组
 * @returns 创建的资源数量
 */
export async function batchCreateDerivativeResources(
  resources: DerivativeResourceCreate[]
): Promise<number> {
  console.log('批量创建衍生资源:', resources.length)

  const { data, error } = await supabase
    .from('derivative_resources')
    .insert(resources)
    .select()

  if (error) {
    throw handleSupabaseError(error)
  }

  console.log(`成功创建 ${data?.length || 0} 个衍生资源`)
  return data?.length || 0
}

/**
 * 获取资源类型的显示名称
 */
export function getResourceTypeDisplayName(type: ResourceType): string {
  const typeNames: Record<ResourceType, string> = {
    'Person': '个人人脉',
    'Association': '协会组织',
    'Company': '公司资源',
    'Government': '政府关系',
    'Other': '其他'
  }
  return typeNames[type] || type
}

/**
 * 获取价值等级的显示名称
 */
export function getValueLevelDisplayName(level: ValueLevel): string {
  const levelNames: Record<ValueLevel, string> = {
    'critical': '关键',
    'high': '高价值',
    'medium': '中等',
    'low': '一般'
  }
  return levelNames[level] || level
}

/**
 * 获取价值等级对应的颜色样式
 */
export function getValueLevelColor(level: ValueLevel | null): string {
  const colors: Record<ValueLevel, string> = {
    'critical': 'text-red-600 bg-red-50 border-red-200',
    'high': 'text-orange-600 bg-orange-50 border-orange-200',
    'medium': 'text-blue-600 bg-blue-50 border-blue-200',
    'low': 'text-slate-600 bg-slate-50 border-slate-200'
  }
  return level ? colors[level] : 'text-slate-600 bg-slate-50 border-slate-200'
}
