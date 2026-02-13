/**
 * React Query Provider 配置
 *
 * 配置 React Query 客户端和提供者
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState, type ReactNode } from 'react'

/**
 * 创建 Query Client
 */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 数据在 5 分钟内认为是新鲜的
        staleTime: 1000 * 60 * 5,
        // 缓存时间 10 分钟
        gcTime: 1000 * 60 * 10,
        // 失败时重试一次
        retry: 1,
        // 窗口重新获得焦点时重新获取数据
        refetchOnWindowFocus: false,
      },
      mutations: {
        // 失败时重试一次
        retry: 1,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

/**
 * 获取浏览器端的 Query Client 单例
 */
function getQueryClient() {
  if (typeof window === 'undefined') {
    // 服务端渲染：每次都创建新实例
    return createQueryClient()
  } else {
    // 浏览器端：使用单例
    if (!browserQueryClient) {
      browserQueryClient = createQueryClient()
    }
    return browserQueryClient
  }
}

interface ProvidersProps {
  children: ReactNode
}

/**
 * 应用 Provider 组件
 *
 * 包裹 React Query Provider
 */
export function Providers({ children }: ProvidersProps) {
  // 注意：在浏览器端使用 useState 确保客户端只有一个实例
  const [queryClient] = useState(() => getQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {import.meta.env.DEV && (
        <ReactQueryDevtools
          initialIsOpen={false}
          position="bottom"
        />
      )}
    </QueryClientProvider>
  )
}
