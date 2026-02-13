-- ========================================
-- 合同管理表创建
-- ========================================
-- 功能: 存储供应商合同信息
-- 创建时间: 2026-02-10
-- ========================================

-- 创建 contracts 表
CREATE TABLE IF NOT EXISTS public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  contract_number VARCHAR(100) UNIQUE NOT NULL,
  contract_name VARCHAR(255) NOT NULL,
  contract_type VARCHAR(50) CHECK (contract_type IN ('Framework', 'Spot', 'NDA', 'MSA', 'SOW', 'Other')),
  start_date DATE NOT NULL,
  end_date DATE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'expired', 'terminated', 'renewed')),
  value_amount NUMERIC(15,2),
  currency VARCHAR(3) DEFAULT 'CNY',
  payment_terms TEXT,
  delivery_terms TEXT,
  terms TEXT,
  notes TEXT,
  file_id UUID REFERENCES public.supplier_files(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_contracts_supplier_id ON public.contracts(supplier_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON public.contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_end_date ON public.contracts(end_date);
CREATE INDEX IF NOT EXISTS idx_contracts_contract_number ON public.contracts(contract_number);

-- 添加注释
COMMENT ON TABLE public.contracts IS '供应商合同表';
COMMENT ON COLUMN public.contracts.id IS '合同唯一标识';
COMMENT ON COLUMN public.contracts.supplier_id IS '关联的供应商 ID';
COMMENT ON COLUMN public.contracts.contract_number IS '合同编号（唯一）';
COMMENT ON COLUMN public.contracts.contract_name IS '合同名称';
COMMENT ON COLUMN public.contracts.contract_type IS '合同类型: Framework(框架), Spot(现货), NDA(保密), MSA(主服务), SOW(工作说明书), Other(其他)';
COMMENT ON COLUMN public.contracts.start_date IS '合同开始日期';
COMMENT ON COLUMN public.contracts.end_date IS '合同结束日期';
COMMENT ON COLUMN public.contracts.status IS '合同状态: draft(草稿), active(生效中), expired(已过期), terminated(已终止), renewed(已续签)';
COMMENT ON COLUMN public.contracts.value_amount IS '合同金额';
COMMENT ON COLUMN public.contracts.currency IS '货币类型';
COMMENT ON COLUMN public.contracts.payment_terms IS '付款条款';
COMMENT ON COLUMN public.contracts.delivery_terms IS '交付条款';
COMMENT ON COLUMN public.contracts.terms IS '合同条款';
COMMENT ON COLUMN public.contracts.notes IS '备注';
COMMENT ON COLUMN public.contracts.file_id IS '关联的合同文件 ID';
COMMENT ON COLUMN public.contracts.created_by IS '创建者用户 ID';

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION public.update_contracts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER contracts_updated_at
  BEFORE UPDATE ON public.contracts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_contracts_updated_at();

-- 自动更新过期合同状态
CREATE OR REPLACE FUNCTION public.update_expired_contracts()
RETURNS TRIGGER AS $$
BEGIN
  -- 更新过期合同状态
  UPDATE public.contracts
  SET status = 'expired'
  WHERE end_date < CURRENT_DATE
    AND status = 'active';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 启用 RLS
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- RLS 策略
-- 所有认证用户可以查看合同
CREATE POLICY "Authenticated users can view contracts"
ON public.contracts FOR SELECT
TO authenticated
USING (true);

-- 所有认证用户可以创建合同
CREATE POLICY "Authenticated users can create contracts"
ON public.contracts FOR INSERT
TO authenticated
WITH CHECK (true);

-- 所有认证用户可以更新合同
CREATE POLICY "Authenticated users can update contracts"
ON public.contracts FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 所有认证用户可以删除合同
CREATE POLICY "Authenticated users can delete contracts"
ON public.contracts FOR DELETE
TO authenticated
USING (true);

-- 授权
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contracts TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 创建合同统计视图
CREATE OR REPLACE VIEW public.contract_stats AS
SELECT
  supplier_id,
  COUNT(*) as total_contracts,
  COUNT(*) FILTER (WHERE status = 'active') as active_contracts,
  COUNT(*) FILTER (WHERE status = 'expired') as expired_contracts,
  COALESCE(SUM(value_amount) FILTER (WHERE status = 'active'), 0) as total_active_value
FROM public.contracts
GROUP BY supplier_id;

COMMENT ON VIEW public.contract_stats IS '合同统计视图';
