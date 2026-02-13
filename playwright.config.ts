import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E 测试配置
 *
 * 配置测试环境、浏览器选项和报告输出
 */

export default defineConfig({
  // 测试目录
  testDir: './tests/e2e',

  // 并行执行测试（加快速度）
  fullyParallel: true,

  // CI 环境下禁止 only 测试
  forbidOnly: !!process.env.CI,

  // CI 环境下重试失败的测试
  retries: process.env.CI ? 2 : 0,

  // 失败时截图
  use: {
    // 基础 URL（需要先启动开发服务器）
    baseURL: 'http://localhost:5173',

    // 失败时截图
    screenshot: 'only-on-failure',

    // 失败时录制视频（CI 环境）
    video: 'retain-on-failure',

    // 失败时创建 trace
    trace: 'on-first-retry',

    // 测试超时时间
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  // 测试报告
  reporter: [
    ['html', { open: 'never', outputFolder: 'test-results/html-reporter' }],
    ['json', { outputFile: 'test-results/json-report/results.json' }],
    ['junit', { outputFile: 'test-results/junit-report/junit.xml' }],
    ['list'],
  ],

  // 测试超时
  timeout: 60000,

  // Web Server 配置（用于启动测试服务器）
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    timeout: 120000,
    reuseExistingServer: !process.env.CI,
  },

  // 项目配置（可选，用于多项目配置）
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // 输出目录
  outputDir: 'test-results',
});
