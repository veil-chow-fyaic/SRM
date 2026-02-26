<div align="center">

# SRM

**供应商关系管理系统**

*将供应商视为可经营资产的战略管理平台*

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

[在线演示](#) · [快速开始](#-快速开始) · [文档](./docs/README.md) · [反馈问题](https://github.com/fyaic/SRM/issues)

<img src="https://via.placeholder.com/800x400?text=SRM+Dashboard+Preview" alt="SRM Dashboard" width="100%">

</div>

---

## 📖 项目简介

SRM（Supplier Relationship Management）是一个现代化的供应商关系管理系统，采用"反常规"设计理念，将供应商视为**可经营的资产**而非简单的交易对象。

### 🎯 核心设计哲学

| 理念 | 描述 |
|------|------|
| **资产经营思维** | 供应商是"自家仓库的一部分"，关注持续稳定供应能力 |
| **结构适配优先** | 适配度 > 价格，强调"门当户对"的战略布局 |
| **P2P 链接管理** | B2B 本质是 Person to Person，管理决策链和关键人亲密度 |
| **主动赋能平台** | 正和博弈，输出管理能力，打造赋能生态 |

### ✨ 核心功能

- 🏠 **驾驶舱** - 全局数据概览、异常看板、任务管理
- 📊 **供应商管理** - 360° 全景档案、生命周期管理
- 🔗 **决策链图谱** - 关键人关系、亲密度追踪
- 📈 **绩效评估** - 多维度绩效分析、历史追踪
- 📝 **互动日志** - PACD 模型、双维动态维护
- ⚙️ **系统配置** - 业务规则、门户权限、分级策略

---

## 🛠️ 技术栈

<table>
<tr>
<td width="50%">

### 前端
- **React 19** - UI 框架
- **TypeScript 5.9** - 类型安全
- **Vite 7** - 构建工具
- **Tailwind CSS 3.4** - 样式框架
- **TanStack Query** - 服务端状态管理
- **Recharts** - 数据可视化
- **Lucide React** - 图标库

</td>
<td width="50%">

### 后端 & 基础设施
- **Supabase** - BaaS 平台
  - PostgreSQL 数据库
  - 认证服务
  - Row Level Security
  - Realtime 订阅
- **Resend** - 邮件服务
- **Cloudflare** - DNS 托管
- **Netlify** - 静态部署

</td>
</tr>
</table>

---

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装步骤

```bash
# 1. 克隆仓库
git clone https://github.com/fyaic/SRM.git
cd SRM

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.local.example .env.local
# 编辑 .env.local 填入 Supabase 配置

# 4. 启动开发服务器
npm run dev
```

### 环境变量配置

```env
# .env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 常用命令

| 命令 | 描述 |
|------|------|
| `npm run dev` | 启动开发服务器 (http://localhost:5173) |
| `npm run build` | 生产构建 |
| `npm run build:standalone` | 独立单文件构建 |
| `npm run lint` | 代码检查 |
| `npm run test` | 运行 E2E 测试 |
| `npm run test:ui` | Playwright UI 模式 |

---

## 📁 项目结构

```
SRM/
├── src/
│   ├── components/       # 可复用组件
│   │   ├── Layout.tsx    # 主布局
│   │   └── ProtectedRoute.tsx
│   ├── pages/            # 页面组件
│   │   ├── Dashboard.tsx
│   │   ├── SupplierList.tsx
│   │   ├── SupplierDetail.tsx
│   │   └── ...
│   ├── hooks/            # 自定义 Hooks
│   ├── services/         # API 服务层
│   ├── contexts/         # React Context
│   ├── types/            # TypeScript 类型
│   ├── lib/              # 工具函数
│   └── data/             # 静态数据/字典
├── docs/                 # 文档
│   └── ai-backend-development-guide/
├── tests/                # E2E 测试
├── database/             # 数据库 Schema
└── public/               # 静态资源
```

---

## 📚 文档

### AI 后端开发指南

专为 AI Coding Agent 设计的 Supabase + React 全栈开发模式文档。

| 文档 | 描述 |
|------|------|
| [📖 导航索引](./docs/ai-backend-development-guide/00-INDEX.md) | 快速导航到你需要的内容 |
| [⚡ 快速开始](./docs/ai-backend-development-guide/01-QUICK-START.md) | 5分钟上手最小示例 |
| [🔧 Supabase 配置](./docs/ai-backend-development-guide/02-SUPABASE-SETUP.md) | 项目创建、MCP 配置 |
| [🗄️ 数据库设计](./docs/ai-backend-development-guide/03-DATABASE-DESIGN.md) | 表设计、RLS 策略 |
| [⚙️ RPC 函数](./docs/ai-backend-development-guide/04-RPC-FUNCTIONS.md) | 函数开发、性能优化 |
| [🎨 前端集成](./docs/ai-backend-development-guide/05-FRONTEND-INTEGRATION.md) | React Query、类型安全 |
| [🔐 认证与邮件](./docs/ai-backend-development-guide/06-AUTH-EMAIL.md) | Resend + Cloudflare 配置 |
| [🧪 测试策略](./docs/ai-backend-development-guide/07-TESTING.md) | 分层测试方法 |
| [🔧 故障排除](./docs/ai-backend-development-guide/08-TROUBLESHOOTING.md) | 常见问题解决方案 |
| [🔄 项目交接](./docs/ai-backend-development-guide/09-PROJECT-HANDOVER.md) | 项目转移、SDK 配置指南 |

👉 [查看完整文档中心](./docs/README.md)

---

## 🏗️ 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │  Pages  │  │  Hooks  │  │Contexts │  │Components│        │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘        │
│       │            │            │            │              │
│       └────────────┴────────────┴────────────┘              │
│                          │                                   │
│                   TanStack Query                            │
│                          │                                   │
└──────────────────────────┼───────────────────────────────────┘
                           │
                    ┌──────┴──────┐
                    │   Services  │
                    └──────┬──────┘
                           │
┌──────────────────────────┼───────────────────────────────────┐
│                     Supabase BaaS                           │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │   Auth  │  │Database │  │ Storage │  │ Realtime│        │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘        │
│                          │                                   │
│                   PostgreSQL + RLS                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 贡献方式

1. **报告 Bug** - [提交 Issue](https://github.com/fyaic/SRM/issues)
2. **功能建议** - [功能讨论](https://github.com/fyaic/SRM/discussions)
3. **代码贡献** - Fork → Branch → PR

### 开发流程

```bash
# 1. Fork 并克隆
git clone https://github.com/your-username/SRM.git

# 2. 创建功能分支
git checkout -b feature/your-feature

# 3. 提交更改
git commit -m 'feat: add some feature'

# 4. 推送分支
git push origin feature/your-feature

# 5. 创建 Pull Request
```

### 代码规范

- 使用 ESLint + TypeScript 严格模式
- 遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范
- 保持代码注释与现有代码库语言一致（中文）

---

## 📄 许可证

本项目基于 [MIT](LICENSE) 许可证开源。

---

## 🙏 致谢

- [Supabase](https://supabase.com/) - 开源 Firebase 替代方案
- [React](https://react.dev/) - 用户界面库
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
- [Lucide](https://lucide.dev/) - 美观的开源图标

---

<div align="center">

**[⬆ 返回顶部](#srm)**

Made with ❤️ by SRM Team

</div>
