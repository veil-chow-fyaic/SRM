-- ================================================
-- PostgreSQL 全文搜索优化 - 添加搜索向量列
-- ================================================
-- 目标: 将 ILIKE 搜索优化为 tsvector + GIN 索引
-- 预期收益: 搜索性能提升 100x+ (大数据集)
--
-- 创建时间: 2026-02-10
-- 版本: 1.0
-- ================================================

-- 1. 添加搜索向量列
ALTER TABLE public.suppliers
ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- 2. 创建生成搜索向量的函数
CREATE OR REPLACE FUNCTION suppliers_search_vector_update()
RETURNS trigger AS $$
BEGIN
  -- 将 name, local_name, code 合并为搜索向量
  -- 使用 'simple' 配置以支持中文和英文混合搜索
  NEW.search_vector :=
    setweight(to_tsvector('simple', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(NEW.local_name, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(NEW.code, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(NEW.description, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. 创建触发器：自动更新搜索向量
DROP TRIGGER IF EXISTS suppliers_search_vector_trigger ON public.suppliers;
CREATE TRIGGER suppliers_search_vector_trigger
  BEFORE INSERT OR UPDATE ON public.suppliers
  FOR EACH ROW
  EXECUTE FUNCTION suppliers_search_vector_update();

-- 4. 回填现有数据
UPDATE public.suppliers
SET search_vector =
  setweight(to_tsvector('simple', COALESCE(name, '')), 'A') ||
  setweight(to_tsvector('simple', COALESCE(local_name, '')), 'A') ||
  setweight(to_tsvector('simple', COALESCE(code, '')), 'B') ||
  setweight(to_tsvector('simple', COALESCE(description, '')), 'C')
WHERE search_vector IS NULL;

-- 5. 添加注释
COMMENT ON COLUMN public.suppliers.search_vector IS
'全文搜索向量，由触发器自动维护。使用 to_tsvector 生成，支持中英文搜索。';

COMMENT ON FUNCTION suppliers_search_vector_update() IS
'触发器函数：自动更新 suppliers 表的 search_vector 列。
权重分配：
- A: name, local_name (最重要)
- B: code (次要)
- C: description (补充)';

COMMENT ON TRIGGER suppliers_search_vector_trigger ON public.suppliers IS
'触发器：在 INSERT/UPDATE 时自动更新 search_vector 列';
