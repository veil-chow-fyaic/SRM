// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Ban,
  ShieldAlert,
  TrendingUp,
  AlertOctagon,
  Lock,
  Calculator
} from 'lucide-react';
import { cn } from '../lib/utils';
import { DICTIONARIES } from '../lib/dictionaries';
import type { Supplier } from '../types/supplier';
import { useSuppliers, useUpdateSupplier } from '../hooks/useSuppliers';
import { createPerformanceEvaluation } from '../services';

// 数据转换函数：将数据库格式转换为 mock 数据格式
function transformDbSupplierToMock(dbSupplier: any): Supplier {
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
    performanceConfig: {
      dimensions: [
        { id: 'cost', name: '成本竞争力', weight: 40 },
        { id: 'quality', name: '服务质量', weight: 30 },
        { id: 'delivery', name: '交付时效', weight: 30 }
      ],
      evaluationPeriod: (dbSupplier.evaluation_period as any) || 'quarterly'
    },
    systemScore: dbSupplier.system_score || undefined,
    address: dbSupplier.address || undefined,
    contactPhone: dbSupplier.contact_phone || undefined,
    website: dbSupplier.website || undefined,
    structure: dbSupplier.structure || undefined,
    tags: dbSupplier.tags || undefined,
    scarceResources: dbSupplier.scarce_resources || undefined
  };
}

export function PerformanceAppraisal() {
  // 从后端加载供应商数据
  const { data: dbSuppliers = [], isLoading, error } = useSuppliers();
  const updateSupplierMutation = useUpdateSupplier();

  // 本地状态管理
  const [localSuppliers, setLocalSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  // 数据同步：当后端数据加载完成后转换格式
  React.useEffect(() => {
    if (dbSuppliers.length > 0) {
      const transformed = dbSuppliers.map(transformDbSupplierToMock);
      setLocalSuppliers(transformed);
    }
  }, [dbSuppliers]);
  
  // Modals State
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [showBlacklistModal, setShowBlacklistModal] = useState(false);
  
  // Form State for Assessment: Map dimension ID to score
  const [scores, setScores] = useState<Record<string, number>>({});
  const [comment, setComment] = useState('');

  const handleOpenAssessment = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setScores({});
    setComment('');
    setShowAssessmentModal(true);
  };

  const handleOpenBlacklist = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setShowBlacklistModal(true);
  };

  // Calculate Weighted Score
  const calculateTotalScore = () => {
    if (!selectedSupplier?.performanceConfig?.dimensions) return 0;
    
    let total = 0;
    selectedSupplier.performanceConfig.dimensions.forEach(dim => {
      const score = scores[dim.id] || 0;
      total += score * (dim.weight / 100);
    });
    return Math.round(total * 10) / 10; // Round to 1 decimal
  };

  const totalScore = calculateTotalScore();

  const handleSubmitAssessment = async () => {
    if (!selectedSupplier) return;

    try {
      // 1. 创建绩效历史记录
      await createPerformanceEvaluation({
        supplier_id: selectedSupplier.id,
        evaluation_date: new Date().toISOString().split('T')[0],
        score: totalScore,
        period: '2024 Q1', // Demo value，实际应该从 UI 获取
        rater_name: 'Current User',
        comment: comment || null
      });

      // 2. 更新供应商的 system_score
      await updateSupplierMutation.mutateAsync({
        id: selectedSupplier.id,
        updates: {
          system_score: totalScore
        }
      });

      // 3. 更新本地状态（乐观更新）
      setLocalSuppliers(prev => prev.map(s => {
        if (s.id === selectedSupplier.id) {
          return {
            ...s,
            systemScore: totalScore
          };
        }
        return s;
      }));

      setShowAssessmentModal(false);
      alert(`评估已提交！供应商 ${selectedSupplier.name} 综合得分: ${totalScore}`);
    } catch (error) {
      console.error('Failed to submit assessment:', error);
      alert('评估提交失败，请重试。');
    }
  };

  const isRedLineTriggered = totalScore < 60 && Object.keys(scores).length > 0;

  // Get tier label helper
  const getTierLabel = (tierId: string) => {
    return DICTIONARIES.tiers.find(t => t.id === tierId)?.label || tierId;
  };
  
  const getTierColor = (tierId: string) => {
    return DICTIONARIES.tiers.find(t => t.id === tierId)?.color || 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-brand-500" />
            绩效与优胜劣汰 (Performance & Exit)
          </h1>
          <p className="text-slate-500 mt-1">管理供应商生命周期流转，执行优胜劣汰机制。</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            筛选
          </button>
          <div className="relative">
             <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
             <input 
               type="text" 
               placeholder="搜索供应商..." 
               className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-brand-500"
             />
          </div>
        </div>
      </div>

      {/* 1. 试用期评估 (Probation Review) */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-bold text-slate-900">待转正评估 (Probation Review)</h2>
          <span className="px-2 py-0.5 bg-brand-100 text-brand-700 text-xs font-bold rounded-full">
            {localSuppliers.filter(s => s.tier === 'probation').length} Pending
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {localSuppliers.filter(s => s.tier === 'probation').map(supplier => (
            <div key={supplier.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-slate-900">{supplier.name}</h3>
                  <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs rounded border border-amber-100">
                    {getTierLabel(supplier.tier)}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    系统评分: <span className="font-mono font-medium text-slate-700">{supplier.systemScore || 0}</span>
                  </span>
                  <span>|</span>
                  <span>评估周期: {supplier.performanceConfig?.evaluationPeriod || 'N/A'}</span>
                </div>
              </div>
              <button 
                onClick={() => handleOpenAssessment(supplier)}
                className="px-4 py-2 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 shadow-sm"
              >
                发起评估
              </button>
            </div>
          ))}
          
          {localSuppliers.filter(s => s.tier === 'probation').length === 0 && (
            <div className="col-span-2 p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500">
              暂无待转正供应商
            </div>
          )}
        </div>
      </section>

      {/* 2. 绩效预警与黑名单 (Watchlist & Blacklist) */}
      <section className="pt-4 border-t border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-bold text-slate-900">绩效概览 (Performance Overview)</h2>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">供应商名称</th>
                <th className="px-6 py-3">当前等级</th>
                <th className="px-6 py-3">系统评分 (System)</th>
                <th className="px-6 py-3">持有稀缺资源</th>
                <th className="px-6 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {localSuppliers.map(supplier => (
                <tr key={supplier.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-medium text-slate-900">{supplier.name}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs",
                      getTierColor(supplier.tier)
                    )}>
                      {getTierLabel(supplier.tier)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full rounded-full", (supplier.systemScore || 0) < 60 ? "bg-red-500" : "bg-emerald-500")} 
                          style={{ width: `${supplier.systemScore || 0}%` }}
                        />
                      </div>
                      <span className={cn("font-mono", (supplier.systemScore || 0) < 60 ? "text-red-600 font-bold" : "text-slate-600")}>
                        {supplier.systemScore || 0}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {supplier.scarceResources && supplier.scarceResources.length > 0 ? (
                      <div className="flex gap-1 flex-wrap">
                        {supplier.scarceResources.map(r => (
                          <span key={r} className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded text-xs flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            {r}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleOpenBlacklist(supplier)}
                      className="text-slate-400 hover:text-red-600 flex items-center gap-1 ml-auto transition-colors"
                    >
                      <Ban className="w-4 h-4" />
                      拉黑
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* --- Modals --- */}

      {/* 1. Assessment Modal - Dynamic based on Configuration */}
      {showAssessmentModal && selectedSupplier && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center flex-shrink-0">
              <div>
                <h3 className="text-xl font-bold text-slate-900">绩效评估 (Performance Appraisal)</h3>
                <p className="text-sm text-slate-500 mt-1">
                  正在评估: <span className="font-bold text-slate-700">{selectedSupplier.name}</span>
                </p>
              </div>
              <button onClick={() => setShowAssessmentModal(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {/* Dynamic Dimension Inputs */}
              <div className="space-y-6">
                {!selectedSupplier.performanceConfig?.dimensions?.length ? (
                   <div className="p-4 bg-slate-50 text-slate-500 text-center rounded-lg">
                     该供应商未配置绩效维度，请先在设置中配置。
                   </div>
                ) : (
                  selectedSupplier.performanceConfig.dimensions.map(dim => (
                    <div key={dim.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          {dim.name}
                          <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-xs rounded-full">
                            权重: {dim.weight}%
                          </span>
                        </label>
                        <div className="flex items-center gap-2">
                          <input 
                            type="number" 
                            min="0" 
                            max="100"
                            placeholder="0"
                            value={scores[dim.id] || ''}
                            onChange={e => setScores({...scores, [dim.id]: parseFloat(e.target.value)})}
                            className="w-20 text-right p-1 border border-slate-300 rounded focus:border-brand-500 outline-none font-mono font-bold"
                          />
                          <span className="text-slate-500 text-sm">分</span>
                        </div>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={scores[dim.id] || 0}
                        onChange={e => setScores({...scores, [dim.id]: parseFloat(e.target.value)})}
                        className="w-full accent-brand-500 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  ))
                )}
              </div>

              {/* Total Score Calculation */}
              <div className="mt-6 p-4 bg-brand-50 rounded-xl border border-brand-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm text-brand-700 font-medium">当前综合得分</div>
                    <div className="text-xs text-brand-500">基于权重自动计算</div>
                  </div>
                </div>
                <div className="text-3xl font-bold text-brand-700 font-mono">
                  {totalScore} <span className="text-lg font-normal opacity-70">/ 100</span>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  评估备注 (Comments)
                </label>
                <textarea 
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-lg focus:border-brand-500 outline-none h-24 resize-none"
                  placeholder="请输入具体的评估理由或改进建议..."
                />
              </div>

              {isRedLineTriggered && (
                <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-start gap-2 text-sm border border-red-100">
                  <AlertOctagon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">触发红线预警：</span>
                    综合得分低于60分，系统将自动建议终止合作或延长考察期。
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-xl flex-shrink-0">
              <button 
                onClick={() => setShowAssessmentModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg"
              >
                取消
              </button>
              <button 
                disabled={!selectedSupplier.performanceConfig?.dimensions?.length}
                onClick={handleSubmitAssessment}
                className="px-6 py-2 bg-brand-500 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium rounded-lg hover:bg-brand-600 shadow-sm flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                提交评估结果
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Blacklist Circuit Breaker Modal */}
      {showBlacklistModal && selectedSupplier && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200 border-t-4 border-red-500">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">确认拉黑该供应商？</h3>
              <p className="text-slate-600 mb-6">
                您正在尝试将 <span className="font-bold text-slate-900">{selectedSupplier.name}</span> 加入黑名单。此操作将冻结所有正在进行的交易。
              </p>

              {/* Circuit Breaker Logic */}
              {selectedSupplier.scarceResources && selectedSupplier.scarceResources.length > 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left mb-6">
                  <h4 className="font-bold text-amber-800 flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5" />
                    触发熔断保护 (Circuit Breaker)
                  </h4>
                  <p className="text-sm text-amber-700 mb-3">
                    检测到该供应商持有以下 <span className="font-bold">稀缺资源</span>，强制拉黑可能导致业务瘫痪：
                  </p>
                  <ul className="list-disc list-inside text-sm text-amber-800 font-medium space-y-1">
                    {selectedSupplier.scarceResources.map(r => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                  <div className="mt-4 pt-3 border-t border-amber-200">
                    <label className="flex items-start gap-3">
                      <input type="checkbox" className="mt-1 w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300 rounded" />
                      <span className="text-xs text-amber-800">
                        我已确认已有替代方案，并获得总经理 (GM) 书面批准。
                      </span>
                    </label>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-sm text-slate-500 mb-6">
                  <CheckCircle2 className="w-4 h-4 inline-block mr-1 text-emerald-500" />
                  系统检测：该供应商无关键稀缺资源绑定，可安全移除。
                </div>
              )}

              <div className="flex gap-3 justify-center">
                <button 
                  onClick={() => setShowBlacklistModal(false)}
                  className="px-6 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
                >
                  取消
                </button>
                <button 
                  className={cn(
                    "px-6 py-2 text-white font-bold rounded-lg shadow-sm flex items-center gap-2",
                    selectedSupplier.scarceResources && selectedSupplier.scarceResources.length > 0 
                      ? "bg-red-600 hover:bg-red-700" 
                      : "bg-slate-900 hover:bg-slate-800"
                  )}
                >
                  <Ban className="w-4 h-4" />
                  {selectedSupplier.scarceResources && selectedSupplier.scarceResources.length > 0 ? '强制拉黑' : '确认拉黑'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
