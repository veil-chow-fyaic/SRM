// @ts-nocheck
/**
 * 决策链服务
 *
 * 封装所有与 decision_chain 和 decision_chain_resources 表相关的 API 调用
 */

import { supabase, handleSupabaseError } from '../lib/supabase'
import type {
  DecisionChain,
  DecisionChainInsert,
  DecisionChainUpdate,
  DecisionLayer,
  DecisionRole
} from '../types/database'

/**
 * 筛选参数接口
 */
export interface DecisionChainFilters {
  supplierId: string
  layer?: DecisionLayer | DecisionLayer[]
  role?: DecisionRole | DecisionRole[]
  minAffinity?: number
  maxAffinity?: number
}

/**
 * 获取供应商的决策链成员列表
 */
export async function getDecisionChain(supplierId: string) {
  const { data, error } = await supabase
    .from('decision_chain')
    .select(`
      *,
      decision_chain_resources (*)
    `)
    .eq('supplier_id', supplierId)
    .order('layer', { ascending: true })

  if (error) {
    throw handleSupabaseError(error)
  }

  return data || []
}

/**
 * 获取单个决策链成员（包含关联资源）
 */
export async function getDecisionChainMemberById(id: string) {
  const { data, error } = await supabase
    .from('decision_chain')
    .select(`
      *,
      decision_chain_resources (*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    throw handleSupabaseError(error)
  }

  return data
}

/**
 * 创建决策链成员
 */
export async function createDecisionChainMember(member: DecisionChainInsert) {
  const { data, error } = await supabase
    .from('decision_chain')
    .insert(member)
    .select(`
      *,
      decision_chain_resources (*)
    `)
    .single()

  if (error) {
    throw handleSupabaseError(error)
  }

  return data
}

/**
 * 更新决策链成员
 */
export async function updateDecisionChainMember(
  id: string,
  updates: DecisionChainUpdate
) {
  const { data, error } = await supabase
    .from('decision_chain')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      decision_chain_resources (*)
    `)
    .single()

  if (error) {
    throw handleSupabaseError(error)
  }

  return data
}

/**
 * 更新决策链成员亲密度
 */
export async function updateAffinity(id: string, affinity: number) {
  const { data, error } = await supabase
    .from('decision_chain')
    .update({ affinity })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw handleSupabaseError(error)
  }

  return data
}

/**
 * 删除决策链成员
 */
export async function deleteDecisionChainMember(id: string): Promise<void> {
  const { error } = await supabase
    .from('decision_chain')
    .delete()
    .eq('id', id)

  if (error) {
    throw handleSupabaseError(error)
  }
}

/**
 * 添加决策链关联资源
 */
export async function addDecisionChainResource(
  decisionChainId: string,
  resource: { name: string; type: string; description?: string }
) {
  const { data, error } = await supabase
    .from('decision_chain_resources')
    .insert({
      decision_chain_id: decisionChainId,
      ...resource,
    })
    .select()
    .single()

  if (error) {
    throw handleSupabaseError(error)
  }

  return data
}

/**
 * 删除决策链关联资源
 */
export async function deleteDecisionChainResource(resourceId: string): Promise<void> {
  const { error } = await supabase
    .from('decision_chain_resources')
    .delete()
    .eq('id', resourceId)

  if (error) {
    throw handleSupabaseError(error)
  }
}

/**
 * 批量创建决策链成员
 */
export async function batchCreateDecisionChainMembers(
  members: DecisionChainInsert[]
) {
  const { data, error } = await supabase
    .from('decision_chain')
    .insert(members)
    .select()

  if (error) {
    throw handleSupabaseError(error)
  }

  return data
}

/**
 * 按层级和角色筛选决策链成员
 */
export async function getDecisionChainByFilters(filters: DecisionChainFilters) {
  let query = supabase
    .from('decision_chain')
    .select(`
      *,
      decision_chain_resources (*)
    `)
    .eq('supplier_id', filters.supplierId)

  // 按层级筛选
  if (filters.layer) {
    if (Array.isArray(filters.layer)) {
      query = query.in('layer', filters.layer)
    } else {
      query = query.eq('layer', filters.layer)
    }
  }

  // 按角色筛选
  if (filters.role) {
    if (Array.isArray(filters.role)) {
      query = query.in('role', filters.role)
    } else {
      query = query.eq('role', filters.role)
    }
  }

  // 按亲密度范围筛选
  if (filters.minAffinity !== undefined) {
    query = query.gte('affinity', filters.minAffinity)
  }
  if (filters.maxAffinity !== undefined) {
    query = query.lte('affinity', filters.maxAffinity)
  }

  // 按层级排序：Decision → Execution → Operation
  const layerOrder = { Decision: 1, Execution: 2, Operation: 3 }

  const { data, error } = await query

  if (error) {
    throw handleSupabaseError(error)
  }

  // 排序
  const sorted = (data || []).sort((a, b) => {
    const layerA = layerOrder[a.layer as keyof typeof layerOrder] || 999
    const layerB = layerOrder[b.layer as keyof typeof layerOrder] || 999
    if (layerA !== layerB) return layerA - layerB
    // 同层级按亲密度降序
    return (b.affinity || 0) - (a.affinity || 0)
  })

  return sorted
}

/**
 * 批量更新决策链成员亲密度
 */
export async function batchUpdateAffinity(
  updates: Array<{ id: string; affinity: number }>
): Promise<void> {
  // 由于 Supabase 不支持批量更新不同的值，需要逐个更新
  for (const { id, affinity } of updates) {
    const { error } = await supabase
      .from('decision_chain')
      .update({ affinity })
      .eq('id', id)

    if (error) {
      throw handleSupabaseError(error)
    }
  }
}

/**
 * 批量删除决策链成员
 */
export async function batchDeleteDecisionChainMembers(
  ids: string[]
): Promise<void> {
  const { error } = await supabase
    .from('decision_chain')
    .delete()
    .in('id', ids)

  if (error) {
    throw handleSupabaseError(error)
  }
}

/**
 * 获取决策链统计信息
 */
export async function getDecisionChainStats(supplierId: string) {
  const { data, error } = await supabase
    .from('decision_chain')
    .select('layer, role, affinity')

  if (error) {
    throw handleSupabaseError(error)
  }

  const members = data || []

  return {
    total: members.length,
    byLayer: {
      decision: members.filter(m => m.layer === 'Decision').length,
      execution: members.filter(m => m.layer === 'Execution').length,
      operation: members.filter(m => m.layer === 'Operation').length,
    },
    byRole: {
      decisionMaker: members.filter(m => m.role === 'Decision Maker').length,
      influencer: members.filter(m => m.role === 'Influencer').length,
      executor: members.filter(m => m.role === 'Executor').length,
    },
    avgAffinity: members.length > 0
      ? members.reduce((sum, m) => sum + (m.affinity || 0), 0) / members.length
      : 0,
    highAffinityCount: members.filter(m => (m.affinity || 0) >= 4).length,
  }
}

/**
 * 更新决策链资源
 */
export async function updateDecisionChainResource(
  id: string,
  updates: { name?: string; type?: string; description?: string }
) {
  const { data, error } = await supabase
    .from('decision_chain_resources')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw handleSupabaseError(error)
  }

  return data
}

/**
 * 批量添加决策链资源
 */
export async function batchAddDecisionChainResources(
  resources: Array<{ decision_chain_id: string; name: string; type: string; description?: string }>
) {
  const { data, error } = await supabase
    .from('decision_chain_resources')
    .insert(resources)
    .select()

  if (error) {
    throw handleSupabaseError(error)
  }

  return data
}

/**
 * 订阅决策链变更（Realtime）
 */
export function subscribeToDecisionChain(
  supplierId: string,
  callback: (payload: {
    data: DecisionChain[]
    eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  }) => void
) {
  return supabase
    .channel(`decision-chain-${supplierId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'decision_chain',
        filter: `supplier_id=eq.${supplierId}`,
      },
      (payload) => {
        callback({
          data: payload.new as DecisionChain[],
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
        })
      }
    )
    .subscribe()
}
