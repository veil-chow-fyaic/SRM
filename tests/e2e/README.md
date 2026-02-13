# E2E 测试套件使用指南

**创建时间**: 2026-02-12
**测试框架**: Playwright 1.58.2

---

## 目录结构

```
tests/e2e/
├── auth/
│   └── login.spec.ts           # 认证功能测试（10 个测试）
├── dashboard/
│   └── dashboard.spec.ts       # 驾驶舱功能测试（12 个测试）
├── suppliers/
│   ├── list.spec.ts           # 供应商列表测试（12 个测试）
│   └── detail.spec.ts          # 供应商详情测试（16 个测试）
├── tasks/
│   └── tasks.spec.ts            # 任务管理测试（14 个测试）
├── fixtures/
│   └── test-data.ts           # 测试数据和选择器
└── helpers/
    └── test-helpers.ts         # 测试辅助函数
```

---

## 测试统计

| 模块 | 测试数量 | 覆盖功能 |
|-------|----------|----------|
| 认证系统 | 10 | 登录、登出、表单验证 |
| 驾驶舱 | 12 | 统计、异常看板、任务、日历 |
| 供应商列表 | 12 | 加载、筛选、搜索、导航 |
| 供应商详情 | 16 | 基本信息、标签切换、返回 |
| 任务管理 | 14 | 列表显示、创建、完成、筛选 |
| **总计** | **64** | **所有核心用户流程** |

---

## 快速开始

### 安装依赖
```bash
npm install
```

### 运行所有测试
```bash
# 无头模式（CI 环境）
npm test

# 有头模式（开发调试）
npm run test:headed

# UI 模式（交互式测试运行器）
npm run test:ui

# 调试模式
npm run test:debug
```

### 运行特定测试文件
```bash
# 只运行认证测试
npm test -- login

# 只运行驾驶舱测试
npm test -- dashboard

# 只运行供应商测试
npm test -- suppliers

# 只运行任务测试
npm test -- tasks
```

### 运行特定测试用例
```bash
# 运行单个测试
npm test -g "应该使用有效凭据成功登录"

# 运行包含关键词的测试
npm test -- grep "登录"

# 运行某个文件中的测试
npm test suppliers/list.spec.ts
```

### 查看测试报告
```bash
# 打开 HTML 报告
npm run test:report

# 或测试后自动打开
npm run test:ui
```

---

## 测试环境配置

### 必需环境变量
测试套件使用以下配置（已在 `playwright.config.ts` 中配置）：

```bash
# 开发服务器 URL
BASE_URL=http://localhost:5173

# 测试用户凭据
TEST_EMAIL=veil@aaa-china.net
TEST_PASSWORD=123456

# Supabase 配置（从 .env.local 读取）
SUPABASE_URL=https://veildev.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 前置条件
1. **开发服务器运行**: `npm run dev` 或配置自动启动
2. **数据库可访问**: Supabase 数据库在线
3. **测试用户存在**: veil@aaa-china.net 用户已创建

---

## 测试数据

### 认证凭据
```typescript
{
  email: 'veil@aaa-china.net',
  password: '123456',
}
```

### 已知供应商 ID
```typescript
// Evergreen Marine Corporation (Ningbo)
'550e8400-e29b-41d4-a716-446655440002'

// Maersk (Shenzhen) Ltd.
'550e8400-e29b-41d4-a716-446655440003'

// ONE Ocean Network Express (Shanghai)
'550e8400-e29b-41d4-a716-446655440004'
```

---

## 故障排除

### 测试失败

**问题**: 测试超时
- **原因**: 开发服务器未启动或网络慢
- **解决**: 确认 `npm run dev` 正在运行

**问题**: 元素未找到
- **原因**: 选择器与页面不匹配
- **解决**: 使用 `npm run test:debug` 查看页面截图

**问题**: 认证失败
- **原因**: 测试用户不存在或密码错误
- **解决**: 检查数据库中是否有测试用户

### 调试技巧

1. **使用 UI 模式**: `npm run test:ui` 提供可视化调试
2. **启用截图**: 失败的测试会自动保存到 `test-results/screenshots/`
3. **查看 trace**: 失败的测试会录制 trace，使用 `npx playwright show-trace` 查看
4. ** headed 模式**: `npm run test:headed` 可以看到浏览器运行

---

## 持续集成

### GitHub Actions 配置（待实施）

```yaml
# .github/workflows/e2e.yml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm install
      - run: npm run build
      - run: npx playwright install --with-deps
      - run: npm test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: test-results/
```

---

## 扩展测试

### 添加新测试

1. 在对应的模块目录下创建 `.spec.ts` 文件
2. 使用 `test.describe()` 组织测试套件
3. 使用 `test()` 编写测试用例
4. 使用 `beforeEach` 设置测试前置条件
5. 使用辅助函数简化常用操作

### 测试命名规范

```typescript
// 好的命名
test('应该能够成功登录')
test('应该显示错误消息')
test('应该能够创建新任务')

// 避免的命名
test('test login')  // 不够描述性
test('check something')  // 不够明确
```

---

## 维护

### 更新 Playwright
```bash
# 更新到最新版本
npm install -D @playwright/test@latest

# 安装浏览器
npx playwright install
```

### 更新测试选择器

当页面 UI 变化时，更新 `tests/e2e/fixtures/test-data.ts` 中的 `SELECTORS` 常量。

---

**文档更新**: 2026-02-12
**Playwright 版本**: 1.58.2
