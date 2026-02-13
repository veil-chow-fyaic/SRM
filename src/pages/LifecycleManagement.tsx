// @ts-nocheck - 临时禁用类型检查
import { useState, useEffect, useMemo } from 'react';
import {
  GitCommit,
  Search,
  MoreHorizontal,
  AlertTriangle,
  Clock,
  Plus,
  ArrowRight,
  ChevronUp,
  ChevronDown,
  Check
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useSuppliers, useUpdateSupplier } from '../hooks/useSuppliers';
import { useProbationTasks } from '../hooks/useProbationTasks';
import { useNavigate } from 'react-router-dom';

// Types
type LifecycleStage = 'leads' | 'probation' | 'active' | 'blacklist';

interface SupplierCard {
  id: string;
  name: string;
  code?: string;
  stage: LifecycleStage;
  tags: string[];
  score?: number;
  probationTask?: {
    name: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    deadline: string;
  };
}

// 数据转换：将数据库供应商映射到生命周期阶段
function mapSupplierToLifecycleCard(dbSupplier: any, probationTasks: Record<string, any[]> = {}): SupplierCard {
  // 根据 tier 和 status 确定生命周期阶段
  let stage: LifecycleStage = 'leads';
  if (dbSupplier.tier === 'blacklisted' || dbSupplier.status === 'blacklisted') {
    stage = 'blacklist';
  } else if (dbSupplier.status === 'active' && dbSupplier.tier !== 'probation') {
    stage = 'active';
  } else if (dbSupplier.tier === 'probation' || dbSupplier.stage === 'probation') {
    stage = 'probation';
  }

  // 获取该供应商的活跃考察任务
  const tasks = probationTasks[dbSupplier.id] || [];
  const activeTask = tasks.find(t => t.status === 'pending' || t.status === 'in_progress');

  return {
    id: dbSupplier.id,
    name: dbSupplier.name,
    code: dbSupplier.code,
    stage,
    tags: dbSupplier.tags || [],
    score: dbSupplier.system_score || undefined,
    probationTask: activeTask ? {
      name: activeTask.name,
      status: activeTask.status,
      deadline: activeTask.deadline
    } : undefined
  };
}

// 生命周期阶段到供应商状态的映射
function lifecycleToSupplierStatus(stage: LifecycleStage): { tier?: string; status?: string } {
  switch (stage) {
    case 'leads':
      return { tier: 'probation', status: 'active', stage: 'leads' };
    case 'probation':
      return { tier: 'probation', status: 'active', stage: 'probation' };
    case 'active':
      return { tier: 'core', status: 'active', stage: 'active' };
    case 'blacklist':
      return { tier: 'blacklisted', status: 'blacklisted', stage: 'blacklist' };
    default:
      return { tier: 'backup', status: 'active' };
  }
}

// 扩展的转换选项类型
interface TransitionOption {
  stage: LifecycleStage;
  label: string;
  icon: typeof ArrowRight;
  isUpgrade: boolean;
  tier?: string; // 目标 tier，用于战略供应商晋升
}

export function LifecycleManagement() {
  const navigate = useNavigate();
  const { data: dbSuppliers = [], isLoading } = useSuppliers();
  const updateSupplierMutation = useUpdateSupplier();

  const [suppliers, setSuppliers] = useState<SupplierCard[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [probationTasksMap, setProbationTasksMap] = useState<Record<string, any[]>>({});
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [promotingId, setPromotingId] = useState<string | null>(null);

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // 检查点击是否在任何菜单按钮或菜单项上
      const target = event.target as HTMLElement;
      const isMenuClick = target.closest('[data-menu]') || target.closest('[data-menu-item]');
      if (!isMenuClick && openMenuId !== null) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

  // 获取 probation 阶段供应商的 ID 列表
  const probationSupplierIds = useMemo(() => {
    return dbSuppliers
      .filter(s => s.tier === 'probation' || s.stage === 'probation')
      .map(s => s.id);
  }, [dbSuppliers]);

  // 获取第一个 probation 供应商的 ID（稳定引用）
  const firstProbationId = probationSupplierIds[0];

  // 获取第一个 probation 供应商的任务（简化版本，实际应该批量获取）
  const { data: firstProbationTasks } = useProbationTasks(firstProbationId);

  // 构建 probation tasks 映射
  useEffect(() => {
    if (firstProbationTasks && firstProbationId) {
      setProbationTasksMap(prev => {
        // 只有数据变化时才更新
        const prevTasks = prev[firstProbationId];
        if (prevTasks === firstProbationTasks ||
            (prevTasks?.length === firstProbationTasks.length &&
             prevTasks.every((t, i) => t.id === firstProbationTasks[i]?.id))) {
          return prev;
        }
        return { ...prev, [firstProbationId]: firstProbationTasks };
      });
    }
  }, [firstProbationTasks, firstProbationId]);

  // 当后端数据加载完成后，转换为生命周期卡片格式
  useEffect(() => {
    if (dbSuppliers.length > 0) {
      setSuppliers(prev => {
        const mapped = dbSuppliers.map(s => mapSupplierToLifecycleCard(s, probationTasksMap));
        // 只有实际变化时才更新
        if (prev.length === mapped.length &&
            prev.every((s, i) => s.id === mapped[i].id && s.stage === mapped[i].stage)) {
          return prev;
        }
        return mapped;
      });
    }
  }, [dbSuppliers, probationTasksMap]);

  // 过滤供应商
  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.code && s.code.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // 计算每个阶段的数量
  const columns: { id: LifecycleStage; label: string; color: string; count: number }[] = [
    { id: 'leads', label: '线索公海 (Leads)', color: 'bg-slate-100 border-slate-200', count: filteredSuppliers.filter(s => s.stage === 'leads').length },
    { id: 'probation', label: '考察/试用 (Probation)', color: 'bg-blue-50 border-blue-200', count: filteredSuppliers.filter(s => s.stage === 'probation').length },
    { id: 'active', label: '合作中 (Active)', color: 'bg-green-50 border-green-200', count: filteredSuppliers.filter(s => s.stage === 'active').length },
    { id: 'blacklist', label: '黑名单/冻结 (Exit)', color: 'bg-red-50 border-red-200', count: filteredSuppliers.filter(s => s.stage === 'blacklist').length },
  ];

  // 处理供应商卡片点击
  const handleCardClick = (supplierId: string) => {
    navigate(`/supplier-profile/${supplierId}`);
  };

  // 处理阶段变更（拖拽或移动）
  const handleStageChange = async (supplierId: string, newStage: LifecycleStage, targetTier?: string) => {
    const statusUpdate = targetTier
      ? { tier: targetTier, status: 'active' as const, stage: newStage }
      : lifecycleToSupplierStatus(newStage);

    try {
      setPromotingId(supplierId);
      await updateSupplierMutation.mutateAsync({
        id: supplierId,
        updates: statusUpdate
      });

      // 乐观更新本地状态
      setSuppliers(prev => prev.map(s => {
        if (s.id === supplierId) {
          return { ...s, stage: newStage };
        }
        return s;
      }));
      setOpenMenuId(null);
    } catch (error) {
      console.error('Failed to update supplier stage:', error);
      alert('更新阶段失败，请重试。');
    } finally {
      setPromotingId(null);
    }
  };

  // 获取可用的阶段转换选项
  const getAvailableTransitions = (currentStage: LifecycleStage): TransitionOption[] => {
    const transitions: TransitionOption[] = [];

    switch (currentStage) {
      case 'leads':
        // 线索可以移到考察期
        transitions.push({ stage: 'probation', label: '进入考察期', icon: ChevronUp, isUpgrade: true });
        break;
      case 'probation':
        // 考察期可以转正或回退
        transitions.push({ stage: 'active', label: '晋升合作供应商', icon: ChevronUp, isUpgrade: true });
        transitions.push({ stage: 'leads', label: '退回线索公海', icon: ChevronDown, isUpgrade: false });
        break;
      case 'active':
        // 合作中可以晋升战略或降级
        transitions.push({ stage: 'active', label: '晋升战略供应商', icon: ChevronUp, isUpgrade: true, tier: 'strategic' });
        transitions.push({ stage: 'probation', label: '降级到考察期', icon: ChevronDown, isUpgrade: false });
        transitions.push({ stage: 'blacklist', label: '加入黑名单', icon: ChevronDown, isUpgrade: false });
        break;
      case 'blacklist':
        // 黑名单可以解除
        transitions.push({ stage: 'probation', label: '解除黑名单', icon: ChevronUp, isUpgrade: true });
        break;
    }

    return transitions;
  };

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-100px)] flex items-center justify-center">
        <div className="text-center">
          <GitCommit className="w-12 h-12 text-slate-300 animate-pulse mx-auto mb-4" />
          <p className="text-slate-500">加载供应商数据...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <GitCommit className="w-8 h-8 text-slate-400" />
            生命周期看板 (Lifecycle Pipeline)
          </h1>
          <p className="text-slate-500 mt-1">全流程可视化管理：从线索录入、试单考察到优胜劣汰。</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search suppliers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-brand-500 w-64"
            />
          </div>
          <button className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 flex items-center gap-2 text-sm font-medium">
            <Plus className="w-4 h-4" /> Add Lead
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-6 h-full min-w-[1200px]">
          {columns.map((col) => (
            <div key={col.id} className="flex-1 flex flex-col min-w-[300px]">
              {/* Column Header */}
              <div className={cn("p-3 rounded-t-xl border-t border-x mb-0 flex justify-between items-center", col.color)}>
                <h3 className="font-bold text-slate-700">{col.label}</h3>
                <span className="bg-white/50 px-2 py-0.5 rounded-full text-xs font-bold text-slate-600">
                  {col.count}
                </span>
              </div>

              {/* Drop Zone (Visual Only for now) */}
              <div className="flex-1 bg-slate-50/50 border rounded-b-xl p-3 space-y-3 overflow-y-auto">
                {filteredSuppliers.filter(s => s.stage === col.id).map((supplier) => {
                    const availableTransitions = getAvailableTransitions(supplier.stage);
                    const isPromoting = promotingId === supplier.id;

                    return (
                      <div
                        key={supplier.id}
                        className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span
                            className="font-bold text-slate-900 line-clamp-1 cursor-pointer hover:text-brand-600"
                            onClick={() => handleCardClick(supplier.id)}
                          >
                            {supplier.name}
                          </span>
                          <div className="relative">
                            <button
                              data-menu="true"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(openMenuId === supplier.id ? null : supplier.id);
                              }}
                              disabled={isPromoting}
                              className={cn(
                                "text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded p-1 transition-colors",
                                openMenuId === supplier.id ? "opacity-100 bg-slate-100" : "opacity-0 group-hover:opacity-100"
                              )}
                            >
                              {isPromoting ? (
                                <Clock className="w-4 h-4 animate-spin" />
                              ) : (
                                <MoreHorizontal className="w-4 h-4" />
                              )}
                            </button>

                            {/* 操作菜单 */}
                            {openMenuId === supplier.id && (
                              <div data-menu-item="true" className="absolute right-0 top-8 z-20 bg-white border border-slate-200 rounded-lg shadow-lg py-1 min-w-[160px]">
                                <div className="px-3 py-2 text-xs font-medium text-slate-500 border-b border-slate-100">
                                  阶段变更
                                </div>
                                {availableTransitions.map((transition, idx) => (
                                  <button
                                    key={`${transition.stage}-${idx}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStageChange(supplier.id, transition.stage, transition.tier);
                                    }}
                                    className={cn(
                                      "w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-slate-50 transition-colors",
                                      transition.isUpgrade ? "text-green-700 hover:bg-green-50" : "text-amber-700 hover:bg-amber-50"
                                    )}
                                  >
                                    <transition.icon className="w-4 h-4" />
                                    {transition.label}
                                  </button>
                                ))}
                                <div className="border-t border-slate-100 mt-1 pt-1">
                                  <button
                                    onClick={() => {
                                      handleCardClick(supplier.id);
                                      setOpenMenuId(null);
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                                  >
                                    <ArrowRight className="w-4 h-4" />
                                    查看详情
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {supplier.code && (
                          <div className="text-xs font-mono text-slate-500 mb-2 bg-slate-100 px-1.5 py-0.5 rounded w-fit">
                            {supplier.code}
                          </div>
                        )}

                        <div className="flex flex-wrap gap-1 mb-3">
                          {supplier.tags.map((tag, i) => (
                            <span key={i} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded border border-slate-200">
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Special Logic per Column */}
                        {col.id === 'probation' && supplier.probationTask && (
                          <div className="mt-3 p-2 bg-blue-50 border border-blue-100 rounded text-xs">
                            <div className="flex items-center gap-1.5 font-semibold text-blue-800 mb-1">
                              <Clock className="w-3 h-3" />
                              试单任务 (Trial)
                            </div>
                            <p className="text-blue-700 mb-1">{supplier.probationTask.name}</p>
                            <div className="flex justify-between text-[10px] text-blue-600/80">
                              <span>Deadline: {supplier.probationTask.deadline}</span>
                              <span className="capitalize font-medium">{supplier.probationTask.status.replace('_', ' ')}</span>
                            </div>
                          </div>
                        )}

                        {col.id === 'active' && supplier.score && (
                          <div className="mt-2 flex items-center justify-between text-xs">
                            <span className="text-slate-500">Performance Score</span>
                            <span className={cn(
                              "font-bold px-1.5 py-0.5 rounded",
                              supplier.score >= 90 ? "bg-green-100 text-green-700" :
                              supplier.score >= 70 ? "bg-blue-100 text-blue-700" :
                              "bg-amber-100 text-amber-700"
                            )}>
                              {supplier.score}
                            </span>
                          </div>
                        )}

                        {col.id === 'blacklist' && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                            <AlertTriangle className="w-3 h-3" />
                            永久拉黑 (Permanent Ban)
                          </div>
                        )}
                      </div>
                    );
                  })}
                
                {/* Empty State / Drop Area */}
                {col.count === 0 && (
                  <div className="h-24 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-400 text-sm">
                    No suppliers
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
