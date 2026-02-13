// @ts-nocheck
import React, { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Globe,
  Phone,
  Mail,
  Tag,
  TrendingUp,
  ShieldCheck,
  History,
  UserCheck,
  Briefcase,
  Network,
  Settings,
  CheckCircle2,
  ArrowRight,
  FileText,
  CreditCard,
  Lightbulb,
  BarChart2,
  Calendar,
  Users,
  Crown,
  AlertCircle,
  Share2,
  Upload,
  Check,
  X,
  FilePlus,
  PenTool,
  Landmark,
  ClipboardList,
  Target,
  Trash2,
  Plus,
  Ship,
  Plane,
  Truck,
  Train,
  FileCheck,
  Star,
  Database,
  File,
  Download,
  Loader2,
  Edit3
} from 'lucide-react';
import { cn } from '../lib/utils';
// API Hooks - 必须在组件外部导入
import { useSupplierDetail, useUpdateSupplier } from '../hooks/useSuppliers';
import { useDecisionChain } from '../hooks/useDecisionChain';
import { useEngagementLogs, useCreateEngagementLog, useUpdateEngagementLog } from '../hooks/useEngagementLogs';
import { useCreateDecisionChainMember, useUpdateDecisionChainMember, useAddDecisionChainResource } from '../hooks/useDecisionChain';
import { useCreateBusinessLine, useUpdateBusinessLine, useDeleteBusinessLine } from '../hooks/useBusinessLines';
import { useSupplierFiles, useUploadFile, useDeleteFile, useFileDownloadUrl } from '../hooks/useFiles';
import { useUpdateSupplierWithLog, useSupplierChangeLogs } from '../hooks/useSupplierChangeLogs';
import { FileUploadDialog } from '../components/FileUploadDialog';
import { SupplierEditModal } from '../components/SupplierEditModal';
import { DICTIONARIES } from '../lib/dictionaries';
import type { Supplier } from '../types/supplier';
import type { SupplierFile } from '../services/files';
import type { SupplierUpdate, ChangeType } from '../types/database';

// --- UI Components for this page ---
const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("bg-white border border-slate-200 rounded-xl shadow-sm", className)}>
    {children}
  </div>
);

const Badge = ({ children, variant = 'default', className }: { children: React.ReactNode; variant?: 'default' | 'outline' | 'brand' | 'success' | 'warning' | 'purple'; className?: string }) => {
  const styles = {
    default: "bg-slate-100 text-slate-700",
    outline: "border border-slate-200 text-slate-600",
    brand: "bg-brand-50 text-brand-700 border border-brand-100",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    warning: "bg-amber-50 text-amber-700 border border-amber-100",
    purple: "bg-purple-50 text-purple-700 border border-purple-100",
  };
  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium", styles[variant], className)}>
      {children}
    </span>
  );
};

  // --- Mock Data Helpers ---
  const MATSON_DECISION_CHAIN = [
    { 
      id: 1, 
      name: "Jason Li", 
      title: "Ocean Dept. Manager", 
      layer: "Decision", 
      role: "Decision Maker", 
      affinity: 3, 
      phone: "+86 139 1111 2222",
      email: "jason.li@matson.com",
      tags: ["看重长期规划", "高尔夫爱好者"],
      conquestRecord: "2023 Q4 拜访达成年度框架意向",
      resources: [
        { id: 'res-1', name: '上海物流协会 (Shanghai Logistics Assn)', type: 'Association', desc: 'Jason 是该协会常务理事，享有优先审批权' },
        { id: 'res-2', name: '张总 (行业协会副会长)', type: 'Person', desc: '大学同学，可引荐上港高层' }
      ]
    },
    { 
      id: 2, 
      name: "Alice Wang", 
      title: "Customs Supervisor", 
      layer: "Execution",
      role: "Influencer", 
      affinity: 5, 
      phone: "+86 138 3333 4444",
      email: "alice.wang@matson.com",
      tags: ["极度专业", "讨厌迟到", "痛恨半夜打电话"],
      resources: [
        { id: 'res-3', name: 'XX 贸易公司', type: 'Company', desc: '家族关联企业，可作为备用资金渠道' },
        { id: 'res-4', name: '李处 (监管机构)', type: 'Official', desc: '前同事，负责审批航线资质' }
      ]
    },
    { 
      id: 3, 
      name: "Mike Wang", 
      title: "Booking Manager", 
      layer: "Operation",
      role: "Executor", 
      affinity: 4, 
      phone: "+86 137 0000 3333",
      email: "mike.wang@supplier.com",
      tags: ["响应快", "喜欢喝咖啡"],
      resources: []
    },
    { 
      id: 4, 
      name: "Sarah Lee", 
      title: "Logistics Specialist", 
      layer: "Operation",
      role: "Executor", 
      affinity: 3, 
      phone: "+86 136 0000 4444",
      email: "sarah.lee@supplier.com",
      tags: ["细心", "熟悉单证"],
      resources: []
    },
    { 
      id: 5, 
      name: "David Zhang", 
      title: "Customer Service", 
      layer: "Operation",
      role: "Executor", 
      affinity: 2, 
      phone: "+86 135 0000 5555",
      email: "david.zhang@supplier.com",
      tags: ["新手", "态度好"],
      resources: []
    },
    { 
      id: 6, 
      name: "Tom Wu", 
      title: "Ops Supervisor", 
      layer: "Execution",
      role: "Influencer", 
      affinity: 4, 
      phone: "+86 134 0000 6666",
      email: "tom.wu@supplier.com",
      tags: ["经验丰富", "解决问题能力强"],
      resources: []
    }
  ];

  const COSCO_DECISION_CHAIN = [
    {
      id: 1,
      name: "Li Qiang",
      title: "Sales Director",
      layer: "Decision",
      role: "Decision Maker",
      affinity: 3,
      phone: "+86 139 1234 5678",
      email: "li.qiang@cosco.com",
      tags: ["务实", "注重数据"],
      conquestRecord: "",
      resources: []
    },
    {
      id: 2,
      name: "Wang Fang",
      title: "Ops Manager",
      layer: "Execution",
      role: "Influencer",
      affinity: 4,
      phone: "+86 138 8765 4321",
      email: "wang.fang@cosco.com",
      tags: ["高效", "直接"],
      resources: []
    }
  ];
  
  const initialEngagementLogs = [
    {
      id: 1,
      status: 'completed',
      type: 'QBR',
      date: '2024-02-01',
      title: 'Q1 季度业务回顾会议',
      author: 'Tommy',
      participants: 'Tommy, Jason Li, Alice Wang',
      outcome: '锁定 Q2 舱位增量',
      rating: 5,
      nextSteps: '跟进 Q2 合同签署',
      tags: ['车队外包'],
      dimensions: {
        basic: '核对了最新的营业执照有效期，已更新至系统。',
        business: '回顾了 Q1 的货量表现，对方承诺在 Q2 旺季给予额外 20% 的舱位支持。',
        decision: '',
        derivative: ''
      }
    },
    {
      id: 2,
      status: 'completed',
      type: 'Regular',
      date: '2024-01-15',
      title: 'Jason Li 私人午宴',
      author: 'Sarah',
      participants: 'Sarah, Jason Li',
      outcome: '获取越南航线内幕信息',
      rating: 4,
      nextSteps: '调研越南市场',
      tags: ['高层公关'],
      dimensions: {
        basic: '',
        business: '了解了对方集团最新的战略方向，Jason 提到可能会在越南增加新航线。',
        decision: '',
        derivative: 'Jason 引荐了他的大学同学（行业协会副会长）。'
      }
    }
  ];
  
  
  
  const tiersConfig = [
  {
    id: 'strategic',
    level: 1,
    name: '战略合作伙伴 (Strategic)',
    desc: '深度绑定，共同分担风险与收益，享有最高优先级与资源倾斜。',
    color: 'bg-purple-600',
    lightColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-700',
    ringColor: 'ring-purple-500',
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
    ringColor: 'ring-blue-500',
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
    ringColor: 'ring-slate-500',
    icon: TrendingUp,
    count: 45,
    rights: [
      { label: '账期 (Payment)', value: 'T+30 Days (月结)' },
      { label: '舱位保障 (Allocation)', value: 'Market (随行就市)' },
      { label: '高层对接 (QBR)', value: 'N/A (按需沟通)' }
    ],
    criteria: '已通过考察试单'
  },
  {
    id: 'probation',
    level: 4,
    name: '考察期 (Probation)',
    desc: '新引入或待观察供应商，合作受限，需密切监控。',
    color: 'bg-amber-500',
    lightColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-700',
    ringColor: 'ring-amber-500',
    icon: AlertCircle,
    count: 8,
    rights: [
      { label: '账期 (Payment)', value: 'Prepaid (预付/现结)' },
      { label: '舱位保障 (Allocation)', value: 'No Guarantee' },
      { label: '高层对接 (QBR)', value: 'N/A' }
    ],
    criteria: '新注册或绩效不达标'
  }
];

export function SupplierDetail() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as 'asset' | 'contract' | 'engagement' | 'performance') || 'asset';

  // === API Data Hooks (必须在所有 useState 之前调用) ===
  const { data: supplierDetail, isLoading: isDetailLoading, error: detailError } = useSupplierDetail(id || '');
  const { data: decisionChainData = [] } = useDecisionChain(id || '');
  const { data: engagementLogsData = [] } = useEngagementLogs(id || '');
  const { data: files = [], isLoading: isFilesLoading, error: filesError } = useSupplierFiles(id || '');
  const updateSupplierMutation = useUpdateSupplier();

  // === API Mutation Hooks ===
  const createEngagementLogMutation = useCreateEngagementLog();
  const updateEngagementLogMutation = useUpdateEngagementLog();
  const createDecisionChainMemberMutation = useCreateDecisionChainMember();
  const updateDecisionChainMemberMutation = useUpdateDecisionChainMember();
  const addDecisionChainResourceMutation = useAddDecisionChainResource();
  const createBusinessLineMutation = useCreateBusinessLine();
  const updateBusinessLineMutation = useUpdateBusinessLine();
  const deleteBusinessLineMutation = useDeleteBusinessLine();
  const uploadFileMutation = useUploadFile();
  const deleteFileMutation = useDeleteFile();
  const getFileUrlMutation = useFileDownloadUrl();

  // === 所有 useState 必须在条件返回之前调用 ===
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [isAddPersonOpen, setIsAddPersonOpen] = useState(false);
  const [editingResourcePersonId, setEditingResourcePersonId] = useState<number | null>(null);

  // --- Unified PACD Log Modal State ---
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [logModalMode, setLogModalMode] = useState<'plan' | 'log' | 'edit'>('plan');

  // --- 信息维护模态框状态 ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // --- 获取修改记录 ---
  const { data: changeLogs } = useSupplierChangeLogs(id || '', 10);

  const [logForm, setLogForm] = useState({
    id: 0,
    status: 'planned' as 'planned' | 'completed',
    // P - Plan
    date: '',
    type: 'Regular',
    title: '', // Subject/Title
    goal: '', // Purpose/Goal (SMART)
    participants: '',
    // C - Check
    rating: 0,
    outcome: '', // Main Outcome/Insights
    tags: '',
    dimensions: {
      basic: '',
      business: '',
      decision: '',
      derivative: ''
    },
    // D - Delivery
    nextSteps: '',
    actionRemarks: ''
  });

  // 从 API 数据初始化的状态（使用空数组作为初始值，通过 useEffect 更新）
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [people, setPeople] = useState<any[]>([]);
  const [engagementLogs, setEngagementLogs] = useState<any[]>([]);

  // Temp State for Modal Editing
  const [tempSupplier, setTempSupplier] = useState<Supplier | null>(null);
  const [tempPeople, setTempPeople] = useState<any[]>([]);
  const [activeModalTab, setActiveModalTab] = useState<'basic' | 'business' | 'decision' | 'derivative'>('basic');

  // --- Temp Add Logic ---
  const [isAddingTempPerson, setIsAddingTempPerson] = useState(false);
  const [isAddingTempResource, setIsAddingTempResource] = useState(false);
  const [tempResourceOwnerId, setTempResourceOwnerId] = useState<number | string>('');

  // File Modal State
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [isFileUploadDialogOpen, setIsFileUploadDialogOpen] = useState(false);

  // --- New Business Logic ---
  const [newBusiness, setNewBusiness] = useState({
    type: '海运 (Ocean)',
    description: '',
    routes: [] as string[],
    carriers: [] as string[]
  });

  const [newPerson, setNewPerson] = useState({
    name: '',
    title: '',
    layer: 'Influencer',
    phone: '',
    email: ''
  });

  const [newResource, setNewResource] = useState({
    ownerId: '',
    name: '',
    type: 'Person',
    desc: ''
  });

  // === 使用 useEffect 在数据加载后更新状态 ===
  React.useEffect(() => {
    if (supplierDetail?.supplier) {
      const apiSupplier = supplierDetail.supplier;
      const apiBusinessLines = supplierDetail.business_lines || [];
      const apiDecisionChain = supplierDetail.decision_chain || [];
      const apiEngagementLogs = supplierDetail.engagement_logs || [];
      const apiPerformanceHistory = supplierDetail.performance_history || [];

      // 设置供应商数据
      const blankSupplier: Supplier = {
        id: id || 'new',
        name: 'New Supplier',
        code: 'V-NEW-XX',
        tier: 'probation',
        status: 'active',
        address: '',
        contactPhone: '',
        website: '',
        structure: '',
        financial: { interval: 'monthly', anchor: 'invoice_date', period: 30 },
        systemScore: 0,
        tags: [] as string[],
        businessLines: [] as any[],
        portalAccess: { demandBroadcast: false, empowermentCenter: false, ticketSystem: false, performanceView: false }
      };

      const initialSupplier: Supplier = {
        ...blankSupplier,
        id: apiSupplier.id,
        name: apiSupplier.name || '',
        code: apiSupplier.code || '',
        tier: (apiSupplier.tier as any) || 'probation',
        status: (apiSupplier.status as any) || 'active',
        address: apiSupplier.address || '',
        contactPhone: apiSupplier.contact_phone || '',
        website: apiSupplier.website || '',
        structure: apiSupplier.structure || '',
        financial: {
          interval: (apiSupplier.financial_interval as any) || 'monthly',
          anchor: (apiSupplier.financial_anchor as any) || 'invoice_date',
          period: apiSupplier.financial_period || 30
        },
        systemScore: apiSupplier.system_score || 0,
        tags: apiSupplier.tags || [],
        businessLines: (apiBusinessLines || []).filter(bl => bl != null).map(bl => ({
          type: bl.line?.type || '',
          description: bl.line?.description || '',
          carriers: bl.line?.carriers || [],
          routes: bl.line?.routes || [],
          contact: bl.contacts?.[0] || null
        })),
        portalAccess: {
          demandBroadcast: apiSupplier.portal_demand_broadcast || false,
          empowermentCenter: apiSupplier.portal_empowerment_center || false,
          ticketSystem: apiSupplier.portal_ticket_system || false,
          performanceView: apiSupplier.portal_performance_view || false
        },
        performanceHistory: (apiPerformanceHistory || []).filter(ph => ph != null).map(ph => ({
          id: ph.id,
          date: ph.evaluation_date || '',
          period: ph.period || '',
          score: ph.score || 0,
          evaluator: ph.rater_name || '',
          notes: ph.comment || ''
        }))
      };

      setSupplier(initialSupplier);

      // 设置决策链数据
      setPeople((apiDecisionChain || []).filter(dc => dc != null).map(dc => ({
        id: dc.member?.id || Date.now(),
        name: dc.member?.name || '',
        title: dc.member?.title || '',
        layer: (dc.member?.layer as any) || 'Influencer',
        role: (dc.member?.role as any) || 'Influencer',
        affinity: dc.member?.affinity || 3,
        phone: dc.member?.phone || '',
        email: dc.member?.email || '',
        tags: dc.member?.tags || [],
        conquestRecord: dc.member?.conquest_record || '',
        resources: dc.resources || []
      })));

      // 设置互动日志数据
      setEngagementLogs((apiEngagementLogs || []).filter(log => log != null).map(log => ({
        id: log.id,
        status: (log.status as any) || 'completed',
        date: log.planned_date || '',
        type: log.log_type || 'Regular',
        title: log.title || '',
        goal: log.goal || '',
        participants: log.participants || '',
        rating: log.rating || 0,
        outcome: log.outcome || '',
        tags: log.tags || [],
        dimensions: {
          basic: log.dimension_basic || '',
          business: log.dimension_business || '',
          decision: log.dimension_decision || '',
          derivative: log.dimension_derivative || ''
        },
        nextSteps: log.next_steps || '',
        actionRemarks: log.action_remarks || ''
      })));
    }
  }, [supplierDetail, id]);

  // --- Deep Linking Logic ---
  React.useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'score_modal') {
      setIsScoreModalOpen(true);
    } else if (action === 'log_modal') {
      setIsLogModalOpen(true);
      setLogModalMode('plan');
    }
  }, [searchParams]);

  // === 处理 tempSupplier 的同步更新 ===
  React.useEffect(() => {
    if (supplier) {
      setTempSupplier(supplier);
      setTempPeople(people);
    }
  }, [supplier, people]);

  // === 早期返回：如果 supplier 为 null，显示加载状态 ===
  // 这可以防止在数据加载前访问 null 对象的属性
  if (!supplier) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          <span className="ml-3 text-slate-600">加载供应商详情...</span>
        </div>
      </div>
    );
  }

  // === 加载和错误状态处理（放在所有 Hooks 之后）===
  if (isDetailLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          <span className="ml-3 text-slate-600">加载供应商详情...</span>
        </div>
      </div>
    );
  }

  if (detailError) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-4">
          <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-red-900">加载失败</h3>
            <p className="text-sm text-red-700 mt-1">
              {detailError?.message || '无法加载供应商详情'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 检查数据是否存在
  if (!supplierDetail?.supplier) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <p className="text-amber-700">供应商详情数据为空或未找到该供应商</p>
        </div>
      </div>
    );
  }

  // 检查 supplier 状态是否已初始化（useEffect 可能还未执行）
  if (!supplier) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          <span className="ml-3 text-slate-600">正在初始化数据...</span>
        </div>
      </div>
    );
  }

  // --- Handlers ---

  const handleOpenPlan = () => {
    setLogModalMode('plan');
    setTempSupplier(JSON.parse(JSON.stringify(supplier)));
    setTempPeople(JSON.parse(JSON.stringify(people)));
    setIsAddingTempPerson(false);
    setIsAddingTempResource(false);
    setTempResourceOwnerId('');
    setLogForm({
      id: 0,
      status: 'planned',
      date: new Date().toISOString().split('T')[0],
      type: 'Regular',
      title: '',
      goal: '',
      participants: '',
      rating: 0,
      outcome: '',
      tags: '',
      dimensions: { basic: '', business: '', decision: '', derivative: '' },
      nextSteps: '',
      actionRemarks: ''
    });
    setIsLogModalOpen(true);
  };

  // --- 信息维护保存处理 ---
  const updateSupplierWithLogMutation = useUpdateSupplierWithLog();

  const handleSaveSupplierEdit = async (
    updates: SupplierUpdate,
    changeType: ChangeType,
    changeTitle: string,
    changeDescription: string
  ) => {
    if (!id) return;

    setIsSavingEdit(true);
    try {
      const result = await updateSupplierWithLogMutation.mutateAsync({
        supplierId: id,
        updates,
        changeType,
        changeTitle,
        changeDescription,
        authorName: '系统用户' // 可以从 AuthContext 获取真实用户名
      });

      if (result.success) {
        // 刷新供应商数据
        refetchSupplier();
        alert('供应商信息已更新');
      } else {
        alert('更新失败: ' + (result.error || '未知错误'));
      }
    } catch (error) {
      console.error('保存供应商信息失败:', error);
      alert('保存失败，请重试');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleEditLog = (log: any) => {
    setLogModalMode('edit');
    setTempSupplier(JSON.parse(JSON.stringify(supplier)));
    setTempPeople(JSON.parse(JSON.stringify(people)));
    setIsAddingTempPerson(false);
    setIsAddingTempResource(false);
    setTempResourceOwnerId('');
    setLogForm({
      id: log.id,
      status: log.status || 'completed',
      date: log.date,
      type: log.type || 'Regular',
      title: log.title,
      goal: log.goal || '',
      participants: log.participants || '',
      rating: log.rating || 0,
      outcome: log.outcome || '',
      tags: log.tags ? log.tags.join(', ') : '',
      dimensions: {
        basic: log.dimensions?.basic || '',
        business: log.dimensions?.business || '',
        decision: log.dimensions?.decision || '',
        derivative: log.dimensions?.derivative || ''
      },
      nextSteps: log.nextSteps || '',
      actionRemarks: log.actionRemarks || ''
    });
    setIsLogModalOpen(true);
  };

  const handleSaveLog = async () => {
    if (!logForm.title || !logForm.date) return;

    // 检查 tempSupplier 是否已初始化
    if (!tempSupplier) {
      alert('数据未加载完成，请稍后重试');
      return;
    }

    // --- Diff Calculation Start ---
    const diffs = {
      basic: [] as string[],
      business: [] as string[],
      decision: [] as string[],
      derivative: [] as string[]
    };

    // 1. Basic Info Diff
    if (supplier?.address !== tempSupplier.address) diffs.basic.push(`地址: ${supplier?.address} -> ${tempSupplier.address}`);
    if (supplier?.tier !== tempSupplier.tier) diffs.basic.push(`等级: ${supplier?.tier} -> ${tempSupplier.tier}`);
    if (JSON.stringify(supplier?.financial) !== JSON.stringify(tempSupplier.financial)) diffs.basic.push('财务账期条款已变更');
    if (supplier?.structure !== tempSupplier.structure) diffs.basic.push('企业结构描述已更新');
    
    // Compare Tags
    const oldTags = supplier.tags || [];
    const newTags = tempSupplier.tags || [];
    const addedTags = newTags.filter(t => !oldTags.includes(t));
    const removedTags = oldTags.filter(t => !newTags.includes(t));
    if (addedTags.length) diffs.basic.push(`新增标签: ${addedTags.join(', ')}`);
    if (removedTags.length) diffs.basic.push(`移除标签: ${removedTags.join(', ')}`);

    // 2. Business Info Diff
    if (tempSupplier.businessLines) {
        tempSupplier.businessLines.forEach((biz, idx) => {
            const oldBiz = supplier.businessLines?.[idx];
            if (!oldBiz) {
                diffs.business.push(`新增业务: ${biz.type}`);
                return;
            }
            
            if (biz.description !== oldBiz.description) diffs.business.push(`${biz.type}: 描述更新`);
            if (JSON.stringify(biz.routes) !== JSON.stringify(oldBiz.routes)) diffs.business.push(`${biz.type}: 覆盖区域变更`);
            if (JSON.stringify(biz.carriers) !== JSON.stringify(oldBiz.carriers)) diffs.business.push(`${biz.type}: 合作资源变更`);
        });
    }

    // 3. Decision Chain Diff (People)
    tempPeople.forEach(p => {
      const oldP = people.find(op => op.id === p.id);
      if (!oldP) {
        diffs.decision.push(`新增关键人: ${p.name || '未命名'} (${p.title || '无职位'})`);
      } else {
        if (oldP.affinity !== p.affinity) diffs.decision.push(`${p.name || '未命名'} 亲密度: ${oldP.affinity} -> ${p.affinity}`);
        if (oldP.role !== p.role) diffs.decision.push(`${p.name || '未命名'} 角色: ${oldP.role} -> ${p.role}`);
        if (oldP.layer !== p.layer) diffs.decision.push(`${p.name || '未命名'} 层级: ${oldP.layer} -> ${p.layer}`);
        if (oldP.title !== p.title) diffs.decision.push(`${p.name || '未命名'} 职位: ${oldP.title || '无职位'} -> ${p.title || '无职位'}`);
        if (oldP.phone !== p.phone || oldP.email !== p.email) diffs.decision.push(`${p.name || '未命名'} 联系方式更新`);
      }
    });

    // 4. Derivative Resources Diff
    tempPeople.forEach(p => {
        const oldP = people.find(op => op.id === p.id);
        if (oldP) {
             p.resources?.forEach(r => {
                 const oldR = oldP.resources?.find(or => or.id === r.id);
                 if (!oldR) diffs.derivative.push(`[${p.name || '未命名'}] 新增资源: ${r.name || '未命名'}`);
                 else if (oldR.desc !== r.desc) diffs.derivative.push(`[${p.name || '未命名'}] 资源更新: ${r.name || '未命名'}`);
             });
        } else {
             // New person, all resources are new
             p.resources?.forEach(r => {
                 diffs.derivative.push(`[${p.name || '未命名'}] 新增资源: ${r.name || '未命名'}`);
             });
        }
    });

    // Construct Dimensions Object
    const autoDimensions = {
        basic: diffs.basic.join('; ') || (logModalMode === 'edit' ? logForm.dimensions.basic : ''),
        business: diffs.business.join('; ') || (logModalMode === 'edit' ? logForm.dimensions.business : ''),
        decision: diffs.decision.join('; ') || (logModalMode === 'edit' ? logForm.dimensions.decision : ''),
        derivative: diffs.derivative.join('; ') || (logModalMode === 'edit' ? logForm.dimensions.derivative : '')
    };

    const tagsArray = logForm.tags 
      ? logForm.tags.split(/[,，]/).map(t => t.trim()).filter(Boolean) 
      : [];

    const newEntry = {
      id: logForm.id || (engagementLogs.length > 0 ? Math.max(...engagementLogs.map(l => l.id)) + 1 : 1),
      status: logModalMode === 'plan' ? 'planned' : 'completed',
      date: logForm.date,
      type: logForm.type,
      title: logForm.title,
      goal: logForm.goal,
      author: 'Tommy', // Mock user
      participants: logForm.participants,
      outcome: logForm.outcome || (logModalMode === 'plan' ? '待执行 (Planned)' : ''),
      rating: logForm.rating,
      nextSteps: logForm.nextSteps,
      actionRemarks: logForm.actionRemarks,
      tags: tagsArray.length > 0 ? tagsArray : (logModalMode === 'plan' ? ['计划拜访'] : []),
      dimensions: autoDimensions
    };

    // === 调用后端 API ===
    // 准备后端 API 数据结构
    const apiLogData = {
      supplier_id: id || '',
      status: logModalMode === 'plan' ? 'planned' : 'completed',
      log_type: logForm.type,
      planned_date: logForm.date,
      title: logForm.title,
      goal: logForm.goal || null,
      participants: logForm.participants || null,
      rating: logForm.rating || null,
      outcome: logForm.outcome || (logModalMode === 'plan' ? '待执行 (Planned)' : null),
      dimension_basic: autoDimensions.basic || null,
      dimension_business: autoDimensions.business || null,
      dimension_decision: autoDimensions.decision || null,
      dimension_derivative: autoDimensions.derivative || null,
      next_steps: logForm.nextSteps || null,
      action_remarks: logForm.actionRemarks || null,
      tags: tagsArray.length > 0 ? tagsArray : (logModalMode === 'plan' ? ['计划拜访'] : []),
      author_name: 'Tommy'
    };

    try {
      if (logModalMode === 'edit') {
        // 编辑模式 - 调用更新 API
        await updateEngagementLogMutation.mutateAsync({
          id: logForm.id.toString(),
          updates: apiLogData
        });
      } else {
        // 新建模式 - 调用创建 API
        await createEngagementLogMutation.mutateAsync(apiLogData);
      }
    } catch (error) {
      console.error('保存互动日志失败:', error);
      alert('保存失败，请重试');
      return;
    }

    if (logModalMode === 'edit') {
      // @ts-ignore
      setEngagementLogs(engagementLogs.map(log => log.id === logForm.id ? newEntry : log));
    } else {
      // @ts-ignore
      setEngagementLogs([newEntry, ...engagementLogs]);
    }

    // Commit Changes to Enterprise Archive
    // === 保存决策链成员变更到后端 ===
    try {
      // 1. 查找新增的决策链成员
      const newPeople = tempPeople.filter(tp => !people.find(p => p.id === tp.id));
      for (const newPerson of newPeople) {
        await createDecisionChainMemberMutation.mutateAsync({
          supplier_id: id || '',
          name: newPerson.name,
          title: newPerson.title || null,
          layer: newPerson.layer,
          role: newPerson.role || 'Influencer',
          affinity: newPerson.affinity || 3,
          phone: newPerson.phone || null,
          email: newPerson.email || null,
          tags: newPerson.tags || [],
          conquest_record: newPerson.conquestRecord || null
        });
      }

      // 2. 查找需要更新的决策链成员
      const updatedPeople = tempPeople.filter(tp => people.find(p => p.id === tp.id));
      for (const updatedPerson of updatedPeople) {
        const oldPerson = people.find(p => p.id === updatedPerson.id);
        if (oldPerson) {
          // 检查是否有变更
          const hasChanges =
            oldPerson.name !== updatedPerson.name ||
            oldPerson.title !== updatedPerson.title ||
            oldPerson.layer !== updatedPerson.layer ||
            oldPerson.role !== updatedPerson.role ||
            oldPerson.affinity !== updatedPerson.affinity ||
            oldPerson.phone !== updatedPerson.phone ||
            oldPerson.email !== updatedPerson.email ||
            JSON.stringify(oldPerson.tags) !== JSON.stringify(updatedPerson.tags);

          if (hasChanges) {
            await updateDecisionChainMemberMutation.mutateAsync({
              id: updatedPerson.id.toString(),
              updates: {
                name: updatedPerson.name,
                title: updatedPerson.title || null,
                layer: updatedPerson.layer,
                role: updatedPerson.role || 'Influencer',
                affinity: updatedPerson.affinity || 3,
                phone: updatedPerson.phone || null,
                email: updatedPerson.email || null,
                tags: updatedPerson.tags || [],
                conquest_record: updatedPerson.conquestRecord || null
              }
            });
          }
        }
      }

      // 3. 处理决策链资源（TODO: 需要添加资源的 API 调用）
      // 这里暂时跳过资源处理，因为需要更复杂的逻辑
    } catch (error) {
      console.error('保存决策链成员失败:', error);
      alert('保存决策链成员失败，请重试');
      return;
    }

    // === 保存业务线变更到后端 ===
    try {
      // 1. 查找新增的业务线
      const oldBusinessLines = supplier.businessLines || [];
      const newBusinessLines = tempSupplier.businessLines || [];

      // 新增的业务线
      const addedBusinessLines = newBusinessLines.filter(nbl => !oldBusinessLines.find(obl => obl.type === nbl.type));
      for (const newBL of addedBusinessLines) {
        await createBusinessLineMutation.mutateAsync({
          businessLine: {
            supplier_id: id || '',
            type: newBL.type,
            description: newBL.description || null,
            routes: newBL.routes || [],
            carriers: newBL.carriers || []
          },
          contacts: newBL.contact?.name ? [{
            name: newBL.contact.name,
            title: newBL.contact.title || null,
            phone: newBL.contact.phone || null,
            email: newBL.contact.email || null,
            is_primary: true
          }] : undefined
        });
      }

      // 更新的业务线
      const updatedBusinessLines = newBusinessLines.filter(nbl => oldBusinessLines.find(obl => obl.type === nbl.type));
      for (const updatedBL of updatedBusinessLines) {
        const oldBL = oldBusinessLines.find(obl => obl.type === updatedBL.type);
        if (oldBL) {
          const hasChanges =
            (oldBL.description !== updatedBL.description) ||
            JSON.stringify(oldBL.routes) !== JSON.stringify(updatedBL.routes) ||
            JSON.stringify(oldBL.carriers) !== JSON.stringify(updatedBL.carriers);

          if (hasChanges) {
            // 获取业务线 ID（从数据库加载的数据会有 ID）
            if ((updatedBL as any).id) {
              await updateBusinessLineMutation.mutateAsync({
                id: (updatedBL as any).id,
                updates: {
                  type: updatedBL.type,
                  description: updatedBL.description || null,
                  routes: updatedBL.routes || [],
                  carriers: updatedBL.carriers || []
                }
              });
            }
          }
        }
      }

      // 处理删除的业务线
      const deletedBusinessLines = oldBusinessLines.filter(obl => !newBusinessLines.find(nbl => nbl.type === obl.type));
      for (const deletedBL of deletedBusinessLines) {
        if ((deletedBL as any).id) {
          await deleteBusinessLineMutation.mutateAsync((deletedBL as any).id);
        }
      }
    } catch (error) {
      console.error('保存业务线失败:', error);
      alert('保存业务线失败，请重试');
      return;
    }

    setSupplier(tempSupplier);
    setPeople(tempPeople);

    if (logModalMode === 'plan') {
      alert("计划拜访任务已创建，并已同步至动态日志！");
    }

    setIsLogModalOpen(false);
  };

  const handleAddPerson = () => {
    if (!newPerson.name) return;
    
    const tagsArray = newPerson.tags 
      ? newPerson.tags.split(/[,，]/).map(t => t.trim()).filter(Boolean) 
      : [];

    const initialResources = [];
    if (newPerson.resourceName) {
      initialResources.push({
        id: `res-${Date.now()}`,
        name: newPerson.resourceName,
        type: newPerson.resourceType,
        desc: newPerson.resourceDesc
      });
    }

    const person = {
      id: people.length > 0 ? Math.max(...people.map(p => p.id)) + 1 : 1,
      name: newPerson.name,
      title: newPerson.title,
      layer: newPerson.layer,
      phone: newPerson.phone,
      email: newPerson.email,
      role: 'Influencer', 
      affinity: 3,
      tags: tagsArray,
      conquestRecord: '',
      resources: initialResources
    };
    // @ts-ignore
    setPeople([...people, person]);
    setIsAddPersonOpen(false);
    setNewPerson({ 
      name: '', title: '', layer: 'Execution', phone: '', email: '', 
      tags: '', resourceName: '', resourceType: 'Person', resourceDesc: '' 
    });
  };

  const handleAddResource = () => {
    if (!editingResourcePersonId || !newResource.name) return;
    
    setPeople(people.map(p => {
      if (p.id === editingResourcePersonId) {
        return {
          ...p,
          resources: [
            ...p.resources,
            // @ts-ignore
            { id: `res-${Date.now()}`, ...newResource }
          ]
        };
      }
      return p;
    }));
    setNewResource({ name: '', type: 'Person', desc: '' });
  };

  const handleDeleteResource = (personId: number, resourceId: string) => {
    setPeople(people.map(p => {
      if (p.id === personId) {
        return {
          ...p,
          resources: p.resources.filter(r => r.id !== resourceId)
        };
      }
      return p;
    }));
  };

  const handleTabChange = (tabId: string) => {
    setSearchParams({ tab: tabId });
  };

  // === 文件管理处理函数 ===
  /**
   * 处理文件上传
   */
  const handleFileUpload = async (file: File, fileType: SupplierFile['file_type'], description?: string) => {
    if (!id) throw new Error('供应商 ID 不存在');
    await uploadFileMutation.mutateAsync({
      supplierId: id,
      file,
      fileType,
      description,
    });
  };

  /**
   * 处理文件下载
   */
  const handleFileDownload = async (file: SupplierFile) => {
    try {
      const url = await getFileUrlMutation.mutateAsync(file);
      window.open(url, '_blank');
    } catch (error) {
      console.error('获取下载链接失败:', error);
      alert('获取下载链接失败，请重试');
    }
  };

  /**
   * 处理文件删除
   */
  const handleFileDelete = async (file: SupplierFile) => {
    if (!confirm(`确定要删除文件 "${file.file_name}" 吗？`)) {
      return;
    }

    if (!id) {
      alert('供应商 ID 不存在');
      return;
    }

    try {
      await deleteFileMutation.mutateAsync({
        supplierId: id,
        fileId: file.id,
      });
    } catch (error) {
      console.error('删除文件失败:', error);
      alert('删除文件失败，请重试');
    }
  };

  const handleSaveTempPerson = () => {
    if (!newPerson.name) return;
    const person = {
        id: tempPeople.length > 0 ? Math.max(...tempPeople.map(p => p.id)) + 1 : Date.now(),
        name: newPerson.name,
        title: newPerson.title,
        layer: newPerson.layer,
        phone: newPerson.phone,
        email: newPerson.email,
        role: 'Influencer',
        affinity: 3,
        tags: [],
        resources: []
    };
    // @ts-ignore
    setTempPeople([...tempPeople, person]);
    setIsAddingTempPerson(false);
    setNewPerson({ 
      name: '', title: '', layer: 'Execution', phone: '', email: '', 
      tags: '', resourceName: '', resourceType: 'Person', resourceDesc: '' 
    });
  };

  const handleSaveTempResource = () => {
      if (!newResource.name || !tempResourceOwnerId) return;
      
      setTempPeople(tempPeople.map(p => {
          if (p.id.toString() === tempResourceOwnerId.toString()) {
              return {
                  ...p,
                  resources: [
                      ...p.resources,
                      // @ts-ignore
                      { id: `res-${Date.now()}`, ...newResource }
                  ]
              };
          }
          return p;
      }));
      setIsAddingTempResource(false);
      setNewResource({ name: '', type: 'Person', desc: '' });
      setTempResourceOwnerId('');
  };

  if (!supplier) {
    return <div className="p-8 text-center text-slate-500">Supplier not found</div>;
  }

  const getTierInfo = (tierId: string) => {
    return DICTIONARIES.tiers.find(t => t.id === tierId);
  };

  const getBusinessResourceConfig = (type: string) => {
    const t = type || '';
    if (t.includes('海运')) return { 
        label: '合作船司', 
        placeholder: '+ 添加船司',
        options: ['Matson', 'COSCO', 'Maersk', 'MSC', 'CMA CGM', 'OOCL', 'ONE', 'HMM', 'Evergreen', 'Yang Ming', 'ZIM', 'WHL'] 
    };
    if (t.includes('空运')) return { 
        label: '合作航司', 
        placeholder: '+ 添加航司',
        options: ['CA (国航)', 'MU (东航)', 'CZ (南航)', 'CX (国泰)', 'EK (阿联酋)', 'LH (汉莎)', 'PO (极地)', 'RU (空桥)'] 
    };
    if (t.includes('铁路')) return { 
        label: '铁路班列', 
        placeholder: '+ 添加班列',
        options: ['中欧班列', '中亚班列', '中老铁路', '渝新欧', '义新欧'] 
    };
    if (t.includes('卡车') || t.includes('拖车') || t.includes('陆运')) return { 
        label: '合作车队', 
        placeholder: '+ 添加车队',
        options: ['顺丰', '德邦', '京东', '跨越', '自有车队', '外包车队'] 
    };
    if (t.includes('仓储')) return { 
        label: '库区', 
        placeholder: '+ 添加库区',
        options: ['普洛斯', '万科纬度', '嘉民', '自有仓库'] 
    };
    if (t.includes('报关')) return { 
        label: '报关行', 
        placeholder: '+ 添加报关行',
        options: [] 
    };
    return { label: '合作资源', placeholder: '+ 添加资源', options: [] };
  };

  const tierInfo = supplier ? getTierInfo(supplier?.tier) : null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* 1. Header Section: Identity & Status */}
      <Card className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex gap-5">
            <div className="w-20 h-20 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center text-2xl font-bold text-slate-500">
              {supplier?.code?.split('-')[1] || 'N/A'}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-slate-900">{supplier?.name || 'Loading...'}</h1>
              </div>
              <p className="text-slate-500 mb-3">Local Name: {supplier?.name || 'Loading...'}</p>
              <div className="flex items-center gap-2">
                {supplier?.tags?.map(tag => (
                  <Badge key={tag} variant="outline">#{tag}</Badge>
                )) || []}
              </div>
            </div>
          </div>
        </div>

                <div className="grid grid-cols-4 gap-4 border-t border-slate-100 pt-6">
                  <div className="px-4 border-r border-slate-100 min-w-[200px]">
                     <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">供应商等级</p>
                     <div className="flex items-center gap-2">
                       <span className={cn(
                         "text-lg font-bold px-2 py-0.5 rounded flex-shrink-0",
                         tierInfo?.color || "bg-slate-100 text-slate-700"
                       )}>
                         {tierInfo?.level || 'N/A'}
                       </span>
                       <span className="text-sm text-slate-600 font-medium truncate">
                         {tierInfo?.id === 'blacklisted' ? '禁用' : (tierInfo?.label?.split(' ')[0] || supplier?.tier || 'N/A')}
                       </span>
                     </div>
                  </div>
                  
                  <div className="px-4 border-r border-slate-100 min-w-[180px]">
                     <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">供应商编码</p>
                     <div className="flex items-center gap-2">
                       <span className="text-lg font-bold font-mono text-slate-700 truncate" title={supplier?.code || ''}>
                         {supplier?.code || 'N/A'}
                       </span>
                     </div>
                  </div>

                  <div className="px-4 border-r border-slate-100 min-w-[150px]">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">合作金额</p>
                    <p className="text-xl font-bold text-slate-900 truncate">
                      {supplier?.tier === 'blacklisted' ? '¥ 0' : '¥ 12,450,000'}
                    </p>
                  </div>

                  <div className="px-4 min-w-[150px]">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">绩效表现</p>
                    <div className={cn(
                      "flex items-center gap-2",
                      supplier?.tier === 'blacklisted' ? "text-red-600" : "text-emerald-600"
                    )}>
                      <span className="text-xl font-bold">{supplier?.systemScore || 0}</span>
                      {supplier?.tier === 'blacklisted' ? (
                        <div className="flex items-center text-xs bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          <span>Fail</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-xs bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          <span>Top 10%</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
      </Card>

      {/* 2. Tabs Navigation (Centers) */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-8">
          {[
            { id: 'asset', label: '企业档案', icon: Building2 },
            { id: 'contract', label: '契约与规则', icon: FileText },
            { id: 'engagement', label: '动态成长', icon: Network },
            { id: 'performance', label: '绩效管理', icon: BarChart2 },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "pb-4 pt-2 flex items-center gap-2 text-sm font-medium border-b-2 transition-colors",
                activeTab === tab.id
                  ? "border-brand-500 text-brand-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* 3. Tab Content */}
      <div className="min-h-[400px]">
        
        {/* === TAB 1: ASSET BUILDER === */}
        {activeTab === 'asset' && (
          <div className="space-y-8">
            {/* 1.1 Identity */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <div className="w-1 h-6 bg-brand-500 rounded-full" />
                  基本信息
                </h3>
                <button 
                  onClick={() => setIsFileModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-brand-600 transition-colors shadow-sm"
                >
                  <FileText className="w-4 h-4" />
                  相关文件 ({files.length})
                </button>
              </div>
              
              <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                <div className="grid grid-cols-4 divide-x divide-y divide-slate-100 text-sm">
                  {/* Row 1 */}
                  <div className="p-4 bg-slate-50 text-slate-500 font-medium">企业名称</div>
                  <div className="p-4 text-slate-900 font-bold col-span-3">{supplier?.name || 'Loading...'}</div>
                  
                  {/* Row 2 */}
                  <div className="p-4 bg-slate-50 text-slate-500 font-medium">统一社会信用代码</div>
                  <div className="p-4 text-slate-900 font-mono">91310000607XXXXXX</div>
                  <div className="p-4 bg-slate-50 text-slate-500 font-medium">成立日期</div>
                  <div className="p-4 text-slate-900">2005-08-15</div>
                  
                  {/* Row 3 */}
                  <div className="p-4 bg-slate-50 text-slate-500 font-medium">注册地址</div>
                  <div className="p-4 text-slate-900 col-span-3">{supplier?.address}</div>
                  
                  {/* Row 4 */}
                  <div className="p-4 bg-slate-50 text-slate-500 font-medium">企业性质</div>
                  <div className="p-4 text-slate-900">
                    <Badge variant="brand">{supplier?.tier === 'blacklisted' ? 'Unknown' : '外商独资'}</Badge>
                  </div>
                  <div className="p-4 bg-slate-50 text-slate-500 font-medium">资质认证</div>
                  <div className="p-4 text-slate-900 flex gap-2">
                     {supplier?.tier === 'blacklisted' ? (
                       <span className="px-2 py-0.5 bg-red-50 text-red-700 border border-red-100 rounded text-xs">Revoked (已吊销)</span>
                     ) : (
                       <>
                         <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-xs">NVOCC</span>
                         <span className="px-2 py-0.5 bg-slate-50 text-slate-600 border border-slate-200 rounded text-xs">ISO 9001</span>
                       </>
                     )}
                  </div>

                  {/* Row 5: Contact */}
                  <div className="p-4 bg-slate-50 text-slate-500 font-medium">联系方式</div>
                  <div className="p-4 col-span-3 space-y-1">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-2 w-48"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {supplier?.address}</span>
                      <span className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-slate-400" /> {supplier?.contactPhone || 'N/A'}</span>
                      <span className="flex items-center gap-2"><Globe className="w-3.5 h-3.5 text-slate-400" /> {supplier?.website}</span>
                    </div>
                  </div>

                  {/* Row 6: Corporate Structure (Flexible Text) */}
                   <div className="p-4 bg-slate-50 text-slate-500 font-medium flex items-center">
                     企业结构
                   </div>
                   <div className="p-4 col-span-3">
                       <div className="flex items-start gap-3">
                         <div className="flex-1">
                            <p className="text-sm text-slate-700 leading-relaxed">
                              {supplier?.structure}
                            </p>
                         </div>
                       </div>
                   </div>

                   {/* Row 7: Main Business (Flexible Text) - REMOVED per user request */}
                   {/* 
                   <div className="p-4 bg-slate-50 text-slate-500 font-medium flex items-center">
                     主营业务
                   </div>
                   <div className="p-4 col-span-3">
                       <div className="flex items-start gap-3">
                         <div className="flex-1">
                            <p className="text-sm text-slate-700 leading-relaxed">
                              {(supplier as any).businessLines?.[0]?.description || '暂无优势描述'}
                            </p>
                         </div>
                       </div>
                   </div>
                   */}
                </div>
                
                {/* Audit Action Footer */}
                {supplier?.tier === 'probation' && (
                  <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end gap-3">
                    <span className="text-sm text-slate-500 flex items-center mr-2">当前状态: 考察期审核中</span>
                    <button className="flex items-center gap-2 px-4 py-1.5 bg-white text-emerald-700 border border-emerald-200 rounded hover:bg-emerald-50 text-sm font-medium transition-colors shadow-sm">
                      <Check className="w-3.5 h-3.5" /> 通过
                    </button>
                    <button className="flex items-center gap-2 px-4 py-1.5 bg-white text-red-700 border border-red-200 rounded hover:bg-red-50 text-sm font-medium transition-colors shadow-sm">
                      <X className="w-3.5 h-3.5" /> 驳回
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* 1.1.5 Core Business - Table View */}
            <section>
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-brand-500 rounded-full" />
                主营业务
              </h3>
              
              <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 font-medium text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 w-[15%]">业务类型</th>
                      <th className="px-4 py-3 w-[25%]">优势</th>
                      <th className="px-4 py-3 w-[20%]">合作资源</th>
                      <th className="px-4 py-3 w-[20%]">覆盖区域</th>
                      <th className="px-4 py-3 w-[20%]">关键联系人</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {supplier?.businessLines && supplier.businessLines.length > 0 ? (
                      supplier?.businessLines.map((biz, idx) => {
                         const Icon = biz.type.includes('海运') ? Ship : 
                               biz.type.includes('空运') ? Plane :
                               biz.type.includes('卡车') || biz.type.includes('陆运') ? Truck :
                               biz.type.includes('铁路') ? Train :
                               biz.type.includes('报关') ? FileCheck : Briefcase;
                        return (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className="font-bold text-slate-900">{biz.type}</div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                                <div className="text-sm text-slate-600 font-medium">{biz.description || '-'}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-2">
                                {biz.carriers?.map(c => (
                                  <span key={c} className="px-2 py-0.5 bg-white border border-slate-200 text-slate-600 rounded text-xs">{c}</span>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-2">
                                {biz.routes?.map(r => (
                                  <span key={r} className="px-2 py-0.5 bg-slate-50 border border-slate-100 text-slate-500 rounded text-xs">{r}</span>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {biz.contact ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                                    {biz.contact.name?.charAt(0) || '?'}
                                  </div>
                                  <div>
                                    <div className="font-medium text-slate-900">{biz.contact.name || '未命名'}</div>
                                    <div className="text-xs text-slate-400">{biz.contact.title || '无职位'}</div>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-slate-400 text-xs">无联系人</div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                          暂无主营业务信息
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* 1.2 Power Map - Table View */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <div className="w-1 h-6 bg-brand-500 rounded-full" />
                  决策链
                </h3>
                <button 
                  onClick={() => setIsAddPersonOpen(true)}
                  className="text-sm text-brand-600 font-medium hover:underline flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> 新增关键人
                </button>
              </div>
              
              <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 font-medium text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 w-[15%]">层级</th>
                      <th className="px-4 py-3 w-[20%]">姓名/职位</th>
                      <th className="px-4 py-3 w-[20%]">联系方式</th>
                      <th className="px-4 py-3 w-[15%]">亲密度</th>
                      <th className="px-4 py-3 w-[30%]">画像标签</th>
                      <th className="px-4 py-3 w-[50px]"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {['Decision', 'Execution', 'Operation'].map(layer => {
                      const layerPeople = people.filter(p => p.layer === layer);
                      if (layerPeople.length === 0) return null;
                      
                      return layerPeople.map((person, idx) => (
                        <tr key={person.id} className="hover:bg-slate-50 transition-colors group">
                          {/* Layer Column - Merge Cells logic simplified by repeating for now or just visually grouping */}
                          <td className="px-4 py-3 align-top">
                             {idx === 0 && (
                               <Badge variant={layer === 'Decision' ? 'purple' : layer === 'Execution' ? 'brand' : 'default'}>
                                 {layer}
                               </Badge>
                             )}
                          </td>
                          <td className="px-4 py-3 align-top">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                                {person.name?.charAt(0) || '?'}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900">{person.name || '未命名'}</div>
                                <div className="text-xs text-slate-500">{person.title || '无职位'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 align-top space-y-1">
                             <div className="flex items-center gap-2 text-xs text-slate-600">
                               <Phone className="w-3 h-3 text-slate-400" /> {person.phone}
                             </div>
                             <div className="flex items-center gap-2 text-xs text-slate-600">
                               <Mail className="w-3 h-3 text-slate-400" /> {person.email}
                             </div>
                          </td>
                          <td className="px-4 py-3 align-top">
                             <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <div key={i} className={cn("w-2 h-2 rounded-full", i < person.affinity ? "bg-amber-400" : "bg-slate-200")} />
                                ))}
                             </div>
                             <div className="text-[10px] text-slate-400 mt-1">
                               {person.role}
                             </div>
                          </td>
                          <td className="px-4 py-3 align-top">
                             <div className="flex flex-wrap gap-1.5">
                               {person.tags.map(tag => (
                                 <span key={tag} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded text-[10px]">
                                   {tag}
                                 </span>
                               ))}
                             </div>
                          </td>
                          <td className="px-4 py-3 align-top text-right">
                            <button 
                              onClick={() => setEditingResourcePersonId(person.id)}
                              className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                              title="编辑信息"
                            >
                              <Settings className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ));
                    })}
                  </tbody>
                </table>
              </div>
            </section>
            
            {/* 1.3 Derived Resources - Table View */}
            <section>
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-brand-500 rounded-full" />
                衍生资源
              </h3>
              
              <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                 <table className="w-full text-sm text-left">
                  <thead className="bg-amber-50/50 font-medium text-slate-500 border-b border-amber-100">
                    <tr>
                      <th className="px-4 py-3 w-[15%]">资源持有者</th>
                      <th className="px-4 py-3 w-[20%]">资源名称</th>
                      <th className="px-4 py-3 w-[10%]">类型</th>
                      <th className="px-4 py-3 w-[45%]">描述/价值</th>
                      <th className="px-4 py-3 w-[10%]">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {people.filter(p => p.resources?.length > 0).length > 0 ? (
                      people.filter(p => p.resources?.length > 0).flatMap(person =>
                        person.resources?.map((res, idx) => {
                          const Icon = res.type === 'Association' ? Landmark : res.type === 'Company' ? Building2 : res.type === 'Person' ? UserCheck : Share2;
                          // Only show Person Name on the first resource row for that person
                          const isFirst = idx === 0;
                          
                          return (
                            <tr key={res.id} className="hover:bg-amber-50/10 transition-colors">
                              <td className="px-4 py-3 align-top border-r border-slate-50">
                                {isFirst && (
                                  <div className="flex items-center gap-2">
                                     <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                                       {person.name?.charAt(0) || '?'}
                                     </div>
                                     <span className="font-bold text-slate-700">{person.name || '未命名'}</span>
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3 align-top">
                                <div className="flex items-center gap-2 font-medium text-slate-800">
                                  <Icon className="w-3.5 h-3.5 text-slate-400" />
                                  {res.name}
                                </div>
                              </td>
                              <td className="px-4 py-3 align-top">
                                <Badge variant="outline" className="text-[10px]">{res.type}</Badge>
                              </td>
                              <td className="px-4 py-3 align-top text-slate-600 text-xs leading-relaxed">
                                {res.desc}
                              </td>
                              <td className="px-4 py-3 align-top text-right">
                                {isFirst && (
                                  <button 
                                    onClick={() => setEditingResourcePersonId(person.id)}
                                    className="text-xs text-brand-600 hover:underline font-medium"
                                  >
                                    管理
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )
                    ) : (
                      <tr>
                         <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                           暂无衍生资源记录
                         </td>
                      </tr>
                    )}
                  </tbody>
                 </table>
              </div>
            </section>


          </div>
        )}

        {/* === TAB 2: CONTRACT HUB === */}
        {activeTab === 'contract' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-6">
              
              {/* Left Column */}
              <div className="space-y-6">
                 {/* Contract Management */}
                 <Card className="p-6">
                   <div className="flex items-center justify-between mb-4">
                     <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                       <FileText className="w-5 h-5 text-brand-500" />
                       合同管理
                     </h3>
                     <button className="text-xs flex items-center gap-1 bg-brand-50 text-brand-600 px-3 py-1.5 rounded-lg hover:bg-brand-100 font-medium">
                       <Upload className="w-3.5 h-3.5" />
                       上传合同
                     </button>
                   </div>
                   <div className="space-y-3">
                     <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg group hover:border-brand-200 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white rounded border border-slate-200 flex items-center justify-center text-red-500">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">2024 年度美线运输框架协议.pdf</p>
                            <p className="text-xs text-slate-500">Expires: 2024-12-31 · Active</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">生效中</span>
                     </div>
                     <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg opacity-60">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white rounded border border-slate-200 flex items-center justify-center text-slate-400">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">2023 补充协议 A.pdf</p>
                            <p className="text-xs text-slate-500">Archived · 2023-12-31</p>
                          </div>
                        </div>
                        <span className="text-xs font-medium text-slate-500">已归档</span>
                     </div>
                   </div>
                 </Card>

                 {/* Financial 4D Model */}
                 <Card className="p-6 space-y-6">
                   <div className="flex items-center justify-between">
                     <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                       <CreditCard className="w-5 h-5 text-brand-500" />
                       财务付款 4 维模型
                     </h3>
                     <span className="text-xs font-mono text-slate-400">Ref: Doc-06</span>
                   </div>
                
                <div className="space-y-4">
                  {/* Visual Formula */}
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <div className="grid grid-cols-7 items-center text-sm text-slate-600 mb-4">
                      {/* 1. Interval */}
                      <div className="col-span-2 flex flex-col items-center gap-1">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">1</span>
                        <span className="text-xs font-medium">计算区间</span>
                      </div>
                      <div className="flex justify-center"><ArrowRight className="w-4 h-4 text-slate-300" /></div>
                      
                      {/* 2. Anchor */}
                      <div className="col-span-2 flex flex-col items-center gap-1">
                        <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">2</span>
                        <span className="text-xs font-medium">计算节点</span>
                      </div>
                      <div className="flex justify-center"><ArrowRight className="w-4 h-4 text-slate-300" /></div>

                      {/* 3. Credit Period */}
                      <div className="col-span-1 flex flex-col items-center gap-1">
                        <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold">3</span>
                        <span className="text-xs font-medium">账期</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                       <div className="flex-1 p-2 bg-white rounded border border-slate-200 font-mono text-sm text-center text-slate-700 shadow-sm">
                         {supplier?.financial?.interval || 'N/A'}
                       </div>
                       <span className="text-slate-400 font-bold">+</span>
                       <div className="flex-1 p-2 bg-white rounded border border-slate-200 font-mono text-sm text-center text-slate-700 shadow-sm">
                         {supplier?.financial?.anchor || 'N/A'}
                       </div>
                       <span className="text-slate-400 font-bold">+</span>
                       <div className="flex-1 p-2 bg-white rounded border border-slate-200 font-mono text-sm text-center text-slate-700 shadow-sm">
                         {supplier?.financial?.period || 0} Days
                       </div>
                    </div>
                  </div>
                  
                  {/* 4. Conditions */}
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">4</div>
                    <div>
                      <span className="block text-xs font-bold text-amber-800 mb-1">附加条件</span>
                      <ul className="text-xs text-amber-700 list-disc list-inside space-y-0.5">
                        <li>需见提单复印件 (Copy of BL required)</li>
                        <li>单笔订单金额 &lt; ¥500,000</li>
                      </ul>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm pt-2 border-t border-slate-100">
                    <div className="p-3 rounded-lg bg-slate-50">
                      <span className="block text-xs text-slate-500 mb-1">现金流出预估</span>
                      <span className="font-bold text-slate-900 font-mono">
                        {supplier?.financial.anchor} + {supplier?.financial.period} Days
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50">
                      <span className="block text-xs text-slate-500 mb-1">信用额度</span>
                      <span className="font-bold text-slate-900">¥ 500,000</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Ops DNA */}
              <Card className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-brand-500" />
                    操作指引
                  </h3>
                  <div className="flex items-center gap-2 px-2 py-1 bg-emerald-50 border border-emerald-100 rounded text-xs font-medium text-emerald-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    已同步至 OMS 下单台
                  </div>
                </div>
                
                {supplier?.opsGuide ? (
                  <div className="space-y-4">
                    {/* Cutoff Time */}
                    <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-lg">
                      <div className="mt-0.5 px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-bold whitespace-nowrap">
                        [截单时间]
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {supplier?.opsGuide?.cutoffTime || 'N/A'}
                      </p>
                    </div>

                    {/* Booking Requirements */}
                    <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                      <div className="mt-0.5 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-bold whitespace-nowrap">
                        [打单要求]
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {supplier?.opsGuide?.bookingReq || 'N/A'}
                      </p>
                    </div>

                    {/* Prohibitions */}
                    <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-100 rounded-lg">
                      <div className="mt-0.5 px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-xs font-bold whitespace-nowrap">
                        [禁忌]
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {supplier?.opsGuide?.prohibitions || 'N/A'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    暂无操作指引配置
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
        )}

        {/* === TAB 3: ENGAGEMENT HUB === */}
        {activeTab === 'engagement' && (
          <div className="space-y-8">
            <div className="grid grid-cols-3 gap-6">

              {/* Left: Multi-Dim Logs */}
              <div className="col-span-2 space-y-6">
                {/* 修改历史记录 */}
                {changeLogs && changeLogs.length > 0 && (
                  <Card className="p-5">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <Settings className="w-4 h-4 text-orange-500" />
                        信息修改记录
                      </h3>
                      <span className="text-xs text-slate-500">{changeLogs.length} 条记录</span>
                    </div>
                    <div className="space-y-3 max-h-48 overflow-y-auto">
                      {changeLogs.map((log: any) => (
                        <div key={log.id} className="flex items-start gap-3 p-3 bg-orange-50/50 border border-orange-100 rounded-lg">
                          <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold",
                            log.change_type === 'basic' ? "bg-slate-100 text-slate-600" :
                            log.change_type === 'business' ? "bg-blue-100 text-blue-600" :
                            log.change_type === 'decision' ? "bg-purple-100 text-purple-600" :
                            log.change_type === 'portal' ? "bg-green-100 text-green-600" :
                            log.change_type === 'financial' ? "bg-emerald-100 text-emerald-600" :
                            "bg-amber-100 text-amber-600"
                          )}>
                            {log.change_type === 'basic' ? '基' :
                             log.change_type === 'business' ? '业' :
                             log.change_type === 'decision' ? '决' :
                             log.change_type === 'portal' ? '门' :
                             log.change_type === 'financial' ? '财' : '衍'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm text-slate-800">{log.change_title}</span>
                              <span className="text-xs text-slate-400">
                                {new Date(log.created_at).toLocaleString('zh-CN')}
                              </span>
                            </div>
                            {log.change_description && (
                              <p className="text-xs text-slate-600 mt-1">{log.change_description}</p>
                            )}
                            {log.changed_fields && log.changed_fields.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {log.changed_fields.slice(0, 5).map((field: string) => (
                                  <span key={field} className="px-1.5 py-0.5 bg-white text-xs text-slate-500 rounded border border-slate-200">
                                    {field}
                                  </span>
                                ))}
                                {log.changed_fields.length > 5 && (
                                  <span className="text-xs text-slate-400">+{log.changed_fields.length - 5} 更多</span>
                                )}
                              </div>
                            )}
                            {log.author_name && (
                              <span className="text-xs text-slate-400 mt-1 block">操作人: {log.author_name}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                <div className="flex justify-between items-center">
                   <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <History className="w-5 h-5 text-brand-500" />
                    全维动态日志 (Multi-Dim Logs)
                  </h3>
                </div>

                <div className="relative pl-6 border-l-2 border-slate-100 space-y-8">
                  {engagementLogs?.map(log => (
                    <div key={log.id} className="relative">
                      {/* Timeline Dot */}
                      <div className={cn(
                        "absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 bg-white",
                        log.status === 'planned' ? "border-blue-500" : "border-brand-500"
                      )} />
                      
                      <div className={cn(
                        "bg-white p-5 rounded-xl border shadow-sm hover:shadow-md transition-shadow",
                        log.status === 'planned' ? "border-blue-200 bg-blue-50/10" : "border-slate-200"
                      )}>
                        {/* Header: Date & Author */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-slate-500">{log.date}</span>
                            <div className="flex items-center gap-2">
                              {log.status === 'planned' && (
                                <Badge variant="brand" className="bg-blue-100 text-blue-700 border-blue-200">
                                  计划中
                                </Badge>
                              )}
                              <h4 className="text-base font-bold text-slate-900">{log.title}</h4>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                             <span className="text-xs text-slate-400">Recorded by {log.author}</span>
                             <button 
                               onClick={() => handleEditLog(log)}
                               className="p-1 text-slate-400 hover:text-brand-600 rounded transition-colors"
                               title="编辑日志"
                             >
                               <PenTool className="w-3.5 h-3.5" />
                             </button>
                          </div>
                        </div>
                        
                        {/* 4 Dimensions Grid - Only show if not planned or has content */}
                        {(log.status !== 'planned' || Object.values(log.dimensions || {}).some(Boolean)) && (
                        <div className="grid grid-cols-1 gap-3 mb-4">
                          {/* 1. Basic Info */}
                          <div className="flex gap-3 p-2 rounded-lg bg-slate-50 border border-slate-100">
                            <div className="mt-0.5 w-6 h-6 rounded flex items-center justify-center bg-white border border-slate-200 text-slate-400 flex-shrink-0" title="基础信息 (Basic)">
                              <Building2 className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex-1">
                              <span className="text-xs font-bold text-slate-700 block mb-0.5">基础信息</span>
                              <p className="text-sm text-slate-600 leading-relaxed">
                                {log.dimensions?.basic || <span className="text-slate-400 italic">无更新 (No Update)</span>}
                              </p>
                            </div>
                          </div>

                          {/* 2. Business Info */}
                          <div className="flex gap-3 p-2 rounded-lg bg-blue-50/50 border border-blue-100">
                            <div className="mt-0.5 w-6 h-6 rounded flex items-center justify-center bg-white border border-blue-200 text-blue-500 flex-shrink-0" title="业务信息 (Business)">
                              <Briefcase className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex-1">
                              <span className="text-xs font-bold text-blue-800 block mb-0.5">业务信息</span>
                              <p className="text-sm text-slate-700 leading-relaxed">
                                {log.dimensions?.business || <span className="text-slate-400 italic">无更新 (No Update)</span>}
                              </p>
                            </div>
                          </div>

                          {/* 3. Decision Chain */}
                          <div className="flex gap-3 p-2 rounded-lg bg-purple-50/50 border border-purple-100">
                            <div className="mt-0.5 w-6 h-6 rounded flex items-center justify-center bg-white border border-purple-200 text-purple-500 flex-shrink-0" title="决策链 (Decision)">
                              <Users className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex-1">
                              <span className="text-xs font-bold text-purple-800 block mb-0.5">决策链</span>
                              <p className="text-sm text-slate-700 leading-relaxed">
                                {log.dimensions?.decision || <span className="text-slate-400 italic">无更新 (No Update)</span>}
                              </p>
                            </div>
                          </div>

                          {/* 4. Derivative Resources */}
                          <div className="flex gap-3 p-2 rounded-lg bg-amber-50/50 border border-amber-100">
                            <div className="mt-0.5 w-6 h-6 rounded flex items-center justify-center bg-white border border-amber-200 text-amber-500 flex-shrink-0" title="衍生资源 (Derivative)">
                              <Share2 className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex-1">
                              <span className="text-xs font-bold text-amber-800 block mb-0.5">衍生资源</span>
                              <p className="text-sm text-slate-700 leading-relaxed">
                                {log.dimensions?.derivative || <span className="text-slate-400 italic">无更新 (No Update)</span>}
                              </p>
                            </div>
                          </div>
                        </div>
                        )}
                        
                        {/* Insights (Outcomes) */}
                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                           <div className="flex items-start gap-2 mb-2">
                             <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                             <div className="w-full">
                               <div className="flex justify-between">
                                 <span className="text-xs font-bold text-slate-700 block mb-1">成果/发现</span>
                                 {log.rating > 0 && (
                                   <div className="flex gap-0.5">
                                     {[...Array(5)].map((_, i) => (
                                       <Star key={i} className={cn("w-3 h-3", i < log.rating ? "text-amber-400 fill-amber-400" : "text-slate-200")} />
                                     ))}
                                   </div>
                                 )}
                               </div>
                               <p className="text-xs text-slate-600">{log.outcome}</p>
                             </div>
                           </div>
                           
                           {/* Tags */}
                           {log.tags && log.tags.length > 0 && (
                             <div className="flex gap-2 mt-2 ml-6">
                               {log.tags.map(tag => (
                                 <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                   <Tag className="w-3 h-3 mr-1" />
                                   {tag}
                                 </span>
                               ))}
                             </div>
                           )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Relationship Frequency */}
              <div className="border border-slate-200 rounded-xl shadow-sm p-6 bg-slate-50 border-blue-200">
                <h3 className="font-bold flex items-center gap-2 mb-6 text-slate-900">
                  <History className="w-5 h-5 text-blue-500" />
                  关系维护频率
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-sm font-medium text-slate-700">所需频率</span>
                       <Badge variant="brand">每季度</Badge>
                    </div>
                    <p className="text-xs text-slate-500">基于供应商等级 {supplier?.tier} 的系统建议</p>
                  </div>
                  
                  <div className="h-px bg-slate-200"></div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-sm font-medium text-slate-700">实际频率</span>
                       <span className={cn(
                           "text-sm font-bold",
                           supplier?.id === 'new' ? "text-slate-400" : "text-emerald-600"
                       )}>
                           {supplier?.id === 'new' ? 'N/A' : '30 天 / 次'}
                       </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">过去 6 个月的平均接触频率</p>
                  </div>
                </div>

                {/* Add Visit Plan Button */}
                <div className="mt-6">
                   <button
                     onClick={handleOpenPlan}
                     className="w-full flex items-center justify-center gap-2 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 font-medium transition-colors"
                   >
                     <Calendar className="w-4 h-4" />
                     创建日志
                   </button>
                </div>

                {/* 信息维护按钮 */}
                <div className="mt-3">
                   <button
                     onClick={() => setIsEditModalOpen(true)}
                     className="w-full flex items-center justify-center gap-2 py-2 bg-orange-50 text-orange-700 border border-orange-200 rounded-lg hover:bg-orange-100 font-medium transition-colors"
                   >
                     <Edit3 className="w-4 h-4" />
                     信息维护
                   </button>
                </div>

                {/* Mini Calendar Visualization */}
                <div className="mt-6 border-t border-slate-200 pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-bold text-slate-700">拜访日历</h4>
                    <span className="text-xs text-slate-500">2024 Mar</span>
                  </div>
                  
                  <div className="bg-white rounded-lg border border-slate-100 p-3">
                    <div className="flex gap-3 justify-end mb-3 text-[10px]">
                       <span className="flex items-center gap-1.5 text-slate-500">
                         <div className="w-2 h-2 rounded-full bg-emerald-400"></div> 已完成
                       </span>
                       <span className="flex items-center gap-1.5 text-slate-500">
                         <div className="w-2 h-2 rounded-full bg-blue-500"></div> 计划中
                       </span>
                    </div>
                    
                    <div className="grid grid-cols-7 gap-1 text-center">
                      {['S','M','T','W','T','F','S'].map(d => (
                        <div key={d} className="text-[10px] text-slate-400 font-medium py-1">{d}</div>
                      ))}
                      {/* Empty slots for start of month */}
                      <div className="col-span-5"></div>
                      
                      {Array.from({length: 31}, (_, i) => i + 1).map(date => {
                         // Mock data: 5th & 15th done, 22nd planned
                         const isDone = [5, 15].includes(date);
                         const isPlanned = [22].includes(date);
                         
                         return (
                           <div 
                             key={date} 
                             className={cn(
                               "text-[10px] py-1.5 rounded-full cursor-pointer transition-colors",
                               isDone ? "bg-emerald-100 text-emerald-700 font-bold" :
                               isPlanned ? "bg-blue-100 text-blue-700 font-bold" :
                               "text-slate-600 hover:bg-slate-50"
                             )}
                           >
                             {date}
                           </div>
                         )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* === TAB 4: PERFORMANCE HUB === */}
        {activeTab === 'performance' && (
          <div className="space-y-8">
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 space-y-8">
                <Card className="p-6">
                   <div className="flex items-center justify-between mb-6">
                     <h3 className="font-bold text-slate-900 flex items-center gap-2">
                      <BarChart2 className="w-5 h-5 text-brand-500" />
                      绩效配置与表现
                    </h3>
                    <button className="text-sm flex items-center gap-1 bg-brand-50 text-brand-600 px-3 py-1.5 rounded-lg hover:bg-brand-100 font-medium">
                      <FilePlus className="w-3.5 h-3.5" />
                      发起考核
                    </button>
                   </div>

                  {/* Pending Review Action */}
                  <div className="mb-8 p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                        <PenTool className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Q1 2024 绩效评估 (待办)</h4>
                        <p className="text-xs text-slate-500">截止日期: Tomorrow · 请尽快完成评分</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 shadow-sm transition-colors">
                      开始评分
                    </button>
                  </div>

                  {/* Dynamic Dimensions Display */}
                  <div className="mb-8">
                    <h4 className="text-sm font-bold text-slate-700 mb-4">考核维度</h4>
                    {!supplier.performanceConfig?.dimensions?.length ? (
                      <div className="p-4 bg-slate-50 text-slate-500 text-center rounded-lg">
                        未配置考核维度
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="border border-slate-200 rounded-lg overflow-hidden">
                          <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-500">
                              <tr>
                                <th className="px-4 py-3 font-medium">维度 (Dimension)</th>
                                <th className="px-4 py-3 font-medium">权重 (Weight)</th>
                                <th className="px-4 py-3 font-medium">打分 (Score 0-10)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {supplier?.performanceConfig?.dimensions?.map(dim => (
                                <tr key={dim.id} className="hover:bg-slate-50/50">
                                  <td className="px-4 py-3 font-medium text-slate-900">{dim.name}</td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                      <span className="text-slate-700 font-medium">{dim.weight}%</span>
                                      <div className="w-24 bg-slate-100 rounded-full h-1.5">
                                        <div className="bg-slate-400 h-1.5 rounded-full" style={{ width: `${dim.weight}%` }} />
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                      <span className={cn(
                                          "font-bold",
                                          supplier?.tier === 'blacklisted' ? "text-red-600" : "text-slate-900"
                                      )}>
                                        {supplier?.tier === 'blacklisted' ? '2.5' : (
                                          dim.id === 'cost' ? '9.0' : 
                                          dim.id === 'finance' ? '8.5' :
                                          dim.id === 'service' ? '8.8' :
                                          dim.id === 'risk' ? '9.5' : '7.5'
                                        )}
                                      </span>
                                      <span className="text-xs text-slate-400">/ 10</span>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                  </div>
                )}
              </div>

                  {/* Performance History */}
                  <div className="mb-8">
                    <h4 className="text-sm font-bold text-slate-700 mb-4">历史绩效表现</h4>
                    {!supplier?.performanceHistory?.length ? (
                      <div className="p-4 bg-slate-50 text-slate-500 text-center rounded-lg">
                        暂无历史绩效记录
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {supplier?.performanceHistory?.map((history, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-lg hover:shadow-sm transition-shadow">
                            <div className="flex items-center gap-4">
                               <div className={cn(
                                 "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm",
                                 history.score >= 90 ? "bg-emerald-100 text-emerald-700" :
                                 history.score >= 80 ? "bg-blue-100 text-blue-700" :
                                 history.score >= 60 ? "bg-amber-100 text-amber-700" :
                                 "bg-red-100 text-red-700"
                               )}>
                                 {history.score}
                               </div>
                               <div>
                                 <div className="font-medium text-slate-900">{history.period}</div>
                                 <div className="text-xs text-slate-500">{history.date} · {history.rater}</div>
                               </div>
                            </div>
                            {history.comment && (
                              <div className="text-sm text-slate-500 max-w-xs truncate hidden md:block" title={history.comment}>
                                {history.comment}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="relative pb-12">
                     <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-100" />
                     <div className="grid grid-cols-5 relative">
                       {[
                         { id: 'lead', label: '线索' },
                         { id: 'inspect', label: '考察' },
                         { id: 'trial', label: '试用' },
                         { id: 'cooperation', label: '合作' },
                         { id: 'freeze', label: '冻结' }
                       ].map((step, i) => {
                         // Simplified logic for demo: Tier determines stage
                        let currentStageIndex = 0;
                        if (supplier?.tier === 'probation') currentStageIndex = 1; // Inspect
                        else if (supplier?.tier === 'backup') currentStageIndex = 3; // Cooperation
                        else if (supplier?.tier === 'core') currentStageIndex = 3; // Cooperation
                         else if (supplier?.tier === 'strategic') currentStageIndex = 3; // Cooperation
                         else if (supplier?.status === 'blacklisted') currentStageIndex = 4; // Freeze

                         const isCurrent = i === currentStageIndex;
                         const isPast = i < currentStageIndex;
                         return (
                           <div key={step.id} className="flex flex-col items-center gap-2">
                             <div className={cn(
                               "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-4 transition-colors z-10",
                               isCurrent ? "bg-white border-brand-500 text-brand-600" :
                               isPast ? "bg-brand-500 border-brand-500 text-white" :
                               "bg-white border-slate-200 text-slate-300"
                             )}>
                               {i + 1}
                             </div>
                             <span className={cn(
                               "text-xs font-medium",
                               isCurrent ? "text-brand-600" : "text-slate-500"
                             )}>{step.label}</span>
                           </div>
                         )
                       })}
                     </div>
                  </div>

                  <div className="mt-8 border-t border-slate-100 pt-8 grid grid-cols-3 gap-8">
                    <div>
                       <span className="text-sm text-slate-500 block mb-1">当前等级</span>
                       <Badge variant="purple">
                         <span className="font-bold mr-1">{tierInfo?.level}</span>
                         {tierInfo?.label || supplier?.tier}
                       </Badge>
                       <p className="text-xs text-slate-400 mt-2">基于系统综合评分分级</p>
                    </div>
                    <div>
                       <span className="text-sm text-slate-500 block mb-1">最近考核</span>
                       <div className="flex items-baseline gap-2">
                         <span className="text-2xl font-bold text-slate-900">{supplier?.systemScore || '-'}</span>
                         <span className="text-sm text-emerald-600 font-medium">稳定</span>
                       </div>
                       <p className="text-xs text-slate-400 mt-2">Cycle: {supplier.performanceConfig?.evaluationPeriod || 'Quarterly'}</p>
                    </div>
                    <div>
                       <span className="text-sm text-slate-500 block mb-1">下一次考核</span>
                       <div className="flex items-center gap-2 text-slate-700 font-medium">
                         <Calendar className="w-4 h-4 text-slate-400" />
                         2024-04-01
                       </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Right Column: Win-Win Value Board (Moved Here) */}
              <div className="space-y-6">
                <div className="border border-slate-200 rounded-xl shadow-sm p-6 bg-slate-50 border-orange-200 sticky top-6">
                  <h3 className="font-bold flex items-center gap-2 mb-6 text-slate-900">
                    <TrendingUp className="w-5 h-5 text-orange-500" />
                    价值共赢看板
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <p className="text-xs text-slate-500 uppercase mb-2">我给他的</p>
                      <div className="space-y-3">
                        <div className="p-3 bg-white rounded-lg border border-slate-100 shadow-sm flex justify-between items-center">
                          <div>
                            <span className="block text-xl font-bold text-slate-900">¥12.4M</span>
                            <span className="text-xs text-slate-500">交易额 (YTD)</span>
                          </div>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-slate-100 shadow-sm flex justify-between items-center">
                          <div>
                            <span className="block text-xl font-bold text-emerald-600">18%</span>
                            <span className="text-xs text-slate-500">毛利贡献</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="h-px bg-slate-200"></div>
                    
                    <div>
                      <p className="text-xs text-slate-500 uppercase mb-2">他给我的</p>
                      <div className="space-y-3">
                        <div className="p-3 bg-white rounded-lg border border-slate-100 shadow-sm flex justify-between items-center">
                          <div>
                            <span className="block text-xl font-bold text-slate-900">98.5%</span>
                            <span className="text-xs text-slate-500">准时履约率</span>
                          </div>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-slate-100 shadow-sm flex justify-between items-center">
                          <div>
                            <span className="block text-xl font-bold text-amber-600">2</span>
                            <span className="text-xs text-slate-500">重大异常解决</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* --- Modals --- */}
      
      {/* Add Person Modal */}
      {isAddPersonOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="font-bold text-slate-900">新增关键人</h3>
              <button onClick={() => setIsAddPersonOpen(false)} className="text-slate-400 hover:text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">姓名</label>
                <input 
                  type="text" 
                  value={newPerson.name}
                  onChange={e => setNewPerson({...newPerson, name: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="例如: 张三"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">职位</label>
                  <input 
                    type="text" 
                    value={newPerson.title}
                    onChange={e => setNewPerson({...newPerson, title: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="例如: 销售经理"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">层级</label>
                  <select 
                    value={newPerson.layer}
                    onChange={e => setNewPerson({...newPerson, layer: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="Decision">决策层</option>
                    <option value="Execution">执行层</option>
                    <option value="Operation">操作层</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">联系方式</label>
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    value={newPerson.phone}
                    onChange={e => setNewPerson({...newPerson, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="电话"
                  />
                  <input 
                    type="text" 
                    value={newPerson.email}
                    onChange={e => setNewPerson({...newPerson, email: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="邮箱"
                  />
                </div>
              </div>

              {/* Special Tags Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  特别标签
                </label>
                <input 
                  type="text" 
                  value={newPerson.tags}
                  onChange={e => setNewPerson({...newPerson, tags: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="例如: 看重长期规划, 高尔夫爱好者 (用逗号分隔)"
                />
              </div>

              {/* Initial Resource Input */}
              <div className="pt-4 border-t border-slate-100">
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <Share2 className="w-3.5 h-3.5 text-slate-400" />
                  初始衍生资源 - 可选
                </label>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <input 
                        type="text" 
                        value={newPerson.resourceName}
                        onChange={e => setNewPerson({...newPerson, resourceName: e.target.value})}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                        placeholder="资源名称 (例如: 上海物流协会)"
                      />
                    </div>
                    <div>
                      <select 
                        value={newPerson.resourceType}
                        onChange={e => setNewPerson({...newPerson, resourceType: e.target.value})}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                      >
                        <option value="Person">个人</option>
                        <option value="Company">公司</option>
                        <option value="Association">协会</option>
                        <option value="Official">官方</option>
                      </select>
                    </div>
                  </div>
                  <input 
                    type="text" 
                    value={newPerson.resourceDesc}
                    onChange={e => setNewPerson({...newPerson, resourceDesc: e.target.value})}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="资源描述 (例如: 是该协会常务理事...)"
                  />
                </div>
              </div>

            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 z-10">
              <button 
                onClick={() => setIsAddPersonOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                取消
              </button>
              <button 
                onClick={handleAddPerson}
                className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg"
              >
                新增
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Resources Modal */}
      {editingResourcePersonId && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-900">资源管理</h3>
              <button onClick={() => setEditingResourcePersonId(null)} className="text-slate-400 hover:text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Existing Resources List */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">现有资源</h4>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                  {people.find(p => p.id === editingResourcePersonId)?.resources.length === 0 ? (
                    <p className="text-sm text-slate-400 italic">暂无资源</p>
                  ) : (
                    people.find(p => p.id === editingResourcePersonId)?.resources.map(res => (
                      <div key={res.id} className="flex justify-between items-start p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-slate-700 text-sm">{res.name}</span>
                            <Badge variant="outline">{res.type}</Badge>
                          </div>
                          <p className="text-xs text-slate-500">{res.desc}</p>
                        </div>
                        <button 
                          onClick={() => handleDeleteResource(editingResourcePersonId, res.id)}
                          className="text-slate-400 hover:text-red-500 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Add New Resource Form */}
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-brand-600 uppercase mb-3 flex items-center gap-2">
                  <Plus className="w-3 h-3" /> 新增资源
                </h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <input 
                        type="text" 
                        value={newResource.name}
                        onChange={e => setNewResource({...newResource, name: e.target.value})}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                        placeholder="资源名称 (例如: 上海物流协会)"
                      />
                    </div>
                    <div>
                      <select 
                        value={newResource.type}
                        onChange={e => setNewResource({...newResource, type: e.target.value})}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                      >
                        <option value="Person">个人</option>
                        <option value="Company">公司</option>
                        <option value="Association">协会</option>
                        <option value="Official">官方</option>
                      </select>
                    </div>
                  </div>
                  <input 
                    type="text" 
                    value={newResource.desc}
                    onChange={e => setNewResource({...newResource, desc: e.target.value})}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="资源描述 (例如: 是该协会常务理事，享有优先审批权)"
                  />
                  <button 
                    onClick={handleAddResource}
                    disabled={!newResource.name}
                    className="w-full py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    添加资源
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Unified PACD Log Modal */}
      {isLogModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 sticky top-0 z-10">
              <div>
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  {logModalMode === 'plan' ? <ClipboardList className="w-5 h-5 text-blue-600" /> : <History className="w-5 h-5 text-brand-500" />}
                  {logModalMode === 'plan' ? '维护日志' : logModalMode === 'edit' ? '编辑动态日志' : '新增动态日志'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">PACD 闭环管理框架</p>
              </div>
              <button onClick={() => setIsLogModalOpen(false)} className="text-slate-400 hover:text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-8">
              
              {/* P - PLAN */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                   <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">P</div>
                   <h4 className="font-bold text-slate-800">计划</h4>
                </div>
                
                <div className="pl-8 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">日期</label>
                      <input 
                        type="date" 
                        value={logForm.date}
                        onChange={e => setLogForm({...logForm, date: e.target.value})}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">类型</label>
                      <select 
                        value={logForm.type}
                        onChange={e => setLogForm({...logForm, type: e.target.value})}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                      >
                        <option value="Regular">日常拜访</option>
                        <option value="QBR">季度复盘</option>
                        <option value="Negotiation">商务谈判</option>
                        <option value="Crisis">危机处理</option>
                        <option value="Maintenance">信息维护</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">主题</label>
                    <input 
                      type="text" 
                      value={logForm.title}
                      onChange={e => setLogForm({...logForm, title: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                      placeholder="例如: Q1 业务复盘会议"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1 flex justify-between">
                      <span>行动目标</span>
                      <span className="text-xs text-brand-600 font-medium flex items-center gap-1" title="S=Specific(具体), M=Measurable(可衡量), A=Achievable(可达成), R=Relevant(相关), T=Time-bound(时限)">
                        <Target className="w-3 h-3" />
                        目标需符合 SMART 原则
                      </span>
                    </label>
                    <textarea 
                      value={logForm.goal}
                      onChange={e => setLogForm({...logForm, goal: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[80px]"
                      placeholder="请详细描述本次拜访/沟通的预期目标..."
                    />
                    <div className="mt-1.5 text-[10px] text-slate-400">
                      S=Specific(具体), M=Measurable(可衡量), A=Achievable(可达成), R=Relevant(相关), T=Time-bound(时限)
                    </div>
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">参与人员</label>
                     <input 
                        type="text" 
                        value={logForm.participants}
                        onChange={e => setLogForm({...logForm, participants: e.target.value})}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                        placeholder="例如: Tommy, James Smith"
                      />
                  </div>
                </div>
              </section>

              {/* A - ACTION */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                   <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">A</div>
                   <h4 className="font-bold text-slate-800">行动</h4>
                </div>
                <div className="pl-8 space-y-3">
                  {logModalMode === 'plan' ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg flex gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="text-emerald-900 font-medium mb-1">将自动生成待办任务</p>
                        <p className="text-emerald-700 text-xs">
                          提交后，该计划将自动同步至“驾驶舱-我的任务”列表，作为即将到来的行动提醒。
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                      <p className="text-sm text-slate-600 flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-500" />
                        已执行
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">我的备注</label>
                    <textarea 
                      value={logForm.actionRemarks}
                      onChange={e => setLogForm({...logForm, actionRemarks: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[60px]"
                      placeholder="如有特殊情况或补充说明，请在此填写..."
                    />
                  </div>
                </div>
              </section>

               {/* C - CHECK */}
               <section className={cn("space-y-4", logModalMode === 'plan' && "opacity-60 grayscale pointer-events-none")}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">C</div>
                  <h4 className="font-bold text-slate-800">检查</h4>
                </div>
                
                <div className="pl-8 space-y-4">
                   {/* 1. Goal Dimension */}
                   <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg">
                     <span className="block text-sm font-bold text-slate-700 mb-2">目标达成度</span>
                     <div className="flex gap-2">
                       {[1,2,3,4,5].map(i => (
                         <button
                           key={i}
                           onClick={() => setLogForm({...logForm, rating: i})}
                           className="focus:outline-none transition-transform hover:scale-110"
                           disabled={logModalMode === 'plan'}
                         >
                           <Star className={cn("w-6 h-6", i <= logForm.rating ? "text-amber-400 fill-amber-400" : "text-slate-300")} />
                         </button>
                       ))}
                     </div>
                   </div>

                   {/* 2. Outcome Dimension (Main Text) */}
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">主要成果/发现</label>
                      <textarea 
                        value={logForm.outcome}
                        onChange={e => setLogForm({...logForm, outcome: e.target.value})}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[60px]"
                        placeholder="本次接触的核心结论..."
                        disabled={logModalMode === 'plan'}
                      />
                   </div>

                   {/* 3. Enterprise Archive Updater (Smart Diff) */}
                   <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Database className="w-4 h-4 text-brand-500" />
                            全维信息更新
                        </h4>
                        {/* Tabs */}
                        <div className="flex bg-white rounded-lg p-1 border border-slate-200">
                            {[
                                { id: 'basic', label: '基础', icon: Building2 },
                                { id: 'business', label: '业务', icon: Briefcase },
                                { id: 'decision', label: '决策链', icon: Users },
                                { id: 'derivative', label: '资源', icon: Share2 }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveModalTab(tab.id as any)}
                                    className={cn(
                                        "px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-all",
                                        activeModalTab === tab.id 
                                            ? "bg-brand-50 text-brand-700 shadow-sm" 
                                            : "text-slate-500 hover:bg-slate-50"
                                    )}
                                >
                                    <tab.icon className="w-3 h-3" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="bg-white border border-slate-200 rounded-lg p-4 min-h-[200px]">
                        {activeModalTab === 'basic' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">企业地址</label>
                                    <input 
                                        type="text"
                                        value={tempSupplier.address || ''}
                                        onChange={e => setTempSupplier({...tempSupplier, address: e.target.value})}
                                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                                        disabled={logModalMode === 'plan'}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">供应商等级</label>
                                        <select
                                            value={tempSupplier.tier}
                                            onChange={e => setTempSupplier({...tempSupplier, tier: e.target.value as any})}
                                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                                            disabled={logModalMode === 'plan'}
                                        >
                                            {tiersConfig.map(t => (
                                                <option key={t.id} value={t.id}>{t.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">标签</label>
                                        <input 
                                            type="text"
                                            value={tempSupplier.tags?.join(', ') || ''}
                                            onChange={e => setTempSupplier({
                                                ...tempSupplier, 
                                                tags: e.target.value.split(/[,，]/).map(t => t.trim()).filter(Boolean)
                                            })}
                                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                                            placeholder="逗号分隔..."
                                            disabled={logModalMode === 'plan'}
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">企业结构</label>
                                    <textarea 
                                        value={tempSupplier.structure || ''}
                                        onChange={e => setTempSupplier({...tempSupplier, structure: e.target.value})}
                                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                                        rows={2}
                                        placeholder="例如：XX 集团全资子公司，负责华东区业务..."
                                        disabled={logModalMode === 'plan'}
                                    />
                                </div>
                                
                                <div className="pt-4 border-t border-slate-100">
                                    <label className="block text-xs font-medium text-slate-500 mb-2">财务账期条款</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-[10px] text-slate-400 mb-1">结算方式</label>
                                            <select
                                                value={tempSupplier.financial.interval}
                                                onChange={e => setTempSupplier({
                                                    ...tempSupplier,
                                                    financial: { ...tempSupplier.financial, interval: e.target.value }
                                                })}
                                                className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500"
                                                disabled={logModalMode === 'plan'}
                                            >
                                                {DICTIONARIES.intervals.map(i => <option key={i.id} value={i.id}>{i.label}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-slate-400 mb-1">起算点</label>
                                            <select
                                                value={tempSupplier.financial.anchor}
                                                onChange={e => setTempSupplier({
                                                    ...tempSupplier,
                                                    financial: { ...tempSupplier.financial, anchor: e.target.value }
                                                })}
                                                className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500"
                                                disabled={logModalMode === 'plan'}
                                            >
                                                {DICTIONARIES.anchors.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-slate-400 mb-1">账期 (天)</label>
                                            <input 
                                                type="number"
                                                value={tempSupplier.financial.period}
                                                onChange={e => setTempSupplier({
                                                    ...tempSupplier,
                                                    financial: { ...tempSupplier.financial, period: Number(e.target.value) }
                                                })}
                                                className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500"
                                                disabled={logModalMode === 'plan'}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeModalTab === 'business' && (
                            <div className="space-y-4">
                                {tempSupplier.businessLines?.map((biz: any, idx: number) => {
                                   const resourceConfig = getBusinessResourceConfig(biz.type);
                                   return (
                                    <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-sm text-slate-700">{biz.type}</span>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-[10px] text-slate-400 mb-0.5">业务描述</label>
                                            <textarea
                                                value={biz.description || ''}
                                                onChange={e => {
                                                    const newLines = [...(tempSupplier.businessLines || [])];
                                                    newLines[idx] = { ...biz, description: e.target.value };
                                                    setTempSupplier({ ...tempSupplier, businessLines: newLines });
                                                }}
                                                className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                                                rows={2}
                                                disabled={logModalMode === 'plan'}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                             <div>
                                                 <label className="block text-[10px] text-slate-400 mb-1">覆盖区域</label>
                                                 <div className="space-y-2">
                                                     <div className="flex flex-wrap gap-1 min-h-[24px]">
                                                         {biz.routes?.map((r: string) => (
                                                             <span key={r} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                                                 {r}
                                                                 {logModalMode !== 'plan' && (
                                                                     <button
                                                                        onClick={() => {
                                                                            const newLines = [...(tempSupplier.businessLines || [])];
                                                                            newLines[idx] = {
                                                                                ...biz,
                                                                                 routes: biz.routes.filter((item: string) => item !== r)
                                                                             };
                                                                             setTempSupplier({ ...tempSupplier, businessLines: newLines });
                                                                         }}
                                                                         className="ml-1 text-slate-400 hover:text-red-500"
                                                                     >
                                                                         <X className="w-3 h-3" />
                                                                     </button>
                                                                 )}
                                                             </span>
                                                         ))}
                                                     </div>
                                                     <select
                                                         onChange={e => {
                                                             if (!e.target.value) return;
                                                             const val = e.target.value;
                                                            if (!biz.routes?.includes(val)) {
                                                                const newLines = [...(tempSupplier.businessLines || [])];
                                                                newLines[idx] = {
                                                                    ...biz,
                                                                     routes: [...(biz.routes || []), val]
                                                                 };
                                                                 setTempSupplier({ ...tempSupplier, businessLines: newLines });
                                                             }
                                                             e.target.value = '';
                                                         }}
                                                         className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                                                         disabled={logModalMode === 'plan'}
                                                     >
                                                         <option value="">+ 添加区域</option>
                                                         {['北美', '南美', '欧洲', '地中海', '中东', '东南亚', '非洲'].map(opt => (
                                                             <option key={opt} value={opt}>{opt}</option>
                                                         ))}
                                                     </select>
                                                 </div>
                                             </div>
                                             <div>
                                                 <label className="block text-[10px] text-slate-400 mb-1">{resourceConfig.label}</label>
                                                 <div className="space-y-2">
                                                     <div className="flex flex-wrap gap-1 min-h-[24px]">
                                                         {biz.carriers?.map((c: string) => (
                                                             <span key={c} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-600 border border-blue-100">
                                                                 {c}
                                                                 {logModalMode !== 'plan' && (
                                                                     <button
                                                                        onClick={() => {
                                                                            const newLines = [...(tempSupplier.businessLines || [])];
                                                                            newLines[idx] = {
                                                                                ...biz,
                                                                                 carriers: biz.carriers.filter((item: string) => item !== c)
                                                                             };
                                                                             setTempSupplier({ ...tempSupplier, businessLines: newLines });
                                                                         }}
                                                                         className="ml-1 text-blue-400 hover:text-red-500"
                                                                     >
                                                                         <X className="w-3 h-3" />
                                                                     </button>
                                                                 )}
                                                             </span>
                                                         ))}
                                                     </div>
                                                     {resourceConfig.options.length > 0 ? (
                                                         <select
                                                             onChange={e => {
                                                                 if (!e.target.value) return;
                                                                 const val = e.target.value;
                                                                if (!biz.carriers?.includes(val)) {
                                                                    const newLines = [...(tempSupplier.businessLines || [])];
                                                                    newLines[idx] = {
                                                                        ...biz,
                                                                         carriers: [...(biz.carriers || []), val]
                                                                     };
                                                                     setTempSupplier({ ...tempSupplier, businessLines: newLines });
                                                                 }
                                                                 e.target.value = '';
                                                             }}
                                                             className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                                                             disabled={logModalMode === 'plan'}
                                                         >
                                                             <option value="">{resourceConfig.placeholder}</option>
                                                             {resourceConfig.options.map(opt => (
                                                                 <option key={opt} value={opt}>{opt}</option>
                                                             ))}
                                                         </select>
                                                     ) : (
                                                        <span className="text-[10px] text-slate-400 italic pl-1">暂无预设选项</span>
                                                     )}
                                                 </div>
                                             </div>
                                         </div>
                                    </div>
                                   );
                                })}
                                
                                <div className="flex gap-2 mt-2">
                                    <select
                                        className="flex-1 py-2 px-2 text-xs text-brand-600 border border-brand-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                                        value={newBusiness.type}
                                        onChange={e => setNewBusiness({...newBusiness, type: e.target.value})}
                                        disabled={logModalMode === 'plan'}
                                    >
                                        {['海运 (Ocean)', '空运 (Air)', '铁路 (Rail)', '卡车 (Truck)', '拖车 (Trailer)', '仓储 (Storage)', '报关 (Customs)'].map(t => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                    <button 
                                        className="flex-1 py-2 text-xs text-white bg-brand-600 rounded-lg hover:bg-brand-700 flex items-center justify-center gap-1 disabled:opacity-50"
                                        onClick={() => {
                                            // Check if business type already exists
                                            if (tempSupplier.businessLines?.some((b: any) => b.type === newBusiness.type)) {
                                                alert('该业务类型已存在！');
                                                return;
                                            }
                                            
                                            setTempSupplier({
                                                ...tempSupplier,
                                                // @ts-ignore
                                                businessLines: [
                                                    ...(tempSupplier.businessLines || []),
                                                    {
                                                        type: newBusiness.type,
                                                        description: '',
                                                        routes: [],
                                                        carriers: [],
                                                        contact: { name: '', title: '', phone: '', email: '' }
                                                    }
                                                ]
                                            });
                                        }}
                                        disabled={logModalMode === 'plan'}
                                    >
                                        <Plus className="w-3.5 h-3.5" /> 新增
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeModalTab === 'decision' && (
                            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                                {tempPeople.map((p, idx) => (
                                    <div key={p.id} className="p-2 bg-slate-50 rounded-lg border border-slate-100 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-xs font-bold text-slate-500 border border-slate-200">
                                                {p.name?.charAt(0) || '?'}
                                            </div>
                                            <span className="font-bold text-sm text-slate-700">{p.name || '未命名'}</span>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="block text-[10px] text-slate-400 mb-0.5">职位</label>
                                                <input
                                                    type="text"
                                                    value={p.title}
                                                    onChange={e => {
                                                        const newP = [...tempPeople];
                                                        newP[idx] = { ...p, title: e.target.value };
                                                        setTempPeople(newP);
                                                    }}
                                                    className="w-full px-2 py-1 text-[10px] border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                                                    disabled={logModalMode === 'plan'}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] text-slate-400 mb-0.5">层级</label>
                                                <select 
                                                    value={p.layer}
                                                    onChange={e => {
                                                        const newP = [...tempPeople];
                                                        newP[idx] = { ...p, layer: e.target.value };
                                                        setTempPeople(newP);
                                                    }}
                                                    className="w-full px-2 py-1 text-[10px] border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                                                    disabled={logModalMode === 'plan'}
                                                >
                                                    <option value="Decision">决策层</option>
                                                    <option value="Execution">执行层</option>
                                                    <option value="Operation">操作层</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="block text-[10px] text-slate-400 mb-0.5">电话</label>
                                                <input
                                                    type="text"
                                                    value={p.phone}
                                                    onChange={e => {
                                                        const newP = [...tempPeople];
                                                        newP[idx] = { ...p, phone: e.target.value };
                                                        setTempPeople(newP);
                                                    }}
                                                    className="w-full px-2 py-1 text-[10px] border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                                                    disabled={logModalMode === 'plan'}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] text-slate-400 mb-0.5">邮箱</label>
                                                <input
                                                    type="text"
                                                    value={p.email}
                                                    onChange={e => {
                                                        const newP = [...tempPeople];
                                                        newP[idx] = { ...p, email: e.target.value };
                                                        setTempPeople(newP);
                                                    }}
                                                    className="w-full px-2 py-1 text-[10px] border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                                                    disabled={logModalMode === 'plan'}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-2 pt-1 border-t border-slate-100">
                                            <div className="flex-1">
                                                <label className="block text-[10px] text-slate-400 mb-0.5">亲密度</label>
                                                <select 
                                                    value={p.affinity}
                                                    onChange={e => {
                                                        const newP = [...tempPeople];
                                                        newP[idx] = { ...p, affinity: Number(e.target.value) };
                                                        setTempPeople(newP);
                                                    }}
                                                    className="w-full px-2 py-1 text-[10px] border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                                                    disabled={logModalMode === 'plan'}
                                                >
                                                    {[1,2,3,4,5].map(v => <option key={v} value={v}>{v}</option>)}
                                                </select>
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-[10px] text-slate-400 mb-0.5">角色</label>
                                                <select 
                                                    value={p.role}
                                                    onChange={e => {
                                                        const newP = [...tempPeople];
                                                        newP[idx] = { ...p, role: e.target.value };
                                                        setTempPeople(newP);
                                                    }}
                                                    className="w-full px-2 py-1 text-[10px] border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                                                    disabled={logModalMode === 'plan'}
                                                >
                                                    <option value="Decision Maker">决策者</option>
                                                    <option value="Influencer">影响者</option>
                                                    <option value="Executor">执行者</option>
                                                    <option value="Gatekeeper">守门人</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {isAddingTempPerson ? (
                                    <div className="p-3 bg-brand-50/50 rounded-lg border border-brand-100 space-y-3">
                                        <h5 className="text-xs font-bold text-brand-700">新增关键人</h5>
                                        <div>
                                            <label className="block text-[10px] text-slate-500 mb-0.5">姓名</label>
                                            <input 
                                                type="text"
                                                value={newPerson.name}
                                                onChange={e => setNewPerson({...newPerson, name: e.target.value})}
                                                className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                                                placeholder="姓名"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="block text-[10px] text-slate-500 mb-0.5">职位</label>
                                                <input 
                                                    type="text"
                                                    value={newPerson.title}
                                                    onChange={e => setNewPerson({...newPerson, title: e.target.value})}
                                                    className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] text-slate-500 mb-0.5">层级</label>
                                                <select 
                                                    value={newPerson.layer}
                                                    onChange={e => setNewPerson({...newPerson, layer: e.target.value})}
                                                    className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                                                >
                                                    <option value="Decision">决策层</option>
                                                    <option value="Execution">执行层</option>
                                                    <option value="Operation">操作层</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="block text-[10px] text-slate-500 mb-0.5">电话</label>
                                                <input 
                                                    type="text"
                                                    value={newPerson.phone}
                                                    onChange={e => setNewPerson({...newPerson, phone: e.target.value})}
                                                    className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] text-slate-500 mb-0.5">邮箱</label>
                                                <input 
                                                    type="text"
                                                    value={newPerson.email}
                                                    onChange={e => setNewPerson({...newPerson, email: e.target.value})}
                                                    className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-2 justify-end">
                                            <button 
                                                onClick={() => setIsAddingTempPerson(false)}
                                                className="px-3 py-1.5 text-xs text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50"
                                            >
                                                取消
                                            </button>
                                            <button 
                                                onClick={handleSaveTempPerson}
                                                className="px-3 py-1.5 text-xs text-white bg-brand-600 rounded hover:bg-brand-700"
                                            >
                                                保存
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button 
                                        className="w-full py-2 text-xs text-brand-600 border border-dashed border-brand-200 rounded-lg hover:bg-brand-50 flex items-center justify-center gap-1"
                                        onClick={() => {
                                            setNewPerson({ 
                                                name: '', title: '', layer: 'Execution', phone: '', email: '', 
                                                tags: '', resourceName: '', resourceType: 'Person', resourceDesc: '' 
                                            });
                                            setIsAddingTempPerson(true);
                                        }}
                                        disabled={logModalMode === 'plan'}
                                    >
                                        <Plus className="w-3.5 h-3.5" /> 新增关键人
                                    </button>
                                )}
                            </div>
                        )}

                        {activeModalTab === 'derivative' && (
                            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                                {tempPeople.flatMap((p, pIdx) => (p.resources || []).map((r, rIdx) => (
                                    <div key={r.id} className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-xs font-bold text-slate-700">{r.name || '未命名'}</span>
                                            <Badge variant="outline" className="text-[10px] scale-90 origin-right">{r.type}</Badge>
                                        </div>
                                        <div className="text-[10px] text-slate-400 mb-1">Holder: {p.name || '未命名'}</div>
                                        <input 
                                            type="text"
                                            value={r.desc}
                                            onChange={e => {
                                                const newP = [...tempPeople];
                                                newP[pIdx].resources[rIdx] = { ...r, desc: e.target.value };
                                                setTempPeople(newP);
                                            }}
                                            className="w-full px-2 py-1 text-xs border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                                            disabled={logModalMode === 'plan'}
                                        />
                                    </div>
                                )))}
                                {tempPeople.every(p => p.resources.length === 0) && (
                                    <div className="text-center text-slate-400 text-xs py-4">暂无资源记录</div>
                                )}

                                {isAddingTempResource ? (
                                    <div className="p-3 bg-brand-50/50 rounded-lg border border-brand-100 space-y-3 mt-2">
                                        <h5 className="text-xs font-bold text-brand-700">新增衍生资源</h5>
                                        <div>
                                            <label className="block text-[10px] text-slate-500 mb-0.5">资源持有者 (Holder)</label>
                                            <select
                                                value={tempResourceOwnerId}
                                                onChange={e => setTempResourceOwnerId(e.target.value)}
                                                className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                                            >
                                                <option value="">请选择持有者...</option>
                                                {tempPeople.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name || '未命名'} ({p.title || '无职位'})</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="col-span-2">
                                                <label className="block text-[10px] text-slate-500 mb-0.5">资源名称</label>
                                                <input 
                                                    type="text"
                                                    value={newResource.name}
                                                    onChange={e => setNewResource({...newResource, name: e.target.value})}
                                                    className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] text-slate-500 mb-0.5">类型</label>
                                                <select 
                                                    value={newResource.type}
                                                    onChange={e => setNewResource({...newResource, type: e.target.value})}
                                                    className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                                                >
                                                    <option value="Person">个人</option>
                                                    <option value="Company">公司</option>
                                                    <option value="Association">协会</option>
                                                    <option value="Official">官方</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-slate-500 mb-0.5">描述</label>
                                            <input 
                                                type="text"
                                                value={newResource.desc}
                                                onChange={e => setNewResource({...newResource, desc: e.target.value})}
                                                className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                                                placeholder="描述该资源的价值..."
                                            />
                                        </div>
                                        <div className="flex gap-2 justify-end">
                                            <button 
                                                onClick={() => setIsAddingTempResource(false)}
                                                className="px-3 py-1.5 text-xs text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50"
                                            >
                                                取消
                                            </button>
                                            <button 
                                                onClick={handleSaveTempResource}
                                                disabled={!tempResourceOwnerId || !newResource.name}
                                                className="px-3 py-1.5 text-xs text-white bg-brand-600 rounded hover:bg-brand-700 disabled:opacity-50"
                                            >
                                                保存
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button 
                                        className="w-full py-2 text-xs text-brand-600 border border-dashed border-brand-200 rounded-lg hover:bg-brand-50 flex items-center justify-center gap-1 mt-2"
                                        onClick={() => {
                                            setNewResource({ name: '', type: 'Person', desc: '' });
                                            setTempResourceOwnerId('');
                                            setIsAddingTempResource(true);
                                        }}
                                        disabled={logModalMode === 'plan'}
                                    >
                                        <Plus className="w-3.5 h-3.5" /> 新增衍生资源
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                  </div>
                </div>
              </section>

              {/* D - DELIVERY */}
              <section className={cn("space-y-4", logModalMode === 'plan' && "opacity-60 grayscale pointer-events-none")}>
                <div className="flex items-center gap-2 mb-2">
                   <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs">D</div>
                   <h4 className="font-bold text-slate-800">交付 (Delivery)</h4>
                </div>
                <div className="pl-8">
                   <label className="block text-sm font-medium text-slate-700 mb-1">下一步行动/交付物</label>
                   <textarea 
                      value={logForm.nextSteps}
                      onChange={e => setLogForm({...logForm, nextSteps: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                      placeholder="例如: 跟进合同签署、发送样品..."
                      disabled={logModalMode === 'plan'}
                    />
                </div>
              </section>

            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0">
              <button 
                onClick={() => setIsLogModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                取消
              </button>
              <button 
                onClick={handleSaveLog}
                className={cn(
                  "px-4 py-2 text-sm font-medium text-white rounded-lg shadow-sm transition-colors",
                  logModalMode === 'plan' ? "bg-blue-600 hover:bg-blue-700" : "bg-brand-600 hover:bg-brand-700"
                )}
              >
                {logModalMode === 'plan' ? '创建计划' : logModalMode === 'edit' ? '更新日志' : '提交日志'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Score Modal */}
      {isScoreModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-brand-500" />
                绩效评分
              </h3>
              <button onClick={() => setIsScoreModalOpen(false)} className="text-slate-400 hover:text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto">
              <div className="p-4 bg-blue-50 text-blue-800 text-sm rounded-lg">
                 正在对 <strong>{supplier?.name || '供应商'}</strong> 进行 Q1 绩效评估。
              </div>

              {supplier?.performanceConfig?.dimensions?.map(dim => (
                <div key={dim.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-slate-700">{dim.name}</label>
                    <span className="text-xs text-slate-500">权重: {dim.weight}%</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" 
                      min="0" max="10" step="0.5"
                      defaultValue="8"
                      className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                    />
                    <span className="w-8 text-right font-bold text-slate-900">8.0</span>
                  </div>
                </div>
              ))}
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">综合评语</label>
                <textarea 
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  rows={3}
                  placeholder="请输入评分理由..."
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => setIsScoreModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                取消
              </button>
              <button 
                onClick={() => setIsScoreModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm"
              >
                提交评分
              </button>
            </div>
          </div>
        </div>
      )}
      {/* File Management Modal */}
      {isFileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h2 className="text-lg font-bold text-slate-900">相关文件 (Documents)</h2>
                <p className="text-sm text-slate-500">管理供应商资质、合同及其他重要文件</p>
              </div>
              <button
                onClick={() => setIsFileModalOpen(false)}
                className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => setIsFileUploadDialogOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors shadow-sm font-medium text-sm"
                >
                  <Upload className="w-4 h-4" />
                  上传新文件
                </button>
              </div>

              {/* 加载状态 */}
              {isFilesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-brand-500 animate-spin" />
                  <span className="ml-2 text-sm text-slate-600">加载文件列表...</span>
                </div>
              ) : files.length === 0 ? (
                // 空状态
                <div className="text-center py-12">
                  <File className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">暂无文件</p>
                  <p className="text-xs text-slate-400 mt-1">点击上方按钮上传文件</p>
                </div>
              ) : (
                // 文件列表
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 w-[40%]">文件名</th>
                        <th className="px-4 py-3 w-[15%]">类型</th>
                        <th className="px-4 py-3 w-[15%]">大小</th>
                        <th className="px-4 py-3 w-[15%]">上传日期</th>
                        <th className="px-4 py-3 w-[15%] text-right">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {files.map((file) => (
                        <tr key={file.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-slate-100 rounded text-slate-500">
                                <File className="w-4 h-4" />
                              </div>
                              <div className="truncate max-w-[200px]">
                                <p className="font-medium text-slate-900 truncate">{file.file_name}</p>
                                {file.description && (
                                  <p className="text-xs text-slate-500 truncate">{file.description}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs border border-slate-200">
                              {file.file_type}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-500">
                            {(file.file_size / 1024).toFixed(1)} KB
                          </td>
                          <td className="px-4 py-3 text-slate-500">
                            {new Date(file.created_at).toLocaleDateString('zh-CN')}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleFileDownload(file)}
                                className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded transition-colors"
                                title="下载"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleFileDelete(file)}
                                disabled={deleteFileMutation.isPending}
                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                                title="删除"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* File Upload Dialog */}
      <FileUploadDialog
        supplierId={id || ''}
        isOpen={isFileUploadDialogOpen}
        onClose={() => setIsFileUploadDialogOpen(false)}
        onUpload={handleFileUpload}
      />

      {/* 信息维护模态框 */}
      <SupplierEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        supplier={supplier}
        onSave={handleSaveSupplierEdit}
        isSaving={isSavingEdit}
      />
    </div>
  );
}
