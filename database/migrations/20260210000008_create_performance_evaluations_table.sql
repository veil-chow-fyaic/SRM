-- ========================================
-- 绩效评估表创建
-- ========================================
-- 功能: 存储供应商绩效评分记录
-- 创建时间: 2026-02-10
-- 说明: 支持多维度评分，自动计算综合得分
-- ========================================

-- 创建 performance_evaluations 表
CREATE TABLE IF NOT EXISTS public.performance_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  evaluation_period VARCHAR(50) NOT NULL,
  period_type VARCHAR(20) CHECK (period_type IN ('monthly', 'quarterly', 'semi_annual', 'annual')),
  evaluator_id UUID REFERENCES auth.users(id),
  dimension_scores JSONB NOT NULL DEFAULT '{}',
  total_score NUMERIC(3,1) CHECK (total_score BETWEEN 0 AND 10),
  auto_calculated BOOLEAN DEFAULT true,
  notes TEXT,
  strengths TEXT[],
  weaknesses TEXT[],
  improvement_areas TEXT[],
  recommended_actions TEXT[],
  evaluated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- 确保同一供应商在同一评估周期只有一条记录
  CONSTRAINT unique_supplier_period UNIQUE (supplier_id, evaluation_period)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_performance_evaluations_supplier_id ON public.performance_evaluations(supplier_id);
CREATE INDEX IF NOT EXISTS idx_performance_evaluations_period ON public.performance_evaluations(evaluation_period);
CREATE INDEX IF NOT EXISTS idx_performance_evaluations_evaluator_id ON public.performance_evaluations(evaluator_id);
CREATE INDEX IF NOT EXISTS idx_performance_evaluations_total_score ON public.performance_evaluations(total_score);
CREATE INDEX IF NOT EXISTS idx_performance_evaluations_evaluated_at ON public.performance_evaluations(evaluated_at DESC);

-- 添加注释
COMMENT ON TABLE public.performance_evaluations IS '供应商绩效评估表';
COMMENT ON COLUMN public.performance_evaluations.id IS '评估记录唯一标识';
COMMENT ON COLUMN public.performance_evaluations.supplier_id IS '关联的供应商 ID';
COMMENT ON COLUMN public.performance_evaluations.evaluation_period IS '评估周期（如 2024-Q1）';
COMMENT ON COLUMN public.performance_evaluations.period_type IS '周期类型: monthly(月度), quarterly(季度), semi_annual(半年度), annual(年度)';
COMMENT ON COLUMN public.performance_evaluations.evaluator_id IS '评估者用户 ID';
COMMENT ON COLUMN public.performance_evaluations.dimension_scores IS '各维度得分，JSON 格式: {"dimension_id": score}';
COMMENT ON COLUMN public.performance_evaluations.total_score IS '综合得分 (0-10)';
COMMENT ON COLUMN public.performance_evaluations.auto_calculated IS '是否自动计算综合得分';
COMMENT ON COLUMN public.performance_evaluations.notes IS '综合评语';
COMMENT ON COLUMN public.performance_evaluations.strengths IS '优势列表';
COMMENT ON COLUMN public.performance_evaluations.weaknesses IS '劣势列表';
COMMENT ON COLUMN public.performance_evaluations.improvement_areas IS '改进领域';
COMMENT ON COLUMN public.performance_evaluations.recommended_actions IS '建议行动';
COMMENT ON COLUMN public.performance_evaluations.evaluated_at IS '评估日期';

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION public.update_performance_evaluations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER performance_evaluations_updated_at
  BEFORE UPDATE ON public.performance_evaluations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_performance_evaluations_updated_at();

-- 自动更新供应商 system_score 的触发器函数
CREATE OR REPLACE FUNCTION public.update_supplier_system_score()
RETURNS TRIGGER AS $$
DECLARE
  v_avg_score NUMERIC(3,1);
BEGIN
  -- 计算最近 3 次评估的平均分
  SELECT COALESCE(AVG(total_score), 0)
  INTO v_avg_score
  FROM public.performance_evaluations
  WHERE supplier_id = NEW.supplier_id
    AND evaluated_at > NOW() - INTERVAL '6 months'
  ORDER BY evaluated_at DESC
  LIMIT 3;

  -- 更新供应商的 system_score
  UPDATE public.suppliers
  SET system_score = v_avg_score,
      updated_at = NOW()
  WHERE id = NEW.supplier_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器：在评估插入或更新后自动更新供应商 system_score
CREATE TRIGGER performance_evaluation_update_system_score
  AFTER INSERT OR UPDATE ON public.performance_evaluations
  FOR EACH ROW
  WHEN (NEW.auto_calculated = true)
  EXECUTE FUNCTION public.update_supplier_system_score();

-- 启用 RLS
ALTER TABLE public.performance_evaluations ENABLE ROW LEVEL SECURITY;

-- RLS 策略
-- 所有认证用户可以查看评估记录
CREATE POLICY "Authenticated users can view performance_evaluations"
ON public.performance_evaluations FOR SELECT
TO authenticated
USING (true);

-- 所有认证用户可以创建评估记录
CREATE POLICY "Authenticated users can create performance_evaluations"
ON public.performance_evaluations FOR INSERT
TO authenticated
WITH CHECK (true);

-- 评估者可以更新自己的评估
CREATE POLICY "Evaluators can update own performance_evaluations"
ON public.performance_evaluations FOR UPDATE
TO authenticated
USING (evaluator_id = auth.uid())
WITH CHECK (evaluator_id = auth.uid());

-- 授权
GRANT SELECT, INSERT, UPDATE ON public.performance_evaluations TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 创建绩效评估统计视图
CREATE OR REPLACE VIEW public.performance_evaluation_stats AS
SELECT
  supplier_id,
  COUNT(*) as total_evaluations,
  COUNT(*) FILTER (WHERE period_type = 'quarterly') as quarterly_evaluations,
  COUNT(*) FILTER (WHERE period_type = 'annual') as annual_evaluations,
  COALESCE(AVG(total_score), 0) as average_score,
  MAX(total_score) as highest_score,
  MIN(total_score) as lowest_score,
  MAX(evaluated_at) as last_evaluated_at
FROM public.performance_evaluations
GROUP BY supplier_id;

COMMENT ON VIEW public.performance_evaluation_stats IS '绩效评估统计视图';

-- 创建获取供应商最新评估的函数
CREATE OR REPLACE FUNCTION public.get_latest_evaluation(p_supplier_id UUID)
RETURNS TABLE (
  id UUID,
  evaluation_period VARCHAR(50),
  total_score NUMERIC(3,1),
  dimension_scores JSONB,
  evaluated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pe.id,
    pe.evaluation_period,
    pe.total_score,
    pe.dimension_scores,
    pe.evaluated_at
  FROM public.performance_evaluations pe
  WHERE pe.supplier_id = p_supplier_id
  ORDER BY pe.evaluated_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建自动计算综合得分的函数
CREATE OR REPLACE FUNCTION public.calculate_total_score(
  p_dimension_scores JSONB,
  p_supplier_id UUID
)
RETURNS NUMERIC(3,1) AS $$
DECLARE
  v_config JSONB;
  v_total_score NUMERIC(3,1);
  v_weighted_sum NUMERIC(10,2) := 0;
  v_total_weight NUMERIC(10,2) := 0;
  v_dimension RECORD;
BEGIN
  -- 获取供应商的绩效配置
  SELECT performance_config INTO v_config
  FROM public.suppliers
  WHERE id = p_supplier_id;

  -- 如果没有配置，使用默认权重
  IF v_config IS NULL OR v_config->'dimensions' IS NULL THEN
    -- 默认：所有维度权重相等
    SELECT COALESCE(AVG((p_dimension_scores->>key)::NUMERIC), 0)
    INTO v_total_score
    FROM jsonb_each_text(p_dimension_scores);
    RETURN v_total_score;
  END IF;

  -- 根据配置的权重计算加权平均分
  FOR v_dimension IN
    SELECT * FROM jsonb_array_elements(v_config->'dimensions')
  LOOP
    DECLARE
      v_dim_id TEXT := v_dimension.value->>'id';
      v_weight NUMERIC := COALESCE((v_dimension.value->>'weight')::NUMERIC, 1);
      v_score NUMERIC := COALESCE((p_dimension_scores->>v_dim_id)::NUMERIC, 0);
    BEGIN
      v_weighted_sum := v_weighted_sum + (v_score * v_weight);
      v_total_weight := v_total_weight + v_weight;
    END;
  END LOOP;

  -- 计算加权平均分
  IF v_total_weight > 0 THEN
    v_total_score := v_weighted_sum / v_total_weight;
  ELSE
    v_total_score := 0;
  END IF;

  RETURN ROUND(v_total_score::NUMERIC, 1);
END;
$$ LANGUAGE plpgsql;
