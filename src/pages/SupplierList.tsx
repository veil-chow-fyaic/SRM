// @ts-nocheck
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Building2,
  Search,
  Plus,
  MoreHorizontal,
  Crown,
  ShieldCheck,
  TrendingUp,
  UserPlus,
  Ban,
  X,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { CreateSupplierModal } from '../components/CreateSupplierModal';
import { useSuppliersSummary, useCreateSupplier, useUpdateSupplier } from '../hooks/useSuppliers';
import type { SupplierSummary as SupplierSummaryType } from '../types/database';

// 状态配置（映射数据库 tier 字段）
const tierConfig = {
  strategic: { label: '战略', statusLabel: 'Strategic', color: 'bg-purple-50 text-purple-700 border-purple-100', activeColor: 'bg-purple-600 text-white border-purple-600', icon: Crown },
  core: { label: '核心', statusLabel: 'Core', color: 'bg-blue-50 text-blue-700 border-blue-100', activeColor: 'bg-blue-600 text-white border-blue-600', icon: ShieldCheck },
  backup: { label: '储备', statusLabel: 'Backup', color: 'bg-slate-50 text-slate-700 border-slate-100', activeColor: 'bg-slate-600 text-white border-slate-600', icon: TrendingUp },
  probation: { label: '潜在/考察', statusLabel: 'Trial', color: 'bg-amber-50 text-amber-700 border-amber-100', activeColor: 'bg-amber-500 text-white border-amber-500', icon: UserPlus },
  blacklisted: { label: '黑名单', statusLabel: 'Blacklisted', color: 'bg-red-50 text-red-700 border-red-100', activeColor: 'bg-red-600 text-white border-red-600', icon: Ban },
};

// 数据库 SupplierSummary 转换为前端显示格式
interface SupplierDisplay extends SupplierSummaryType {
  // 添加兼容性字段
  category?: string;
  totalSpend?: string;
  logoText?: string;
}

// --- Add Partner Modal Component ---
const AddPartnerModal = ({
  isOpen,
  onClose,
  sourceList,
  onAdd
}: {
  isOpen: boolean;
  onClose: () => void;
  sourceList: SupplierDisplay[];
  onAdd: (selectedIds: string[]) => void;
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-900">选择要晋升的供应商</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-0 max-h-[60vh] overflow-y-auto">
          {sourceList.length > 0 ? (
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100 sticky top-0">
                <tr>
                  <th className="px-6 py-3 w-10"></th>
                  <th className="px-6 py-3">供应商名称</th>
                  <th className="px-6 py-3">当前层级</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sourceList.map(s => (
                  <tr
                    key={s.id}
                    className={cn(
                      "hover:bg-slate-50 transition-colors cursor-pointer",
                      selectedIds.has(s.id) ? "bg-brand-50 hover:bg-brand-50" : ""
                    )}
                    onClick={() => toggleSelection(s.id!)}
                  >
                    <td className="px-6 py-4">
                      <div className={cn(
                        "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                        selectedIds.has(s.id) ? "bg-brand-500 border-brand-500" : "border-slate-300 bg-white"
                      )}>
                        {selectedIds.has(s.id) && <Plus className="w-3 h-3 text-white rotate-45" />}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{s.name}</div>
                      <div className="text-xs text-slate-500">{s.local_name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn("px-2 py-0.5 rounded text-xs border", tierConfig[s.tier as keyof typeof tierConfig]?.color)}>
                        {tierConfig[s.tier as keyof typeof tierConfig]?.label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-slate-500">
              没有可供选择的供应商
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-200 rounded-lg transition-all"
          >
            取消
          </button>
          <button
            onClick={() => {
              onAdd(Array.from(selectedIds));
              onClose();
            }}
            disabled={selectedIds.size === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm shadow-brand-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            确认添加 ({selectedIds.size})
          </button>
        </div>
      </div>
    </div>
  );
};

export function SupplierList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddPartnerModalOpen, setIsAddPartnerModalOpen] = useState(false);

  // 获取 URL 类型参数
  const activeType = searchParams.get('type') || 'all';

  // 构建筛选条件
  const filters = React.useMemo(() => {
    switch (activeType) {
      case 'strategic':
        return { tier: 'strategic' };
      case 'active':
        return { tier: ['core', 'backup'] }; // 需要服务层支持数组查询，这里简化
      case 'potential':
        return { tier: 'probation' };
      case 'blacklist':
        return { tier: 'blacklisted' };
      default:
        return {};
    }
  }, [activeType]);

  // 使用 React Query 获取数据
  const { data: suppliers = [], isLoading, error } = useSuppliersSummary(filters);

  // 获取所有供应商用于晋升选择（不受当前筛选条件限制）
  const { data: allSuppliers = [] } = useSuppliersSummary({});

  // 创建供应商 mutation
  const createSupplierMutation = useCreateSupplier();

  // 更新供应商 mutation（用于晋升）
  const updateSupplierMutation = useUpdateSupplier();

  // 处理创建供应商
  const handleCreateSupplier = async (newSupplier: any) => {
    try {
      // 转换前端数据格式为数据库格式
      const supplierData = {
        code: newSupplier.id,
        name: newSupplier.name,
        local_name: newSupplier.localName,
        tier: 'probation',
        status: 'active' as const,
        stage: 'leads' as const,
        category: newSupplier.category,
        location: newSupplier.location,
        address: newSupplier.address,
        structure: newSupplier.structure,
        tags: newSupplier.tags,
        logo_text: newSupplier.logoText,
        // 业务线数据会通过其他接口创建
      };

      await createSupplierMutation.mutateAsync(supplierData);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('创建供应商失败:', error);
      alert('创建供应商失败，请重试');
    }
  };

  // 处理晋升供应商
  const handleAddPartners = async (selectedIds: string[]) => {
    try {
      const targetTier = activeType === 'strategic' ? 'strategic' : 'core';

      // 批量更新
      for (const id of selectedIds) {
        await updateSupplierMutation.mutateAsync({
          id,
          updates: { tier: targetTier },
        });
      }

      setIsAddPartnerModalOpen(false);
    } catch (error) {
      console.error('更新供应商失败:', error);
      alert('更新供应商失败，请重试');
    }
  };

  const handleTabChange = (type: string) => {
    setSearchParams(type === 'all' ? {} : { type });
  };

  // 获取可用于晋升的供应商列表（从所有供应商中选择，不受当前筛选限制）
  const getSourceListForAdd = (): SupplierDisplay[] => {
    if (activeType === 'strategic') {
      // 从核心/储备晋升到战略
      return allSuppliers.filter(s => s.tier === 'core' || s.tier === 'backup');
    } else if (activeType === 'active') {
      // 从潜在晋升到合作
      return allSuppliers.filter(s => s.tier === 'probation');
    }
    return [];
  };

  // 加载状态
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          <span className="ml-3 text-slate-600">加载供应商数据...</span>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-4">
          <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-red-900">加载失败</h3>
            <p className="text-sm text-red-700 mt-1">
              {error.message || '无法加载供应商数据，请检查网络连接或刷新页面重试'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Header Actions */}
      <div className="flex flex-col gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-brand-500" />
              供应商名录 (Supplier Directory)
              <div className="flex items-center gap-2 px-2 py-1 bg-emerald-50 border border-emerald-100 rounded text-xs font-medium text-emerald-700">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                已连接 Supabase 数据库
              </div>
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              共找到 {suppliers.length} 家
              {activeType !== 'all' && <span className="font-bold mx-1">{activeType}</span>}
              供应商
            </p>
          </div>

          <div className="flex gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="搜索供应商..."
                className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-brand-500 w-64"
              />
            </div>

            {/* 新建档案按钮 - 在潜在供应商和全部供应商页显示 */}
            {(activeType === 'potential' || activeType === 'all') ? (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors shadow-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                新建档案
              </button>
            ) : null}

            {/* 新增伙伴按钮 - 在合作供应商、战略供应商页显示 */}
            {activeType === 'active' || activeType === 'strategic' ? (
              <button
                onClick={() => setIsAddPartnerModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm font-medium"
              >
                <UserPlus className="w-4 h-4 text-brand-500" />
                新增伙伴
              </button>
            ) : null}
          </div>
        </div>

        {/* Tier Tabs / Filter */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
          <button
            onClick={() => handleTabChange('all')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-all border",
              activeType === 'all'
                ? "bg-slate-800 text-white border-slate-800"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            )}
          >
            全部 (All)
          </button>

          <button
            onClick={() => handleTabChange('potential')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-all border flex items-center gap-2",
              activeType === 'potential'
                ? tierConfig.probation.activeColor
                : "bg-white text-slate-600 border-slate-200 hover:bg-amber-50 hover:text-amber-700"
            )}
          >
            <tierConfig.probation.icon className="w-3.5 h-3.5" />
            {tierConfig.probation.label}
          </button>

          <button
            onClick={() => handleTabChange('active')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-all border flex items-center gap-2",
              activeType === 'active'
                ? tierConfig.core.activeColor
                : "bg-white text-slate-600 border-slate-200 hover:bg-blue-50 hover:text-blue-700"
            )}
          >
            <tierConfig.core.icon className="w-3.5 h-3.5" />
            合作供应商 (Active)
          </button>

          <button
            onClick={() => handleTabChange('strategic')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-all border flex items-center gap-2",
              activeType === 'strategic'
                ? tierConfig.strategic.activeColor
                : "bg-white text-slate-600 border-slate-200 hover:bg-purple-50 hover:text-purple-700"
            )}
          >
            <tierConfig.strategic.icon className="w-3.5 h-3.5" />
            {tierConfig.strategic.label}
          </button>

          <button
            onClick={() => handleTabChange('blacklist')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-all border flex items-center gap-2",
              activeType === 'blacklist'
                ? tierConfig.blacklisted.activeColor
                : "bg-white text-slate-600 border-slate-200 hover:bg-red-50 hover:text-red-700"
            )}
          >
            <tierConfig.blacklisted.icon className="w-3.5 h-3.5" />
            {tierConfig.blacklisted.label}
          </button>
        </div>
      </div>

      {/* List View (Table) */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
            <tr>
              <th className="px-6 py-3">供应商名称</th>
              <th className="px-6 py-3">位置</th>
              <th className="px-6 py-3">状态</th>
              <th className="px-6 py-3">评分</th>
              <th className="px-6 py-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {suppliers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  暂无供应商数据
                </td>
              </tr>
            ) : (
              suppliers.map(supplier => {
                const config = tierConfig[supplier.tier as keyof typeof tierConfig];
                const logoText = supplier.logo_text || (supplier.name ? supplier.name.charAt(0).toUpperCase() : '?');
                const performanceScore = supplier.performance_score ?? 0;

                return (
                  <tr key={supplier.id} className="hover:bg-slate-50/50 group cursor-pointer" onClick={() => navigate(`/supplier-profile/${supplier.id}`)}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                          {logoText}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{supplier.name}</div>
                          <div className="text-xs text-slate-500">{supplier.local_name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{supplier.location || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={cn("px-2 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1 w-fit", config?.color)}>
                        {config?.icon && React.createElement(config.icon, { className: "w-3 h-3" })}
                        {config?.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={cn("h-full rounded-full", performanceScore >= 90 ? "bg-emerald-500" : performanceScore >= 70 ? "bg-blue-500" : "bg-amber-500")}
                            style={{ width: `${Math.min(performanceScore, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-slate-600">{performanceScore}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-brand-600 transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <CreateSupplierModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSupplier}
      />

      <AddPartnerModal
        isOpen={isAddPartnerModalOpen}
        onClose={() => setIsAddPartnerModalOpen(false)}
        sourceList={getSourceListForAdd()}
        onAdd={handleAddPartners}
      />
    </div>
  );
}
