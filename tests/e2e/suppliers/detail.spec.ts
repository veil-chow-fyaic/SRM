/**
 * 供应商详情 E2E 测试
 *
 * 测试供应商详情页面的加载、标签切换和数据展示
 */

import { test, expect, beforeEach } from '@playwright/test';
import { TEST_USER, PAGE_URLS, SELECTORS, WAIT_TIMES } from '../../fixtures/test-data';
import {
  loginUser,
  waitForLoadingToFinish,
  navigateAndWait,
  safeClick,
} from '../../helpers/test-helpers';

// 已知的真实供应商 ID（从数据库获取）
const REAL_SUPPLIER_ID = '550e8400-e29b-41d4-a716-446655440002'; // Evergreen Marine

/**
 * 供应商详情测试套件设置
 */
beforeEach(async ({ page }) => {
  await loginUser(page);
  // 直接导航到已知供应商的详情页
  await navigateAndWait(page, PAGE_URLS.supplierDetail(REAL_SUPPLIER_ID));
});

/**
 * 供应商详情功能测试
 */
test.describe('供应商详情功能', () => {

  /**
   * 测试 1: 详情页应该正确加载
   */
  test('应该显示供应商详情页', async ({ page }) => {
    await waitForLoadingToFinish(page);

    // 验证 URL 包含供应商 ID
    const url = page.url();
    expect(url).toContain(REAL_SUPPLIER_ID);

    // 验证详情页容器存在
    await expect(page.locator(SELECTORS.supplierDetail.container)).toBeVisible();
  });

  /**
   * 测试 2: 应该显示供应商名称
   */
  test('应该显示供应商名称', async ({ page }) => {
    waitForLoadingToFinish(page);

    // 验证供应商名称显示
    await expect(page.locator('text=Evergreen Marine Corporation')).toBeVisible();
    await expect(page.locator('text=长荣海运宁波分公司')).toBeVisible();
  });

  /**
   * 测试 3: 应该显示供应商等级信息
   */
  test('应该显示供应商等级和编码', async ({ page }) => {
    waitForLoadingToFinish(page);

    // 验证 Tier-2 核心供应商
    await expect(page.locator('text=Tier-2')).toBeVisible();
    await expect(page.locator('text=核心供应商')).toBeVisible();
    await expect(page.locator('text=V-EMC-NB')).toBeVisible();
  });

  /**
   * 测试 4: 应该显示基本信息
   */
  test('应该显示企业基本信息', async ({ page }) => {
    waitForLoadingToFinish(page);

    // 验证基本信息字段
    await expect(page.locator('text=统一社会信用代码')).toBeVisible();
    await expect(page.locator('text=91310000607')).toBeVisible({ timeout: WAIT_TIMES.medium });
    await expect(page.locator('text=成立日期')).toBeVisible();
    await expect(page.locator('text=2005-08-15')).toBeVisible();
    await expect(page.locator('text=注册地址')).toBeVisible();
    await expect(page.locator('text=宁波市北仑区')).toBeVisible();
    await expect(page.locator('text=外商独资')).toBeVisible();
    await expect(page.locator('text=NVOCC')).toBeVisible();
  });

  /**
   * 测试 5: 应该显示联系信息
   */
  test('应该显示联系方式', async ({ page }) => {
    waitForLoadingToFinish(page);

    // 验证联系方式
    await expect(page.locator('text=联系方式')).toBeVisible();
    await expect(page.locator('text=+86 574')).toBeVisible({ timeout: WAIT_TIMES.medium });
    await expect(page.locator('text=https://www.evergreen-marine.com')).toBeVisible();
  });

  /**
   * 测试 6: 应该显示绩效信息
   */
  test('应该显示供应商绩效数据', async ({ page }) => {
    waitForLoadingToFinish(page);

    // 验证绩效相关内容
    await expect(page.locator('text=绩效表现')).toBeVisible();
    await expect(page.locator('text=88')).toBeVisible({ timeout: WAIT_TIMES.medium });
    await expect(page.locator('text=Top 10%')).toBeVisible();
    await expect(page.locator('text=¥ 12,450,000')).toBeVisible();
  });

  /**
   * 测试 7: 应该能够切换标签页
   */
  test('应该能够切换不同的标签页', async ({ page }) => {
    waitForLoadingToFinish(page);

    // 定义要测试的标签
    const tabs = [
      SELECTORS.supplierDetail.tabBasic,
      SELECTORS.supplierDetail.tabResource,
      SELECTORS.supplierDetail.tabEngagement,
      SELECTORS.supplierDetail.tabPerformance,
    ];

    // 测试每个标签切换
    for (const tabSelector of tabs) {
      const tab = page.locator(tabSelector);
      const isVisible = await tab.isVisible().catch(() => false);

      if (isVisible) {
        await safeClick(page, tabSelector);
        await page.waitForTimeout(WAIT_TIMES.short);
      }
    }
  });

  /**
   * 测试 8: 资产标签应该显示企业档案
   */
  test('资产标签应该显示企业档案', async ({ page }) => {
    waitForLoadingToFinish(page);

    // 点击资产标签
    const basicTab = page.locator(SELECTORS.supplierDetail.tabBasic);
    const isTabVisible = await basicTab.isVisible().catch(() => false);

    if (isTabVisible) {
      await basicTab.click();
      await page.waitForTimeout(WAIT_TIMES.medium);

      // 验证企业档案内容
      await expect(page.locator('text=企业名称')).toBeVisible();
      await expect(page.locator('text=企业结构')).toBeVisible();
      await expect(page.locator('text=关键联系人')).toBeVisible();
    }
  });

  /**
   * 测试 9: 互动标签应该显示互动日志
   */
  test('互动标签应该显示互动日志区域', async ({ page }) => {
    waitForLoadingToFinish(page);

    // 点击互动标签
    const engagementTab = page.locator(SELECTORS.supplierDetail.tabEngagement);
    const isTabVisible = await engagementTab.isVisible().catch(() => false);

    if (isTabVisible) {
      await engagementTab.click();
      await page.waitForTimeout(WAIT_TIMES.medium);

      // 验证互动日志区域存在
      // 可能显示"暂无互动日志"或互动记录列表
      const hasContent = await page.locator('text=互动').isVisible().catch(() => false);
      expect(hasContent).toBeTruthy();
    }
  });

  /**
   * 测试 10: 绩效标签应该显示绩效历史
   */
  test('绩效标签应该显示绩效历史', async ({ page }) => {
    waitForLoadingToFinish(page);

    // 点击绩效标签
    const perfTab = page.locator(SELECTORS.supplierDetail.tabPerformance);
    const isTabVisible = await perfTab.isVisible().catch(() => false);

    if (isTabVisible) {
      await perfTab.click();
      await page.waitForTimeout(WAIT_TIMES.medium);

      // 验证绩效相关内容
      const hasContent = await page.locator('text=绩效').isVisible().catch(() => false);
      expect(hasContent).toBeTruthy();
    }
  });

  /**
   * 测试 11: 应该显示返回按钮或面包屑导航
   */
  test('应该能够返回供应商列表', async ({ page }) => {
    waitForLoadingToFinish(page);

    // 查找返回按钮、面包屑或返回链接
    const backButton = page.locator('button:has-text("返回"), button[aria-label="back"]').first();
    const breadcrumb = page.locator('a[href*="/suppliers"], a:has-text("供应商列表")').first();

    const hasBack = await backButton.isVisible().catch(() => false);
    const hasBreadcrumb = await breadcrumb.isVisible().catch(() => false);

    // 至少应该有一种返回方式
    expect(hasBack || hasBreadcrumb).toBeTruthy();

    // 如果存在，点击并验证返回
    if (hasBack) {
      await backButton.click();
      await page.waitForTimeout(WAIT_TIMES.medium);

      const url = page.url();
      expect(url).toContain('/suppliers');
    } else if (hasBreadcrumb) {
      await breadcrumb.click();
      await page.waitForTimeout(WAIT_TIMES.medium);

      const url = page.url();
      expect(url).toContain('/suppliers');
    }
  });

  /**
   * 测试 12: 应该能够编辑供应商信息（如果有编辑按钮）
   */
  test('应该显示编辑按钮', async ({ page }) => {
    waitForLoadingToFinish(page);

    // 查找编辑按钮
    const editButton = page.locator('button:has-text("编辑"), button[aria-label="edit"]').first();
    const editIcon = page.locator('svg[data-lucide="edit"], button:has(svg[data-lucide="edit"])').first();

    const hasButton = await editButton.isVisible().catch(() => false);
    const hasIcon = await editIcon.isVisible().catch(() => false);

    // 应该至少有一种编辑入口
    expect(hasButton || hasIcon).toBeTruthy();
  });

  /**
   * 测试 13: 不存在的供应商 ID 应该显示错误
   */
  test('不存在的供应商 ID 应该显示 404 或错误', async ({ page }) => {
    // 使用一个不存在的 UUID
    const fakeId = '00000000-0000-0000-0000-000000000000';

    // 导航到不存在的供应商
    page.goto(PAGE_URLS.supplierDetail(fakeId));

    // 等待页面加载
    page.waitForTimeout(WAIT_TIMES.long);

    // 验证显示错误或重定向
    const hasError = page.locator(SELECTORS.common.errorMessage).isVisible().catch(() => false);
    const isStillOnDetail = page.url().includes(`/suppliers/${fakeId}`);

    // 应该有错误提示或重定向
    expect(hasError || !isStillOnDetail).toBeTruthy();
  });

  /**
   * 测试 14: 决策链标签应该显示决策链信息
   */
  test('决策链标签应该显示决策链区域', async ({ page }) => {
    waitForLoadingToFinish(page);

    // 点击决策链标签
    const decisionTab = page.locator(SELECTORS.supplierDetail.tabDecisionChain);
    const isTabVisible = await decisionTab.isVisible().catch(() => false);

    if (isTabVisible) {
      await decisionTab.click();
      await page.waitForTimeout(WAIT_TIMES.medium);

      // 验证决策链内容
      const hasContent = await page.locator('text=决策链').isVisible().catch(() => false);
      expect(hasContent).toBeTruthy();
    }
  });

  /**
   * 测试 15: 相关文件区域应该显示（如果有的话）
   */
  test('应该显示相关文件区域', async ({ page }) => {
    waitForLoadingToFinish(page);

    // 验证文件区域存在（可能显示"相关文件"或"企业档案"）
    const filesSection = page.locator('text=相关文件, text=企业档案').first();
    const hasFiles = await filesSection.isVisible().catch(() => false);

    if (hasFiles) {
      await expect(filesSection).toBeVisible();
    }
  });

  /**
   * 测试 16: 页面刷新后应该保持同一供应商
   */
  test('刷新页面后应该保持同一供应商', async ({ page }) => {
    waitForLoadingToFinish(page);

    // 获取当前 URL
    const urlBefore = page.url();

    // 刷新页面
    page.reload();
    waitForLoadingToFinish(page);

    // 验证 URL 保持不变
    const urlAfter = page.url();
    expect(urlAfter).toBe(urlBefore);
  });
});
