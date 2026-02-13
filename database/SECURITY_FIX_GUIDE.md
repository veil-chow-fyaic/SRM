# 🔒 Supabase 后端安全修复指南

## 📋 问题摘要

通过 Supabase MCP 工具检查，发现以下**严重安全问题**：

### 错误级别 (ERROR)
1. **8 个表未启用 RLS** - 完全暴露给所有人
2. **所有 RLS 策略都是 `USING (true)`** - 相当于没有安全措施
3. **1 个视图使用 `SECURITY DEFINER`** - 存在权限提升风险

### 警告级别 (WARN)
4. **6 个函数缺少 `search_path`** - 存在 SQL 注入风险

---

## 🚀 执行修复（3 种方式）

### 方式一：通过 Supabase Dashboard SQL Editor（推荐）

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择项目 `tdrbuwshyebmjqljggww`
3. 点击左侧菜单 **SQL Editor**
4. 点击 **New Query**
5. 复制 `database/migrations/20260210000001_fix_security_issues.sql` 的全部内容
6. 点击 **Run** 执行
7. 等待执行完成，检查是否有错误

### 方式二：分步执行（适合调试）

将 SQL 文件分成小部分逐步执行：

#### 第1步：启用 RLS
```sql
ALTER TABLE performance_dimensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE probation_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE lifecycle_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
```

#### 第2步：删除旧策略
```sql
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
```

#### 第3步：创建新策略
```sql
-- 创建新的 RLS 策略（见完整文件）
```

### 方式三：使用 psql 命令行

```bash
# 获取数据库连接字符串（从 Supabase Dashboard > Settings > Database）
psql "postgresql://postgres:[PASSWORD]@db.tdrbuwshyebmjqljggww.supabase.co:5432/postgres" -f database/migrations/20260210000001_fix_security_issues.sql
```

---

## ✅ 验证修复

运行验证脚本确认所有问题已修复：

```bash
node database/scripts/verify-security-fix.js
```

或使用 Supabase MCP 工具重新检查：

```bash
mcp__supabase__get_advisors --type security
mcp__supabase__get_advisors --type performance
```

---

## ⚠️ 重要提示

### 当前修复后的状态
- 所有策略要求 `auth.role() = 'authenticated'`
- 这意味着**任何登录用户**都可以访问所有数据
- 这只是临时解决方案，适合开发/测试环境

### 生产环境需要的额外安全措施
1. **基于用户的行级访问控制**
   ```sql
   -- 示例：用户只能访问自己创建的数据
   CREATE POLICY "Users can access own data"
   ON suppliers
   USING (created_by = auth.uid());
   ```

2. **基于角色的访问控制**
   ```sql
   -- 示例：只有管理员可以删除
   CREATE POLICY "Admins can delete"
   ON suppliers
   FOR DELETE
   USING (auth.jwt() ->> 'role' = 'admin');
   ```

3. **多租户支持**
   ```sql
   -- 示例：使用 tenant_id 隔离数据
   CREATE POLICY "Tenant isolation"
   ON suppliers
   USING (tenant_id = auth.jwt() ->> 'tenant_id');
   ```

---

## 📊 预期结果

修复后，`get_advisors` 应该返回：

### 安全问题 (ERROR)
- ✅ 所有表都已启用 RLS
- ✅ 所有策略不再是 `USING (true)`
- ✅ 视图使用 `SECURITY INVOKER`

### 性能问题 (INFO)
- ✅ 新增的索引将提高查询性能

---

## 🔄 回滚

如果需要回滚更改：

```sql
-- 重新创建旧策略（不推荐）
-- 或使用 git 恢复之前的 migration 版本
```

---

## 📞 需要帮助？

1. 查看完整 SQL 文件：`database/migrations/20260210000001_fix_security_issues.sql`
2. 查看验证脚本：`database/scripts/verify-security-fix.js`
3. 查看 Supabase 文档：https://supabase.com/docs/guides/database/postgres/row-level-security

---

**创建时间**: 2026-02-10
**问题级别**: 严重安全漏洞
**修复状态**: 等待执行
