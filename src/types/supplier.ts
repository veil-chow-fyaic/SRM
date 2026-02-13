/**
 * 供应商类型定义
 *
 * 从 mockData.ts 迁移过来的类型定义
 */

export interface Supplier {
  id: string;
  name: string;
  code: string;
  tier: 'strategic' | 'core' | 'backup' | 'probation' | 'blacklisted';
  status: 'active' | 'inactive' | 'blacklisted';
  financial: {
    interval: string;
    anchor: string;
    period: number; // days
  };
  performanceConfig?: {
    dimensions: { id: string; name: string; weight: number }[];
    evaluationPeriod: 'monthly' | 'quarterly' | 'annual';
  };
  // Extended fields for Performance Appraisal
  systemScore?: number;
  address?: string;
  contactPhone?: string;
  website?: string;
  structure?: string;
  opsGuide?: {
    cutoffTime: string;
    bookingReq: string;
    prohibitions: string;
  };
  performanceHistory?: {
    date: string;
    score: number;
    period: string; // e.g., '2023-Q4'
    rater: string;
    comment?: string;
  }[];
  scarceResources?: string[];
  tags?: string[];
  portalAccess: {
    demandBroadcast: boolean;
    empowermentCenter: boolean;
    ticketSystem: boolean;
    performanceView: boolean;
  };
  businessLines?: {
    type: string; // e.g. '海运', '空运', '铁路', '卡车', '报关清关'
    description?: string; // Optional tagline
    carriers?: string[]; // e.g. ['Matson', 'COSCO']
    routes?: string[]; // e.g. ['North America', 'Europe']
    contact: {
      name: string;
      title?: string;
      phone?: string;
      email?: string;
    };
  }[];
}
