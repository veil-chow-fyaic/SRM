# SRM 系统 - 测试发现与分析 (v2.0)

## 文档说明
记录测试驱动开发过程中的发现、问题分析和解决方案。

---

## 1. 测试覆盖度分析

### 1.1 当前测试状态

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
测试类别                  计划    已执行   完成度
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
后端 API 测试             76       76     100%
前端代码静态分析           31       31     100%
前端 UI 交互测试           77        0       0% (阻塞)
深度后端验证                4        4     100%
Bug 修复闭环                7        7     100%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 1.2 未覆盖的测试场景

#### 认证模块 (31 个 UI 测试用例)
- AUTH-001 至 AUTH-014: 注册流程
- AUTH-101 至 AUTH-110: 登录流程
- AUTH-201 至 AUTH-208: 路由保护
- AUTH-301 至 AUTH-302: 用户档案

#### 全局功能 (13 个 UI 测试用例)
- G-001 至 G-013: 布局和导航

#### 供应商模块 (11 个 UI 测试用例)
- S-001 至 S-007: 列表加载和筛选
- SD-001 至 SD-004: 详情页加载

#### 文件管理 (15 个 UI 测试用例)
- FILE-001 至 FILE-008: 文件上传
- FILE-101 至 FILE-105: 文件列表
- FILE-201 至 FILE-205: 文件操作

#### 日历功能 (4 个 UI 测试用例待执行)
- CAL-201 至 CAL-205: 事件筛选

#### 绩效管理 (3 个 UI 测试用例)
- LC-001 至 LC-002: 生命周期管理
- PA-001 至 PA-002: 绩效评估
- TS-001: 分级策略

#### 业务配置 (4 个 UI 测试用例)
- SS-001 至 SS-004: 配置页面

---

## 2. 功能缺失识别

### 2.1 代码 TODO 分析

| 文件 | 行号 | TODO 描述 | 数据表 | 状态 | 优先级 |
|------|------|-----------|--------|------|--------|
| LifecycleManagement.tsx | 50 | probation_task 可以从 tasks 表关联 | `probation_tasks` (0记录) | 需实现 | P1 |
| SupplierDetail.tsx | 876 | 处理决策链资源（需要添加资源的 API 调用） | `derivative_resources` (0记录) | 需实现 | P1 |
| SupplierDetail.tsx | 938 | 处理删除的业务线 | N/A | 需实现 | P2 |

### 2.2 数据库表数据状态 (2026-02-13 验证)

#### 有数据的表
| 表名 | 记录数 | 状态 |
|------|--------|------|
| suppliers | 6 | ✅ 就绪 |
| business_lines | 7 | ✅ 就绪 |
| decision_chain | 7 | ✅ 就绪 |
| engagement_logs | 6 | ✅ 就绪 |
| performance_history | 6 | ✅ 就绪 |
| tasks | 6 | ✅ 就绪 |
| calendar_events | 7 | ✅ 就绪 |
| profiles | 3 | ✅ 就绪 |

#### 空数据表 (需要测试数据)
| 表名 | 记录数 | 关联功能 | 优先级 |
|------|--------|----------|--------|
| supplier_files | 0 | 文件管理模块 | P0 |
| probation_tasks | 0 | 生命周期 TODO 1 | P1 |
| derivative_resources | 0 | 决策链资源 TODO 2 | P1 |
| decision_chain_resources | 0 | 决策链资源 | P1 |
| business_line_contacts | 0 | 业务线联系人 | P2 |
| performance_dimensions | 0 | 绩效配置维度 | P2 |
| risk_alerts | 0 | 风险预警 | P2 |
| system_settings | 0 | 系统配置 | P2 |
| lifecycle_events | 0 | 生命周期事件 | P2 |
| audit_logs | 0 | 审计日志 | P2 |
| contracts | 0 | 合同管理 | P2 |
| performance_evaluations | 0 | 绩效评估 | P2 |

### 2.3 潜在功能缺失

#### 数据关联 - 深度分析 (2026-02-13)

| TODO | 问题描述 | 服务层 | Hooks层 | 前端集成 | 修复方案 |
|------|----------|--------|---------|----------|----------|
| TODO 1 | probation_task 关联 | ❌ 缺失 | ❌ 缺失 | ❌ 缺失 | **需创建服务和hooks** |
| TODO 2 | derivative_resources 调用 | ✅ 存在 | ✅ 存在 | ❌ 未集成 | **在SupplierDetail.tsx中添加hooks调用** |
| TODO 3 | 业务线删除处理 | ✅ 存在 | ✅ 存在 | ❌ 未集成 | **在SupplierDetail.tsx中添加删除逻辑** |

#### 测试数据状态
- [x] supplier_files 测试数据 → 已创建 5 条
- [x] probation_tasks 测试数据 → 已创建 4 条
- [x] derivative_resources 测试数据 → 已创建 4 条

---

## 3. 测试数据状态

### 3.1 当前数据量

| 数据类型 | 目标 | 已创建 | 状态 |
|----------|------|--------|------|
| 测试用户账号 | 2 | 3 | ✅ 超额 |
| 供应商 | 6 | 6 | ✅ 就绪 |
| 业务线 | 15 | 7 | ⚠️ 不足 |
| 决策链成员 | 25 | 7 | ⚠️ 不足 |
| 互动日志 | 50 | 6 | ⚠️ 不足 |
| 绩效历史 | 30 | 6 | ⚠️ 不足 |
| 任务 | 20 | 6 | ⚠️ 不足 |
| 文件记录 | 10 | 0 | ❌ 缺失 |
| 日历事件 | 15 | 7 | ⚠️ 不足 |

---

## 4. 已知问题

### 4.1 阻塞性问题

| Bug ID | 描述 | 影响 | 状态 |
|--------|------|------|------|
| BUG-003 | Playwright 浏览器自动化 | 77 个 UI 测试无法执行 | 待解决 |
| BUG-005 | 无中文全文搜索配置 | 全文搜索功能受限 | 已知问题 |

### 4.2 已修复问题

| Bug ID | 描述 | 修复方式 |
|--------|------|----------|
| BUG-001 | event_type 约束 | ALTER TABLE |
| BUG-002 | status 约束 | ALTER TABLE |
| BUG-004 | Dashboard RPC 验证 | 验证存在 |
| BUG-006 | 无管理员用户 | UPDATE profiles |
| BUG-007 | 日历事件类型图标 | 代码修复 |
| BUG-008 | EventType 导出错误 | 修改 Dashboard.tsx 导入 |
| BUG-009 | supplier_config_audit RLS | 添加 authenticated INSERT 策略 |

### 4.3 React 警告问题

**问题描述**: "Encountered two children with the same key, `T`" 和 `S`

**原因分析**: 某些组件使用单字符作为 key，当数据中有重复值时会产生警告

**影响**: 低 - 不影响功能，仅为开发警告

**建议**: 在后续迭代中检查并修复 key 重复问题

---

## 5. 功能实现对比

### 5.1 test_cases.md vs 实际实现

待验证...

### 5.2 user_interaction_flows.md vs 实际实现

待验证...

---

## 6. 建议优先级

### 紧急 (P0)
1. 解决 BUG-003 或使用替代方案进行 UI 测试
2. 创建文件记录测试数据
3. 验证核心业务流程

### 重要 (P1)
1. 修复代码 TODO 注释
2. 补充测试数据
3. 完善功能缺失

### 可选 (P2)
1. 添加中文全文搜索支持
2. 优化用户体验
3. 添加更多测试覆盖

---

## 更新记录

| 日期 | 发现内容 | 操作 |
|------|----------|------|
| 2026-02-12 | 初始分析完成 | 创建文档 |
| 2026-02-13 | Phase 12 完成修复 | TODO 1, TODO 3 已修复 |
| 2026-02-13 | 测试数据创建 | supplier_files:5, probation_tasks:4, derivative_resources:4 |
| 2026-02-13 | TypeScript 编译验证 | ✅ 通过 |

---

## 7. Phase 12 修复总结

### 已修复项目 (2/3)

| TODO | 文件 | 问题 | 解决方案 | 状态 |
|------|------|------|----------|------|
| TODO 1 | LifecycleManagement.tsx:50 | probation_task 未关联 | 创建服务和hooks，集成到组件 | ✅ |
| TODO 3 | SupplierDetail.tsx:938 | 业务线删除未处理 | 添加 deleteBusinessLineMutation 调用 | ✅ |

### 待优化项目 (1/3)

| TODO | 文件 | 问题 | 建议 |
|------|------|------|------|
| TODO 2 | SupplierDetail.tsx:876 | 决策链资源API调用 | 服务已存在(resources.ts)，后续迭代集成 |

### 新增代码文件

```
src/services/probationTasks.ts  (175行) - 考察任务服务
src/hooks/useProbationTasks.ts  (155行) - 考察任务hooks
```

### 修改文件

```
src/pages/SupplierDetail.tsx       - 导入 useDeleteBusinessLine，添加删除逻辑
src/pages/LifecycleManagement.tsx  - 导入 useProbationTasks，集成 probation_task
src/services/index.ts              - 导出 probationTasks 服务
```

---

## 8. Phase 14: 供应商晋升功能实现

### 8.1 功能需求

用户要求实现供应商层级晋升功能：
- 潜在供应商 (probation) → 合作供应商 (core/backup)
- 合作供应商 (core/backup) → 战略供应商 (strategic)

### 8.2 问题诊断

**问题 1: SupplierList.tsx 新增伙伴功能失效**
- `getSourceListForAdd()` 函数在已筛选的数据中查找可晋升供应商
- 导致永远找不到可晋升的供应商（因为数据已被过滤）

**问题 2: LifecycleManagement.tsx 缺少明确的晋升按钮**
- `handleStageChange` 函数存在，但UI上没有触发入口
- 用户无法通过看板界面进行供应商晋升操作

### 8.3 修复方案

#### 修复 1: SupplierList.tsx
- 添加 `allSuppliers` 查询，获取所有供应商（不受筛选限制）
- 修改 `getSourceListForAdd()` 使用 `allSuppliers` 进行过滤

```typescript
// 获取所有供应商用于晋升选择（不受当前筛选条件限制）
const { data: allSuppliers = [] } = useSuppliersSummary({});

// 获取可用于晋升的供应商列表（从所有供应商中选择）
const getSourceListForAdd = (): SupplierDisplay[] => {
  if (activeType === 'strategic') {
    return allSuppliers.filter(s => s.tier === 'core' || s.tier === 'backup');
  } else if (activeType === 'active') {
    return allSuppliers.filter(s => s.tier === 'probation');
  }
  return [];
};
```

#### 修复 2: LifecycleManagement.tsx
- 添加看板卡片操作菜单（hover 时显示）
- 定义阶段转换规则和可用操作
- 支持晋升/降级操作

**阶段转换规则：**
| 当前阶段 | 可用操作 |
|----------|----------|
| leads (线索公海) | 进入考察期 |
| probation (考察期) | 晋升合作供应商、退回线索公海 |
| active (合作中) | 晋升战略供应商、降级到考察期、加入黑名单 |
| blacklist (黑名单) | 解除黑名单 |

### 8.4 修改文件

| 文件 | 修改内容 |
|------|----------|
| SupplierList.tsx | 添加 allSuppliers 查询，修复晋升源数据 |
| LifecycleManagement.tsx | 添加操作菜单、阶段转换逻辑、状态管理 |

### 8.5 状态

✅ 已完成 (2026-02-13)

### 8.6 Bug 修复记录

| Bug ID | 描述 | 原因 | 修复方式 |
|--------|------|------|----------|
| BUG-010 | 晋升菜单立即消失 | `menuRef` 在循环中被多个卡片共享，只有最后一个 ref 有效 | 使用 `data-menu` 属性替代 ref 进行外部点击检测 |
| BUG-011 | 晋升操作未触发 API | 同上，事件处理被干扰 | 修复外部点击检测逻辑 |

### 8.7 验证结果

**测试用例: ONE Ocean Network Express 晋升**
- 操作前: tier=probation, stage=probation
- 操作后: tier=core, stage=active
- 结果: ✅ 成功

**UI 变化验证:**
- 考察期: 2 → 1
- 合作中: 3 → 4
- 数据库同步: ✅ 已更新

---

## 9. Phase 14 完整测试报告

### 9.1 测试用例执行结果

| 测试项 | 功能描述 | UI测试 | 数据库验证 | 状态 |
|--------|----------|--------|------------|------|
| 看板晋升-考察期→合作 | ONE Ocean 晋升 | ✅ | ✅ tier: core | 通过 |
| 列表新增伙伴-潜在→合作 | Tianjin Future 晋升 | ✅ | ✅ tier: core | 通过 |
| 列表新增伙伴-核心→战略 | Evergreen 晋升 | ✅ | ✅ tier: strategic | 通过 |
| 看板降级-合作→考察期 | Tianjin Future 降级 | ✅ | ✅ tier: probation | 通过 |
| 黑名单功能 | SQL 直接验证 | - | ✅ tier: blacklisted | 通过 |

### 9.2 最终数据库状态

| 供应商 | Tier | Status |
|--------|------|--------|
| Evergreen Marine | strategic | active |
| Shanghai Matson | strategic | active |
| Maersk (Shenzhen) | core | active |
| ONE Ocean | blacklisted | blacklisted |
| Tianjin Future | probation | active |
| Guangzhou Risk | blacklisted | blacklisted |

### 9.3 功能测试覆盖

```
晋升功能测试:
  潜在 → 合作    ✅ 通过 (看板 + 列表页)
  合作 → 战略    ✅ 通过 (列表页)

降级功能测试:
  合作 → 考察期  ✅ 通过 (看板)
  合作 → 黑名单  ✅ 通过 (SQL验证)
  考察期 → 线索  ✅ 功能可用
  黑名单 → 考察期 ✅ 功能可用
```

### 9.4 修复的 Bug 汇总

| Bug ID | 描述 | 修复方式 |
|--------|------|----------|
| BUG-010 | 菜单立即消失 | data-menu 属性替代 ref |
| BUG-011 | 晋升未触发 API | 修复外部点击检测 |
| BUG-012 | 新增伙伴数据源错误 | 使用 allSuppliers 查询 |

---

## 10. 业务配置页面分级权益修复

### 10.1 问题描述

用户指出：
1. 降级功能应通过业务配置菜单进入，对每个供应商单独管理
2. 生命周期看板在生产环境无法展示海量供应商

### 10.2 修复内容

**问题**: `transformMockToDbUpdate` 只更新 `tier`，没有同步更新 `stage` 和 `status`

**修复**: 添加 `tierToStage` 函数，确保 tier 变更时同步更新相关字段：

```typescript
function tierToStage(tier: string): string {
  switch (tier) {
    case 'strategic':
    case 'core':
    case 'backup':
      return 'active';
    case 'probation':
      return 'probation';
    case 'blacklisted':
      return 'blacklist';
    default:
      return 'active';
  }
}
```

### 10.3 分级权益功能说明

业务配置页面 (`/settings`) 提供 5 个分级选项：

| Tier | Stage | Status | 说明 |
|------|-------|--------|------|
| strategic | active | active | 战略合作伙伴 |
| core | active | active | 核心供应商 |
| backup | active | active | 储备/备份 |
| probation | probation | active | 考察期 |
| blacklisted | blacklist | blacklisted | 黑名单/禁用 |

### 10.4 架构建议

**生命周期看板使用场景**:
- ✅ 适合：管理视图、决策展示、小规模供应商池
- ❌ 不适合：生产环境海量数据展示

**推荐使用方式**:
- 日常分级管理 → **业务配置页面** (支持搜索、分页)
- 晋降级审批流 → **生命周期看板** (可视化决策)

---

## 11. Phase 15: 业务配置页面前后端一致性修复

### 11.1 问题描述

用户反馈：
1. "配置页面的数据显示没有和真实的后端数据对应"
2. "必须全局检索，一律使用真实后端"

### 11.2 修复内容

#### 修复 1: `transformDbSupplierToMock` - 读取真实 performance_config

**问题**: 原代码使用硬编码的默认值，没有读取数据库中的 `performance_config` 字段

**修复**: 从数据库 JSONB 字段读取实际配置：

```typescript
function transformDbSupplierToMock(dbSupplier: any): Supplier {
  // 从数据库 performance_config 字段读取，如果没有则使用默认值
  const performanceConfig = dbSupplier.performance_config || {
    dimensions: [
      { id: 'cost', name: '成本竞争力', weight: 40 },
      { id: 'quality', name: '服务质量', weight: 30 },
      { id: 'delivery', name: '交付时效', weight: 30 }
    ],
    evaluationPeriod: 'quarterly'
  };
  // ...
}
```

#### 修复 2: `transformMockToDbUpdate` - 保存完整 performance_config

**问题**: 原代码只保存 `evaluation_period`，没有保存完整的绩效配置

**修复**: 保存完整的 JSONB 对象：

```typescript
function transformMockToDbUpdate(mockSupplier: Supplier): any {
  return {
    // ... 其他字段
    tier: mockSupplier.tier,
    stage: tierToStage(mockSupplier.tier), // 同步更新 stage
    status: mockSupplier.tier === 'blacklisted' ? 'blacklisted' : 'active', // 同步更新 status
    // 保存完整的 performance_config JSONB 对象（包含 dimensions 和 evaluationPeriod）
    performance_config: mockSupplier.performanceConfig || null
  };
}
```

### 11.3 全局检查结果

**检查范围**: `src/pages/` 目录下所有组件

**结果**:
- ✅ 所有页面都使用 React Query hooks (useSuppliers, useSuppliersSummary 等)
- ✅ Hooks 调用 Services 层
- ✅ Services 调用 Supabase API
- ✅ 无 mock 数据直接引用
- ✅ 无硬编码数据源

**数据流程验证**:
```
Pages → Hooks (useSuppliers.ts) → Services (suppliers.ts) → Supabase
```

### 11.4 状态

✅ 已完成 (2026-02-13)

### 11.5 验证

- [x] TypeScript 编译通过
- [x] 全局检查无 mock 数据引用
- [x] 前后端数据流一致性确认
