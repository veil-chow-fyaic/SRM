# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

**SRM (供应商关系管理系统)** 是一个基于 React + TypeScript + Vite 的现代化前端应用，采用"反常规"设计理念，将供应商视为**可经营的资产**而非简单的交易对象。

**核心设计哲学** (参见 `长期记忆/00_SRM_设计哲学.md`):
- **资产经营思维**: 供应商是"自家仓库的一部分"，关注持续稳定供应能力
- **结构适配优先**: 适配度 > 价格，强调"门当户对"的战略布局
- **P2P 链接管理**: B2B 本质是 Person to Person，管理决策链和关键人亲密度
- **主动赋能平台**: 正和博弈，输出管理能力，打造赋能生态

## 开发命令

```bash
# 开发服务器 (支持 HMR)
npm run dev

# 生产构建 (输出到 dist/)
npm run build

# 独立单文件构建 (输出到 dist-standalone/)
npm run build:standalone

# 代码检查
npm run lint

# 预览生产构建
npm run preview

# E2E 测试
npm run test                    # 运行所有测试
npm run test:ui                 # UI 模式
npm run test:headed             # 有头模式 (可见浏览器)
npm run test:debug              # 调试模式
npm run test:report             # 显示测试报告
```

## 技术栈与配置

### 核心技术
- **React 19.2.0** + **TypeScript 5.9.3** (严格模式全开)
- **Vite 7.2.4** - 构建工具
- **React Router DOM 7.13.0** - 使用 HashRouter (适合静态部署)
- **Tailwind CSS 3.4.17** - 自定义 brand 色系 (#e83e0b)
- **Recharts 3.7.0** - 数据可视化
- **Lucide React 0.563.0** - 图标库
- **Supabase** - 后端 BaaS (PostgreSQL + Auth + Realtime)
- **TanStack Query (React Query)** - 服务端状态管理

### TypeScript 配置
- 目标: ES2022, 模块: ESNext
- 启用所有严格检查 (`strict: true`)
- JSX 模式: `react-jsx` (自动运行时)

### 构建配置
- 标准构建: `vite.config.ts`
- 独立构建: `vite.standalone.config.ts` (使用 vite-plugin-singlefile)

## 项目架构

### 目录结构
```
src/
├── components/          # 可复用组件
│   ├── Layout.tsx       # 主布局 (侧边栏 + 顶部导航)
│   ├── CreateSupplierModal.tsx
│   ├── FileUploadDialog.tsx
│   └── ProtectedRoute.tsx  # 路由保护 (认证检查)
├── pages/               # 页面组件 (按功能模块)
├── contexts/            # React Context
│   └── AuthContext.tsx  # 用户认证状态管理
├── hooks/               # 自定义 React Hooks (数据获取)
├── services/            # API 服务层 (Supabase 调用)
├── types/               # TypeScript 类型定义
│   ├── database.ts      # Supabase 数据库类型
│   └── supplier.ts      # 供应商类型
├── data/                # 数据层
│   └── mockData.ts      # 模拟数据和核心类型定义
├── lib/                 # 工具函数
│   ├── utils.ts         # cn() 样式类名合并
│   ├── supabase.ts      # Supabase 客户端配置
│   ├── queryClient.tsx  # React Query Provider
│   └── dictionaries.ts  # 数据字典
├── models.ts            # 导出的数据模型 (SupplierSummary)
├── App.tsx              # 路由配置 (7层架构)
└── main.tsx             # 应用入口
```

### 数据流架构
```
Page Component → Custom Hook → Service Layer → Supabase (PostgreSQL)
                     ↓
              React Query (缓存 + 状态)
```

### 路由结构 (7层架构)
App.tsx 中定义的导航层级:
1. **驾驶舱** → `/` (Dashboard.tsx)
2. **资源中心** → 供应商列表/详情 (SupplierList/SupplierDetail)
3. **关系管理** → 互动日志 (集成在 SupplierDetail 中)
4. **绩效管理** → 生命周期/绩效评估/分级策略
5. **共赢门户** → 需求广播/赋能中心/工单系统
6. **业务配置** → SystemSettings.tsx
7. **支持中心** → ODC 审计

### 侧边栏菜单
Layout.tsx 中定义的菜单结构:
- 驾驶舱、潜在供应商、合作供应商、战略供应商、黑名单、业务配置、支持中心

## 核心数据模型

### Supplier 接口 (定义于 `src/data/mockData.ts`)
```typescript
interface Supplier {
  id: string
  name: string
  code: string
  tier: 'strategic' | 'core' | 'backup' | 'probation' | 'blacklisted'
  status: 'active' | 'inactive' | 'blacklisted'
  financial: { interval: string; anchor: string; period: number }
  performanceConfig?: { dimensions: {...}[]; evaluationPeriod: string }
  businessLines?: Array<{ type; description?; carriers?; routes?; contact }>
  portalAccess: { demandBroadcast; empowermentCenter; ticketSystem; performanceView }
  // ... 更多字段
}
```

### 数据字典 (DICTIONARIES)
- `intervals`: 月结/半月结/周结/票结
- `anchors`: ETD/ETA/Gate-in/Invoice Date
- `tiers`: 战略/核心/储备/考察期/黑名单

## 状态管理

**分层状态管理**:
- **服务端状态**: React Query (缓存、自动重新获取、乐观更新)
- **认证状态**: AuthContext (用户信息、登录状态)
- **组件状态**: useState (表单、UI 状态)

**数据获取模式**:
- 自定义 Hooks (`src/hooks/`) 封装 React Query 调用
- Service 层 (`src/services/`) 封装 Supabase API 调用
- 使用 RPC 函数优化复杂查询性能

## 认证系统

- **登录**: `/login` (Login.tsx)
- **注册**: `/register` (Register.tsx)
- **保护路由**: ProtectedRoute.tsx 检查认证状态
- **Supabase Auth**: PKCE 流程，token 自动刷新

## UI/UX 约定

### 样式系统
- **主色**: brand (#e83e0b) - 定义于 tailwind.config.js
- **样式优先级**: Tailwind 工具类 > 内联样式
- **条件样式**: 使用 `cn()` 函数合并类名

### 布局结构
- 固定侧边栏 (w-64 = 256px)
- 固定顶部导航 (h-16 = 64px)
- 主内容区自适应 (ml-64)

### 组件模式
- 页面组件内部定义子组件 (如 Card、Badge)
- 模态框优先使用内联形式 (避免路由跳转)
- 图标使用 Lucide React，保持语义化

## 核心功能页面

### SupplierDetail.tsx (最复杂)
供应商详情页，包含 6 个标签页:
1. **资产**: 基本信息、业务线、联系人
2. **资源**: 稀缺资源管理，关联具体控制人
3. **互动**: 互动日志 (双维维护: 业务+决策链)
4. **绩效**: 绩效历史、评估记录
5. **合同**: 合同管理
6. **决策链**: 决策链图谱，关键人亲密度管理

### Dashboard.tsx
驾驶舱主页，包含:
- 异常看板、我的任务、全域拜访日历
- 绩效看板 (主营/个人视图)
- 使用 Recharts 进行数据可视化

### SystemSettings.tsx
业务配置页，包含:
- 财务配置、门户权限、分级管理、绩效配置
- 左侧供应商列表 + 右侧配置面板
- 实时保存提示和脏数据检查

## 数据库架构

数据库定义在 `database/schema.sql`，核心表:
- `suppliers` - 供应商主表
- `business_lines` - 业务线
- `decision_chain` - 决策链成员
- `engagement_logs` - 互动日志 (PACD 模型)
- `performance_history` - 绩效历史
- `tasks` - 任务表
- `calendar_events` - 日历事件

## 测试

E2E 测试位于 `tests/e2e/`，使用 Playwright:
- `auth/login.spec.ts` - 登录测试
- `dashboard/dashboard.spec.ts` - 驾驶舱测试
- `suppliers/list.spec.ts` - 供应商列表测试
- `suppliers/detail.spec.ts` - 供应商详情测试
- `tasks/tasks.spec.ts` - 任务测试

## 设计理念落地要求

根据 `长期记忆/01_SRM_核心需求.md`:

1. **供应商即资产**: 以"供应商 ID"为核心资产包，服务能力作为"装备"挂在供应商身上
2. **经营人就是经营资源**: 决策链图谱存"权力结构"而非简单通讯录
3. **双维动态维护**: 强制从"主营业务特点"和"决策链特点"两个维度更新供应商画像

## 常见任务

### 添加新页面
1. 在 `src/pages/` 创建 TSX 文件
2. 在 `src/App.tsx` 添加路由
3. 如需侧边栏菜单，在 `src/components/Layout.tsx` 的 `menuStructure` 中添加

### 添加新的数据获取逻辑
1. 在 `src/types/` 定义类型
2. 在 `src/services/` 创建服务函数
3. 在 `src/hooks/` 创建自定义 Hook

### 修改数据模型
- 前端类型定义: `src/types/supplier.ts`
- 数据库类型: `src/types/database.ts`
- 模拟数据: `src/data/mockData.ts`

### 修改品牌颜色
编辑 `tailwind.config.js` 中的 `colors.brand` 配置

## 重要提示

- **路由模式**: 使用 HashRouter，路径格式为 `#/path`
- **国际化**: 当前仅支持中文
- **环境配置**: 复制 `.env.local.example` 为 `.env.local` 并配置 Supabase 凭据

## 代码注释语言

**现有代码库使用中文注释**。在添加新代码时，请保持使用中文注释以保持一致性。变量名和函数名仍应使用英文。

## 长期记忆文档

项目的设计文档和需求文档存储在 `长期记忆/` 目录:
- `00_SRM_设计哲学.md`: 四大反常规特点和核心管理逻辑
- `01_SRM_核心需求.md`: 五大核心要求和双维维护机制
- `02_供应商全景档案.md`: 供应商 360 度画像设计
- 其他会议记录和反馈文档
