-- =====================================================
-- SRM 供应商关系管理系统 - Supabase 数据库架构
-- =====================================================
-- 创建日期: 2026-02-09
-- PostgreSQL 15+ / Supabase
-- =====================================================

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- 用于模糊搜索

-- =====================================================
-- 1. 供应商主表 (suppliers)
-- =====================================================
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,  -- 如 V-MSK-SH
  name VARCHAR(255) NOT NULL,
  local_name VARCHAR(255),
  logo_text VARCHAR(10),  -- 用于显示的简称首字母

  -- 状态和层级
  tier VARCHAR(20) NOT NULL DEFAULT 'probation' CHECK (tier IN ('strategic', 'core', 'backup', 'probation', 'blacklisted')),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blacklisted')),
  stage VARCHAR(20) DEFAULT 'leads' CHECK (stage IN ('leads', 'probation', 'active', 'blacklist')),  -- 生命周期阶段

  -- 基本信息
  category VARCHAR(100),  -- Ocean Carrier, Forwarder, Logistics 等
  location VARCHAR(255),
  address TEXT,
  contact_phone VARCHAR(50),
  website VARCHAR(255),
  structure TEXT,  -- 公司结构描述

  -- 财务信息 (4D 模型)
  financial_interval VARCHAR(20) CHECK (financial_interval IN ('monthly', 'semi_monthly', 'weekly', 'per_shipment')),
  financial_anchor VARCHAR(20) CHECK (financial_anchor IN ('etd', 'eta', 'gate_in', 'invoice_date')),
  financial_period INTEGER DEFAULT 0,  -- 账期天数

  -- 绩效相关
  system_score DECIMAL(5,2) DEFAULT 0,  -- 系统评分 0-100
  evaluation_period VARCHAR(20) DEFAULT 'quarterly' CHECK (evaluation_period IN ('monthly', 'quarterly', 'annual')),

  -- 门户权限
  portal_demand_broadcast BOOLEAN DEFAULT false,
  portal_empowerment_center BOOLEAN DEFAULT false,
  portal_ticket_system BOOLEAN DEFAULT false,
  portal_performance_view BOOLEAN DEFAULT false,

  -- 元数据
  tags TEXT[],  -- PostgreSQL 数组类型
  scarce_resources TEXT[],  -- 稀缺资源列表
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  notes TEXT
);

-- 创建索引
CREATE INDEX idx_suppliers_tier ON suppliers(tier);
CREATE INDEX idx_suppliers_status ON suppliers(status);
CREATE INDEX idx_suppliers_stage ON suppliers(stage);
CREATE INDEX idx_suppliers_name ON suppliers USING gin(name gin_trgm_ops);  -- 全文搜索
CREATE INDEX idx_suppliers_local_name ON suppliers USING gin(local_name gin_trgm_ops);
CREATE INDEX idx_suppliers_code ON suppliers(code);

-- =====================================================
-- 2. 业务线表 (business_lines)
-- =====================================================
CREATE TABLE business_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,

  type VARCHAR(100) NOT NULL,  -- 海运、空运、铁路等
  description TEXT,
  carriers TEXT[],  -- 承运人列表，如 ['Matson', 'COSCO']
  routes TEXT[],    -- 航线列表，如 ['North America', 'Europe']

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_business_lines_supplier ON business_lines(supplier_id);

-- =====================================================
-- 3. 业务线联系人表 (business_line_contacts)
-- =====================================================
CREATE TABLE business_line_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_line_id UUID NOT NULL REFERENCES business_lines(id) ON DELETE CASCADE,

  name VARCHAR(255) NOT NULL,
  title VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255),
  is_primary BOOLEAN DEFAULT false
);

-- =====================================================
-- 4. 决策链成员表 (decision_chain)
-- =====================================================
CREATE TABLE decision_chain (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,

  name VARCHAR(255) NOT NULL,
  title VARCHAR(255),
  layer VARCHAR(20) NOT NULL CHECK (layer IN ('Decision', 'Execution', 'Operation')),
  role VARCHAR(50) NOT NULL CHECK (role IN ('Decision Maker', 'Influencer', 'Executor')),
  affinity INTEGER DEFAULT 1 CHECK (affinity BETWEEN 1 AND 5),  -- 亲密度 1-5

  phone VARCHAR(50),
  email VARCHAR(255),
  tags TEXT[],  -- 个人特征标签
  conquest_record TEXT,  -- 征服记录

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_decision_chain_supplier ON decision_chain(supplier_id);

-- =====================================================
-- 5. 决策链关联资源表 (decision_chain_resources)
-- =====================================================
CREATE TABLE decision_chain_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  decision_chain_id UUID NOT NULL REFERENCES decision_chain(id) ON DELETE CASCADE,

  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('Association', 'Person', 'Company', 'Official')),
  description TEXT
);

CREATE INDEX idx_decision_chain_resources_person ON decision_chain_resources(decision_chain_id);

-- =====================================================
-- 6. 互动日志表 (engagement_logs)
-- =====================================================
CREATE TABLE engagement_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,

  -- 日志状态
  status VARCHAR(20) NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'completed', 'cancelled')),
  log_type VARCHAR(20) DEFAULT 'Regular' CHECK (log_type IN ('QBR', 'Regular', 'Visit', 'Call', 'Email')),

  -- P - Plan (计划)
  planned_date DATE,
  title VARCHAR(500) NOT NULL,
  goal TEXT,  -- SMART 目标
  participants TEXT,  -- 参与人列表

  -- A - Action/Check (执行/检查)
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),  -- 评分 1-5
  outcome TEXT,  -- 主要成果/洞察

  -- C - Content (内容 - 双维维护)
  dimension_basic TEXT,      -- 基本信息变更
  dimension_business TEXT,   -- 主营业务特点
  dimension_decision TEXT,   -- 决策链特点
  dimension_derivative TEXT, -- 衍生资源

  -- D - Delivery (交付)
  next_steps TEXT,
  action_remarks TEXT,

  -- 元数据
  tags TEXT[],
  author_id UUID,
  author_name VARCHAR(100),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_engagement_logs_supplier ON engagement_logs(supplier_id);
CREATE INDEX idx_engagement_logs_date ON engagement_logs(planned_date);
CREATE INDEX idx_engagement_logs_status ON engagement_logs(status);

-- =====================================================
-- 7. 绩效历史表 (performance_history)
-- =====================================================
CREATE TABLE performance_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,

  evaluation_date DATE NOT NULL,
  period VARCHAR(20),  -- 如 '2024 Q1'
  score DECIMAL(5,2) NOT NULL CHECK (score BETWEEN 0 AND 100),

  rater_id UUID,
  rater_name VARCHAR(100),
  comment TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_performance_history_supplier ON performance_history(supplier_id);
CREATE INDEX idx_performance_history_date ON performance_history(evaluation_date);

-- =====================================================
-- 8. 绩效配置维度表 (performance_dimensions)
-- =====================================================
CREATE TABLE performance_dimensions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,

  dimension_id VARCHAR(50) NOT NULL,  -- 如 'cost', 'quality', 'delivery'
  name VARCHAR(100) NOT NULL,
  weight INTEGER NOT NULL CHECK (weight BETWEEN 0 AND 100),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(supplier_id, dimension_id)
);

-- =====================================================
-- 9. 任务表 (tasks)
-- =====================================================
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  title VARCHAR(500) NOT NULL,
  description TEXT,

  -- 任务分类
  task_type VARCHAR(20) CHECK (task_type IN ('Approval', 'Review', 'Doc', 'Follow-up', 'Personal')),
  priority VARCHAR(20) DEFAULT 'Medium' CHECK (priority IN ('High', 'Medium', 'Low')),

  -- 关联
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  target_tab VARCHAR(50),  -- 如 'asset', 'performance', 'engagement'
  action_param VARCHAR(50),  -- 如 'score_modal', 'log_modal'

  -- 状态
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  due_date DATE,

  -- 分配
  assignee_id UUID,
  assignee_name VARCHAR(100),

  -- 来源
  source VARCHAR(20) DEFAULT 'System' CHECK (source IN ('System', 'Personal')),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_tasks_supplier ON tasks(supplier_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- =====================================================
-- 10. 风险预警表 (risk_alerts)
-- =====================================================
CREATE TABLE risk_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,

  alert_type VARCHAR(50) NOT NULL,  -- '资质过期', '准时率低', '单一依赖', '绩效下滑'
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('High', 'Medium', 'Low')),

  title VARCHAR(255) NOT NULL,
  description TEXT,

  -- 触发条件
  trigger_metric VARCHAR(50),  -- 如 'on_time_rate', 'performance_score'
  trigger_value DECIMAL(10,2),
  threshold_value DECIMAL(10,2),

  -- 状态
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'ignored')),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_risk_alerts_supplier ON risk_alerts(supplier_id);
CREATE INDEX idx_risk_alerts_status ON risk_alerts(status);
CREATE INDEX idx_risk_alerts_severity ON risk_alerts(severity);

-- =====================================================
-- 11. 考察任务表 (probation_tasks)
-- =====================================================
CREATE TABLE probation_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,

  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  deadline DATE NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_probation_tasks_supplier ON probation_tasks(supplier_id);
CREATE INDEX idx_probation_tasks_status ON probation_tasks(status);

-- =====================================================
-- 12. 日历事件表 (calendar_events)
-- =====================================================
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  title VARCHAR(255) NOT NULL,
  event_date DATE NOT NULL,
  event_type VARCHAR(20) CHECK (event_type IN ('visit', 'meeting', 'call', 'task', 'other')),
  status VARCHAR(20) DEFAULT 'planned' CHECK (status IN ('planned', 'completed', 'cancelled')),

  -- 关联
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,

  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);

CREATE INDEX idx_calendar_events_date ON calendar_events(event_date);
CREATE INDEX idx_calendar_events_supplier ON calendar_events(supplier_id);

-- =====================================================
-- 13. 系统配置表 (system_settings)
-- =====================================================
CREATE TABLE system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,

  -- 配置类型
  setting_type VARCHAR(50) NOT NULL,  -- 'financial', 'portal', 'tiering', 'performance'
  setting_key VARCHAR(100) NOT NULL,
  setting_value TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(supplier_id, setting_type, setting_key)
);

-- =====================================================
-- 14. 生命周期事件表 (lifecycle_events)
-- =====================================================
CREATE TABLE lifecycle_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,

  event_type VARCHAR(50) NOT NULL,  -- 'created', 'stage_changed', 'tier_changed', 'blacklisted'
  from_stage VARCHAR(20),
  to_stage VARCHAR(20),
  from_tier VARCHAR(20),
  to_tier VARCHAR(20),

  reason TEXT,
  changed_by UUID,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lifecycle_events_supplier ON lifecycle_events(supplier_id);
CREATE INDEX idx_lifecycle_events_date ON lifecycle_events(created_at);

-- =====================================================
-- 15. 操作审计表 (audit_logs)
-- =====================================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  table_name VARCHAR(100) NOT NULL,
  record_id UUID NOT NULL,
  action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),

  old_data JSONB,
  new_data JSONB,

  changed_by UUID,
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

CREATE INDEX idx_audit_logs_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_date ON audit_logs(changed_at);

-- =====================================================
-- 触发器：自动更新 updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为需要的表添加触发器
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_decision_chain_updated_at BEFORE UPDATE ON decision_chain
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_engagement_logs_updated_at BEFORE UPDATE ON engagement_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 视图：供应商汇总 (supplier_summary)
-- =====================================================
CREATE OR REPLACE VIEW supplier_summary AS
SELECT
    s.id,
    s.code,
    s.name,
    s.local_name,
    s.logo_text,
    s.category,
    s.tier,
    s.status,
    s.stage,
    s.location,
    s.system_score AS performance_score,
    s.tags,
    s.scarce_resources,
    COALESCE(SUM(ph.score), 0) AS total_spend_amount,  -- 占位，实际应从订单表计算
    COUNT(DISTINCT bl.id) AS business_line_count
FROM suppliers s
LEFT JOIN business_lines bl ON s.id = bl.supplier_id
LEFT JOIN performance_history ph ON s.id = ph.supplier_id
GROUP BY s.id;

-- =====================================================
-- RLS (Row Level Security) 策略
-- =====================================================

-- 启用 RLS（可选，根据多租户需求）
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision_chain ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- 任务表 RLS 策略：用户只能操作自己的任务
CREATE POLICY "Users can view their own tasks" ON tasks
  FOR SELECT USING (auth.uid() = assignee_id);

CREATE POLICY "Users can create their own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = assignee_id);

CREATE POLICY "Users can update their own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = assignee_id);

CREATE POLICY "Users can delete their own tasks" ON tasks
  FOR DELETE USING (auth.uid() = assignee_id);

-- 示例策略：用户只能看到自己创建的记录（需要 authentication）
-- CREATE POLICY "Users can view their own suppliers" ON suppliers
--   FOR SELECT USING (auth.uid() = created_by);

-- =====================================================
-- 初始化数据字典
-- =====================================================

-- 供应商层级配置（可作为配置表或存储在系统设置中）
-- strategic: 年合作金额 > $5M 且 绩效评分 > 90
-- core: 年合作金额 > $1M 且 绩效评分 > 80
-- backup: 已通过考察试单
-- probation: 新注册或绩效不达标

-- 财务账期配置
-- monthly: 月结
-- semi_monthly: 半月结
-- weekly: 周结
-- per_shipment: 票结

-- 账期锚点配置
-- etd: 开船日
-- eta: 到港日
-- gate_in: 入仓日
-- invoice_date: 账单日

COMMENT ON TABLE suppliers IS '供应商主表';
COMMENT ON TABLE business_lines IS '业务线表';
COMMENT ON TABLE decision_chain IS '决策链成员表';
COMMENT ON TABLE engagement_logs IS '互动日志表（双维维护：业务特点+决策链特点）';
COMMENT ON TABLE performance_history IS '绩效历史记录表';
COMMENT ON TABLE tasks IS '任务表（系统任务+个人任务）';
COMMENT ON TABLE risk_alerts IS '风险预警表';
COMMENT ON TABLE probation_tasks IS '考察任务表';
COMMENT ON TABLE calendar_events IS '日历事件表';
COMMENT ON TABLE lifecycle_events IS '生命周期事件表';
COMMENT ON TABLE audit_logs IS '操作审计表';
