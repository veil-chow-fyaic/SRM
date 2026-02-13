-- ========================================
-- 衍生资源表创建
-- ========================================
-- 功能: 存储供应商决策链成员的衍生资源信息
-- 创建时间: 2026-02-10
-- 说明: 衍生资源是指决策链成员背后的社会关系、协会、人脉等
-- ========================================

-- 创建 derivative_resources 表
CREATE TABLE IF NOT EXISTS public.derivative_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  decision_chain_member_id UUID REFERENCES public.decision_chain_members(id) ON DELETE CASCADE,
  resource_name VARCHAR(255) NOT NULL,
  resource_type VARCHAR(50) CHECK (resource_type IN ('Person', 'Association', 'Company', 'Government', 'Other')),
  description TEXT,
  value_level VARCHAR(20) CHECK (value_level IN ('critical', 'high', 'medium', 'low')),
  last_verified DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_derivative_resources_supplier_id ON public.derivative_resources(supplier_id);
CREATE INDEX IF NOT EXISTS idx_derivative_resources_member_id ON public.derivative_resources(decision_chain_member_id);
CREATE INDEX IF NOT EXISTS idx_derivative_resources_type ON public.derivative_resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_derivative_resources_value_level ON public.derivative_resources(value_level);

-- 添加注释
COMMENT ON TABLE public.derivative_resources IS '供应商决策链衍生资源表';
COMMENT ON COLUMN public.derivative_resources.id IS '资源唯一标识';
COMMENT ON COLUMN public.derivative_resources.supplier_id IS '关联的供应商 ID';
COMMENT ON COLUMN public.derivative_resources.decision_chain_member_id IS '关联的决策链成员 ID';
COMMENT ON COLUMN public.derivative_resources.resource_name IS '资源名称';
COMMENT ON COLUMN public.derivative_resources.resource_type IS '资源类型: Person(个人), Association(协会), Company(公司), Government(政府), Other(其他)';
COMMENT ON COLUMN public.derivative_resources.description IS '资源描述';
COMMENT ON COLUMN public.derivative_resources.value_level IS '价值等级: critical(关键), high(高), medium(中), low(低)';
COMMENT ON COLUMN public.derivative_resources.last_verified IS '最后验证日期';
COMMENT ON COLUMN public.derivative_resources.notes IS '备注';

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION public.update_derivative_resources_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER derivative_resources_updated_at
  BEFORE UPDATE ON public.derivative_resources
  FOR EACH ROW
  EXECUTE FUNCTION public.update_derivative_resources_updated_at();

-- 启用 RLS
ALTER TABLE public.derivative_resources ENABLE ROW LEVEL SECURITY;

-- RLS 策略
-- 所有认证用户可以查看衍生资源
CREATE POLICY "Authenticated users can view derivative_resources"
ON public.derivative_resources FOR SELECT
TO authenticated
USING (true);

-- 所有认证用户可以创建衍生资源
CREATE POLICY "Authenticated users can create derivative_resources"
ON public.derivative_resources FOR INSERT
TO authenticated
WITH CHECK (true);

-- 所有认证用户可以更新衍生资源
CREATE POLICY "Authenticated users can update derivative_resources"
ON public.derivative_resources FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 所有认证用户可以删除衍生资源
CREATE POLICY "Authenticated users can delete derivative_resources"
ON public.derivative_resources FOR DELETE
TO authenticated
USING (true);

-- 授权
GRANT SELECT, INSERT, UPDATE, DELETE ON public.derivative_resources TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 创建衍生资源统计视图
CREATE OR REPLACE VIEW public.derivative_resource_stats AS
SELECT
  supplier_id,
  COUNT(*) as total_resources,
  COUNT(*) FILTER (WHERE resource_type = 'Person') as person_resources,
  COUNT(*) FILTER (WHERE resource_type = 'Association') as association_resources,
  COUNT(*) FILTER (WHERE resource_type = 'Company') as company_resources,
  COUNT(*) FILTER (WHERE value_level = 'critical') as critical_resources,
  COUNT(*) FILTER (WHERE value_level = 'high') as high_value_resources
FROM public.derivative_resources
GROUP BY supplier_id;

COMMENT ON VIEW public.derivative_resource_stats IS '衍生资源统计视图';
