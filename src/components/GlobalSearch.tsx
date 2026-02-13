/**
 * 全局搜索组件
 * 用于搜索供应商、资源等
 */

import { useState, useRef, useEffect } from 'react'
import { Search, X, Building2, Users, FileText, Loader2 } from 'lucide-react'
import { cn } from '../lib/utils'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

interface SearchResult {
  id: string
  type: 'supplier' | 'person' | 'task' | 'log'
  title: string
  subtitle?: string
  icon: typeof Building2
}

interface GlobalSearchProps {
  className?: string
}

export function GlobalSearch({ className }: GlobalSearchProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  // 点击外部关闭
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // 搜索防抖
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const timer = setTimeout(() => {
      performSearch(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // 执行搜索
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return

    setIsLoading(true)
    try {
      const searchResults: SearchResult[] = []

      // 搜索供应商
      const { data: suppliers } = await supabase
        .from('suppliers')
        .select('id, name, code, tier')
        .or(`name.ilike.%${searchQuery}%,code.ilike.%${searchQuery}%`)
        .limit(5)

      if (suppliers) {
        suppliers.forEach((s: any) => {
          searchResults.push({
            id: s.id,
            type: 'supplier',
            title: s.name,
            subtitle: `${s.code} · ${s.tier}`,
            icon: Building2
          })
        })
      }

      // 搜索决策链成员
      const { data: people } = await supabase
        .from('decision_chain')
        .select('id, name, title, supplier_id')
        .ilike('name', `%${searchQuery}%`)
        .limit(3)

      if (people) {
        people.forEach((p: any) => {
          searchResults.push({
            id: p.id,
            type: 'person',
            title: p.name,
            subtitle: p.title || '决策链成员',
            icon: Users
          })
        })
      }

      // 搜索任务
      const { data: tasks } = await supabase
        .from('tasks')
        .select('id, title, status, supplier_id')
        .ilike('title', `%${searchQuery}%`)
        .limit(3)

      if (tasks) {
        tasks.forEach((t: any) => {
          searchResults.push({
            id: t.id,
            type: 'task',
            title: t.title,
            subtitle: t.status,
            icon: FileText
          })
        })
      }

      setResults(searchResults)
    } catch (error) {
      console.error('搜索失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 处理点击结果
  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'supplier') {
      navigate(`/supplier-profile/${result.id}`)
    } else if (result.type === 'person') {
      // 查找该人员关联的供应商
      supabase
        .from('decision_chain')
        .select('supplier_id')
        .eq('id', result.id)
        .single()
        .then(({ data }) => {
          if (data?.supplier_id) {
            navigate(`/supplier-profile/${data.supplier_id}?tab=decision`)
          }
        })
    } else if (result.type === 'task') {
      navigate('/tasks')
    }

    setQuery('')
    setIsOpen(false)
  }

  // 键盘快捷键
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Cmd/Ctrl + K 打开搜索
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        setIsOpen(true)
      }

      // Escape 关闭
      if (e.key === 'Escape') {
        setIsOpen(false)
        inputRef.current?.blur()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className={cn('relative', className)} ref={containerRef}>
      {/* 搜索输入框 */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="搜索供应商 / 资源... (⌘K)"
          className="w-64 pl-9 pr-4 py-1.5 text-sm border border-slate-200 rounded-full focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all bg-white"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('')
              setResults([])
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-slate-100 rounded text-slate-400"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 搜索结果下拉 */}
      {isOpen && query.trim() && (
        <div className="absolute left-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="px-4 py-2 border-b border-slate-100 bg-slate-50/50">
            <span className="text-xs text-slate-500">搜索结果</span>
          </div>

          {/* 结果列表 */}
          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 text-brand-500 animate-spin" />
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                未找到相关结果
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {results.map((result, index) => {
                  const Icon = result.icon
                  return (
                    <div
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleResultClick(result)}
                      className="p-3 hover:bg-slate-50 cursor-pointer transition-colors flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-slate-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-slate-900 truncate">
                          {result.title}
                        </div>
                        {result.subtitle && (
                          <div className="text-xs text-slate-500 truncate">
                            {result.subtitle}
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 uppercase">
                        {result.type === 'supplier' ? '供应商' :
                         result.type === 'person' ? '人员' : '任务'}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default GlobalSearch
