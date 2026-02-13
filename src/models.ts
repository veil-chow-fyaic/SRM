export interface SupplierSummary {
  id: string;
  name: string;
  localName: string;
  category: string;
  status: 'Strategic' | 'Core' | 'Backup' | 'Trial' | 'Blacklisted';
  location: string;
  totalSpend: string;
  performanceScore: number;
  tags: string[];
  logoText: string;
  // New fields for Potential Suppliers
  source?: string; // 来源渠道
  interactionFreq?: 'High' | 'Medium' | 'Low'; // 互动频率
  advantageLevel?: 'High' | 'Medium' | 'Low'; // 优势层级
  coreAdvantages?: string[]; // 具体优势
  potentialStage?: 'Uncontacted' | 'Contacted' | 'IntentConfirmed' | 'Negotiating' | 'Onboarding'; // 现有阶段
}
