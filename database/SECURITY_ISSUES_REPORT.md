# 🔴 Supabase 后端安全漏洞报告

**项目**: SRM 供应商关系管理系统
**数据库**: Supabase (tdrbuwshyebmjqljggww)
**扫描时间**: 2026-02-10
**扫描工具**: Supabase MCP Advisors
**严重程度**: 🔴 严重

---

## 📊 问题统计

| 级别 | 数量 | 影响 |
|------|------|------|
| **ERROR** | 8 | 数据完全暴露，无安全保护 |
| **WARN** | 16 | SQL 注入风险，权限提升风险 |
| **INFO** | 20 | 性能优化建议 |

---

## 🔴 ERROR 级别问题（必须立即修复）

### 1. 8 个表未启用 Row Level Security (RLS)

这些表**完全暴露**给所有人，任何知道 API 地址的人都可以读取、修改、删除数据：

| 表名 | 风险 | 数据敏感度 |
|------|------|-----------|
| `performance_dimensions` | 绩效配置可被篡改 | ⚠️ 高 |
| `risk_alerts` | 风险预警可被删除 | ⚠️ 高 |
| `probation_tasks` | 考察任务可被修改 | ⚠️ 中 |
| `system_settings` | 系统配置可被篡改 | 🔴 极高 |
| `lifecycle_events` | 生命周期记录可被删除 | ⚠️ 中 |
| `calendar_events` | 日历事件可被读取 | ⚠️ 中 |
| `audit_logs` | 审计日志可被删除 | 🔴 极高 |

**影响**: 任何人都可以：
- ❌ 读取所有数据（无认证要求）
- ❌ 修改/删除任何记录
- ❌ 篡改系统配置
- ❌ 删除审计日志掩盖踪迹

---

### 2. 所有 RLS 策略都是 `USING (true)`

已启用 RLS 的表，策略**完全绕过安全检查**：

```sql
-- 当前策略（危险！）
CREATE POLICY "Allow public access on suppliers"
ON suppliers FOR ALL
USING (true);  -- ❌ 允许任何人访问
```

**受影响的表**:
- `suppliers` - 供应商数据可被任意篡改
- `business_lines` - 业务线数据可被任意修改
- `decision_chain` - 决策链数据可被任意修改
- `engagement_logs` - 互动日志可被任意修改
- `performance_history` - 绩效历史可被任意篡改
- `tasks` - 任务数据可被任意修改

**影响**: 即使启用了 RLS，策略也形同虚设。

---

### 3. 视图使用 `SECURITY DEFINER`

**视图**: `supplier_summary`

**问题**: 该视图使用创建者的权限（通常是 postgres 超级用户）执行，可能允许用户访问原本不应该看到的数据。

**风险**: 权限提升攻击

---

## ⚠️ WARN 级别问题（应该修复）

### 4. 6 个函数缺少 `search_path` 设置

**缺少 search_path 的函数**:
1. `search_suppliers_by_name` - 搜索供应商
2. `calculate_supplier_score` - 计算绩效分数
3. `get_supplier_detail` - 获取供应商详情
4. `get_dashboard_stats` - 获取仪表板统计
5. `batch_update_supplier_tier` - 批量更新等级
6. `update_updated_at_column` - 更新时间戳

**风险**: SQL 注入攻击 - 攻击者可以通过操纵 `search_path` 来执行任意 SQL 代码。

**示例攻击**:
```sql
-- 攻击者可以通过修改 search_path 来执行恶意代码
SET search_path = 'public, malicious_schema';
SELECT * FROM calculate_supplier_score('...'); -- 可能执行恶意代码
```

---

### 5. pg_trgm 扩展安装在 public schema

**问题**: `pg_trgm`（全文搜索扩展）安装在 public schema，可能被恶意用户利用。

**建议**: 移动到独立的 schema，如 `extensions`

---

## 📈 INFO 级别问题（性能优化）

### 6. 未使用的外键索引

**表**: `business_line_contacts`
**外键**: `business_line_contacts_business_line_id_fkey`
**影响**: 关联查询性能下降

**修复**:
```sql
CREATE INDEX idx_business_line_contacts_business_line_id
ON business_line_contacts(business_line_id);
```

---

### 7. 19 个未使用的索引

未使用的索引会占用存储空间并降低写入性能。建议删除或监控使用情况。

---

## 🎯 修复优先级

### P0 - 立即修复（今天）
1. ✅ 为 8 个表启用 RLS
2. ✅ 修复所有 `USING (true)` 策略
3. ✅ 修复视图安全问题

### P1 - 尽快修复（本周）
4. ✅ 为所有函数设置 `search_path`
5. ✅ 移动 pg_trgm 扩展

### P2 - 性能优化（下个迭代）
6. ⚠️ 添加缺失的索引
7. ⚠️ 清理未使用的索引

---

## 📁 修复文件

已为您准备好修复 SQL 文件：

```
D:\SRM\database\migrations\20260210000001_fix_security_issues.sql
```

该文件包含：
- ✅ 启用所有表的 RLS
- ✅ 删除所有 `USING (true)` 策略
- ✅ 创建基于 `auth.role() = 'authenticated'` 的新策略
- ✅ 修复所有函数的 `search_path`
- ✅ 修复视图安全问题
- ✅ 添加缺失的索引

---

## 🚀 执行修复步骤

### 方式一：通过 Supabase Dashboard（推荐）

1. 登录 https://supabase.com/dashboard
2. 选择项目 `tdrbuwshyebmjqljggww`
3. 点击 **SQL Editor**
4. 点击 **New Query**
5. 复制 `database/migrations/20260210000001_fix_security_issues.sql` 内容
6. 点击 **Run** 执行
7. 检查输出确认无错误

### 方式二：通过命令行

```bash
# 使用 psql 直接执行
psql "postgresql://postgres:[PASSWORD]@db.tdrbuwshyebmjqljggww.supabase.co:5432/postgres" \
  -f D:/SRM/database/migrations/20260210000001_fix_security_issues.sql
```

---

## ✅ 验证修复

修复后，运行验证脚本：

```bash
node D:/SRM/database/scripts/verify-security-fix.js
```

或使用 Supabase MCP 工具重新扫描：

```javascript
// 检查安全问题
mcp__supabase__get_advisors({ type: 'security' })

// 检查性能问题
mcp__supabase__get_advisors({ type: 'performance' })
```

**预期结果**:
- ✅ 0 个 ERROR 级别问题
- ✅ 0-2 个 WARN 级别问题（仅 pg_trgm 扩展）
- ⚠️ 部分 INFO 级别问题（未使用索引）

---

## ⚡ 修复后的安全状态

修复后的 RLS 策略将要求：

```sql
-- 新策略（更安全）
CREATE POLICY "Allow authenticated access"
ON suppliers FOR ALL
USING (auth.role() = 'authenticated');  -- ✅ 需要登录
```

这意味着：
- ✅ 未登录用户无法访问任何数据
- ✅ 需要有效的 JWT token
- ✅ 基于用户角色的访问控制

---

## 🔐 生产环境额外建议

当前修复仅实现基础的认证检查。生产环境还需要：

### 1. 基于用户的行级访问控制

```sql
-- 示例：用户只能访问自己创建的数据
CREATE POLICY "Users can access own data"
ON suppliers
USING (created_by = auth.uid());
```

### 2. 基于角色的访问控制

```sql
-- 示例：只有管理员可以删除
CREATE POLICY "Admins can delete"
ON suppliers
FOR DELETE
USING (auth.jwt() ->> 'role' = 'admin');
```

### 3. 多租户隔离

```sql
-- 示例：使用 tenant_id 隔离数据
CREATE POLICY "Tenant isolation"
ON suppliers
USING (tenant_id = auth.jwt() ->> 'tenant_id');
```

---

## 📞 支持资源

- **修复指南**: `database/SECURITY_FIX_GUIDE.md`
- **修复 SQL**: `database/migrations/20260210000001_fix_security_issues.sql`
- **验证脚本**: `database/scripts/verify-security-fix.js`
- **Supabase 文档**: https://supabase.com/docs/guides/database/postgres/row-level-security

---

**报告生成**: 2026-02-10
**工具**: Supabase MCP Advisors + Claude Code
**下一步**: 执行 `20260210000001_fix_security_issues.sql` 并验证
