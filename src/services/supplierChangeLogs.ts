/**
 * 供应商修改记录服务
 * 用于追踪供应商信息的所有变更历史
 */

// @ts-nocheck - 临时禁用类型检查，等待 Supabase 类型生成更新
import { supabase } from '../lib/supabase'
import type {
  SupplierChangeLog,
  SupplierUpdate,
  UpdateSupplierWithLogResult,
  ChangeType
} from '../types/database'

function normalizeSupplierUpdatePayload(updates: SupplierUpdate): SupplierUpdate {
  const normalized: SupplierUpdate = { ...updates }

  if (normalized.financial_interval) {
    const intervalMap: Record<string, string> = {
      semimonthly: 'semi_monthly',
      semi_monthly: 'semi_monthly',
      ticket: 'per_shipment',
      per_shipment: 'per_shipment',
      monthly: 'monthly',
      weekly: 'weekly',
    }
    const key = String(normalized.financial_interval).toLowerCase().replace(/-/g, '_')
    normalized.financial_interval = intervalMap[key] ?? normalized.financial_interval
  }

  if (normalized.financial_anchor) {
    const anchorMap: Record<string, string> = {
      etd: 'etd',
      eta: 'eta',
      gate_in: 'gate_in',
      invoice: 'invoice_date',
      invoice_date: 'invoice_date',
    }
    const key = String(normalized.financial_anchor).toLowerCase().replace(/[-\s]/g, '_')
    normalized.financial_anchor = anchorMap[key] ?? normalized.financial_anchor
  }

  if (normalized.evaluation_period) {
    const periodMap: Record<string, string> = {
      semiannual: 'annual',
      semi_annual: 'annual',
      monthly: 'monthly',
      quarterly: 'quarterly',
      annual: 'annual',
    }
    const key = String(normalized.evaluation_period).toLowerCase().replace(/[-\s]/g, '_')
    normalized.evaluation_period = periodMap[key] ?? normalized.evaluation_period
  }

  return normalized
}

/**
 * 更新供应商信息并自动记录修改日志
 * @param supplierId 供应商ID
 * @param updates 要更新的字段
 * @param changeType 修改类型
 * @param changeTitle 修改标题
 * @param changeDescription 修改描述
 * @param authorId 操作者ID
 * @param authorName 操作者名称
 */
export async function updateSupplierWithLog(
  supplierId: string,
  updates: SupplierUpdate,
  changeType: ChangeType = 'basic',
  changeTitle: string = '供应商信息更新',
  changeDescription?: string,
  authorId?: string,
  authorName?: string
): Promise<UpdateSupplierWithLogResult> {
  try {
    const normalizedUpdates = normalizeSupplierUpdatePayload(updates)

    const { data, error } = await supabase.rpc('update_supplier_with_log', {
      p_supplier_id: supplierId,
      p_updates: normalizedUpdates,
      p_change_type: changeType,
      p_change_title: changeTitle,
      p_change_description: changeDescription || null,
      p_author_id: authorId || null,
      p_author_name: authorName || null
    })

    if (error) {
      console.error('更新供应商失败:', error)
      return {
        success: false,
        supplier: null,
        changed_fields: null,
        log_id: null,
        error: error.message
      }
    }

    return data as UpdateSupplierWithLogResult
  } catch (err) {
    console.error('更新供应商异常:', err)
    return {
      success: false,
      supplier: null,
      changed_fields: null,
      log_id: null,
      error: err instanceof Error ? err.message : '未知错误'
    }
  }
}

/**
 * 获取供应商的修改历史记录
 * @param supplierId 供应商ID
 * @param limit 返回记录数量限制
 * @param offset 偏移量
 */
export async function getSupplierChangeLogs(
  supplierId: string,
  limit: number = 20,
  offset: number = 0
): Promise<SupplierChangeLog[]> {
  try {
    const { data, error } = await supabase.rpc('get_supplier_change_logs', {
      p_supplier_id: supplierId,
      p_limit: limit,
      p_offset: offset
    })

    if (error) {
      console.error('获取修改记录失败:', error)
      return []
    }

    return (data as SupplierChangeLog[]) || []
  } catch (err) {
    console.error('获取修改记录异常:', err)
    return []
  }
}

/**
 * 直接创建修改记录（不更新供应商）
 * @param log 修改记录数据
 */
export async function createSupplierChangeLog(
  log: {
    supplier_id: string
    change_type: ChangeType
    change_title: string
    change_description?: string
    old_value?: Record<string, unknown>
    new_value?: Record<string, unknown>
    changed_fields?: string[]
    author_id?: string
    author_name?: string
  }
): Promise<SupplierChangeLog | null> {
  try {
    const { data, error } = await supabase
      .from('supplier_change_logs')
      .insert({
        supplier_id: log.supplier_id,
        change_type: log.change_type,
        change_title: log.change_title,
        change_description: log.change_description || null,
        old_value: log.old_value || null,
        new_value: log.new_value || null,
        changed_fields: log.changed_fields || [],
        author_id: log.author_id || null,
        author_name: log.author_name || null
      })
      .select()
      .single()

    if (error) {
      console.error('创建修改记录失败:', error)
      return null
    }

    return data as SupplierChangeLog
  } catch (err) {
    console.error('创建修改记录异常:', err)
    return null
  }
}

/**
 * 获取修改类型的中文标签
 */
export function getChangeTypeLabel(changeType: ChangeType): string {
  const labels: Record<ChangeType, string> = {
    basic: '基本信息',
    business: '业务特点',
    decision: '决策链',
    derivative: '衍生资源',
    portal: '门户权限',
    financial: '财务条款'
  }
  return labels[changeType] || changeType
}

/**
 * 获取修改类型的颜色
 */
export function getChangeTypeColor(changeType: ChangeType): string {
  const colors: Record<ChangeType, string> = {
    basic: 'bg-slate-100 text-slate-700',
    business: 'bg-blue-100 text-blue-700',
    decision: 'bg-purple-100 text-purple-700',
    derivative: 'bg-amber-100 text-amber-700',
    portal: 'bg-green-100 text-green-700',
    financial: 'bg-emerald-100 text-emerald-700'
  }
  return colors[changeType] || 'bg-slate-100 text-slate-700'
}
