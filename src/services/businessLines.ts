// @ts-nocheck
/**
 * 业务线服务
 *
 * 封装所有与 business_lines 和 business_line_contacts 表相关的 API 调用
 */

import { supabase, handleSupabaseError } from '../lib/supabase'
import type {
  BusinessLine,
  BusinessLineInsert,
  BusinessLineContact,
  BusinessLineContactInsert,
  BusinessLineContactUpdate
} from '../types/database'

/**
 * 获取供应商的业务线列表
 */
export async function getBusinessLines(supplierId: string) {
  const { data, error } = await supabase
    .from('business_lines')
    .select(`
      *,
      business_line_contacts (*)
    `)
    .eq('supplier_id', supplierId)
    .order('created_at', { ascending: false })

  if (error) {
    throw handleSupabaseError(error)
  }

  return data || []
}

/**
 * 获取单个业务线
 */
export async function getBusinessLineById(id: string) {
  const { data, error } = await supabase
    .from('business_lines')
    .select(`
      *,
      business_line_contacts (*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    throw handleSupabaseError(error)
  }

  return data
}

/**
 * 创建业务线（包含联系人）
 */
export async function createBusinessLine(
  businessLine: BusinessLineInsert,
  contacts?: Array<{ name: string; title?: string; phone?: string; email?: string; is_primary?: boolean }>
) {
  // 首先创建业务线
  const { data: newLine, error: lineError } = await supabase
    .from('business_lines')
    .insert(businessLine)
    .select()
    .single()

  if (lineError) {
    throw handleSupabaseError(lineError)
  }

  // 如果有联系人，批量创建
  if (contacts && contacts.length > 0) {
    const contactsToInsert = contacts.map(contact => ({
      business_line_id: newLine.id,
      ...contact,
    }))

    const { error: contactsError } = await supabase
      .from('business_line_contacts')
      .insert(contactsToInsert)

    if (contactsError) {
      throw handleSupabaseError(contactsError)
    }
  }

  // 返回完整的业务线数据
  return getBusinessLineById(newLine.id)
}

/**
 * 更新业务线
 */
export async function updateBusinessLine(
  id: string,
  updates: Partial<BusinessLineInsert>
) {
  const { data, error } = await supabase
    .from('business_lines')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      business_line_contacts (*)
    `)
    .single()

  if (error) {
    throw handleSupabaseError(error)
  }

  return data
}

/**
 * 删除业务线
 */
export async function deleteBusinessLine(id: string): Promise<void> {
  const { error } = await supabase
    .from('business_lines')
    .delete()
    .eq('id', id)

  if (error) {
    throw handleSupabaseError(error)
  }
}

/**
 * 添加业务线联系人
 */
export async function addBusinessLineContact(
  businessLineId: string,
  contact: { name: string; title?: string; phone?: string; email?: string; is_primary?: boolean }
) {
  const { data, error } = await supabase
    .from('business_line_contacts')
    .insert({
      business_line_id: businessLineId,
      ...contact,
    })
    .select()
    .single()

  if (error) {
    throw handleSupabaseError(error)
  }

  return data
}

/**
 * 更新业务线联系人
 */
export async function updateBusinessLineContact(
  contactId: string,
  updates: Partial<{
    name: string
    title?: string
    phone?: string
    email?: string
    is_primary?: boolean
  }>
) {
  const { data, error } = await supabase
    .from('business_line_contacts')
    .update(updates)
    .eq('id', contactId)
    .select()
    .single()

  if (error) {
    throw handleSupabaseError(error)
  }

  return data
}

/**
 * 删除业务线联系人
 */
export async function deleteBusinessLineContact(contactId: string): Promise<void> {
  const { error } = await supabase
    .from('business_line_contacts')
    .delete()
    .eq('id', contactId)

  if (error) {
    throw handleSupabaseError(error)
  }
}

/**
 * 设置主联系人
 * 会取消该业务线的其他主联系人标记
 */
export async function setPrimaryContact(
  businessLineId: string,
  contactId: string
): Promise<void> {
  // 首先取消该业务线的所有主联系人标记
  await supabase
    .from('business_line_contacts')
    .update({ is_primary: false })
    .eq('business_line_id', businessLineId)
    .eq('is_primary', true)

  // 然后设置新的主联系人
  const { error } = await supabase
    .from('business_line_contacts')
    .update({ is_primary: true })
    .eq('id', contactId)

  if (error) {
    throw handleSupabaseError(error)
  }
}

/**
 * 获取业务线的主联系人
 */
export async function getPrimaryContact(businessLineId: string): Promise<BusinessLineContact | null> {
  const { data, error } = await supabase
    .from('business_line_contacts')
    .select('*')
    .eq('business_line_id', businessLineId)
    .eq('is_primary', true)
    .limit(1)
    .single()

  if (error) {
    // 如果没有主联系人，返回 null
    if (error.code === 'PGRST116') {
      return null
    }
    throw handleSupabaseError(error)
  }

  return data
}

/**
 * 获取业务线的所有联系人
 */
export async function getBusinessLineContacts(businessLineId: string): Promise<BusinessLineContact[]> {
  const { data, error } = await supabase
    .from('business_line_contacts')
    .select('*')
    .eq('business_line_id', businessLineId)
    .order('is_primary', { ascending: false })
    .order('created_at', { ascending: true })

  if (error) {
    throw handleSupabaseError(error)
  }

  return data || []
}

/**
 * 按类型筛选业务线
 */
export async function getBusinessLinesByType(
  supplierId: string,
  types: string[]
): Promise<BusinessLine[]> {
  const { data, error } = await supabase
    .from('business_lines')
    .select(`
      *,
      business_line_contacts (*)
    `)
    .eq('supplier_id', supplierId)
    .in('type', types)
    .order('created_at', { ascending: false })

  if (error) {
    throw handleSupabaseError(error)
  }

  return data || []
}

/**
 * 批量创建业务线
 */
export async function batchCreateBusinessLines(
  businessLines: BusinessLineInsert[]
): Promise<BusinessLine[]> {
  const { data, error } = await supabase
    .from('business_lines')
    .insert(businessLines)
    .select()

  if (error) {
    throw handleSupabaseError(error)
  }

  return data || []
}

/**
 * 批量删除业务线
 */
export async function batchDeleteBusinessLines(ids: string[]): Promise<void> {
  const { error } = await supabase
    .from('business_lines')
    .delete()
    .in('id', ids)

  if (error) {
    throw handleSupabaseError(error)
  }
}

/**
 * 获取业务线统计
 */
export async function getBusinessLinesStats(supplierId: string) {
  const { data, error } = await supabase
    .from('business_lines')
    .select('type')

  if (error) {
    throw handleSupabaseError(error)
  }

  const lines = data || []

  // 统计各类型的数量
  const typeCounts: Record<string, number> = {}
  lines.forEach(line => {
    const type = line.type || 'unknown'
    typeCounts[type] = (typeCounts[type] || 0) + 1
  })

  return {
    total: lines.length,
    byType: typeCounts,
    uniqueTypes: Object.keys(typeCounts).length,
  }
}

/**
 * 订阅业务线变更（Realtime）
 */
export function subscribeToBusinessLines(
  supplierId: string,
  callback: (payload: {
    data: BusinessLine[]
    eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  }) => void
) {
  return supabase
    .channel(`business-lines-${supplierId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'business_lines',
        filter: `supplier_id=eq.${supplierId}`,
      },
      (payload) => {
        callback({
          data: payload.new as BusinessLine[],
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
        })
      }
    )
    .subscribe()
}

/**
 * 创建业务线联系人（独立接口）
 */
export async function createBusinessLineContact(
  contact: BusinessLineContactInsert
): Promise<BusinessLineContact> {
  const { data, error } = await supabase
    .from('business_line_contacts')
    .insert(contact)
    .select()
    .single()

  if (error) {
    throw handleSupabaseError(error)
  }

  return data
}

/**
 * 批量创建联系人
 */
export async function batchCreateBusinessLineContacts(
  contacts: BusinessLineContactInsert[]
): Promise<BusinessLineContact[]> {
  const { data, error } = await supabase
    .from('business_line_contacts')
    .insert(contacts)
    .select()

  if (error) {
    throw handleSupabaseError(error)
  }

  return data || []
}
