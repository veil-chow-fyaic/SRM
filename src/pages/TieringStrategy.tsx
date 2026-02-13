import { 
  Crown, 
  ShieldCheck, 
  TrendingUp, 
  BarChart3,
  Award, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { cn } from '../lib/utils';

// Mock Data (Simulating Config from Settings + Live Data)
const tiers = [
  {
    id: 'strategic',
    level: 1,
    name: '战略合作伙伴 (Strategic)',
    desc: '深度绑定，共同分担风险与收益，享有最高优先级与资源倾斜。',
    color: 'bg-purple-600',
    lightColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-700',
    icon: Crown,
    count: 3,
    rights: [
      { label: '账期 (Payment)', value: 'T+60 Days (月结)' },
      { label: '舱位保障 (Allocation)', value: 'Tier 1 Priority (保舱保柜)' },
      { label: '返利政策 (Rebate)', value: '季度返利 2% (Quarterly)' },
      { label: '高层对接 (QBR)', value: 'CEO/VP 季度复盘' }
    ],
    criteria: '年合作金额 > $5M 且 绩效评分 > 90'
  },
  {
    id: 'core',
    level: 2,
    name: '核心供应商 (Core)',
    desc: '业务基本盘，提供稳定的服务与价格，标准化的合作模式。',
    color: 'bg-blue-600',
    lightColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    icon: ShieldCheck,
    count: 12,
    rights: [
      { label: '账期 (Payment)', value: 'T+45 Days (月结)' },
      { label: '舱位保障 (Allocation)', value: 'Tier 2 Standard (协议量)' },
      { label: '高层对接 (QBR)', value: '总监级 半年复盘' }
    ],
    criteria: '年合作金额 > $1M 且 绩效评分 > 80'
  },
  {
    id: 'backup',
    level: 3,
    name: '储备/备份 (Backup)',
    desc: '补充运力与特定航线资源，作为核心供应商的替补与竞价参照。',
    color: 'bg-slate-500',
    lightColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    textColor: 'text-slate-700',
    icon: TrendingUp,
    count: 45,
    rights: [
      { label: '账期 (Payment)', value: 'T+30 Days (月结)' },
      { label: '舱位保障 (Allocation)', value: 'Market (随行就市)' },
      { label: '高层对接 (QBR)', value: 'N/A (按需沟通)' }
    ],
    criteria: '已通过考察试单'
  }
];

export function TieringStrategy() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-slate-400" />
          分级策略与权益 (Tiering Strategy)
        </h1>
        <p className="text-slate-500 mt-1 ml-11">
          基于“二八定律”管理供应商资源，不同等级享有差异化的付款条件与合作权益。
          <span className="ml-2 text-xs text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full cursor-pointer hover:underline">
            Go to Settings to Configure
          </span>
        </p>
      </div>

      {/* Pyramid Visualization (Simplified as Stacked Cards for now) */}
      <div className="space-y-6">
        {tiers.map((tier) => (
          <div key={tier.id} className={cn("relative overflow-hidden rounded-xl border bg-white shadow-sm hover:shadow-md transition-all", tier.borderColor)}>
            {/* Left Border Strip */}
            <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", tier.color)} />

            <div className="p-6 flex flex-col md:flex-row gap-6">
              {/* Left: Identity */}
              <div className="md:w-1/4 flex-shrink-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", tier.lightColor)}>
                    <tier.icon className={cn("w-6 h-6", tier.textColor)} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{tier.name}</h3>
                    <span className="text-xs font-medium text-slate-500">Level {tier.level}</span>
                  </div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  {tier.desc}
                </p>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-900 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 w-fit">
                  <Award className="w-4 h-4 text-amber-500" />
                  当前数量: {tier.count} 家
                </div>
              </div>

              {/* Middle: Rights Grid */}
              <div className="flex-1 border-l border-slate-100 pl-6 border-dashed">
                <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-slate-400" />
                  核心权益 (Core Rights)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {tier.rights.map((right, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2.5 bg-slate-50 rounded border border-slate-100">
                      <span className="text-xs text-slate-500">{right.label}</span>
                      <span className="text-sm font-semibold text-slate-900">{right.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Criteria */}
              <div className="md:w-1/5 border-l border-slate-100 pl-6 border-dashed flex flex-col justify-center">
                <h4 className="text-sm font-bold text-slate-900 mb-2">晋升标准 (Criteria)</h4>
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 text-xs text-amber-800 leading-relaxed">
                  {tier.criteria}
                </div>
                <button className="mt-4 text-xs font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1">
                  View Suppliers <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Info */}
      <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 flex gap-4">
        <AlertCircle className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-slate-900">分级动态调整机制</h4>
          <p className="text-sm text-slate-600">
            系统每年 1 月和 7 月会自动发起“分级复盘”任务。对于连续两个季度绩效评分低于 60 分的核心供应商，系统将自动触发降级预警（Downgrade Alert）。
          </p>
        </div>
      </div>
    </div>
  );
}
