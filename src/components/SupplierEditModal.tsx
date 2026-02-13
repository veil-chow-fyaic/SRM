/**
 * 供应商信息维护模态框组件
 * 用于对供应商的4大模块信息进行修改
 */

import { useState, useEffect } from 'react'
import { X, Save, Building2, Briefcase, Users, GitBranch, Settings, DollarSign } from 'lucide-react'
import { cn } from '../lib/utils'
import type { Supplier, SupplierUpdate, ChangeType } from '../types/database'

interface SupplierEditModalProps {
  isOpen: boolean
  onClose: () => void
  supplier: Supplier | null
  onSave: (updates: SupplierUpdate, changeType: ChangeType, changeTitle: string, changeDescription: string) => Promise<void>
  isSaving?: boolean
}

type EditTab = 'basic' | 'business' | 'decision' | 'portal' | 'financial'

// 修改类型标签映射
const CHANGE_TYPE_MAP: Record<EditTab, ChangeType> = {
  basic: 'basic',
  business: 'business',
  decision: 'decision',
  portal: 'portal',
  financial: 'financial'
}

const TAB_CONFIG = [
  { id: 'basic' as EditTab, label: '基本信息', icon: Building2 },
  { id: 'business' as EditTab, label: '业务特点', icon: Briefcase },
  { id: 'decision' as EditTab, label: '决策链', icon: Users },
  { id: 'portal' as EditTab, label: '门户权限', icon: Settings },
  { id: 'financial' as EditTab, label: '财务条款', icon: DollarSign },
]

export function SupplierEditModal({
  isOpen,
  onClose,
  supplier,
  onSave,
  isSaving = false
}: SupplierEditModalProps) {
  const [activeTab, setActiveTab] = useState<EditTab>('basic')
  const [formData, setFormData] = useState<SupplierUpdate>({})
  const [changeTitle, setChangeTitle] = useState('供应商信息更新')
  const [changeDescription, setChangeDescription] = useState('')
  const [hasChanges, setHasChanges] = useState(false)

  // 当供应商数据变化时，重置表单
  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name,
        code: supplier.code,
        local_name: supplier.local_name,
        logo_text: supplier.logo_text,
        tier: supplier.tier,
        status: supplier.status,
        stage: supplier.stage,
        category: supplier.category,
        location: supplier.location,
        address: supplier.address,
        contact_phone: supplier.contact_phone,
        website: supplier.website,
        structure: supplier.structure,
        financial_interval: supplier.financial_interval,
        financial_anchor: supplier.financial_anchor,
        financial_period: supplier.financial_period,
        system_score: supplier.system_score,
        evaluation_period: supplier.evaluation_period,
        portal_demand_broadcast: supplier.portal_demand_broadcast,
        portal_empowerment_center: supplier.portal_empowerment_center,
        portal_ticket_system: supplier.portal_ticket_system,
        portal_performance_view: supplier.portal_performance_view,
        tags: supplier.tags,
        scarce_resources: supplier.scarce_resources,
        notes: supplier.notes,
      })
      setChangeTitle('供应商信息更新')
      setChangeDescription('')
      setHasChanges(false)
    }
  }, [supplier])

  // 检测表单变化
  useEffect(() => {
    if (!supplier) return
    const hasAnyChange = Object.keys(formData).some(key => {
      const formValue = formData[key as keyof SupplierUpdate]
      const originalValue = supplier[key as keyof Supplier]
      return JSON.stringify(formValue) !== JSON.stringify(originalValue)
    })
    setHasChanges(hasAnyChange)
  }, [formData, supplier])

  const handleInputChange = (field: keyof SupplierUpdate, value: string | number | boolean | string[] | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    if (!hasChanges) return
    await onSave(formData, CHANGE_TYPE_MAP[activeTab], changeTitle, changeDescription)
    onClose()
  }

  if (!isOpen || !supplier) return null

  const renderBasicTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">供应商名称 *</label>
          <input
            type="text"
            value={formData.name || ''}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">供应商代码 *</label>
          <input
            type="text"
            value={formData.code || ''}
            onChange={(e) => handleInputChange('code', e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">本地名称</label>
          <input
            type="text"
            value={formData.local_name || ''}
            onChange={(e) => handleInputChange('local_name', e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Logo文字</label>
          <input
            type="text"
            value={formData.logo_text || ''}
            onChange={(e) => handleInputChange('logo_text', e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            maxLength={10}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">供应商层级</label>
          <select
            value={formData.tier || ''}
            onChange={(e) => handleInputChange('tier', e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          >
            <option value="strategic">战略供应商</option>
            <option value="core">核心供应商</option>
            <option value="backup">储备供应商</option>
            <option value="probation">考察期供应商</option>
            <option value="blacklisted">黑名单</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">状态</label>
          <select
            value={formData.status || ''}
            onChange={(e) => handleInputChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          >
            <option value="active">活跃</option>
            <option value="inactive">非活跃</option>
            <option value="blacklisted">黑名单</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">类别</label>
          <input
            type="text"
            value={formData.category || ''}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">所在地区</label>
          <input
            type="text"
            value={formData.location || ''}
            onChange={(e) => handleInputChange('location', e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">详细地址</label>
        <input
          type="text"
          value={formData.address || ''}
          onChange={(e) => handleInputChange('address', e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">联系电话</label>
          <input
            type="text"
            value={formData.contact_phone || ''}
            onChange={(e) => handleInputChange('contact_phone', e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">网站</label>
          <input
            type="text"
            value={formData.website || ''}
            onChange={(e) => handleInputChange('website', e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">企业性质</label>
        <input
          type="text"
          value={formData.structure || ''}
          onChange={(e) => handleInputChange('structure', e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          placeholder="如: 国企、外企、民企等"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">备注</label>
        <textarea
          value={formData.notes || ''}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          rows={3}
        />
      </div>
    </div>
  )

  const renderPortalTab = () => (
    <div className="space-y-4">
      <p className="text-sm text-slate-500 mb-4">配置供应商在共赢门户中的访问权限</p>

      <div className="space-y-3">
        {[
          { key: 'portal_demand_broadcast', label: '需求广播', desc: '允许供应商查看采购需求信息' },
          { key: 'portal_empowerment_center', label: '赋能中心', desc: '允许供应商访问培训和支持资源' },
          { key: 'portal_ticket_system', label: '工单系统', desc: '允许供应商提交和处理工单' },
          { key: 'portal_performance_view', label: '绩效查看', desc: '允许供应商查看自身绩效数据' },
        ].map((item) => (
          <div key={item.key} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div>
              <div className="font-medium text-slate-700">{item.label}</div>
              <div className="text-xs text-slate-500">{item.desc}</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData[item.key as keyof SupplierUpdate] as boolean || false}
                onChange={(e) => handleInputChange(item.key as keyof SupplierUpdate, e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  )

  const renderFinancialTab = () => (
    <div className="space-y-4">
      <p className="text-sm text-slate-500 mb-4">配置财务付款4维模型：付款周期 + 锚点 + 账期</p>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">付款周期</label>
          <select
            value={formData.financial_interval || ''}
            onChange={(e) => handleInputChange('financial_interval', e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          >
            <option value="">请选择</option>
            <option value="monthly">月结</option>
            <option value="semimonthly">半月结</option>
            <option value="weekly">周结</option>
            <option value="ticket">票结</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">付款锚点</label>
          <select
            value={formData.financial_anchor || ''}
            onChange={(e) => handleInputChange('financial_anchor', e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          >
            <option value="">请选择</option>
            <option value="ETD">ETD (预计离港日)</option>
            <option value="ETA">ETA (预计到港日)</option>
            <option value="Gate-in">Gate-in (入闸日)</option>
            <option value="Invoice">Invoice Date (发票日)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">账期 (天)</label>
          <input
            type="number"
            value={formData.financial_period || ''}
            onChange={(e) => handleInputChange('financial_period', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            min={0}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">系统评分</label>
          <input
            type="number"
            value={formData.system_score || ''}
            onChange={(e) => handleInputChange('system_score', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            min={0}
            max={100}
            step={0.01}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">评估周期</label>
        <select
          value={formData.evaluation_period || ''}
          onChange={(e) => handleInputChange('evaluation_period', e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        >
          <option value="">请选择</option>
          <option value="monthly">月度</option>
          <option value="quarterly">季度</option>
          <option value="semiannual">半年度</option>
          <option value="annual">年度</option>
        </select>
      </div>
    </div>
  )

  const renderBusinessTab = () => (
    <div className="space-y-4">
      <p className="text-sm text-slate-500 mb-4">
        业务特点配置请在供应商详情页的"资产"标签页中进行更详细的编辑。
        此处仅提供标签管理。
      </p>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">标签 (用逗号分隔)</label>
        <input
          type="text"
          value={(formData.tags as string[])?.join(', ') || ''}
          onChange={(e) => handleInputChange('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          placeholder="如: 物流, 海运, 仓储"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">稀缺资源 (用逗号分隔)</label>
        <input
          type="text"
          value={(formData.scarce_resources as string[])?.join(', ') || ''}
          onChange={(e) => handleInputChange('scarce_resources', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          placeholder="如: 冷藏舱位, 危险品资质"
        />
      </div>
    </div>
  )

  const renderDecisionTab = () => (
    <div className="space-y-4">
      <p className="text-sm text-slate-500 mb-4">
        决策链配置请在供应商详情页的"决策链"标签页中进行更详细的编辑。
        当前仅提供基本信息确认。
      </p>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <GitBranch className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <div className="font-medium text-amber-800">决策链管理提示</div>
            <div className="text-sm text-amber-700 mt-1">
              完整的决策链图谱管理，包括关键人信息、亲密度评分、征服记录等，
              请在供应商详情页的"决策链"标签页中进行操作。
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return renderBasicTab()
      case 'portal':
        return renderPortalTab()
      case 'financial':
        return renderFinancialTab()
      case 'business':
        return renderBusinessTab()
      case 'decision':
        return renderDecisionTab()
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-brand-500" />
              信息维护
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              修改供应商 {supplier.name} 的档案信息
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-100">
          <div className="flex overflow-x-auto">
            {TAB_CONFIG.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                    activeTab === tab.id
                      ? 'border-brand-500 text-brand-600 bg-brand-50/50'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderTabContent()}

          {/* 修改说明 */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <label className="block text-sm font-medium text-slate-700 mb-2">修改标题</label>
            <input
              type="text"
              value={changeTitle}
              onChange={(e) => setChangeTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="简短描述本次修改"
            />

            <label className="block text-sm font-medium text-slate-700 mb-2 mt-4">修改说明 (可选)</label>
            <textarea
              value={changeDescription}
              onChange={(e) => setChangeDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              rows={2}
              placeholder="详细说明修改原因和内容"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div className="text-sm text-slate-500">
            {hasChanges ? (
              <span className="text-amber-600">• 有未保存的修改</span>
            ) : (
              <span>• 无修改</span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                hasChanges && !isSaving
                  ? 'bg-brand-500 text-white hover:bg-brand-600'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              )}
            >
              <Save className="w-4 h-4" />
              {isSaving ? '保存中...' : '保存修改'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SupplierEditModal
