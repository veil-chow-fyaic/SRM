export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          changed_at: string | null
          changed_by: string | null
          id: string
          ip_address: unknown
          new_data: Json | null
          old_data: Json | null
          record_id: string
          table_name: string
          user_agent: string | null
        }
        Insert: {
          action: string
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          record_id: string
          table_name: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string
          table_name?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          id: string
          code: string
          name: string
          local_name: string | null
          logo_text: string | null
          tier: string
          status: string
          stage: string | null
          category: string | null
          location: string | null
          address: string | null
          contact_phone: string | null
          website: string | null
          structure: string | null
          financial_interval: string | null
          financial_anchor: string | null
          financial_period: number | null
          system_score: number | null
          evaluation_period: string | null
          portal_demand_broadcast: boolean | null
          portal_empowerment_center: boolean | null
          portal_ticket_system: boolean | null
          portal_performance_view: boolean | null
          tags: string[] | null
          scarce_resources: string[] | null
          created_at: string | null
          updated_at: string | null
          created_by: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          code: string
          name: string
          local_name?: string | null
          logo_text?: string | null
          tier?: string
          status?: string
          stage?: string | null
          category?: string | null
          location?: string | null
          address?: string | null
          contact_phone?: string | null
          website?: string | null
          structure?: string | null
          financial_interval?: string | null
          financial_anchor?: string | null
          financial_period?: number | null
          system_score?: number | null
          evaluation_period?: string | null
          portal_demand_broadcast?: boolean | null
          portal_empowerment_center?: boolean | null
          portal_ticket_system?: boolean | null
          portal_performance_view?: boolean | null
          tags?: string[] | null
          scarce_resources?: string[] | null
          created_at?: string | null
          updated_at?: string | null
          created_by?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          code?: string
          name?: string
          local_name?: string | null
          logo_text?: string | null
          tier?: string
          status?: string
          stage?: string | null
          category?: string | null
          location?: string | null
          address?: string | null
          contact_phone?: string | null
          website?: string | null
          structure?: string | null
          financial_interval?: string | null
          financial_anchor?: string | null
          financial_period?: number | null
          system_score?: number | null
          evaluation_period?: string | null
          portal_demand_broadcast?: boolean | null
          portal_empowerment_center?: boolean | null
          portal_ticket_system?: boolean | null
          portal_performance_view?: boolean | null
          tags?: string[] | null
          scarce_resources?: string[] | null
          created_at?: string | null
          updated_at?: string | null
          created_by?: string | null
          notes?: string | null
        }
        Relationships: []
      }
      decision_chain: {
        Row: {
          id: string
          supplier_id: string
          name: string
          title: string | null
          layer: string
          role: string
          affinity: number | null
          phone: string | null
          email: string | null
          tags: string[] | null
          conquest_record: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          supplier_id: string
          name: string
          title?: string | null
          layer: string
          role: string
          affinity?: number | null
          phone?: string | null
          email?: string | null
          tags?: string[] | null
          conquest_record?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          supplier_id?: string
          name?: string
          title?: string | null
          layer?: string
          role?: string
          affinity?: number | null
          phone?: string | null
          email?: string | null
          tags?: string[] | null
          conquest_record?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "decision_chain_supplier_id_fkey"
            columns: ["supplier_id"]
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          }
        ]
      }
      engagement_logs: {
        Row: {
          id: string
          supplier_id: string
          status: string
          log_type: string | null
          planned_date: string | null
          title: string
          goal: string | null
          participants: string | null
          rating: number | null
          outcome: string | null
          dimension_basic: string | null
          dimension_business: string | null
          dimension_decision: string | null
          dimension_derivative: string | null
          next_steps: string | null
          action_remarks: string | null
          tags: string[] | null
          author_id: string | null
          author_name: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          supplier_id: string
          status?: string
          log_type?: string | null
          planned_date?: string | null
          title: string
          goal?: string | null
          participants?: string | null
          rating?: number | null
          outcome?: string | null
          dimension_basic?: string | null
          dimension_business?: string | null
          dimension_decision?: string | null
          dimension_derivative?: string | null
          next_steps?: string | null
          action_remarks?: string | null
          tags?: string[] | null
          author_id?: string | null
          author_name?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          supplier_id?: string
          status?: string
          log_type?: string | null
          planned_date?: string | null
          title?: string
          goal?: string | null
          participants?: string | null
          rating?: number | null
          outcome?: string | null
          dimension_basic?: string | null
          dimension_business?: string | null
          dimension_decision?: string | null
          dimension_derivative?: string | null
          next_steps?: string | null
          action_remarks?: string | null
          tags?: string[] | null
          author_id?: string | null
          author_name?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      performance_history: {
        Row: {
          id: string
          supplier_id: string
          evaluation_date: string
          period: string | null
          score: number
          rater_id: string | null
          rater_name: string | null
          comment: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          supplier_id: string
          evaluation_date: string
          period?: string | null
          score: number
          rater_id?: string | null
          rater_name?: string | null
          comment?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          supplier_id?: string
          evaluation_date?: string
          period?: string | null
          score?: number
          rater_id?: string | null
          rater_name?: string | null
          comment?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          task_type: string | null
          priority: string | null
          supplier_id: string | null
          target_tab: string | null
          action_param: string | null
          status: string | null
          due_date: string | null
          assignee_id: string | null
          assignee_name: string | null
          source: string | null
          created_at: string | null
          updated_at: string | null
          completed_at: string | null
          plan_type: string | null
          start_time: string | null
          end_time: string | null
          location: string | null
          sync_to_calendar: boolean | null
          calendar_event_id: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          task_type?: string | null
          priority?: string | null
          supplier_id?: string | null
          target_tab?: string | null
          action_param?: string | null
          status?: string | null
          due_date?: string | null
          assignee_id?: string | null
          assignee_name?: string | null
          source?: string | null
          created_at?: string | null
          updated_at?: string | null
          completed_at?: string | null
          plan_type?: string | null
          start_time?: string | null
          end_time?: string | null
          location?: string | null
          sync_to_calendar?: boolean | null
          calendar_event_id?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          task_type?: string | null
          priority?: string | null
          supplier_id?: string | null
          target_tab?: string | null
          action_param?: string | null
          status?: string | null
          due_date?: string | null
          assignee_id?: string | null
          assignee_name?: string | null
          source?: string | null
          created_at?: string | null
          updated_at?: string | null
          completed_at?: string | null
          plan_type?: string | null
          start_time?: string | null
          end_time?: string | null
          location?: string | null
          sync_to_calendar?: boolean | null
          calendar_event_id?: string | null
        }
        Relationships: []
      }
      business_lines: {
        Row: {
          id: string
          supplier_id: string
          type: string
          description: string | null
          carriers: string[] | null
          routes: string[] | null
          created_at: string | null
        }
        Insert: {
          id?: string
          supplier_id: string
          type: string
          description?: string | null
          carriers?: string[] | null
          routes?: string[] | null
          created_at?: string | null
        }
        Update: {
          id?: string
          supplier_id?: string
          type?: string
          description?: string | null
          carriers?: string[] | null
          routes?: string[] | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_lines_supplier_id_fkey"
            columns: ["supplier_id"]
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          }
        ]
      }
      business_line_contacts: {
        Row: {
          id: string
          business_line_id: string
          name: string
          title: string | null
          phone: string | null
          email: string | null
          is_primary: boolean | null
        }
        Insert: {
          id?: string
          business_line_id: string
          name: string
          title?: string | null
          phone?: string | null
          email?: string | null
          is_primary?: boolean | null
        }
        Update: {
          id?: string
          business_line_id?: string
          name?: string
          title?: string | null
          phone?: string | null
          email?: string | null
          is_primary?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "business_line_contacts_business_line_id_fkey"
            columns: ["business_line_id"]
            referencedRelation: "business_lines"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      supplier_summary: {
        Row: {
          id: string | null
          code: string | null
          name: string | null
          local_name: string | null
          logo_text: string | null
          category: string | null
          tier: string | null
          status: string | null
          stage: string | null
          location: string | null
          performance_score: number | null
          tags: string[] | null
          scarce_resources: string[] | null
          total_spend_amount: number | null
          business_line_count: number | null
        }
        Relationships: []
      }
    }
  }
}

// 便捷类型导出
export type Supplier = Database['public']['Tables']['suppliers']['Row']
export type SupplierInsert = Database['public']['Tables']['suppliers']['Insert']
export type SupplierUpdate = Database['public']['Tables']['suppliers']['Update']

export type DecisionChain = Database['public']['Tables']['decision_chain']['Row']
export type DecisionChainInsert = Database['public']['Tables']['decision_chain']['Insert']
export type DecisionChainUpdate = Database['public']['Tables']['decision_chain']['Update']

export type EngagementLog = Database['public']['Tables']['engagement_logs']['Row']
export type EngagementLogInsert = Database['public']['Tables']['engagement_logs']['Insert']
export type EngagementLogUpdate = Database['public']['Tables']['engagement_logs']['Update']

export type PerformanceHistory = Database['public']['Tables']['performance_history']['Row']
export type PerformanceHistoryInsert = Database['public']['Tables']['performance_history']['Insert']

export type Task = Database['public']['Tables']['tasks']['Row']
export type TaskInsert = Database['public']['Tables']['tasks']['Insert']
export type TaskUpdate = Database['public']['Tables']['tasks']['Update']

export type BusinessLine = Database['public']['Tables']['business_lines']['Row']
export type BusinessLineInsert = Database['public']['Tables']['business_lines']['Insert']

export type BusinessLineContact = Database['public']['Tables']['business_line_contacts']['Row']
export type BusinessLineContactInsert = Database['public']['Tables']['business_line_contacts']['Insert']
export type BusinessLineContactUpdate = Database['public']['Tables']['business_line_contacts']['Update']

export type SupplierSummary = Database['public']['Views']['supplier_summary']['Row']

// Profile 类型（手动定义，因为 profiles 表不在自动生成的类型中）
export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  role: string | null
  created_at: string | null
  updated_at: string | null
}

export interface ProfileInsert {
  id: string
  email?: string | null
  full_name?: string | null
  avatar_url?: string | null
  role?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface ProfileUpdate {
  email?: string | null
  full_name?: string | null
  avatar_url?: string | null
  role?: string | null
  updated_at?: string | null
}

// 供应商层级枚举
export type SupplierTier = 'strategic' | 'core' | 'backup' | 'probation' | 'blacklisted'
export type SupplierStatus = 'active' | 'inactive' | 'blacklisted'
export type SupplierStage = 'leads' | 'probation' | 'active' | 'blacklist'

// 决策链层级枚举
export type DecisionLayer = 'Decision' | 'Execution' | 'Operation'
export type DecisionRole = 'Decision Maker' | 'Influencer' | 'Executor'

// 互动日志枚举
export type LogStatus = 'planned' | 'completed' | 'cancelled'
export type LogType = 'QBR' | 'Regular' | 'Visit' | 'Call' | 'Email'

// 任务枚举
export type TaskType = 'Approval' | 'Review' | 'Doc' | 'Follow-up' | 'Personal'
export type TaskPriority = 'High' | 'Medium' | 'Low'
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'

// 供应商修改记录类型
export type ChangeType = 'basic' | 'business' | 'decision' | 'derivative' | 'portal' | 'financial'

export interface SupplierChangeLog {
  id: string
  supplier_id: string
  change_type: ChangeType
  change_title: string
  change_description: string | null
  old_value: Json | null
  new_value: Json | null
  changed_fields: string[] | null
  author_id: string | null
  author_name: string | null
  created_at: string
  engagement_log_id?: string | null
}

export interface SupplierChangeLogInsert {
  supplier_id: string
  change_type: ChangeType
  change_title: string
  change_description?: string | null
  old_value?: Json | null
  new_value?: Json | null
  changed_fields?: string[] | null
  author_id?: string | null
  author_name?: string | null
  engagement_log_id?: string | null
}

// RPC 函数返回类型
export interface UpdateSupplierWithLogResult {
  success: boolean
  supplier: Supplier | null
  changed_fields: string[] | null
  log_id: string | null
  error?: string
}

// 个人计划类型
export type PlanType = 'visit' | 'meeting' | 'call' | 'task' | 'reminder' | 'other'

// 个人计划接口
export interface PersonalPlan {
  id: string
  title: string
  description: string | null
  plan_type: PlanType | null
  priority: TaskPriority | null
  status: TaskStatus | null
  due_date: string | null
  start_time: string | null
  end_time: string | null
  location: string | null
  supplier_id: string | null
  assignee_name: string | null
  created_at: string | null
  updated_at: string | null
  sync_to_calendar: boolean | null
  calendar_event_id: string | null
}

// 创建个人计划参数
export interface CreatePersonalPlanParams {
  title: string
  description?: string
  plan_type?: PlanType
  priority?: TaskPriority
  due_date?: string
  start_time?: string
  end_time?: string
  location?: string
  supplier_id?: string
  sync_to_calendar?: boolean
}

// 同步计划到日历的结果
export interface SyncPlanToCalendarResult {
  success: boolean
  event_id?: string
  action?: 'created' | 'updated' | 'deleted'
  error?: string
}
