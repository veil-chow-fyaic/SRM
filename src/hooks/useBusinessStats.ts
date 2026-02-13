/**
 * 经营统计 Hook
 * 用于获取经营看板和异常预警数据
 */

import { useQuery } from '@tanstack/react-query'
import { getBusinessStats, getAlertStats } from '../services/businessStats'

/**
 * 获取经营统计数据的 Hook
 */
export function useBusinessStats() {
  return useQuery({
    queryKey: ['businessStats'],
    queryFn: getBusinessStats,
    staleTime: 60000, // 1分钟内不重新获取
  })
}

/**
 * 获取异常预警统计的 Hook
 */
export function useAlertStats() {
  return useQuery({
    queryKey: ['alertStats'],
    queryFn: getAlertStats,
    staleTime: 60000,
  })
}
