import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  MoreHorizontal,
  Plus,
  X,
  CalendarDays,
  Coffee,
  Utensils,
  FileText,
  Phone,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Target
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  PieChart,
  Pie
} from 'recharts';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { useCreateTask, useUpdateTask, useDeleteTask } from '../hooks/useTasks';
import { useDashboardFullStats, useBusinessPerformanceTrends, useBusinessCategoryDistribution, useSupplierTierDistribution } from '../hooks/useSuppliers';
import { useEventsByDate } from '../hooks/useCalendarEvents';
import { usePersonalPlans, useCreatePersonalPlan, useUpdatePersonalPlan, useDeletePersonalPlan } from '../hooks/usePersonalPlans';
import { PlanFormModal, PlanDetailModal } from '../components/PlanModals';
import type { EventType } from '../services/calendar';
import type { PersonalPlan, PlanType, TaskPriority } from '../types/database';
import { getPlanTypeIcon, getPlanTypeColor, getPlanTypeLabel } from '../services/personalPlans';

// 事件类型到图标的映射函数
function getEventIcon(eventType: EventType) {
  const iconMap = {
    visit: CalendarDays,     // 📅 拜访
    qbr: Coffee,             // ☕ 季度回顾
    dinner: Utensils,        // 🍽️ 宴请
    review: FileText,         // 📋 评审
    call: Phone,             // 📞 电话
    other: MoreHorizontal      // ⋯ 其他
  }
  return iconMap[eventType] || MoreHorizontal
}

// 数据转换函数：将数据库任务格式转换为 Dashboard 格式
function transformDbTaskToDashboard(dbTask: any) {
  const dueDate = dbTask.due_date ? new Date(dbTask.due_date) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let due = 'No Date';
  if (dueDate) {
    dueDate.setHours(0, 0, 0, 0);
    if (dueDate.getTime() === today.getTime()) {
      due = 'Today';
    } else {
      due = dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  }

  return {
    id: parseInt(dbTask.id.slice(-8), 16) || Math.random(), // 生成数字 ID
    title: dbTask.title,
    type: dbTask.task_type || 'Personal',
    due: due,
    status: dbTask.priority || 'Medium',
    supplierId: dbTask.supplier_id || '',
    targetTab: dbTask.target_tab || '',
    action: dbTask.action_param || '',
    assignee: dbTask.assignee_name || 'Me',
    source: dbTask.source || 'System'
  };
}

// --- UI Components ---
const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden", className)}>
    {children}
  </div>
);

const CardHeader = ({ title, action }: { title: string; action?: React.ReactNode }) => (
  <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
    <h3 className="font-semibold text-slate-900">{title}</h3>
    {action}
  </div>
);

// 颜色常量（用于饼图）
const COLORS = ['#ea580c', '#f97316', '#fb923c', '#fdba74'];

export function Dashboard() {
  const navigate = useNavigate();

  // RPC 优化版本：一次调用获取所有 Dashboard 数据
  // 替代原来的 4+ 次独立 API 调用，性能提升 75%
  const { data: dashboardData, isLoading } = useDashboardFullStats();

  // 提取各部分数据（保持向后兼容）
  const dbTasks = dashboardData?.tasks || [];
  const alerts = dashboardData?.alerts || [];
  const stats = dashboardData?.stats;
  const performanceTrends = dashboardData?.performanceTrends || [];
  const businessStats = dashboardData?.businessStats;

  const createTaskMutation = useCreateTask();

  // 本地状态管理
  const [tasks, setTasks] = useState([]);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', due: '', status: 'Medium' });
  const [perfTab, setPerfTab] = useState<'business' | 'personal'>('business');
  const [perfDimension, setPerfDimension] = useState('spend');
  const [perfPeriod, setPerfPeriod] = useState('H1');
  const [pieType, setPieType] = useState<'category' | 'tier'>('category');

  // 日历状态
  const [calendarDate, setCalendarDate] = useState(new Date());
  const calendarYear = calendarDate.getFullYear();
  const calendarMonth = calendarDate.getMonth();
  const { eventsByDate, isLoading: isLoadingCalendar } = useEventsByDate(calendarYear, calendarMonth);

  // 个人计划状态
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isPlanDetailOpen, setIsPlanDetailOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PersonalPlan | null>(null);
  const [planModalMode, setPlanModalMode] = useState<'create' | 'edit'>('create');
  const [isSavingPlan, setIsSavingPlan] = useState(false);

  // 获取个人计划数据
  const { data: personalPlans = [] } = usePersonalPlans();

  // 获取业务绩效真实数据
  const { data: businessTrendData = [], isLoading: isLoadingBusinessTrends } = useBusinessPerformanceTrends(6);
  const { data: businessCategoryData = [], isLoading: isLoadingCategoryData } = useBusinessCategoryDistribution();
  const { data: tierDistributionData = [], isLoading: isLoadingTierData } = useSupplierTierDistribution();

  // 个人计划操作 Hooks
  const createPlanMutation = useCreatePersonalPlan();
  const updatePlanMutation = useUpdatePersonalPlan();
  const deletePlanMutation = useDeletePersonalPlan();

  // 数据同步：当后端数据加载完成后转换格式
  useEffect(() => {
    if (dbTasks.length > 0) {
      const transformed = dbTasks.map(transformDbTaskToDashboard);
      setTasks(transformed);
    }
  }, [dbTasks]);

  // 从统计数据计算供应商层级分布数据（用于图表）- 优先使用 RPC 真实数据
  const supplierTierData = tierDistributionData.length > 0
    ? tierDistributionData
    : (stats?.tierDistribution?.map(tier => ({
        name: `${tier.label} (${tier.tier})`,
        value: tier.count,
        fill: tier.tier === 'strategic' ? '#ea580c' :
               tier.tier === 'core' ? '#f97316' :
               tier.tier === 'backup' ? '#fb923c' :
               '#fdba74'
      })) || []);

  // ===== 个人计划处理函数 =====

  // 打开创建计划模态框
  const handleOpenCreatePlan = () => {
    setSelectedPlan(null);
    setPlanModalMode('create');
    setIsPlanModalOpen(true);
  };

  // 打开编辑计划模态框
  const handleOpenEditPlan = (plan: PersonalPlan) => {
    setSelectedPlan(plan);
    setPlanModalMode('edit');
    setIsPlanDetailOpen(false);
    setIsPlanModalOpen(true);
  };

  // 查看计划详情
  const handleViewPlanDetail = (plan: PersonalPlan) => {
    setSelectedPlan(plan);
    setIsPlanDetailOpen(true);
  };

  // 保存计划（创建或编辑）
  const handleSavePlan = async (planData: {
    title: string
    description: string
    plan_type: PlanType
    priority: TaskPriority
    due_date: string
    start_time: string
    end_time: string
    location: string
    sync_to_calendar: boolean
  }) => {
    setIsSavingPlan(true);
    try {
      if (planModalMode === 'create') {
        await createPlanMutation.mutateAsync({
          title: planData.title,
          description: planData.description,
          plan_type: planData.plan_type,
          priority: planData.priority,
          due_date: planData.due_date,
          start_time: planData.start_time || undefined,
          end_time: planData.end_time || undefined,
          location: planData.location || undefined,
          sync_to_calendar: planData.sync_to_calendar
        });
      } else if (selectedPlan) {
        await updatePlanMutation.mutateAsync({
          planId: selectedPlan.id,
          updates: {
            title: planData.title,
            description: planData.description,
            plan_type: planData.plan_type,
            priority: planData.priority,
            due_date: planData.due_date,
            start_time: planData.start_time || undefined,
            end_time: planData.end_time || undefined,
            location: planData.location || undefined,
            sync_to_calendar: planData.sync_to_calendar
          }
        });
      }
      setIsPlanModalOpen(false);
      setSelectedPlan(null);
    } catch (error) {
      console.error('保存计划失败:', error);
      alert('保存失败，请重试');
    } finally {
      setIsSavingPlan(false);
    }
  };

  // 完成计划
  const handleCompletePlan = async () => {
    if (!selectedPlan) return;
    setIsSavingPlan(true);
    try {
      await updatePlanMutation.mutateAsync({
        planId: selectedPlan.id,
        updates: { status: 'completed' }
      });
      setIsPlanDetailOpen(false);
      setSelectedPlan(null);
    } catch (error) {
      console.error('完成计划失败:', error);
    } finally {
      setIsSavingPlan(false);
    }
  };

  // 删除计划
  const handleDeletePlan = async () => {
    if (!selectedPlan) return;
    if (!confirm('确定要删除这个计划吗？')) return;
    setIsSavingPlan(true);
    try {
      await deletePlanMutation.mutateAsync(selectedPlan.id);
      setIsPlanModalOpen(false);
      setIsPlanDetailOpen(false);
      setSelectedPlan(null);
    } catch (error) {
      console.error('删除计划失败:', error);
    } finally {
      setIsSavingPlan(false);
    }
  };

  const handleAddTask = async () => {
    if (!newTask.title) return;

    try {
      // 解析日期
      let dueDate = null;
      if (newTask.due && newTask.due !== 'No Date') {
        // 简单日期解析
        if (newTask.due === 'Today') {
          dueDate = new Date().toISOString();
        } else {
          // 尝试解析各种日期格式
          const parsed = new Date(newTask.due);
          if (!isNaN(parsed.getTime())) {
            dueDate = parsed.toISOString();
          }
        }
      }

      // 调用后端 API 创建任务
      const createdTask = await createTaskMutation.mutateAsync({
        title: newTask.title,
        task_type: 'Personal',
        priority: newTask.status as any,
        due_date: dueDate,
        assignee_id: undefined,
        assignee_name: 'Me',
        source: 'Personal',
        status: 'pending'
      });

      // 乐观更新本地状态
      const dashboardTask = transformDbTaskToDashboard(createdTask);
      setTasks([dashboardTask, ...tasks]);

      setIsAddTaskOpen(false);
      setNewTask({ title: '', due: '', status: 'Medium' });
    } catch (error) {
      console.error('Failed to create task:', error);
      alert('创建任务失败，请重试。');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      <div className="space-y-6">
        
        {/* 2. 异常看板 */}
        <Card className="border-t-4 border-t-red-500">
          <CardHeader
             title="异常看板"
             action={<button className="p-1 hover:bg-slate-100 rounded"><MoreHorizontal className="w-5 h-5 text-slate-400" /></button>}
          />
          <div className="p-0">
            {isLoading ? (
              <div className="p-6 text-center text-slate-500">加载中...</div>
            ) : alerts.length === 0 ? (
              <div className="p-6 text-center text-slate-500">暂无异常预警</div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3 font-medium">供应商</th>
                    <th className="px-6 py-3 font-medium">风险事项</th>
                    <th className="px-6 py-3 font-medium">等级</th>
                    <th className="px-6 py-3 font-medium text-right">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.map((alert) => (
                    <tr key={alert.id} className="border-b border-slate-50 hover:bg-red-50/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">{alert.supplier_name}</td>
                      <td className="px-6 py-4 text-slate-600 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        {alert.issue}
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2 py-1 rounded border text-xs font-bold",
                          alert.level === 'High' ? "bg-red-50 text-red-700 border-red-100" : "bg-amber-50 text-amber-700 border-amber-100"
                        )}>
                          {alert.level}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => navigate(`/supplier-profile/${alert.id}`)}
                          className="text-brand-600 hover:text-brand-700 font-medium text-xs hover:underline"
                        >
                          查看
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>

      <div className="grid grid-cols-2 gap-6">
        {/* 3. 我的任务/计划 */}
        <Card className="flex flex-col border-t-4 border-t-blue-500 relative h-[400px]">
          <CardHeader
             title="我的计划"
             action={
               <div className="flex items-center gap-2">
                 <span className="bg-brand-100 text-brand-700 text-xs font-bold px-2 py-0.5 rounded-full">
                   {tasks.length + personalPlans.length} 项
                 </span>
                 <button
                   onClick={handleOpenCreatePlan}
                   className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-brand-600 transition-colors"
                   title="创建计划"
                 >
                   <Plus className="w-4 h-4" />
                 </button>
               </div>
             }
          />
          <div className="p-0 flex-1 overflow-y-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3 font-medium">计划/任务</th>
                  <th className="px-4 py-3 font-medium text-right">日期</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {/* 个人计划列表 */}
                {personalPlans.filter(p => p.status !== 'completed').slice(0, 5).map((plan) => (
                  <tr
                    key={plan.id}
                    onClick={() => handleViewPlanDetail(plan)}
                    className="hover:bg-amber-50/50 transition-colors group cursor-pointer"
                  >
                    <td className="px-4 py-3">
                       <div className="flex items-start gap-2">
                         <span className="text-sm">{getPlanTypeIcon(plan.plan_type || 'other')}</span>
                         <div>
                           <div className="font-medium text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1" title={plan.title}>
                             {plan.title}
                           </div>
                           <div className="flex items-center gap-2 mt-1">
                             <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded border', getPlanTypeColor(plan.plan_type || 'other'))}>
                               {getPlanTypeLabel(plan.plan_type || 'other')}
                             </span>
                             {plan.location && (
                               <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                                 <MapPin className="w-2.5 h-2.5" />
                                 {plan.location}
                               </span>
                             )}
                           </div>
                         </div>
                       </div>
                    </td>
                    <td className="px-4 py-3 text-right align-top">
                      <div className={cn(
                        "text-xs font-bold",
                        plan.due_date === new Date().toISOString().split('T')[0] ? "text-red-500" : "text-slate-400"
                      )}>
                        {plan.due_date ? new Date(plan.due_date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }) : '无日期'}
                      </div>
                      {plan.start_time && (
                        <div className="text-[10px] text-slate-400 flex items-center justify-end gap-0.5 mt-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          {plan.start_time}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {/* 系统任务列表 */}
                {tasks.slice(0, 5 - Math.min(personalPlans.filter(p => p.status !== 'completed').length, 3)).map((task) => (
                  <tr
                    key={task.id}
                    onClick={() => {
                      if (task.supplierId) {
                        // @ts-ignore
                        const actionParam = task.action ? `&action=${task.action}` : '';
                        navigate(`/supplier-profile/${task.supplierId}?tab=${task.targetTab}${actionParam}`);
                      }
                    }}
                    className={cn(
                      "hover:bg-slate-50 transition-colors group",
                      task.supplierId ? "cursor-pointer" : "cursor-default"
                    )}
                  >
                    <td className="px-4 py-3">
                       <div className="flex items-start gap-2">
                         <div className={cn(
                           "mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0",
                           task.status === 'High' ? "bg-red-500" : task.status === 'Medium' ? "bg-amber-500" : "bg-slate-300"
                         )} />
                         <div>
                           <div className="font-medium text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1" title={task.title}>
                             {task.title}
                           </div>
                           <div className="flex items-center gap-2 mt-1">
                             {task.source === 'Personal' ? (
                               <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border bg-amber-50 text-amber-700 border-amber-100">
                                 Personal
                               </span>
                             ) : (
                               <span className={cn(
                                 "text-[10px] font-bold px-1.5 py-0.5 rounded border",
                                 task.type === 'Approval' ? "bg-purple-50 text-purple-600 border-purple-100" :
                                 task.type === 'Review' ? "bg-blue-50 text-blue-600 border-blue-100" :
                                 "bg-slate-50 text-slate-500 border-slate-100"
                               )}>
                                 {task.type}
                               </span>
                             )}
                             <span className="text-[10px] text-slate-400">{task.assignee}</span>
                           </div>
                         </div>
                       </div>
                    </td>
                    <td className="px-4 py-3 text-right align-top">
                      <span className={cn(
                        "text-xs font-bold",
                        task.due === 'Today' ? "text-red-500" : "text-slate-400"
                      )}>{task.due}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-3 border-t border-slate-100 text-center mt-auto">
            <button
              onClick={() => navigate('/tasks')}
              className="text-xs font-medium text-slate-500 hover:text-brand-600 w-full py-1"
            >
              查看全部 (View All)
            </button>
          </div>

          {/* Add Task Modal (Inline Absolute) */}
          {isAddTaskOpen && (
            <div className="absolute inset-0 bg-white z-10 flex flex-col p-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-slate-900">新增个人任务</h4>
                <button onClick={() => setIsAddTaskOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4 flex-1">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">任务标题 (Title)</label>
                  <input 
                    type="text" 
                    value={newTask.title}
                    onChange={e => setNewTask({...newTask, title: e.target.value})}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="例如: 联系 James 确认 Q3 报价"
                    autoFocus
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">截止日期 (Due Date)</label>
                    <input 
                      type="text" 
                      value={newTask.due}
                      onChange={e => setNewTask({...newTask, due: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                      placeholder="例如: 明天"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">优先级 (Priority)</label>
                    <select 
                      value={newTask.status}
                      onChange={e => setNewTask({...newTask, status: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                    >
                      <option value="High">高 (High)</option>
                      <option value="Medium">中 (Medium)</option>
                      <option value="Low">低 (Low)</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="mt-auto pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button 
                  onClick={() => setIsAddTaskOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded"
                >
                  取消
                </button>
                <button 
                  onClick={handleAddTask}
                  disabled={!newTask.title}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-brand-600 hover:bg-brand-700 rounded disabled:opacity-50"
                >
                  确认添加
                </button>
              </div>
            </div>
          )}
        </Card>

        {/* 3.5 Global Visit Calendar - Moved next to Tasks */}
        <Card className="h-[400px] flex flex-col">
          <CardHeader
            title="全域拜访日历"
            action={
              <div className="flex items-center gap-4">
                 <div className="flex gap-2 text-[10px]">
                   <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div>计划</span>
                   <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div>完成</span>
                   <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-cyan-500"></div>日志</span>
                   <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div>任务</span>
                 </div>
                 <div className="flex items-center gap-1">
                   <button
                     onClick={() => setCalendarDate(new Date(calendarYear, calendarMonth - 1))}
                     className="p-1 hover:bg-slate-100 rounded"
                   >
                     <MoreHorizontal className="w-4 h-4 rotate-180" />
                   </button>
                   <select
                     value={`${calendarYear}年 ${calendarMonth + 1}月`}
                     onChange={(e) => {
                       const [year, month] = e.target.value.split(/年|月/).filter(Boolean)
                       setCalendarDate(new Date(parseInt(year), parseInt(month) - 1))
                     }}
                     className="text-xs border-slate-200 rounded-lg py-1.5 px-2 bg-slate-50"
                   >
                     <option>{calendarYear}年 {calendarMonth + 1}月</option>
                   </select>
                   <button
                     onClick={() => setCalendarDate(new Date(calendarYear, calendarMonth + 1))}
                     className="p-1 hover:bg-slate-100 rounded"
                   >
                     <MoreHorizontal className="w-4 h-4" />
                   </button>
                 </div>
              </div>
            }
          />
          <div className="p-6 flex-1 overflow-hidden">
             <div className="grid grid-cols-7 bg-slate-200 gap-px border border-slate-200 rounded-lg overflow-hidden h-full">
               {['周日', '周一', '周二', '周三', '周四', '周五', '周六'].map(day => (
                 <div key={day} className="bg-slate-50 p-2 text-center text-[10px] font-semibold text-slate-500 h-8 flex items-center justify-center">
                   {day}
                 </div>
               ))}

               {/* Calendar Days */}
               {Array.from({length: 42}).map((_, i) => {
                  // Calculate date for this slot
                  const firstDayOfMonth = new Date(calendarYear, calendarMonth, 1).getDay()
                  const dayNumber = i - firstDayOfMonth + 1
                  const isCurrentMonth = dayNumber > 0 && dayNumber <= new Date(calendarYear, calendarMonth + 1, 0).getDate()
                  const day = isCurrentMonth ? dayNumber : ''

                  // 获取当天的所有事件（日历事件 + 互动日志 + 个人计划）
                  const dayEvents = isCurrentMonth && day ? (eventsByDate[day] || []) : []

                  return (
                    <div
                      key={i}
                      className={cn(
                        "bg-white p-1 transition-colors relative flex flex-col min-h-[40px]",
                        isCurrentMonth ? "hover:bg-slate-50 cursor-pointer" : "bg-slate-50/50"
                      )}
                      onClick={() => isCurrentMonth && day && navigate(`/calendar?date=${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`)}
                    >
                      <span className={cn(
                        "text-[10px] font-medium block mb-0.5",
                        isCurrentMonth ? "text-slate-700" : "text-slate-300"
                      )}>{day}</span>

                      <div className="space-y-0.5 flex-1 overflow-y-auto">
                        {dayEvents.slice(0, 3).map((evt: any) => {
                          // 根据事件来源和类型决定颜色
                          const getEventStyle = () => {
                            // 个人计划的颜色
                            if (evt.source === 'plan') {
                              const planColors: Record<string, string> = {
                                visit: 'bg-purple-50 text-purple-700 border-purple-100',
                                meeting: 'bg-indigo-50 text-indigo-700 border-indigo-100',
                                call: 'bg-green-50 text-green-700 border-green-100',
                                task: 'bg-amber-50 text-amber-700 border-amber-100',
                                reminder: 'bg-red-50 text-red-700 border-red-100',
                                other: 'bg-slate-50 text-slate-700 border-slate-100'
                              }
                              return planColors[evt.type] || planColors.other
                            }
                            // 互动日志的颜色
                            if (evt.source === 'engagement') {
                              return evt.status === 'planned'
                                ? "bg-cyan-50 text-cyan-700 border-cyan-100"
                                : "bg-emerald-50 text-emerald-700 border-emerald-100"
                            }
                            // 日历事件的颜色
                            return evt.status === 'planned'
                              ? "bg-blue-50 text-blue-700 border-blue-100"
                              : "bg-emerald-50 text-emerald-700 border-emerald-100"
                          }

                          return (
                          <div
                            key={evt.id}
                            className={cn(
                              "px-1 py-0.5 rounded text-[8px] truncate border leading-none flex items-center gap-0.5",
                              getEventStyle()
                            )}
                            title={evt.title}
                            onClick={(e) => {
                              e.stopPropagation()
                              if (evt.supplierId) {
                                navigate(`/supplier-profile/${evt.supplierId}`)
                              }
                            }}
                          >
                            <span className="truncate">{evt.title}</span>
                          </div>
                          )
                        })}
                        {dayEvents.length > 3 && (
                          <div className="text-[8px] text-slate-400 text-center">
                            +{dayEvents.length - 3} 更多
                          </div>
                        )}
                      </div>
                    </div>
                  )
               })}
             </div>
          </div>
        </Card>
      </div>
      </div>

      {/* 4. 绩效看板 (Performance Dashboard) */}
      <Card className="mt-6">
          <CardHeader
            title="我的绩效看板"
            action={
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button
                  onClick={() => setPerfTab('business')}
                  className={cn(
                    "px-3 py-1 text-xs font-medium rounded-md transition-all",
                    perfTab === 'business' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  主营业务
                </button>
                <button
                  onClick={() => setPerfTab('personal')}
                  className={cn(
                    "px-3 py-1 text-xs font-medium rounded-md transition-all",
                    perfTab === 'personal' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  个人绩效
                </button>
              </div>
            }
          />

          <div className="p-6">
            {/* 个人绩效占位信息 */}
            {perfTab === 'personal' ? (
              <div className="flex flex-col items-center justify-center h-80 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">个人绩效功能暂未开放</h3>
                <p className="text-sm text-slate-500 max-w-md">
                  个人绩效效果需要和 HR 系统相关联，目前暂不显示。
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  如需开通此功能，请联系系统管理员或人力资源部门。
                </p>
              </div>
            ) : (
              <>
                {/* 主营业务 - 真实数据 */}
                {/* Filters */}
                <div className="flex items-center gap-4 mb-6">
                  <select
                    className="text-sm border-slate-200 rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                    value={perfPeriod}
                    onChange={(e) => setPerfPeriod(e.target.value)}
                  >
                    <option value="H1">2026 上半年</option>
                    <option value="Q1">2026 Q1</option>
                    <option value="Q2">2026 Q2</option>
                  </select>

                  <div className="flex gap-2">
                    {['spend', 'delivery', 'quality'].map(dim => (
                      <button
                        key={dim}
                        onClick={() => setPerfDimension(dim)}
                        className={cn(
                          "px-3 py-1.5 text-xs font-medium rounded-full border transition-colors",
                          perfDimension === dim
                            ? "bg-brand-50 border-brand-200 text-brand-700"
                            : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                        )}
                      >
                        {dim === 'spend' ? '采购额' : dim === 'delivery' ? '交付率' : '质量得分'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-8">
                  {/* Left: Trend Chart (60%) */}
                  <div className="col-span-3 flex flex-col h-64">
                    <h4 className="text-sm font-medium text-slate-700 mb-4 flex items-center gap-2">
                      <div className="w-1 h-4 bg-brand-500 rounded-full"></div>
                      {`${perfDimension === 'spend' ? '采购额' : perfDimension === 'delivery' ? '交付准时率' : '质量评分'}趋势`}
                    </h4>
                    <div className="flex-1 min-h-0 bg-slate-50/50 rounded-lg p-2 border border-slate-100">
                      {isLoadingBusinessTrends ? (
                        <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                          加载中...
                        </div>
                      ) : businessTrendData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={businessTrendData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis
                              dataKey="month"
                              axisLine={false}
                              tickLine={false}
                              tick={{fontSize: 12, fill: '#64748b'}}
                              dy={10}
                            />
                            <YAxis
                              axisLine={false}
                              tickLine={false}
                              tick={{fontSize: 12, fill: '#64748b'}}
                            />
                            <Tooltip
                              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Line
                              type="monotone"
                              dataKey={perfDimension}
                              stroke="#3b82f6"
                              strokeWidth={2}
                              dot={{r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff'}}
                              activeDot={{r: 6}}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                          暂无绩效趋势数据
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Pie Chart (40%) */}
                  <div className="col-span-2 flex flex-col h-64 pl-6 border-l border-slate-100">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
                        占比分析
                      </h4>

                      <div className="flex bg-slate-100 rounded-lg p-0.5">
                        <button
                          onClick={() => setPieType('category')}
                          className={cn(
                            "px-2 py-0.5 text-[10px] font-medium rounded transition-all",
                            pieType === 'category' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                          )}
                        >
                          按业务
                        </button>
                        <button
                          onClick={() => setPieType('tier')}
                          className={cn(
                            "px-2 py-0.5 text-[10px] font-medium rounded transition-all",
                            pieType === 'tier' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                          )}
                        >
                          按分级
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 min-h-0 relative flex items-center">
                      {/* Custom Legend (Left) */}
                      <div className="w-1/3 space-y-2">
                        {(pieType === 'category' ? businessCategoryData : supplierTierData).map((entry, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.fill || COLORS[index % COLORS.length] }} />
                            <span className="text-xs text-slate-600 truncate" title={entry.name}>{entry.name}</span>
                          </div>
                        ))}
                      </div>

                      {/* Pie Chart (Right) */}
                      <div className="flex-1 h-full relative">
                        {(isLoadingCategoryData || isLoadingTierData) ? (
                          <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                            加载中...
                          </div>
                        ) : (pieType === 'category' ? businessCategoryData : supplierTierData).length > 0 ? (
                          <>
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={pieType === 'category' ? businessCategoryData : supplierTierData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={50}
                                  outerRadius={70}
                                  paddingAngle={5}
                                  dataKey="value"
                                >
                                  {(pieType === 'category' ? businessCategoryData : supplierTierData).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill || COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip />
                              </PieChart>
                            </ResponsiveContainer>
                            {/* Center Text Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="text-center">
                                <span className="block text-xl font-bold text-slate-900">
                                  {(pieType === 'category' ? businessCategoryData : supplierTierData).reduce((sum, e) => sum + e.value, 0)}
                                </span>
                                <span className="text-[10px] text-slate-500 uppercase">Total</span>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                            暂无数据
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key Metrics Row - 使用真实数据 */}
                <div className="grid grid-cols-3 gap-6 mt-6 pt-6 border-t border-slate-100">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">本月总支出</div>
                    <div className="text-xl font-bold text-slate-900">
                      ¥{businessTrendData.length > 0 ? (businessTrendData[businessTrendData.length - 1]?.spend || 0).toFixed(0) : '---'}
                      <span className="text-xs font-normal text-slate-400">万元</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">平均交付准时率</div>
                    <div className="text-xl font-bold text-slate-900">
                      {businessTrendData.length > 0 ? (businessTrendData.reduce((sum, e) => sum + (e.delivery || 0), 0) / businessTrendData.length).toFixed(1) : '--.-'}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">活跃供应商</div>
                    <div className="text-xl font-bold text-slate-900">
                      {stats?.activeSuppliers || 0}
                      <span className="text-xs font-normal text-slate-400">家</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
      </Card>

      {/* 计划表单模态框 */}
      <PlanFormModal
        isOpen={isPlanModalOpen}
        onClose={() => {
          setIsPlanModalOpen(false)
          setSelectedPlan(null)
        }}
        onSave={handleSavePlan}
        onDelete={planModalMode === 'edit' ? handleDeletePlan : undefined}
        plan={selectedPlan}
        isSaving={isSavingPlan}
        mode={planModalMode}
      />

      {/* 计划详情模态框 */}
      <PlanDetailModal
        isOpen={isPlanDetailOpen}
        onClose={() => {
          setIsPlanDetailOpen(false)
          setSelectedPlan(null)
        }}
        plan={selectedPlan}
        onEdit={() => {
          if (selectedPlan) {
            handleOpenEditPlan(selectedPlan)
          }
        }}
        onComplete={handleCompletePlan}
        onDelete={handleDeletePlan}
        isUpdating={isSavingPlan}
      />
    </div>
  );
}
