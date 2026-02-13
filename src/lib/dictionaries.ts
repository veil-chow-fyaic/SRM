// @ts-nocheck
/**
 * 数据字典配置
 *
 * 从 mockData.ts 迁移过来的字典常量
 */

export const DICTIONARIES = {
  intervals: [
    { id: 'monthly', label: '月结 (Monthly)' },
    { id: 'semi_monthly', label: '半月结 (Semi-monthly)' },
    { id: 'weekly', label: '周结 (Weekly)' },
    { id: 'per_shipment', label: '票结 (Per Shipment)' },
  ],
  anchors: [
    { id: 'etd', label: '开船日 (ETD)' },
    { id: 'eta', label: '到港日 (ETA)' },
    { id: 'gate_in', label: '入仓日 (Gate-in)' },
    { id: 'invoice_date', label: '账单日 (Invoice Date)' },
  ],
  tiers: [
    { id: 'strategic', level: 'Tier-1', label: '战略合作伙伴 (Strategic)', color: 'bg-purple-100 text-purple-700' },
    { id: 'core', level: 'Tier-2', label: '核心供应商 (Core)', color: 'bg-blue-100 text-blue-700' },
    { id: 'backup', level: 'Tier-3', label: '储备/备份 (Backup)', color: 'bg-slate-100 text-slate-700' },
    { id: 'probation', level: 'Tier-4', label: '考察期 (Probation)', color: 'bg-amber-100 text-amber-700' },
    { id: 'blacklisted', level: 'Tier-5', label: '黑名单/禁用 (Blacklisted)', color: 'bg-red-100 text-red-700' },
  ]
};
