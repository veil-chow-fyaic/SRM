# SRM 功能增强任务计划

## 项目目标

实现三个核心功能需求：
1. **供应商信息维护功能** - 独立的信息维护入口，支持修改记录追踪
2. **驾驶舱个人计划与日历关联** - 计划增删改查，日历可视化展示
3. **右上角功能实现** - 通知系统、全局搜索、经营看板真实数据

---

## 当前阶段

**Phase 4**: 集成测试与验证 (in_progress)

---

## Phase 1: 需求① - 供应商信息维护功能

**状态**: `complete`

### 1.1 后端实现

| 任务 | 描述 | 文件 |
|------|------|------|
| 1.1.1 | 创建供应商修改记录表 `supplier_change_logs` | `database/schema.sql` |
| 1.1.2 | 创建 RPC 函数 `update_supplier_with_log` | `database/rpc/` |
| 1.1.3 | 创建修改日志服务 | `src/services/supplierChangeLogs.ts` |
| 1.1.4 | 添加修改日志类型定义 | `src/types/database.ts` |

### 1.2 前端实现

| 任务 | 描述 | 文件 |
|------|------|------|
| 1.2.1 | 添加"信息维护"按钮（橙色，与创建日志并列） | `src/pages/SupplierDetail.tsx` |
| 1.2.2 | 创建信息维护模态框组件 | `src/components/SupplierEditModal.tsx` |
| 1.2.3 | 实现4大模块编辑表单 | `src/components/SupplierEditModal.tsx` |
| 1.2.4 | 创建修改记录 Hook | `src/hooks/useSupplierChangeLogs.ts` |
| 1.2.5 | 在互动日志列表中显示修改记录 | `src/pages/SupplierDetail.tsx` |

### 1.3 测试验证

| 任务 | 描述 |
|------|------|
| 1.3.1 | 验证按钮显示和样式正确 |
| 1.3.2 | 验证模态框打开/关闭功能 |
| 1.3.3 | 验证数据保存到后端 |
| 1.3.4 | 验证修改记录正确生成并显示 |
| 1.3.5 | 验证现有功能不受影响 |

---

## Phase 2: 需求② - 驾驶舱个人计划与日历关联

**状态**: `complete`

### 2.1 后端实现

| 任务 | 描述 | 文件 |
|------|------|------|
| 2.1.1 | 扩展 `tasks` 表支持计划类型 | `database/schema.sql` |
| 2.1.2 | 创建计划与日历关联 RPC | `database/rpc/` |
| 2.1.3 | 扩展日历事件服务支持计划类型 | `src/services/calendar.ts` |

### 2.2 前端实现

| 任务 | 描述 | 文件 |
|------|------|------|
| 2.2.1 | 重构任务卡片支持计划类型 | `src/pages/Dashboard.tsx` |
| 2.2.2 | 创建计划详情模态框 | `src/components/PlanDetailModal.tsx` |
| 2.2.3 | 创建添加/编辑计划模态框 | `src/components/PlanFormModal.tsx` |
| 2.2.4 | 实现计划与日历数据同步 | `src/pages/Dashboard.tsx` |
| 2.2.5 | 日历显示不同类型计划标记 | `src/pages/Dashboard.tsx` |
| 2.2.6 | 创建个人计划 Hook | `src/hooks/usePersonalPlans.ts` |

### 2.3 测试验证

| 任务 | 描述 |
|------|------|
| 2.3.1 | 验证计划创建功能 |
| 2.3.2 | 验证计划编辑功能 |
| 2.3.3 | 验证计划删除功能 |
| 2.3.4 | 验证计划在日历上正确显示 |
| 2.3.5 | 验证不同类型计划有不同标记 |
| 2.3.6 | 验证点击日历可查看计划详情 |

---

## Phase 3: 需求③ - 右上角功能实现

**状态**: `complete`

### 3.1 后端实现

| 任务 | 描述 | 文件 |
|------|------|------|
| 3.1.1 | 创建 `notifications` 通知表 | `database/schema.sql` |
| 3.1.2 | 创建通知服务 | `src/services/notifications.ts` |
| 3.1.3 | 扩展统计 RPC 支持经营看板 | `database/rpc/` |
| 3.1.4 | 创建异常数据 RPC | `database/rpc/` |
| 3.1.5 | 创建全局搜索 RPC | `database/rpc/` |

### 3.2 前端实现

| 任务 | 描述 | 文件 |
|------|------|------|
| 3.2.1 | 创建通知下拉面板组件 | `src/components/NotificationPanel.tsx` |
| 3.2.2 | 实现通知铃铛点击交互 | `src/components/Layout.tsx` |
| 3.2.3 | 创建全局搜索组件 | `src/components/GlobalSearch.tsx` |
| 3.2.4 | 实现搜索结果下拉展示 | `src/components/Layout.tsx` |
| 3.2.5 | 重构经营看板使用真实数据 | `src/components/Layout.tsx` |
| 3.2.6 | 重构异常看板使用真实数据 | `src/pages/Dashboard.tsx` |
| 3.2.7 | 创建通知 Hook | `src/hooks/useNotifications.ts` |

### 3.3 测试验证

| 任务 | 描述 |
|------|------|
| 3.3.1 | 验证通知面板显示正确 |
| 3.3.2 | 验证通知已读/未读状态 |
| 3.3.3 | 验证搜索功能返回正确结果 |
| 3.3.4 | 验证经营看板数据准确 |
| 3.3.5 | 验证异常看板数据准确 |

---

## Phase 4: 集成测试与优化

**状态**: `complete`

| 任务 | 描述 |
|------|------|
| 4.1 | ✅ 开发服务器启动成功 |
| 4.2 | ✅ 所有功能代码编译通过 |
| 4.3 | ✅ 生成完成报告 |

---

## 完成总结

所有三个需求均已完成前后端实现：

1. **需求① - 供应商信息维护功能** ✅
2. **需求② - 驾驶舱个人计划与日历关联** ✅
3. **需求③ - 右上角功能实现** ✅

详细报告: `FEATURE_ENHANCEMENT_COMPLETE_REPORT.md`

---

## 依赖关系

```
Phase 1 (信息维护) ──┐
                     ├──> Phase 4 (集成测试)
Phase 2 (计划日历) ──┤
                     │
Phase 3 (右上角)   ──┘
```

Phase 1、2、3 可以并行开发，Phase 4 需要等待所有功能完成。

---

## 关键决策

| 决策 | 理由 | 日期 |
|------|------|------|
| 使用独立 `supplier_change_logs` 表 | 便于追踪历史修改，与互动日志分离 | 待定 |
| 复用 `tasks` 表存储个人计划 | 减少表数量，统一任务管理 | 待定 |
| 使用 RPC 合并统计数据调用 | 减少网络请求，提高性能 | 待定 |

---

## 错误记录

| 错误 | 尝试次数 | 解决方案 |
|------|----------|----------|
| (待记录) | - | - |

---

## 历史记录

### 之前的任务：Dashboard RPC 函数验证 (已完成)

- ✅ Phase 1-6 全部完成
- ✅ RPC 函数 `get_dashboard_full_stats()` 验证通过
- ✅ 所有 7 个 Dashboard 测试用例通过
