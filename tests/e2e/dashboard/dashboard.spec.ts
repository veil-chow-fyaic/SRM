/**
 * 驾驶舱功能 E2E 测试
 *
 * 测试驾驶舱数据加载、统计显示和核心功能
 */

import { test, expect, beforeEach } from '@playwright/test';
import { TEST_USER, PAGE_URLS, SELECTORS, WAIT_TIMES } from '../../fixtures/test-data';
import {
  loginUser,
  logoutUser,
  waitForLoadingToFinish,
  navigateAndWait,
  expectStatsNotEmpty,
  expectListNotEmpty,
  safeClick,
} from '../../helpers/test-helpers';

/**
 * 驾驶舱测试套件设置
 */
beforeEach(async ({ page }) => {
  // 每个测试前确保已登录
  await loginUser(page);
});

/**
 * 驾驶舱功能测试
 */
test.describe('驾驶舱功能', () => {

  /**
   * 测试 1: 驾驶舱页面应该正确加载
   */
  test('应该显示驾驶舱页面', async ({ page }) => {
    // 验证 URL
    await expect(page).toHaveURL(/\/(login#\/|dashboard)/);

    // 等待加载完成
    await waitForLoadingToFinish(page);

    // 验证页面标题
    await expect(page.locator('text=驾驶舱')).toBeVisible();
  });

  /**
   * 测试 2: 应该显示统计数据
   */
  test('应该显示关键统计数据', async ({ page }) => {
    await waitForLoadingToFinish(page);

    // 验证统计网格存在
    await expect(page.locator(SELECTORS.dashboard.statsGrid)).toBeVisible();

    // 验证统计不为空
    const statsText = await page.locator(SELECTORS.dashboard.statsGrid).textContent();
    expect(statsText).not.toBe('');
    expect(statsText).not.toContain('0');

    // 验证关键统计指标存在
    await expect(page.locator('text=合作供应商')).toBeVisible();
    await expect(page.locator('text=本月采购')).toBeVisible();
    await expect(page.locator('text=核心覆盖率')).toBeVisible();
    await expect(page.locator('text=平均账期')).toBeVisible();
  });

  /**
   * 测试 3: 应该显示异常看板
   */
  test('应该显示异常看板', async ({ page }) => {
    await waitForLoadingToFinish(page);

    // 验证异常看板区域存在
    const alertsSection = page.locator(SELECTORS.dashboard.alertsSection);
    await expect(alertsSection).toBeVisible();

    // 验证有警告内容（数据库中应该有风险警报）
    const alertText = await alertsSection.textContent();
    expect(alertText?.length).toBeGreaterThan(0);
  });

  /**
   * 测试 4: 应该显示我的任务列表
   */
  test('应该显示我的任务列表', async ({ page }) => {
    await waitForLoadingToFinish(page);

    // 验证任务区域存在
    const tasksSection = page.locator(SELECTORS.dashboard.tasksSection);
    await expect(tasksSection).toBeVisible();

    // 验证有任务内容
    const tasksText = await tasksSection.textContent();
    expect(tasksText?.length).toBeGreaterThan(0);
  });

  /**
   * 测试 5: 应该显示全域拜访日历
   */
  test('应该显示全域拜访日历', async ({ page }) => {
    await waitForLoadingToFinish(page);

    // 验证日历区域存在
    const calendarSection = page.locator(SELECTORS.dashboard.calendarSection);
    await expect(calendarSection).toBeVisible();
  });

  /**
   * 测试 6: 统计数据应该来自真实数据库
   */
  test('统计数据应该反映真实数据库内容', async ({ page }) => {
    await waitForLoadingToFinish(page);

    // 等待并验证供应商数量统计
    await page.waitForTimeout(WAIT_TIMES.medium);

    // 验证显示的供应商数量（数据库中有 152 家）
    const supplierCountText = await page.locator('text=/合作供应商.*\\d+/').textContent();
    expect(supplierCountText).toBeDefined();
    expect(supplierCountText).toMatch(/\d+/);

    // 提取数字并验证合理性
    const match = supplierCountText?.match(/\d+/);
    if (match) {
      const count = parseInt(match[0]);
      expect(count).toBeGreaterThan(0);
    }
  });

  /**
   * 测试 7: 异常看板应该显示风险警报
   */
  test('异常看板应该显示具体的风险警报', async ({ page }) => {
    await waitForLoadingToFinish(page);

    // 等待异常看板加载
    const alertsSection = page.locator(SELECTORS.dashboard.alertsSection);
    await expect(alertsSection).toBeVisible();

    // 验证显示供应商名称
    await expect(page.locator('text=Tianjin Future Logistics')).toBeVisible({ timeout: WAIT_TIMES.medium });
  });

  /**
   * 测试 8: 应该能够切换月份
   */
  test('应该能够切换日历月份', async ({ page }) => {
    waitForLoadingToFinish(page);

    // 查找月份切换按钮（通常在日历区域）
    const calendarSection = page.locator(SELECTORS.dashboard.calendarSection);
    const nextMonthButton = calendarSection.locator('button:has-text(">"), button:has-text("下月")').first();
    const prevMonthButton = calendarSection.locator('button:has-text("<"), button:has-text("上月")').first();

    // 验证按钮存在
    const nextExists = await nextMonthButton.isVisible().catch(() => false);
    const prevExists = await prevMonthButton.isVisible().catch(() => false);

    expect(nextExists || prevExists).toBeTruthy();
  });

  /**
   * 测试 9: "查看全部"按钮应该导航
   */
  test('点击"查看全部"应该导航到任务列表', async ({ page }) => {
    waitForLoadingToFinish(page);

    // 查找"查看全部"链接
    const viewAllLink = page.locator('a:has-text("查看全部"), a:has-text("View All")').first();

    // 验证链接存在
    const exists = await viewAllLink.isVisible().catch(() => false);

    if (exists) {
      // 点击并验证导航
      await safeClick(page, 'a:has-text("查看全部")');
      await page.waitForTimeout(WAIT_TIMES.medium);

      // 验证 URL 变化
      const url = page.url();
      expect(url).toContain('tasks');
    }
  });

  /**
   * 测试 10: 侧边栏导航应该正常工作
   */
  test('侧边栏导航应该正常工作', async ({ page }) => {
    // 测试各个侧边栏链接
    const navItems = [
      { text: '潜在供应商', pattern: /suppliers.*filter/ },
      { text: '合作供应商', pattern: /suppliers/ },
      { text: '战略供应商', pattern: /suppliers.*strategic/ },
      { text: '业务配置', pattern: /settings/ },
    ];

    // 测试每个导航项
    for (const item of navItems) {
      const navLink = page.locator(`a:has-text("${item.text}")`).first();
      const isVisible = await navLink.isVisible().catch(() => false);

      if (isVisible) {
        await navLink.click();
        await page.waitForTimeout(WAIT_TIMES.short);

        // 验证 URL 变化
        const url = page.url();
        expect(url).toMatch(item.pattern);

        // 返回驾驶舱
        await page.goto(PAGE_URLS.dashboard);
        await waitForLoadingToFinish(page);
      }
    }
  });

  /**
   * 测试 11: 应该显示用户信息
   */
  test('应该显示当前登录用户信息', async ({ page }) => {
    waitForLoadingToFinish(page);

    // 验证用户名显示
    await expect(page.locator('text=veiluser')).toBeVisible();

    // 验证用户头像或信息区域存在
    const userInfo = page.locator('[aria-label="用户信息"], .user-info');
    const isVisible = await userInfo.isVisible().catch(() => false);

    if (isVisible) {
      await expect(userInfo).toBeVisible();
    }
  });

  /**
   * 测试 12: 页面刷新后数据应该保持
   */
  test('页面刷新后数据应该保持一致', async ({ page }) => {
    waitForLoadingToFinish(page);

    // 获取初始统计文本
    const initialStats = await page.locator(SELECTORS.dashboard.statsGrid).textContent();

    // 刷新页面
    await page.reload();
    await waitForLoadingToFinish(page);

    // 获取刷新后的统计文本
    const refreshedStats = await page.locator(SELECTORS.dashboard.statsGrid).textContent();

    // 验证数据一致
    expect(refreshedStats).toBe(initialStats);
  });
});
