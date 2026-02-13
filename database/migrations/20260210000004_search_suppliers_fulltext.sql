-- ================================================
-- 供应商全文搜索 RPC 函数
-- ================================================
-- 目标: 使用 tsvector 全文搜索替代 ILIKE
-- 预期收益: 搜索性能提升 100x+ (大数据集)
--
-- 创建时间: 2026-02-10
-- 版本: 1.0
-- ================================================

-- 删除旧版本函数（如果存在）
DROP FUNCTION IF EXISTS search_suppliers_fulltext;

-- 创建全文搜索 RPC 函数
CREATE OR REPLACE FUNCTION search_suppliers_fulltext(
  p_search_term text DEFAULT '',
  p_tier text DEFAULT NULL,
  p_status text DEFAULT NULL,
  p_stage text DEFAULT NULL,
  p_category text DEFAULT NULL,
  p_limit int DEFAULT 50,
  p_offset int DEFAULT 0
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_result json;
  v_tsquery tsquery;
BEGIN
  -- 构建搜索查询
  -- 如果搜索词为空，匹配所有记录
  IF p_search_term IS NULL OR p_search_term = '' THEN
    v_tsquery := to_tsquery('simple', '*');
  ELSE
    -- 将搜索词转换为 tsquery
    -- 处理空格、特殊字符等
    v_tsquery := to_tsquery('simple', p_search_term);
  END IF;

  -- 执行搜索并返回结果
  SELECT json_build_object(
    'results', (
      SELECT json_agg(row_to_json(result))
      FROM (
        SELECT
          id, code, name, local_name, logo_text,
          tier, status, stage, category, location,
          system_score, tags, scarce_resources,
          address, contact_phone, website,
          financial_interval, financial_anchor, financial_period,
          evaluation_period,
          portal_demand_broadcast, portal_empowerment_center,
          portal_ticket_system, portal_performance_view,
          structure, notes,
          ts_rank(search_vector, v_tsquery) as search_rank,
          created_at, updated_at
        FROM public.suppliers
        WHERE
          -- 全文搜索条件
          search_vector @@ v_tsquery
          -- 筛选条件
          AND (p_tier IS NULL OR tier = p_tier)
          AND (p_status IS NULL OR status = p_status)
          AND (p_stage IS NULL OR stage = p_stage)
          AND (p_category IS NULL OR category = p_category)
        ORDER BY
          -- 按相关性排序，然后按名称排序
          ts_rank(search_vector, v_tsquery) DESC,
          name ASC
        LIMIT p_limit
        OFFSET p_offset
      ) result
    ),
    'total', (
      SELECT COUNT(*)
      FROM public.suppliers
      WHERE
        search_vector @@ v_tsquery
        AND (p_tier IS NULL OR tier = p_tier)
        AND (p_status IS NULL OR status = p_status)
        AND (p_stage IS NULL OR stage = p_stage)
        AND (p_category IS NULL OR category = p_category)
    ),
    'search_term', p_search_term,
    'tsquery', v_tsquery::text,
    'metadata', json_build_object(
      'limit', p_limit,
      'offset', p_offset,
      'has_more', (
        SELECT COUNT(*) > (p_limit + p_offset)
        FROM public.suppliers
        WHERE search_vector @@ v_tsquery
      )
    )
  ) INTO v_result;

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'error', SQLERRM,
      'sqlstate', SQLSTATE,
      'timestamp', NOW()
    );
END;
$$;

-- 添加注释
COMMENT ON FUNCTION search_suppliers_fulltext IS
'供应商全文搜索 RPC 函数。
使用 PostgreSQL tsvector 全文搜索，性能优于 ILIKE。

参数:
- p_search_term: 搜索词（支持中英文）
- p_tier: 筛选 - 层级
- p_status: 筛选 - 状态
- p_stage: 筛选 - 阶段
- p_category: 筛选 - 分类
- p_limit: 返回结果数限制
- p_offset: 偏移量（分页）

返回: JSON 对象包含 results, total, search_term, metadata
';
