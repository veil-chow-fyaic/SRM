-- ================================================
-- 修复 Supabase 后端安全漏洞
-- ================================================

-- 1. 为未启用 RLS 的表启用 RLS
-- ================================================

ALTER TABLE performance_dimensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE probation_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE lifecycle_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 2. 删除所有过度宽松的 RLS 策略
-- ================================================

DROP POLICY IF EXISTS "Allow public access on business_line_contacts" ON business_line_contacts;
DROP POLICY IF EXISTS "Allow public access on business_lines" ON business_lines;
DROP POLICY IF EXISTS "Allow public access on decision_chain" ON decision_chain;
DROP POLICY IF EXISTS "Allow public access on decision_chain_resources" ON decision_chain_resources;
DROP POLICY IF EXISTS "Allow public access on engagement_logs" ON engagement_logs;
DROP POLICY IF EXISTS "Allow public access on performance_history" ON performance_history;
DROP POLICY IF EXISTS "Allow public delete access on suppliers" ON suppliers;
DROP POLICY IF EXISTS "Allow public insert access on suppliers" ON suppliers;
DROP POLICY IF EXISTS "Allow public update access on suppliers" ON suppliers;
DROP POLICY IF EXISTS "Allow public access on tasks" ON tasks;

-- 3. 创建新的 RLS 策略（临时：允许所有操作，用于开发测试）
-- ⚠️ 警告：生产环境需要基于用户认证的真实策略
-- ================================================

-- business_line_contacts
CREATE POLICY "Allow authenticated access on business_line_contacts"
  ON business_line_contacts
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- business_lines
CREATE POLICY "Allow authenticated access on business_lines"
  ON business_lines
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- decision_chain
CREATE POLICY "Allow authenticated access on decision_chain"
  ON decision_chain
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- decision_chain_resources
CREATE POLICY "Allow authenticated access on decision_chain_resources"
  ON decision_chain_resources
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- engagement_logs
CREATE POLICY "Allow authenticated access on engagement_logs"
  ON engagement_logs
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- performance_history
CREATE POLICY "Allow authenticated access on performance_history"
  ON performance_history
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- suppliers
CREATE POLICY "Allow authenticated select on suppliers"
  ON suppliers
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated insert on suppliers"
  ON suppliers
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update on suppliers"
  ON suppliers
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete on suppliers"
  ON suppliers
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- tasks
CREATE POLICY "Allow authenticated access on tasks"
  ON tasks
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- performance_dimensions
CREATE POLICY "Allow authenticated access on performance_dimensions"
  ON performance_dimensions
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- risk_alerts
CREATE POLICY "Allow authenticated access on risk_alerts"
  ON risk_alerts
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- probation_tasks
CREATE POLICY "Allow authenticated access on probation_tasks"
  ON probation_tasks
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- system_settings
CREATE POLICY "Allow authenticated access on system_settings"
  ON system_settings
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- lifecycle_events
CREATE POLICY "Allow authenticated access on lifecycle_events"
  ON lifecycle_events
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- calendar_events
CREATE POLICY "Allow authenticated access on calendar_events"
  ON calendar_events
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- audit_logs (只读)
CREATE POLICY "Allow authenticated read on audit_logs"
  ON audit_logs
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- 4. 修复函数 search_path
-- ================================================

CREATE OR REPLACE FUNCTION search_suppliers_by_name(search_term text)
RETURNS TABLE (
  id uuid,
  name varchar,
  local_name varchar,
  tier varchar,
  status varchar,
  score numeric
)
LANGUAGE plpgsql
SEARCH_PATH ''
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.name,
    s.local_name,
    s.tier,
    s.status,
    s.system_score
  FROM suppliers s
  WHERE
    s.name ILIKE '%' || search_term || '%'
    OR s.local_name ILIKE '%' || search_term || '%'
  ORDER BY s.name;
END;
$$;

CREATE OR REPLACE FUNCTION calculate_supplier_score(supplier_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SEARCH_PATH ''
SECURITY DEFINER
AS $$
DECLARE
  total_score numeric;
BEGIN
  SELECT COALESCE(AVG(score), 0)
  INTO total_score
  FROM performance_history
  WHERE supplier_id = calculate_supplier_score.supplier_id;

  RETURN total_score;
END;
$$;

CREATE OR REPLACE FUNCTION get_supplier_detail(supplier_id uuid)
RETURNS json
LANGUAGE plpgsql
SEARCH_PATH ''
SECURITY DEFINER
AS $$
DECLARE
  detail json;
BEGIN
  SELECT row_to_json(s)
  INTO detail
  FROM (
    SELECT * FROM suppliers WHERE id = get_supplier_detail.supplier_id
  ) s;

  RETURN detail;
END;
$$;

CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS json
LANGUAGE plpgsql
SEARCH_PATH ''
SECURITY DEFINER
AS $$
DECLARE
  stats json;
BEGIN
  SELECT row_to_json(t)
  INTO stats
  FROM (
    SELECT
      (SELECT COUNT(*) FROM suppliers WHERE tier = 'strategic') as strategic_count,
      (SELECT COUNT(*) FROM suppliers WHERE tier = 'core') as core_count,
      (SELECT COUNT(*) FROM suppliers WHERE tier = 'backup') as backup_count,
      (SELECT COUNT(*) FROM suppliers WHERE status = 'active') as active_count,
      (SELECT COUNT(*) FROM tasks WHERE status = 'pending') as pending_tasks
  ) t;

  RETURN stats;
END;
$$;

CREATE OR REPLACE FUNCTION batch_update_supplier_tier(
  supplier_ids uuid[],
  new_tier varchar
)
RETURNS int
LANGUAGE plpgsql
SEARCH_PATH ''
SECURITY DEFINER
AS $$
DECLARE
  updated_count int;
BEGIN
  UPDATE suppliers
  SET tier = batch_update_supplier_tier.new_tier,
      updated_at = now()
  WHERE id = ANY(supplier_ids);

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;

-- 5. 修复视图安全问题
-- ================================================

-- 删除 SECURITY DEFINER 视图，重新创建为 SECURITY INVOKER
DROP VIEW IF EXISTS supplier_summary;

CREATE VIEW supplier_summary
SECURITY INVOKER
AS
SELECT
  s.id,
  s.code,
  s.name,
  s.local_name,
  s.logo_text,
  s.tier,
  s.status,
  s.stage,
  s.category,
  s.location,
  s.system_score,
  s.tags,
  s.scarce_resources,
  s.created_at,
  s.updated_at,
  -- 聚合数据
  (SELECT COUNT(*) FROM decision_chain WHERE supplier_id = s.id) as decision_chain_count,
  (SELECT COUNT(*) FROM engagement_logs WHERE supplier_id = s.id) as engagement_count,
  (SELECT COUNT(*) FROM performance_history WHERE supplier_id = s.id) as evaluation_count
FROM suppliers s;

COMMENT ON VIEW supplier_summary IS '供应商汇总视图 - 包含基本信息的聚合数据';

-- 6. 为新增的表创建基础索引
-- ================================================

CREATE INDEX IF NOT EXISTS idx_performance_dimensions_supplier_id ON performance_dimensions(supplier_id);
CREATE INDEX IF NOT EXISTS idx_risk_alerts_supplier_id ON risk_alerts(supplier_id);
CREATE INDEX IF NOT EXISTS idx_risk_alerts_status ON risk_alerts(status);
CREATE INDEX IF NOT EXISTS idx_risk_alerts_severity ON risk_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_probation_tasks_supplier_id ON probation_tasks(supplier_id);
CREATE INDEX IF NOT EXISTS idx_probation_tasks_status ON probation_tasks(status);
CREATE INDEX IF NOT EXISTS idx_system_settings_supplier_id ON system_settings(supplier_id);
CREATE INDEX IF NOT EXISTS idx_lifecycle_events_supplier_id ON lifecycle_events(supplier_id);
CREATE INDEX IF NOT EXISTS idx_lifecycle_events_created_at ON lifecycle_events(created_at);
CREATE INDEX IF NOT EXISTS idx_calendar_events_supplier_id ON calendar_events(supplier_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_event_date ON calendar_events(event_date);
CREATE INDEX IF NOT EXISTS idx_audit_logs_record_id ON audit_logs(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_changed_at ON audit_logs(changed_at);

-- 为 business_line_contacts 添加索引
CREATE INDEX IF NOT EXISTS idx_business_line_contacts_business_line_id ON business_line_contacts(business_line_id);

-- ================================================
-- 安全修复完成
-- ================================================
-- 注意：这些策略仍然允许所有认证用户访问所有数据
-- 生产环境需要：
-- 1. 实现基于用户角色的细粒度访问控制
-- 2. 添加多租户支持 (tenant_id)
-- 3. 实现行级所有权检查 (created_by = auth.uid())
-- ================================================
