-- ========================================
-- 供应商文件表创建
-- ========================================
-- 功能: 存储供应商相关文件的元数据
-- 创建时间: 2026-02-10
-- ========================================

-- 创建 supplier_files 表
CREATE TABLE IF NOT EXISTS public.supplier_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL CHECK (file_type IN ('License', 'Cert', 'Contract', 'Finance', 'Other')),
  file_size BIGINT NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type VARCHAR(100),
  description TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_supplier_files_supplier_id ON public.supplier_files(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_files_file_type ON public.supplier_files(file_type);
CREATE INDEX IF NOT EXISTS idx_supplier_files_created_at ON public.supplier_files(created_at DESC);

-- 添加注释
COMMENT ON TABLE public.supplier_files IS '供应商文件元数据表';
COMMENT ON COLUMN public.supplier_files.id IS '文件记录唯一标识';
COMMENT ON COLUMN public.supplier_files.supplier_id IS '关联的供应商 ID';
COMMENT ON COLUMN public.supplier_files.file_name IS '原始文件名';
COMMENT ON COLUMN public.supplier_files.file_type IS '文件类型: License(营业执照), Cert(认证证书), Contract(合同), Finance(财务), Other(其他)';
COMMENT ON COLUMN public.supplier_files.file_size IS '文件大小（字节）';
COMMENT ON COLUMN public.supplier_files.storage_path IS 'Supabase Storage 中的存储路径';
COMMENT ON COLUMN public.supplier_files.mime_type IS '文件 MIME 类型';
COMMENT ON COLUMN public.supplier_files.description IS '文件描述';
COMMENT ON COLUMN public.supplier_files.uploaded_by IS '上传者用户 ID';
COMMENT ON COLUMN public.supplier_files.created_at IS '创建时间';
COMMENT ON COLUMN public.supplier_files.updated_at IS '更新时间';

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION public.update_supplier_files_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER supplier_files_updated_at
  BEFORE UPDATE ON public.supplier_files
  FOR EACH ROW
  EXECUTE FUNCTION public.update_supplier_files_updated_at();

-- 启用 RLS
ALTER TABLE public.supplier_files ENABLE ROW LEVEL SECURITY;

-- RLS 策略
-- 所有认证用户可以查看文件
CREATE POLICY "Authenticated users can view files"
ON public.supplier_files FOR SELECT
TO authenticated
USING (true);

-- 所有认证用户可以上传文件
CREATE POLICY "Authenticated users can upload files"
ON public.supplier_files FOR INSERT
TO authenticated
WITH CHECK (true);

-- 文件上传者可以更新自己的文件
CREATE POLICY "Users can update own files"
ON public.supplier_files FOR UPDATE
TO authenticated
USING (uploaded_by = auth.uid())
WITH CHECK (uploaded_by = auth.uid());

-- 所有认证用户可以删除文件（可选：更严格）
CREATE POLICY "Authenticated users can delete files"
ON public.supplier_files FOR DELETE
TO authenticated
USING (true);

-- 授权
GRANT SELECT, INSERT, UPDATE, DELETE ON public.supplier_files TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.supplier_files_id_seq TO authenticated;
