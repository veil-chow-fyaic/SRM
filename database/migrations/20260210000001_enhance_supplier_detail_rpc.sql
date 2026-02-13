-- ================================================
-- 增强 get_supplier_full_detail RPC 函数
-- ================================================
-- 目标: 将 SupplierDetail 页面的 6 次串行查询优化为 1 次 RPC 调用
-- 预期收益: 网络请求数减少 83%，响应时间从 600-1200ms 降至 100-200ms
--
-- 创建时间: 2026-02-10
-- 版本: 1.0
-- ================================================

-- 删除旧版本函数（如果存在）
DROP FUNCTION IF EXISTS get_supplier_full_detail(uuid);

-- 创建增强的供应商详情 RPC 函数
CREATE OR REPLACE FUNCTION get_supplier_full_detail(
  p_supplier_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER  -- 以函数定义者权限执行
SET search_path = ''  -- 安全：防止 SQL 注入
AS $$
DECLARE
  detail json;
  v_supplier_record record;
BEGIN
  -- 1. 获取供应商基本信息
  SELECT * INTO v_supplier_record
  FROM suppliers
  WHERE id = p_supplier_id;

  -- 如果供应商不存在，返回空
  IF NOT FOUND THEN
    RETURN json_build_object(
      'error', 'Supplier not found',
      'supplier_id', p_supplier_id
    );
  END IF;

  -- 2. 构建完整的 JSON 响应
  SELECT json_build_object(
    'supplier', (
      SELECT row_to_json(s)
      FROM (
        SELECT
          id, code, name, local_name, logo_text,
          tier, status, stage, category, location,
          system_score, tags, scarce_resources,
          -- 财务信息（4D模型）
          financial_interval,
          financial_anchor,
          financial_period,
          -- 门户权限
          portal_demand_broadcast,
          portal_empowerment_center,
          portal_ticket_system,
          portal_performance_view,
          -- 其他字段
          address, contact_phone, website, structure,
          ops_guide_cutoff_time as ops_guide_cutoff_time,
          ops_guide_booking_req as ops_guide_booking_req,
          ops_guide_prohibitions as ops_guide_prohibitions,
          created_at, updated_at
        FROM suppliers
        WHERE id = p_supplier_id
      ) s
    ),

    -- 3. 业务线数据（包含联系人的关联查询）
    'business_lines', (
      SELECT json_agg(
        json_build_object(
          'line', row_to_json(bl),
          'contacts', (
            SELECT json_agg(blc)
            FROM business_line_contacts blc
            WHERE blc.business_line_id = bl.id
          )
        )
      )
      FROM (
        SELECT * FROM business_lines
        WHERE supplier_id = p_supplier_id
        ORDER BY created_at DESC
      ) bl
    ),

    -- 4. 决策链数据（包含资源关联）
    'decision_chain', (
      SELECT json_agg(
        json_build_object(
          'member', row_to_json(dc),
          'resources', (
            SELECT json_agg(dcr.resource_name)
            FROM decision_chain_resources dcr
            WHERE dcr.decision_chain_id = dc.id
          )
        )
      )
      FROM (
        SELECT * FROM decision_chain
        WHERE supplier_id = p_supplier_id
        ORDER BY affinity_score DESC NULLS LAST, created_at DESC
      ) dc
    ),

    -- 5. 互动日志（PACD 模型，限制 20 条）
    'engagement_logs', (
      SELECT json_agg(row_to_json(el))
      FROM (
        SELECT
          id, supplier_id, log_type, title, subject,
          business_insight, political_insight,
          planned_date, actual_date, status, outcome,
          created_at, updated_at
        FROM engagement_logs
        WHERE supplier_id = p_supplier_id
        ORDER BY
          planned_date DESC NULLS LAST,
          created_at DESC
        LIMIT 20
      ) el
    ),

    -- 6. 绩效历史（限制 10 条）
    'performance_history', (
      SELECT json_agg(row_to_json(ph))
      FROM (
        SELECT
          id, supplier_id, evaluation_date, score,
          period, rater, comment, dimensions,
          created_at, updated_at
        FROM performance_history
        WHERE supplier_id = p_supplier_id
        ORDER BY evaluation_date DESC
        LIMIT 10
      ) ph
    ),

    -- 7. 待处理任务
    'tasks', (
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT
          id, supplier_id, title, description,
          task_type, priority, status, due_date,
          assignee_id, created_at, updated_at
        FROM tasks
        WHERE supplier_id = p_supplier_id
          AND status = 'pending'
        ORDER BY due_date ASC NULLS LAST, created_at DESC
      ) t
    ),

    -- 8. 统计信息
    'stats', (
      SELECT json_build_object(
        'engagement_count', (
          SELECT COUNT(*)::int
          FROM engagement_logs
          WHERE supplier_id = p_supplier_id
        ),
        'completed_engagement', (
          SELECT COUNT(*)::int
          FROM engagement_logs
          WHERE supplier_id = p_supplier_id AND status = 'completed'
        ),
        'avg_rating', (
          SELECT COALESCE(AVG(score), 0)::numeric(10,2)
          FROM performance_history
          WHERE supplier_id = p_supplier_id
        ),
        'business_line_count', (
          SELECT COUNT(*)::int
          FROM business_lines
          WHERE supplier_id = p_supplier_id
        ),
        'decision_chain_count', (
          SELECT COUNT(*)::int
          FROM decision_chain
          WHERE supplier_id = p_supplier_id
        ),
        'pending_task_count', (
          SELECT COUNT(*)::int
          FROM tasks
          WHERE supplier_id = p_supplier_id AND status = 'pending'
        ),
        'last_engagement_date', (
          SELECT MAX(actual_date)
          FROM engagement_logs
          WHERE supplier_id = p_supplier_id AND status = 'completed'
        ),
        'last_evaluation_date', (
          SELECT MAX(evaluation_date)
          FROM performance_history
          WHERE supplier_id = p_supplier_id
        )
      )
    )
  ) INTO detail;

  RETURN detail;

EXCEPTION
  WHEN OTHERS THEN
    -- 错误处理：返回错误信息
    RETURN json_build_object(
      'error', SQLERRM,
      'sqlstate', SQLSTATE,
      'supplier_id', p_supplier_id
    );
END;
$$;

-- 添加注释
COMMENT ON FUNCTION get_supplier_full_detail(uuid) IS
'获取供应商完整详情，包含基本信息、业务线、决策链、互动日志、绩效历史、任务和统计信息。
用于 SupplierDetail 页面，一次调用获取所有需要的数据，替代原来的 6 次串行查询。

参数:
  p_supplier_id: 供应商 UUID

返回:
  JSON 对象，包含以下字段:
  - supplier: 供应商基本信息
  - business_lines: 业务线数组（包含联系人）
  - decision_chain: 决策链数组（包含关联资源）
  - engagement_logs: 互动日志（最多 20 条）
  - performance_history: 绩效历史（最多 10 条）
  - tasks: 待处理任务
  - stats: 统计信息

性能: 预期响应时间 100-200ms（原来 6 次查询需 600-1200ms）';

-- ================================================
-- 验证函数创建
-- ================================================
-- 测试查询（取消注释以测试）
-- SELECT get_supplier_full_detail('00000000-0000-0000-0000-000000000000'::uuid);
