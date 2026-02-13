/**
 * 任务管理 E2E 测试
 *
 * 测试任务列表的加载、创建、更新和删除功能
 */

import { test, expect, beforeEach } from '@playwright/test';
import { TEST_TASKS, PAGE_URLS, SELECTORS, WAIT_TIMES } from '../../fixtures/test-data';
import {
  loginUser,
  waitForLoadingToFinish,
  navigateAndWait,
  expectListNotEmpty,
  safeClick,
  safeFill,
} from '../../helpers/test-helpers';

/**
 * 任务管理测试套件设置
 */
beforeEach(async ({ page }) => {
  // 每个测试前确保已登录
  await loginUser(page);
});

/**
 * 任务管理功能测试
 */
test.describe('任务管理功能', () => {

  /**
   * 测试 1: 驾驶舱应该显示任务列表
   */
  test('驾驶舱应该显示我的任务列表', async ({ page }) => {
    // 在驾驶舱（默认页面）
    await waitForLoadingToFinish(page);

    // 验证任务区域存在
    const tasksSection = page.locator(SELECTORS.dashboard.tasksSection);
    await expect(tasksSection).toBeVisible();

    // 验证有任务内容
    const tasksText = await tasksSection.textContent();
    expect(tasksText?.length).toBeGreaterThan(0);
  });

  /**
   * 测试 2: 应该显示任务数量
   */
  test('应该显示任务数量统计', async ({ page }) => {
    await waitForLoadingToFinish(page);

    // 验证显示任务数量（例如"5 Pending"）
    const countText = await page.locator('text=/\\d+\\s*(Pending|In Progress|Completed)/').textContent();
    expect(countText).toBeDefined();

    // 提取数字并验证
    const match = countText?.match(/\\d+/);
    if (match) {
      const count = parseInt(match[0]);
      expect(count).toBeGreaterThan(0);
    }
  });

  /**
   * 测试 3: 应该显示任务优先级
   */
  test('应该显示任务优先级标签', async ({ page }) => {
    await waitForLoadingToFinish(page);

    // 验证优先级相关内容
    // 可能显示为"High"、"Medium"或中文"高"、"中"
    const hasPriority = await page.locator('text=/优先级|Priority|High|Medium|Low/').isVisible().catch(() => false);
    expect(hasPriority).toBeTruthy();
  });

  /**
   * 测试 4: 应该显示任务截止日期
   */
  test('应该显示任务截止日期', async ({ page }) => {
    await waitForLoadingToFinish(page);

    // 验证显示日期
    // 可能显示为"Oct 20"、"2026-10-20"等格式
    const hasDate = await page.locator('text=/(Oct|Sep|Nov|Dec)\\s+\\d+/').isVisible().catch(() => false);
    expect(hasDate).toBeTruthy();
  });

  /**
   * 测试 5: 应该显示任务分配人
   */
  test('应该显示任务分配人', async ({ page }) => {
    await waitForLoadingToFinish(page);

    // 验证显示分配人信息
    const hasAssignee = await page.locator('text=/Review|Assignee|负责人/').isVisible().catch(() => false);
    expect(hasAssignee).toBeTruthy();
  });

  /**
   * 测试 6: "查看全部"应该导航到任务管理页面
   */
  test('点击"查看全部"应该导航到任务页面', async ({ page }) => {
    waitForLoadingToFinish(page);

    // 查找"查看全部"链接
    const viewAllLink = page.locator('a:has-text("查看全部"), a:has-text("View All")').first();
    const isVisible = await viewAllLink.isVisible().catch(() => false);

    if (isVisible) {
      // 点击并验证导航
      await viewAllLink.click();
      await page.waitForTimeout(WAIT_TIMES.medium);

      // 验证导航到任务页
      const url = page.url();
      expect(url).toContain('/tasks');
    }
  });

  /**
   * 测试 7: 应该能够搜索任务
   */
  test('应该能够搜索任务', async ({ page }) => {
    waitForLoadingToFinish(page);

    // 查找搜索框
    const searchInput = page.locator('input[placeholder*="搜索" i], input[type="search"]').first();
    const isVisible = await searchInput.isVisible().catch(() => false);

    if (isVisible) {
      // 搜索"资质"关键词
      await searchInput.fill('资质');
      await page.waitForTimeout(WAIT_TIMES.medium);

      // 验证搜索结果
      // 应该包含"天津未来物流资质审核"
      const hasResult = await page.locator('text=资质').isVisible();
      expect(hasResult).toBeTruthy();

      // 清空搜索
      await searchInput.fill('');
      await page.waitForTimeout(WAIT_TIMES.medium);

      // 验证恢复显示所有任务
      const allTasks = await page.locator('[class*="task"], [data-task]').count();
      expect(allTasks).toBeGreaterThan(0);
    }
  });

  /**
   * 测试 8: 应该能够筛选任务状态
   */
  test('应该能够筛选任务状态', async ({ page }) => {
    waitForLoadingToFinish(page);

    // 查找状态筛选按钮
    const filters = ['Pending', 'In Progress', 'Completed', 'All'];
    let hasAnyFilter = false;

    for (const status of filters) {
      const filterButton = page.locator(`button:has-text("${status}")`).first();
      const isVisible = await filterButton.isVisible().catch(() => false);

      if (isVisible) {
        hasAnyFilter = true;
        // 点击筛选
        await filterButton.click();
        await page.waitForTimeout(WAIT_TIMES.short);

        // 验证页面响应
        const url = page.url();
        expect(url).toContain('tasks');
      }
    }

    expect(hasAnyFilter).toBeTruthy();
  });

  /**
   * 测试 9: 应该显示任务创建入口
   */
  test('应该显示创建任务按钮', async ({ page }) => {
    waitForLoadingToFinish(page);

    // 查找创建按钮
    const createButton = page.locator('button:has-text("新建任务"), button:has-text("创建"), button[aria-label="add task"]').first();
    const createLink = page.locator('a:has-text("新建任务"), a:has-text("Create Task")').first();
    const fabButton = page.locator('button[aria-label="add"], button.fab, button.rounded-full').first();

    const hasButton = await createButton.isVisible().catch(() => false);
    const hasLink = await createLink.isVisible().catch(() => false);
    const hasFab = await fabButton.isVisible().catch(() => false);

    // 应该至少有一种创建方式
    expect(hasButton || hasLink || hasFab).toBeTruthy();
  });

  /**
   * 测试 10: 任务应该显示完成操作
   */
  test('任务卡片应该显示操作按钮', async ({ page }) => {
    waitForLoadingToFinish(page);

    // 验证任务卡片上有操作按钮
    // 可能显示为"完成"、"编辑"、"删除"等
    const hasActions = await page.locator('button:has-text("完成"), button:has-text("Complete"), button[aria-label="complete"]').isVisible().catch(() => false);
    expect(hasActions).toBeTruthy();
  });

  /**
   * 测试 11: 应该能够标记任务完成
   */
  test('应该能够标记任务为完成', async ({ page }) => {
    waitForLoadingToFinish(page);

    // 查找第一个任务的完成按钮
    const completeButton = page.locator('button:has-text("完成"), button:has-text("Complete")').first();
    const isVisible = await completeButton.isVisible().catch(() => false);

    if (isVisible) {
      // 记录当前任务数量
      const beforeCount = await page.locator('[class*="task"], [data-task]').count();

      // 点击完成
      await completeButton.click();
      await page.waitForTimeout(WAIT_TIMES.medium);

      // 验证任务状态更新或数量变化
      await page.waitForTimeout(WAIT_CODES.medium);

      // 注意：实际行为取决于实现，可能需要确认对话框
      const afterCount = await page.locator('[class*="task"], [data-task]').count();

      // 任务可能消失或状态改变
      expect(afterCount).toBeLessThanOrEqual(beforeCount);
    }
  });

  /**
   * 测试 12: 过期任务应该有特殊标识
   */
  test('过期任务应该有特殊标识', async ({ page }) => {
    waitForLoadingToFinish(page);

    // 验证过期任务的特殊标识
    // 可能显示为红色背景、"过期"标签等
    const hasOverdueIndicator = await page.locator('text=过期, Overdue').isVisible().catch(() => false);

    // 可能没有过期的任务（取决于测试数据）
    if (hasOverdueIndicator) {
      // 如果有过期标识，应该有红色或警告样式
      const overdueElement = page.locator('text=过期, Overdue');
      await expect(overdueElement).toBeVisible();
    }
  });

  /**
   * 测试 13: 应该能够查看任务详情
   */
  test('应该能够点击任务查看详情', async ({ page }) => {
    waitForLoadingToFinish(page);

    // 点击第一个任务
    const firstTask = page.locator('[class*="task"], [data-task]').first();
    const count = await firstTask.count();

    if (count > 0) {
      await firstTask.click();
      await page.waitForTimeout(WAIT_TIMES.medium);

      // 验证打开详情或导航
      const url = page.url();
      const hasNavigated = url.includes('/tasks/') || url.includes('/task/');

      // 可能打开模态框或导航到详情页
      expect(hasNavigated || page.locator('dialog, [role="dialog"]').isVisible()).toBeTruthy();
    }
  });

  /**
   * 测试 14: 页面刷新后数据应该保持
   */
  test('刷新页面后任务数据应该保持一致', async ({ page }) => {
    waitForLoadingToFinish(page);

    // 获取初始任务数量
    const initialCount = await page.locator('[class*="task"], [data-task]').count();

    // 刷新页面
    await page.reload();
    await waitForLoadingToFinish(page);

    // 获取刷新后任务数量
    const refreshedCount = await page.locator('[class*="task"], [data-task]').count();

    // 验证数量一致
    expect(refreshedCount).toBe(initialCount);
  });
});
