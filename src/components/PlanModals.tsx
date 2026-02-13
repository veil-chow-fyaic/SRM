/**
 * 个人计划模态框组件
 * 包括：创建/编辑计划模态框、计划详情模态框
 */

import { useState, useEffect } from 'react'
import { X, Save, Calendar, Clock, MapPin, Trash2, Edit3, CheckCircle } from 'lucide-react'
import { cn } from '../lib/utils'
import type { PersonalPlan, PlanType, TaskPriority } from '../types/database'
import { getPlanTypeLabel, getPlanTypeColor, getPlanTypeIcon } from '../services/personalPlans'

// 计划类型选项
const PLAN_TYPE_OPTIONS: { value: PlanType; label: string; icon: string }[] = [
  { value: 'visit', label: '拜访', icon: '🗺️' },
  { value: 'meeting', label: '会议', icon: '👥' },
  { value: 'call', label: '电话', icon: '📞' },
  { value: 'task', label: '任务', icon: '✅' },
  { value: 'reminder', label: '提醒', icon: '⏰' },
  { value: 'other', label: '其他', icon: '📌' },
]

// 优先级选项
const PRIORITY_OPTIONS: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'High', label: '高', color: 'text-red-600 bg-red-50 border-red-200' },
  { value: 'Medium', label: '中', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { value: 'Low', label: '低', color: 'text-slate-600 bg-slate-50 border-slate-200' },
]

// ===== 创建/编辑计划模态框 =====
interface PlanFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (plan: {
    title: string
    description: string
    plan_type: PlanType
    priority: TaskPriority
    due_date: string
    start_time: string
    end_time: string
    location: string
    sync_to_calendar: boolean
  }) => Promise<void>
  onDelete?: () => Promise<void>
  plan?: PersonalPlan | null
  isSaving?: boolean
  mode: 'create' | 'edit'
}

export function PlanFormModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  plan,
  isSaving = false,
  mode
}: PlanFormModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    plan_type: 'task' as PlanType,
    priority: 'Medium' as TaskPriority,
    due_date: new Date().toISOString().split('T')[0],
    start_time: '',
    end_time: '',
    location: '',
    sync_to_calendar: true
  })

  // 当编辑计划时，初始化表单数据
  useEffect(() => {
    if (plan && mode === 'edit') {
      setFormData({
        title: plan.title,
        description: plan.description || '',
        plan_type: plan.plan_type || 'task',
        priority: plan.priority || 'Medium',
        due_date: plan.due_date || new Date().toISOString().split('T')[0],
        start_time: plan.start_time || '',
        end_time: plan.end_time || '',
        location: plan.location || '',
        sync_to_calendar: plan.sync_to_calendar ?? true
      })
    } else if (mode === 'create') {
      setFormData({
        title: '',
        description: '',
        plan_type: 'task',
        priority: 'Medium',
        due_date: new Date().toISOString().split('T')[0],
        start_time: '',
        end_time: '',
        location: '',
        sync_to_calendar: true
      })
    }
  }, [plan, mode])

  const handleSubmit = async () => {
    if (!formData.title.trim()) return
    await onSave(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand-500" />
            {mode === 'create' ? '创建个人计划' : '编辑计划'}
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* 标题 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">计划标题 *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="输入计划标题"
            />
          </div>

          {/* 计划类型和优先级 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">计划类型</label>
              <select
                value={formData.plan_type}
                onChange={(e) => setFormData({ ...formData, plan_type: e.target.value as PlanType })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {PLAN_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.icon} {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">优先级</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {PRIORITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 日期和时间 */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">日期</label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">开始时间</label>
              <input
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">结束时间</label>
              <input
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* 地点 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">地点</label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="输入地点（可选）"
              />
            </div>
          </div>

          {/* 描述 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">描述</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              rows={2}
              placeholder="计划详细描述（可选）"
            />
          </div>

          {/* 同步到日历 */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="sync_calendar"
              checked={formData.sync_to_calendar}
              onChange={(e) => setFormData({ ...formData, sync_to_calendar: e.target.checked })}
              className="w-4 h-4 text-brand-500 border-slate-300 rounded focus:ring-brand-500"
            />
            <label htmlFor="sync_calendar" className="text-sm text-slate-600">
              同步到日历显示
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div>
            {mode === 'edit' && onDelete && (
              <button
                onClick={onDelete}
                className="flex items-center gap-1.5 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
              >
                <Trash2 className="w-4 h-4" />
                删除
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={!formData.title.trim() || isSaving}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                formData.title.trim() && !isSaving
                  ? 'bg-brand-500 text-white hover:bg-brand-600'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              )}
            >
              <Save className="w-4 h-4" />
              {isSaving ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ===== 计划详情模态框 =====
interface PlanDetailModalProps {
  isOpen: boolean
  onClose: () => void
  plan: PersonalPlan | null
  onEdit: () => void
  onComplete: () => Promise<void>
  onDelete: () => Promise<void>
  isUpdating?: boolean
}

export function PlanDetailModal({
  isOpen,
  onClose,
  plan,
  onEdit,
  onComplete,
  onDelete,
  isUpdating = false
}: PlanDetailModalProps) {
  if (!isOpen || !plan) return null

  const priorityOption = PRIORITY_OPTIONS.find(p => p.value === plan.priority)
  const planTypeOption = PLAN_TYPE_OPTIONS.find(p => p.value === plan.plan_type)

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="text-xl">{getPlanTypeIcon(plan.plan_type || 'other')}</span>
            <h3 className="font-bold text-slate-900">{plan.title}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* 状态和优先级标签 */}
          <div className="flex items-center gap-2">
            <span className={cn('px-2 py-0.5 rounded text-xs font-medium border', getPlanTypeColor(plan.plan_type || 'other'))}>
              {planTypeOption?.label || '其他'}
            </span>
            {priorityOption && (
              <span className={cn('px-2 py-0.5 rounded text-xs font-medium border', priorityOption.color)}>
                优先级: {priorityOption.label}
              </span>
            )}
            {plan.status === 'completed' && (
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                已完成
              </span>
            )}
          </div>

          {/* 日期时间 */}
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>{plan.due_date || '未设置日期'}</span>
            </div>
            {(plan.start_time || plan.end_time) && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{plan.start_time || '00:00'} - {plan.end_time || '23:59'}</span>
              </div>
            )}
          </div>

          {/* 地点 */}
          {plan.location && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <MapPin className="w-4 h-4" />
              <span>{plan.location}</span>
            </div>
          )}

          {/* 描述 */}
          {plan.description && (
            <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-700">
              {plan.description}
            </div>
          )}

          {/* 时间信息 */}
          <div className="text-xs text-slate-400 space-y-1">
            {plan.created_at && (
              <div>创建时间: {new Date(plan.created_at).toLocaleString('zh-CN')}</div>
            )}
            {plan.updated_at && plan.updated_at !== plan.created_at && (
              <div>更新时间: {new Date(plan.updated_at).toLocaleString('zh-CN')}</div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <button
            onClick={onDelete}
            disabled={isUpdating}
            className="flex items-center gap-1.5 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            删除
          </button>
          <div className="flex gap-2">
            {plan.status !== 'completed' && (
              <button
                onClick={onComplete}
                disabled={isUpdating}
                className="flex items-center gap-1.5 px-3 py-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors text-sm disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                完成
              </button>
            )}
            <button
              onClick={onEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 text-brand-600 hover:bg-brand-100 rounded-lg transition-colors text-sm"
            >
              <Edit3 className="w-4 h-4" />
              编辑
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlanFormModal
