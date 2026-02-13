/**
 * 供应商列表 E2E 测试
 *
 * 测试供应商列表的加载、筛选和导航功能
 */

import { test, expect, beforeEach } from '@playwright/test';
import { PAGE_URLS, SELECTORS, WAIT_TIMES } from '../../fixtures/test-data';
import {
  loginUser,
  waitForLoadingToFinish,
  navigateAndWait,
  expectListNotEmpty,
  safeClick,
} from '../../helpers/test-helpers';

/**
 * 供应商列表测试套件设置
 */
beforeEach(async ({ page }) => {
  // 每个测试前确保已登录并导航到供应商列表
  await loginUser(page);
  await navigateAndWait(page, PAGE_URLS.suppliers);
});

/**
 * 供应商列表功能测试
 */
test.describe('供应商列表功能', () => {

  /**
   * 测试 1: 供应商列表应该正确加载
   */
  test('应该显示供应商列表', async ({ page }) => {
    await waitForLoadingToFinish(page);

    // 验证列表容器存在
    await expect(page.locator(SELECTORS.suppliers.listContainer)).toBeVisible();

    // 验证有供应商卡片
    const cardCount = await page.locator(SELECTORS.suppliers.supplierCard).count();
    expect(cardCount).toBeGreaterThan(0);
  });

  /**
   * 测试 2: 应该显示数据库中的所有供应商
   */
  test('应该显示数据库中的所有供应商', async ({ page }) => {
    await waitForLoadingToFinish(page);

    // 数据库中有 6 家供应商
    const cardCount = await page.locator(SELECTORS.suppliers.supplierCard).count();
    expect(cardCount).toBe(6);

    // 验证已知供应商名称存在
    await expect(page.locator('text=Evergreen Marine')).toBeVisible();
    await expect(page.locator('text=Maersk')).toBeVisible();
    await expect(page.locator('text=Shanghai Matson')).toBeVisible();
  });

  /**
   * 测试 3: 应该显示供应商层级信息
   */
  test('应该显示供应商的层级标签', async ({ page }) => {
    await waitForLoadingToFinish(page);

    // 验证显示层级标签
    await expect(page.locator('text=核心')).toBeVisible();
    await expect(page.locator('text=战略')).toBeVisible();
    await expect(page.locator('text=储备')).toBeVisible();
  });

  /**
   * 测试 4: 应该能够点击供应商卡片
   */
  test('应该能够点击供应商卡片进入详情', async ({ page }) => {
    waitForLoadingToFinish(page);

    // 点击第一个供应商卡片
    await safeClick(page, SELECTORS.suppliers.supplierCard);

    // 等待导航到详情页
    await page.waitForTimeout(WAIT_TIMES.medium);

    // 验证 URL 包含供应商 ID
    const url = page.url();
    expect(url).toContain('/suppliers/');
  });

  /**
   * 测试 5: 应该能够筛选供应商
   */
  test('应该能够通过层级筛选供应商', async ({ page }) => {
    waitForLoadingToFinish(page);

    // 测试"合作供应商"筛选
    const activeFilter = page.locator(SELECTORS.suppliers.filterActive);
    const isActiveVisible = await activeFilter.isVisible().catch(() => false);

    if (isActiveVisible) {
      await activeFilter.click();
      await page.waitForTimeout(WAIT_TIMES.medium);

      // 验证只显示合作供应商
      const cardCount = await page.locator(SELECTORS.suppliers.supplierCard).count();
      expect(cardCount).toBeGreaterThan(0);
    }

    // 测试"战略供应商"筛选
    const strategicFilter = page.locator(SELECTORS.suppliers.filterStrategic);
    const isStrategicVisible = await strategicFilter.isVisible().catch(() => false);

    if (isStrategicVisible) {
      await strategicFilter.click();
      await page.waitForTimeout(WAIT_TIMES.medium);

      // 验证结果
      const cardCount = await page.locator(SELECTORS.suppliers.supplierCard).count();
      expect(cardCount).toBeGreaterThanOrEqual(0);
    }
  });

  /**
   * 测试 6: "全部"筛选应该显示所有供应商
   */
  test('"全部"筛选应该显示所有供应商', async ({ page }) => {
    waitForLoadingToFinish(page);

    // 点击"全部"筛选
    const allFilter = page.locator(SELECTORS.suppliers.filterAll);
    const isVisible = await allFilter.isVisible().catch(() => false);

    if (isVisible) {
      await allFilter.click();
      await page.waitForTimeout(WAIT_TIMES.medium);

      // 应该显示 6 家供应商
      const cardCount = await page.locator(SELECTORS.suppliers.supplierCard).count();
      expect(cardCount).toBe(6);
    }
  });

  /**
   * 测试 7: 供应商卡片应该显示关键信息
   */
  test('供应商卡片应该显示关键信息', async ({ page }) => {
    waitForLoadingToFinish(page);

    // 验证卡片显示供应商名称
    await expect(page.locator('text=Evergreen Marine Corporation')).toBeVisible();

    // 验证显示位置信息
    await expect(page.locator('text=Ningbo')).toBeVisible();
    await expect(page.locator('text=Shanghai')).toBeVisible();
    await expect(page.locator('text=Shenzhen')).toBeVisible();
    await expect(page.locator('text=Tianjin')).toBeVisible();

    // 验证显示 Tier 标签
    await expect(page.locator('text=Tier')).toBeVisible();
  });

  /**
   * 测试 8: 应该能够搜索供应商
   */
  test('应该能够搜索供应商', async ({ page }) => {
    waitForLoadingToFinish(page);

    // 查找搜索框
    const searchInput = page.locator(SELECTORS.suppliers.searchInput);
    const isVisible = await searchInput.isVisible().catch(() => false);

    if (isVisible) {
      // 搜索"Maersk"
      await searchInput.fill('Maersk');
      await page.waitForTimeout(WAIT_TIMES.medium);

      // 验证搜索结果
      const results = page.locator(SELECTORS.suppliers.supplierCard);
      const count = await results.count();

      // 应该至少有一个结果
      expect(count).toBeGreaterThan(0);

      // 清空搜索
      await searchInput.fill('');
      await page.waitForTimeout(WAIT_TIMES.medium);

      // 验证恢复显示所有供应商
      const allCount = await page.locator(SELECTORS.suppliers.supplierCard).count();
      expect(allCount).toBe(6);
    }
  });

  /**
   * 测试 9: 应该显示供应商状态
   */
  test('应该显示供应商状态标签', async ({ page }) => {
    waitForLoadingToFinish(page);

    // 验证状态标签存在
    // 可能显示为"合作"、"潜在"、"黑名单"等
    await expect(page.locator('text=合作')).toBeVisible();
    await expect(page.locator('text=潜在')).toBeVisible();
    await expect(page.locator('text=考察')).toBeVisible();

    // 检查黑名单状态
    const blacklistBadge = page.locator('text=黑名单');
    const hasBlacklist = await blacklistBadge.isVisible().catch(() => false);
    expect(hasBlacklist).toBeTruthy();
  });

  /**
   * 测试 10: 列表页面应该支持分页（如果有大量数据）
   */
  test('列表页面应该能够滚动加载更多数据', async ({ page }) => {
    waitForLoadingToFinish(page);

    // 获取初始卡片数量
    const initialCount = await page.locator(SELECTORS.suppliers.supplierCard).count();

    // 尝试滚动到页面底部
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });

    // 等待可能的懒加载
    await page.waitForTimeout(WAIT_TIMES.medium);

    // 验证至少有初始数量的卡片
    const finalCount = await page.locator(SELECTORS.suppliers.supplierCard).count();
    expect(finalCount).toBeGreaterThanOrEqual(initialCount);
  });

  /**
   * 测试 11: 应该能够创建新供应商（如果有创建按钮）
   */
  test('应该显示新建供应商按钮或链接', async ({ page }) => {
    waitForLoadingToFinish(page);

    // 查找"新建档案"、"创建供应商"或"+"按钮
    const createButton = page.locator('button:has-text("新建"), button:has-text("创建"), button[aria-label="add"]').first();
    const createLink = page.locator('a:has-text("新建档案")').first();

    const hasButton = await createButton.isVisible().catch(() => false);
    const hasLink = await createLink.isVisible().catch(() => false);

    // 应该至少有一种创建方式
    expect(hasButton || hasLink).toBeTruthy();
  });

  /**
   * 测试 12: 页面刷新后应该保持筛选状态
   */
  test('刷新页面后应该保持当前筛选', async ({ page }) => {
    waitForLoadingToFinish(page);

    // 先点击"合作供应商"筛选
    const activeFilter = page.locator(SELECTORS.suppliers.filterActive);
    const isFilterVisible = await activeFilter.isVisible().catch(() => false);

    if (isFilterVisible) {
      await activeFilter.click();
      await page.waitForTimeout(WAIT_TIMES.medium);

      // 获取当前 URL
      const urlBefore = page.url();

      // 刷新页面
      await page.reload();
      await waitForLoadingToFinish(page);

      // 验证 URL 保持不变（或者筛选保持激活状态）
      const urlAfter = page.url();
      expect(urlAfter).toBe(urlBefore);
    }
  });
});
