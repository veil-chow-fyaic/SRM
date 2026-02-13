
import React, { useState } from 'react';
import {
  CreditCard,
  Globe2,
  Settings,
  Save,
  Search,
  Building2,
  CheckCircle2,
  Crown,
  AlertCircle,
  LayoutDashboard,
  BarChart2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { DICTIONARIES } from '../lib/dictionaries';
import type { Supplier } from '../types/supplier';
import { useSuppliers } from '../hooks/useSuppliers';
import { useUpdateSupplier } from '../hooks/useSuppliers';

// --- Components ---

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("bg-white border border-slate-200 rounded-xl shadow-sm", className)}>
      {children}
    </div>
  );
}

// 数据库 Supplier 类型到前端数据类型的转换函数
function transformDbSupplierToMock(dbSupplier: any): Supplier {
  // 从数据库 performance_config 字段读取，如果没有则使用默认值
  const performanceConfig = dbSupplier.performance_config || {
    dimensions: [
      { id: 'cost', name: '成本竞争力', weight: 40 },
      { id: 'quality', name: '服务质量', weight: 30 },
      { id: 'delivery', name: '交付时效', weight: 30 }
    ],
    evaluationPeriod: 'quarterly'
  };

  return {
    id: dbSupplier.id,
    name: dbSupplier.name,
    code: dbSupplier.code,
    tier: dbSupplier.tier,
    status: dbSupplier.status,
    financial: {
      interval: dbSupplier.financial_interval || 'monthly',
      anchor: dbSupplier.financial_anchor || 'etd',
      period: dbSupplier.financial_period || 30
    },
    portalAccess: {
      demandBroadcast: dbSupplier.portal_demand_broadcast || false,
      empowermentCenter: dbSupplier.portal_empowerment_center || false,
      ticketSystem: dbSupplier.portal_ticket_system || false,
      performanceView: dbSupplier.portal_performance_view || false
    },
    performanceConfig: performanceConfig,
    systemScore: dbSupplier.system_score || undefined,
    address: dbSupplier.address || undefined,
    contactPhone: dbSupplier.contact_phone || undefined,
    website: dbSupplier.website || undefined,
    structure: dbSupplier.structure || undefined,
    tags: dbSupplier.tags || undefined,
    scarceResources: dbSupplier.scarce_resources || undefined
  };
}

// 根据 tier 计算 stage 字段（确保前后端一致）
function tierToStage(tier: string): string {
  switch (tier) {
    case 'strategic':
    case 'core':
    case 'backup':
      return 'active';
    case 'probation':
      return 'probation';
    case 'blacklisted':
      return 'blacklist';
    default:
      return 'active';
  }
}

// mock 数据类型到数据库更新类型的转换函数
function transformMockToDbUpdate(mockSupplier: Supplier): any {
  return {
    financial_interval: mockSupplier.financial.interval,
    financial_anchor: mockSupplier.financial.anchor,
    financial_period: mockSupplier.financial.period,
    portal_demand_broadcast: mockSupplier.portalAccess.demandBroadcast,
    portal_empowerment_center: mockSupplier.portalAccess.empowermentCenter,
    portal_ticket_system: mockSupplier.portalAccess.ticketSystem,
    portal_performance_view: mockSupplier.portalAccess.performanceView,
    tier: mockSupplier.tier,
    stage: tierToStage(mockSupplier.tier), // 同步更新 stage 字段
    status: mockSupplier.tier === 'blacklisted' ? 'blacklisted' : 'active', // 同步更新 status
    // 保存完整的 performance_config JSONB 对象（包含 dimensions 和 evaluationPeriod）
    performance_config: mockSupplier.performanceConfig || null
  };
}

export function SystemSettings() {
  // --- State ---
  const { data: suppliers = [], isLoading, error } = useSuppliers();
  const updateSupplierMutation = useUpdateSupplier();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'financial' | 'portal' | 'tiering' | 'performance'>('financial');
  const [isDirty, setIsDirty] = useState(false);

  // 本地状态用于临时存储编辑中的供应商数据（使用 mock 数据结构）
  const [localSuppliers, setLocalSuppliers] = useState<Supplier[]>([]);

  // 当后端数据加载完成后，转换为 mock 数据格式并初始化本地状态
  React.useEffect(() => {
    if (suppliers.length > 0) {
      const transformed = suppliers.map(transformDbSupplierToMock);
      setLocalSuppliers(transformed);
    }
  }, [suppliers]);

  // Derived state
  const selectedSupplier = localSuppliers.find(s => s.id === selectedId);
  const filteredSuppliers = localSuppliers.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- Handlers ---

  const handleSelect = (id: string) => {
    if (isDirty) {
      if (!confirm('Unsaved changes will be lost. Continue?')) return;
    }
    setSelectedId(id);
    setIsDirty(false);
    // Reset tab to financial on new selection
    setActiveTab('financial'); 
  };

  const updateFinancial = (field: keyof Supplier['financial'], value: any) => {
    if (!selectedId) return;
    setLocalSuppliers(prev => prev.map(s => {
      if (s.id === selectedId) {
        return { ...s, financial: { ...s.financial, [field]: value } };
      }
      return s;
    }));
    setIsDirty(true);
  };

  const updatePerformance = (field: string, value: any, dimensionId?: string) => {
    if (!selectedId) return;
    setLocalSuppliers(prev => prev.map(s => {
      if (s.id !== selectedId) return s;
      
      const currentConfig = s.performanceConfig || { dimensions: [], evaluationPeriod: 'quarterly' };
      
      if (field === 'period') {
        return { ...s, performanceConfig: { ...currentConfig, evaluationPeriod: value } };
      }
      
      if (field === 'dimension' && dimensionId) {
        const newDimensions = currentConfig.dimensions.map(d => 
          d.id === dimensionId ? { ...d, weight: Number(value) } : d
        );
        return { ...s, performanceConfig: { ...currentConfig, dimensions: newDimensions } };
      }

      return s;
    }));
    setIsDirty(true);
  };

  const updatePortal = (key: keyof Supplier['portalAccess']) => {
    if (!selectedId) return;
    setLocalSuppliers(prev => prev.map(s => {
      if (s.id === selectedId) {
        return { 
          ...s, 
          portalAccess: { 
            ...s.portalAccess, 
            [key]: !s.portalAccess[key] 
          } 
        };
      }
      return s;
    }));
    setIsDirty(true);
  };

  const updateTier = (tierId: any) => {
    if (!selectedId) return;
    setLocalSuppliers(prev => prev.map(s => {
      if (s.id === selectedId) {
        return { ...s, tier: tierId };
      }
      return s;
    }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    if (!selectedId) return;

    const supplierToUpdate = localSuppliers.find(s => s.id === selectedId);
    if (!supplierToUpdate) return;

    try {
      // 将 mock 数据格式转换为数据库格式
      const dbUpdate = transformMockToDbUpdate(supplierToUpdate);

      // 调用后端 API 更新供应商
      await updateSupplierMutation.mutateAsync({
        id: supplierToUpdate.id,
        updates: dbUpdate
      });

      setIsDirty(false);
      alert('Configuration saved successfully!');
    } catch (error) {
      console.error('Failed to save configuration:', error);
      alert('Failed to save configuration. Please try again.');
    }
  };

  // 加载状态处理
  if (isLoading) {
    return (
      <div className="h-[calc(100vh-6rem)] flex items-center justify-center">
        <div className="text-center">
          <Settings className="w-12 h-12 text-slate-300 animate-pulse mx-auto mb-4" />
          <p className="text-slate-500">加载供应商数据...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[calc(100vh-6rem)] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-slate-500">加载失败，请刷新页面重试</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col">
      
      {/* Header */}
      <div className="mb-6 flex-none">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <Settings className="w-8 h-8 text-slate-400" />
          业务配置 (Business Configuration)
        </h1>
        <p className="text-slate-500 mt-1 ml-11">为供应商分配财务模型、权益等级与门户权限。</p>
      </div>

      <div className="flex flex-1 gap-6 min-h-0">
        
        {/* Left Panel: Supplier Directory */}
        <div className="w-1/3 flex flex-col gap-4">
          <Card className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex-none">
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-slate-500" />
                供应商名录
              </h3>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search by name or code..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
            </div>

            <div className="overflow-y-auto flex-1 p-2 space-y-1">
              {filteredSuppliers.map(supplier => (
                <button
                  key={supplier.id}
                  onClick={() => handleSelect(supplier.id)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg border transition-all hover:shadow-md",
                    selectedId === supplier.id
                      ? "bg-brand-50 border-brand-200 ring-1 ring-brand-200"
                      : "bg-white border-transparent hover:bg-slate-50 hover:border-slate-200"
                  )}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={cn(
                      "font-semibold text-sm truncate pr-2",
                      selectedId === supplier.id ? "text-brand-900" : "text-slate-900"
                    )}>
                      {supplier.name}
                    </span>
                    {supplier.status === 'blacklisted' && (
                      <AlertCircle className="w-4 h-4 text-red-500 flex-none" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono text-slate-400">{supplier.code}</span>
                    <span className={cn(
                      "px-1.5 py-0.5 rounded border capitalize",
                      supplier.tier === 'strategic' ? "bg-purple-50 text-purple-700 border-purple-100" :
                      supplier.tier === 'core' ? "bg-blue-50 text-blue-700 border-blue-100" :
                      "bg-slate-50 text-slate-600 border-slate-100"
                    )}>
                      {supplier.tier}
                    </span>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="p-3 bg-slate-50 border-t border-slate-100 text-xs text-center text-slate-500 flex-none">
              Showing {filteredSuppliers.length} suppliers
            </div>
          </Card>
        </div>

        {/* Right Panel: Configuration */}
        <div className="w-2/3 flex flex-col">
          {selectedSupplier ? (
            <Card className="flex-1 flex flex-col overflow-hidden bg-slate-50/50">
              
              {/* Toolbar */}
              <div className="p-4 bg-white border-b border-slate-200 flex justify-between items-center flex-none">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-lg">
                    {selectedSupplier.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900">{selectedSupplier.name}</h2>
                    <p className="text-xs text-slate-500">正在配置策略参数...</p>
                  </div>
                </div>
                <button 
                  onClick={handleSave}
                  disabled={!isDirty}
                  className={cn(
                    "px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-all",
                    isDirty 
                      ? "bg-brand-600 text-white shadow-lg shadow-brand-500/30 hover:bg-brand-700"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  )}
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-200 bg-white px-4 flex-none">
                {[
                  { id: 'financial', label: '财务模型 (Financial)', icon: CreditCard },
                  { id: 'portal', label: '门户权限 (Portal)', icon: Globe2 },
                  { id: 'tiering', label: '分级权益 (Tiering)', icon: Crown },
                  { id: 'performance', label: '绩效配置 (Performance)', icon: BarChart2 },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      "px-4 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors",
                      activeTab === tab.id
                        ? "border-brand-500 text-brand-600"
                        : "border-transparent text-slate-500 hover:text-slate-700"
                    )}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto p-6">
                
                {/* Financial Tab */}
                {activeTab === 'financial' && (
                  <div className="space-y-6 max-w-2xl">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                      <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-blue-500" />
                        4D 模型配置
                      </h3>
                      
                      <div className="space-y-6">
                        {/* Interval */}
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">1. 结算区间 (Interval)</label>
                          <div className="grid grid-cols-2 gap-3">
                            {DICTIONARIES.intervals.map(opt => (
                              <button
                                key={opt.id}
                                onClick={() => updateFinancial('interval', opt.id)}
                                className={cn(
                                  "px-3 py-2 text-sm text-left rounded-lg border transition-all",
                                  selectedSupplier.financial.interval === opt.id
                                    ? "bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500"
                                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                                )}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Anchor */}
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">2. 锚定节点 (Anchor)</label>
                          <select
                            value={selectedSupplier.financial.anchor}
                            onChange={(e) => updateFinancial('anchor', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          >
                            {DICTIONARIES.anchors.map(opt => (
                              <option key={opt.id} value={opt.id}>{opt.label}</option>
                            ))}
                          </select>
                        </div>

                        {/* Period */}
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">3. 账期长度 (Period Days)</label>
                          <div className="flex items-center gap-3">
                            <input
                              type="number"
                              value={selectedSupplier.financial.period}
                              onChange={(e) => updateFinancial('period', parseInt(e.target.value) || 0)}
                              className="w-24 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                            <span className="text-sm text-slate-500">Days</span>
                          </div>
                        </div>

                        {/* Summary */}
                        <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-3 text-sm text-slate-600">
                          <AlertCircle className="w-4 h-4 text-slate-400" />
                          <span>
                            当前配置: 
                            <strong className="text-slate-900 mx-1">
                              {DICTIONARIES.intervals.find(i => i.id === selectedSupplier.financial.interval)?.label}
                            </strong>
                            + 
                            <strong className="text-slate-900 mx-1">T+{selectedSupplier.financial.period}</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Portal Tab */}
                {activeTab === 'portal' && (
                  <div className="space-y-6 max-w-2xl">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                      <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <Globe2 className="w-5 h-5 text-brand-500" />
                        门户功能开关
                      </h3>
                      
                      <div className="space-y-4">
                        {[
                          { key: 'demandBroadcast', label: '需求广播 (Demand Broadcast)', desc: 'View RFQs and Forecasts' },
                          { key: 'empowermentCenter', label: '赋能中心 (Empowerment)', desc: 'Access SOPs and Training' },
                          { key: 'ticketSystem', label: '协同工单 (Ticket System)', desc: 'Submit Issues and Claims' },
                          { key: 'performanceView', label: '绩效透视 (Performance)', desc: 'View Scorecards', sensitive: true },
                        ].map((module: any) => (
                          <div key={module.key} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                            <div>
                              <div className="font-medium text-slate-900 flex items-center gap-2">
                                {module.label}
                                {module.sensitive && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Sensitive</span>}
                              </div>
                              <div className="text-xs text-slate-500">{module.desc}</div>
                            </div>
                            <button
                              onClick={() => updatePortal(module.key)}
                              className={cn(
                                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                                selectedSupplier.portalAccess[module.key as keyof typeof selectedSupplier.portalAccess] 
                                  ? "bg-brand-600" 
                                  : "bg-slate-200"
                              )}
                            >
                              <span className={cn(
                                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                selectedSupplier.portalAccess[module.key as keyof typeof selectedSupplier.portalAccess] 
                                  ? "translate-x-6" 
                                  : "translate-x-1"
                              )} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tiering Tab */}
                {activeTab === 'tiering' && (
                  <div className="space-y-6 max-w-2xl">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                      <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <Crown className="w-5 h-5 text-purple-500" />
                        等级与权益分配
                      </h3>
                      
                      <div className="grid grid-cols-1 gap-3">
                        {DICTIONARIES.tiers.map(tier => (
                          <button
                            key={tier.id}
                            onClick={() => updateTier(tier.id)}
                            className={cn(
                              "flex items-center p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden",
                              selectedSupplier.tier === tier.id
                                ? tier.id === 'strategic' 
                                  ? "border-purple-500 bg-purple-50 ring-1 ring-purple-500"
                                  : tier.id === 'core'
                                    ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                                    : tier.id === 'backup'
                                      ? "border-slate-500 bg-slate-50 ring-1 ring-slate-500"
                                      : tier.id === 'probation'
                                        ? "border-amber-500 bg-amber-50 ring-1 ring-amber-500"
                                        : "border-red-500 bg-red-50 ring-1 ring-red-500"
                                : "border-slate-100 bg-white hover:border-slate-300"
                            )}
                          >
                            <div className={cn("w-12 h-12 rounded-lg flex flex-col items-center justify-center mr-4 shrink-0 font-bold border", 
                              selectedSupplier.tier === tier.id 
                                ? tier.id === 'strategic'
                                  ? "bg-white border-purple-200 text-purple-700"
                                  : tier.id === 'core'
                                    ? "bg-white border-blue-200 text-blue-700"
                                    : tier.id === 'backup'
                                      ? "bg-white border-slate-200 text-slate-700"
                                      : tier.id === 'probation'
                                        ? "bg-white border-amber-200 text-amber-700"
                                        : "bg-white border-red-200 text-red-700"
                                : "bg-slate-50 border-slate-200 text-slate-400"
                            )}>
                              <span className="text-[10px] uppercase tracking-tighter leading-none opacity-70">Tier</span>
                              <span className="text-xl leading-none">{(tier as any).level?.split('-')[1]}</span>
                            </div>

                            <div className="flex-1 z-10">
                              <span className={cn("font-bold block flex items-center gap-2", 
                                selectedSupplier.tier === tier.id 
                                  ? tier.id === 'strategic'
                                    ? "text-purple-900"
                                    : tier.id === 'core'
                                      ? "text-blue-900"
                                      : tier.id === 'backup'
                                        ? "text-slate-900"
                                        : tier.id === 'probation'
                                          ? "text-amber-900"
                                          : "text-red-900"
                                  : "text-slate-700"
                              )}>
                                {tier.label.split(' (')[0]}
                                <span className="text-xs font-normal opacity-60">{(tier as any).level}</span>
                              </span>
                              <span className="text-xs text-slate-500">{(tier as any).id.toUpperCase()} Strategy</span>
                            </div>
                            
                            {selectedSupplier.tier === tier.id && (
                              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <CheckCircle2 className={cn("w-6 h-6",
                                  tier.id === 'strategic' ? "text-purple-600" :
                                  tier.id === 'core' ? "text-blue-600" :
                                  tier.id === 'backup' ? "text-slate-600" :
                                  tier.id === 'probation' ? "text-amber-600" :
                                  "text-red-600"
                                )} />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>

                      <div className={cn(
                        "mt-6 p-4 rounded-lg border",
                        selectedSupplier.tier === 'strategic' ? "bg-purple-50 border-purple-100" :
                        selectedSupplier.tier === 'core' ? "bg-blue-50 border-blue-100" :
                        selectedSupplier.tier === 'backup' ? "bg-slate-50 border-slate-100" :
                        selectedSupplier.tier === 'probation' ? "bg-amber-50 border-amber-100" :
                        "bg-red-50 border-red-100"
                      )}>
                        <h4 className={cn(
                          "font-bold text-sm mb-2",
                          selectedSupplier.tier === 'strategic' ? "text-purple-900" :
                          selectedSupplier.tier === 'core' ? "text-blue-900" :
                          selectedSupplier.tier === 'backup' ? "text-slate-900" :
                          selectedSupplier.tier === 'probation' ? "text-amber-900" :
                          "text-red-900"
                        )}>已选权益 (Selected Rights):</h4>
                        <ul className={cn(
                          "list-disc list-inside text-sm space-y-1",
                          selectedSupplier.tier === 'strategic' ? "text-purple-800" :
                          selectedSupplier.tier === 'core' ? "text-blue-800" :
                          selectedSupplier.tier === 'backup' ? "text-slate-800" :
                          selectedSupplier.tier === 'probation' ? "text-amber-800" :
                          "text-red-800"
                        )}>
                          {selectedSupplier.tier === 'strategic' && (
                            <>
                              <li>账期: T+60 (月结)</li>
                              <li>优先级: 最高 (VVIP)</li>
                              <li>返利政策: 年度 2%</li>
                            </>
                          )}
                          {selectedSupplier.tier === 'core' && (
                            <>
                              <li>账期: T+45</li>
                              <li>优先级: 高</li>
                            </>
                          )}
                          {['backup', 'probation'].includes(selectedSupplier.tier) && (
                            <>
                              <li>账期: 标准 / 预付</li>
                              <li>优先级: 标准</li>
                            </>
                          )}
                          {selectedSupplier.tier === 'blacklisted' && (
                            <>
                              <li>账期: 禁用 (Blocked)</li>
                              <li>优先级: 无 (None)</li>
                              <li>限制: 禁止下单与付款</li>
                            </>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Performance Tab */}
                {activeTab === 'performance' && (
                  <div className="space-y-6 max-w-2xl">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                      <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <BarChart2 className="w-5 h-5 text-brand-500" />
                        绩效维度配置
                      </h3>

                      {!selectedSupplier.performanceConfig ? (
                        <div className="text-center py-8">
                          <p className="text-slate-500 mb-4">该供应商尚未配置绩效考核维度。</p>
                          <button
                            onClick={() => {
                              const defaultDims = [
                                { id: 'cost', name: '成本竞争力', weight: 40 },
                                { id: 'quality', name: '服务质量', weight: 30 },
                                { id: 'delivery', name: '交付时效', weight: 30 }
                              ];
                              // We need a new handler or use existing one cleverly? 
                              // Actually we need to update the whole object.
                              // Let's just use updatePerformance logic but we need to trigger it.
                              // Since updatePerformance is granular, let's just add a specialized one or expand updatePerformance.
                              // Or better, just direct setLocalSuppliers here for simplicity in this tool call.
                              setLocalSuppliers(prev => prev.map(s => {
                                if (s.id === selectedId) {
                                  return { 
                                    ...s, 
                                    performanceConfig: { 
                                      dimensions: defaultDims, 
                                      evaluationPeriod: 'quarterly' 
                                    } 
                                  };
                                }
                                return s;
                              }));
                              setIsDirty(true);
                            }}
                            className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 font-medium"
                          >
                            初始化默认模板
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {/* Evaluation Period */}
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">考核周期 (Evaluation Period)</label>
                            <div className="flex gap-3">
                              {['monthly', 'quarterly', 'annual'].map(period => (
                                <button
                                  key={period}
                                  onClick={() => updatePerformance('period', period)}
                                  className={cn(
                                    "px-4 py-2 text-sm rounded-lg border capitalize transition-all",
                                    selectedSupplier.performanceConfig?.evaluationPeriod === period
                                      ? "bg-brand-50 border-brand-500 text-brand-700 ring-1 ring-brand-500"
                                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                                  )}
                                >
                                  {period}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Dimensions & Weights */}
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-3">
                              考核维度权重 (Dimensions & Weights)
                              <span className="ml-2 text-xs font-normal text-slate-500">Total must be 100%</span>
                            </label>
                            
                            <div className="space-y-3">
                              {selectedSupplier.performanceConfig.dimensions.map(dim => (
                                <div key={dim.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                                  <div className="flex-1">
                                    <div className="font-medium text-slate-900">{dim.name}</div>
                                    <div className="text-xs text-slate-500 uppercase">{dim.id}</div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="number"
                                      min="0"
                                      max="100"
                                      value={dim.weight}
                                      onChange={(e) => updatePerformance('dimension', parseInt(e.target.value) || 0, dim.id)}
                                      className="w-20 px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-right"
                                    />
                                    <span className="text-slate-500 font-medium">%</span>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Total Weight Check */}
                            <div className="mt-4 flex justify-end">
                              <div className={cn(
                                "text-sm font-bold px-3 py-1 rounded-full border",
                                selectedSupplier.performanceConfig.dimensions.reduce((acc, curr) => acc + curr.weight, 0) === 100
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-red-50 text-red-700 border-red-200"
                              )}>
                                Total: {selectedSupplier.performanceConfig.dimensions.reduce((acc, curr) => acc + curr.weight, 0)}%
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-slate-50 rounded-xl border border-slate-200 border-dashed m-4">
              <div className="text-center max-w-sm mx-auto">
                <LayoutDashboard className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900">未选择供应商</h3>
                <p className="text-slate-500 mt-2">
                  请从左侧列表选择一个供应商，以为其配置财务模型、门户权限及等级权益。
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
