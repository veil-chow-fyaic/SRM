// @ts-nocheck
/**
 * 合同管理服务
 *
 * 处理供应商合同的 CRUD 操作
 */

import { supabase, handleSupabaseError } from '../lib/supabase'

/**
 * 合同类型枚举
 */
export type ContractType = 'Framework' | 'Spot' | 'NDA' | 'MSA' | 'SOW' | 'Other'

/**
 * 合同状态枚举
 */
export type ContractStatus = 'draft' | 'active' | 'expired' | 'terminated' | 'renewed'

/**
 * 供应商合同接口
 */
export interface Contract {
  id: string
  supplier_id: string
  contract_number: string
  contract_name: string
  contract_type: ContractType
  start_date: string
  end_date: string | null
  status: ContractStatus
  value_amount: number | null
  currency: string
  payment_terms: string | null
  delivery_terms: string | null
  terms: string | null
  notes: string | null
  file_id: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

/**
 * 合同创建参数
 */
export interface ContractCreate {
  supplier_id: string
  contract_number: string
  contract_name: string
  contract_type: ContractType
  start_date: string
  end_date?: string
  value_amount?: number
  currency?: string
  payment_terms?: string
  delivery_terms?: string
  terms?: string
  notes?: string
  file_id?: string
}

/**
 * 合同更新参数
 */
export interface ContractUpdate {
  contract_number?: string
  contract_name?: string
  contract_type?: ContractType
  start_date?: string
  end_date?: string
  status?: ContractStatus
  value_amount?: number
  currency?: string
  payment_terms?: string
  delivery_terms?: string
  terms?: string
  notes?: string
  file_id?: string
}

/**
 * 合同统计信息
 */
export interface ContractStats {
  total_contracts: number
  active_contracts: number
  expired_contracts: number
  total_active_value: number
}

/**
 * 获取供应商的合同列表
 *
 * @param supplierId - 供应商 ID
 * @param status - 可选，按状态筛选
 * @returns 合同列表
 */
export async function getSupplierContracts(
  supplierId: string,
  status?: ContractStatus
): Promise<Contract[]> {
  console.log('获取供应商合同列表:', { supplierId, status })

  let query = supabase
    .from('contracts')
    .select('*')
    .eq('supplier_id', supplierId)
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) {
    throw handleSupabaseError(error)
  }

  console.log(`找到 ${data?.length || 0} 个合同`)
  return data || []
}

/**
 * 获取合同详情
 *
 * @param contractId - 合同 ID
 * @returns 合同详情
 */
export async function getContractById(contractId: string): Promise<Contract> {
  console.log('获取合同详情:', contractId)

  const { data, error } = await supabase
    .from('contracts')
    .select('*')
    .eq('id', contractId)
    .single()

  if (error) {
    throw handleSupabaseError(error)
  }

  return data as Contract
}

/**
 * 创建合同
 *
 * @param contract - 合同创建参数
 * @returns 创建的合同
 */
export async function createContract(contract: ContractCreate): Promise<Contract> {
  console.log('创建合同:', contract)

  const { data, error } = await supabase
    .from('contracts')
    .insert(contract)
    .select()
    .single()

  if (error) {
    throw handleSupabaseError(error)
  }

  console.log('合同创建成功:', data)
  return data as Contract
}

/**
 * 更新合同
 *
 * @param contractId - 合同 ID
 * @param updates - 更新内容
 * @returns 更新后的合同
 */
export async function updateContract(
  contractId: string,
  updates: ContractUpdate
): Promise<Contract> {
  console.log('更新合同:', { contractId, updates })

  const { data, error } = await supabase
    .from('contracts')
    .update(updates)
    .eq('id', contractId)
    .select()
    .single()

  if (error) {
    throw handleSupabaseError(error)
  }

  console.log('合同更新成功:', data)
  return data as Contract
}

/**
 * 删除合同
 *
 * @param contractId - 合同 ID
 * @returns 是否成功
 */
export async function deleteContract(contractId: string): Promise<boolean> {
  console.log('删除合同:', contractId)

  const { error } = await supabase
    .from('contracts')
    .delete()
    .eq('id', contractId)

  if (error) {
    throw handleSupabaseError(error)
  }

  console.log('合同删除成功')
  return true
}

/**
 * 获取供应商合同统计
 *
 * @param supplierId - 供应商 ID
 * @returns 统计信息
 */
export async function getContractStats(supplierId: string): Promise<ContractStats | null> {
  console.log('获取合同统计:', supplierId)

  const { data, error } = await supabase
    .from('contract_stats')
    .select('*')
    .eq('supplier_id', supplierId)
    .single()

  if (error) {
    // 如果没有统计数据，返回默认值
    if (error.code === 'PGRST116') {
      return {
        total_contracts: 0,
        active_contracts: 0,
        expired_contracts: 0,
        total_active_value: 0
      }
    }
    throw handleSupabaseError(error)
  }

  return data as ContractStats
}

/**
 * 批量更新过期合同状态
 *
 * @returns 更新的合同数量
 */
export async function updateExpiredContracts(): Promise<number> {
  console.log('更新过期合同状态')

  const { data, error } = await supabase.rpc('update_expired_contracts')

  if (error) {
    throw handleSupabaseError(error)
  }

  return data || 0
}

/**
 * 获取合同类型的显示名称
 */
export function getContractTypeDisplayName(type: ContractType): string {
  const typeNames: Record<ContractType, string> = {
    'Framework': '框架协议',
    'Spot': '现货合同',
    'NDA': '保密协议',
    'MSA': '主服务协议',
    'SOW': '工作说明书',
    'Other': '其他'
  }
  return typeNames[type] || type
}

/**
 * 获取合同状态的显示名称
 */
export function getContractStatusDisplayName(status: ContractStatus): string {
  const statusNames: Record<ContractStatus, string> = {
    'draft': '草稿',
    'active': '生效中',
    'expired': '已过期',
    'terminated': '已终止',
    'renewed': '已续签'
  }
  return statusNames[status] || status
}

/**
 * 格式化金额
 */
export function formatCurrency(amount: number | null, currency: string = 'CNY'): string {
  if (amount === null) return '-'

  const currencySymbols: Record<string, string> = {
    'CNY': '¥',
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥'
  }

  const symbol = currencySymbols[currency] || currency
  return `${symbol}${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
