/**
 * 测试数据 Fixtures
 *
 * 提供测试用的示例数据和工具函数
 */

/**
 * 测试用户凭据
 */
export const TEST_USER = {
  email: 'veil@aaa-china.net',
  password: '123456',
  name: 'veiluser',
} as const;

/**
 * 页面 URL 映射
 */
export const PAGE_URLS = {
  login: '/login',
  dashboard: '/',
  suppliers: '/suppliers',
  supplierDetail: (id: string) => `/suppliers/${id}`,
  tasks: '/tasks',
  settings: '/settings',
} as const;

/**
 * 等待时间配置（毫秒）
 */
export const WAIT_TIMES = {
  instant: 100,
  short: 500,
  medium: 1000,
  long: 3000,
  extraLong: 10000,
} as const;

/**
 * 选择器配置
 */
export const SELECTORS = {
  // 认证页面
  auth: {
    emailInput: 'input[placeholder*="邮箱" i], input[type="email"]',
    passwordInput: 'input[type="password"]',
    submitButton: 'button[type="submit"], button:has-text("登录")',
    logoutButton: 'button:has-text("登出"), a:has-text("登出")',
    registerLink: 'a:has-text("立即注册")',
  },

  // 驾驶舱
  dashboard: {
    container: '[aria-label="驾驶舱"], .dashboard',
    statsGrid: '.stats-grid',
    alertsSection: '[aria-label="异常看板"], .alerts-section',
    tasksSection: '[aria-label="我的任务"], .tasks-section',
    calendarSection: '[aria-label="全域拜访日历"], .calendar-section',
  },

  // 供应商列表
  suppliers: {
    listContainer: '.supplier-list, [aria-label="供应商列表"]',
    supplierCard: 'a[href*="/suppliers/"]',
    filterAll: 'button:has-text("全部")',
    filterActive: 'button:has-text("合作供应商")',
    filterStrategic: 'button:has-text("战略供应商")',
    filterBlacklist: 'button:has-text("黑名单")',
    searchInput: 'input[placeholder*="搜索" i], input[type="search"]',
  },

  // 供应商详情
  supplierDetail: {
    container: '.supplier-detail, [aria-label="供应商详情"]',
    tabBasic: 'button:has-text("资产"), button:has-text("基本信息")',
    tabResource: 'button:has-text("资源")',
    tabEngagement: 'button:has-text("互动")',
    tabPerformance: 'button:has-text("绩效")',
    tabContract: 'button:has-text("合同")',
    tabDecisionChain: 'button:has-text("决策链")',
  },

  // 通用
  common: {
    loadingSpinner: '[aria-label="加载中"], .loading, [data-loading="true"]',
    errorMessage: '[role="alert"], .error, [data-error="true"]',
    successMessage: '[role="status"], .success, [data-success="true"]',
  },
} as const;

/**
 * 生成随机测试数据
 */
export function generateRandomId(): string {
  return `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 生成测试用供应商名称
 */
export function generateTestSupplierName(suffix?: string): string {
  const timestamp = Date.now();
  return `测试供应商_${suffix || timestamp}`;
}

/**
 * 生成测试用任务标题
 */
export function generateTestTaskTitle(suffix?: string): string {
  const timestamp = Date.now();
  return `测试任务_${suffix || timestamp}`;
}

/**
 * 延迟函数
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 格式化日期为测试友好的字符串
 */
export function formatDateForTest(date: Date): string {
  return date.toISOString().split('T')[0];
}
