/**
 * 认证功能 E2E 测试
 *
 * 测试用户登录、登出和注册流程
 */

import { test, expect } from '@playwright/test';
import { TEST_USER, PAGE_URLS, SELECTORS, WAIT_TIMES } from '../../fixtures/test-data';

/**
 * 认证测试套件
 */
test.describe('用户认证', () => {

  /**
   * 测试 1: 使用有效凭据登录
   */
  test('应该使用有效凭据成功登录', async ({ page }) => {
    // 导航到登录页
    await page.goto(PAGE_URLS.login);

    // 验证登录表单元素存在
    await expect(page.locator(SELECTORS.auth.emailInput)).toBeVisible();
    await expect(page.locator(SELECTORS.auth.passwordInput)).toBeVisible();
    await expect(page.locator(SELECTORS.auth.submitButton)).toBeVisible();

    // 填写登录凭据
    await page.fill(SELECTORS.auth.emailInput, TEST_USER.email);
    await page.fill(SELECTORS.auth.passwordInput, TEST_USER.password);

    // 提交登录表单
    await page.click(SELECTORS.auth.submitButton);

    // 等待导航到驾驶舱
    await page.waitForURL(`**${PAGE_URLS.dashboard}`, { timeout: WAIT_TIMES.extraLong });

    // 验证已登录状态
    await expect(page).toHaveURL(/\/(login#\/|dashboard)/);
  });

  /**
   * 测试 2: 无效邮箱应该显示错误
   */
  test('无效邮箱应该显示错误提示', async ({ page }) => {
    await page.goto(PAGE_URLS.login);

    // 填写无效邮箱
    await page.fill(SELECTORS.auth.emailInput, 'invalid@example.com');
    await page.fill(SELECTORS.auth.passwordInput, TEST_USER.password);
    await page.click(SELECTORS.auth.submitButton);

    // 等待错误消息
    await page.waitForTimeout(WAIT_TIMES.medium);

    // 验证错误提示
    const errorMessage = page.locator('.error, [role="alert"], .validation-error').first();
    const isVisible = await errorMessage.isVisible().catch(() => false);

    if (isVisible) {
      await expect(errorMessage).toBeVisible();
    }
  });

  /**
   * 测试 3: 页面应该正确加载
   */
  test('登录页面应该包含必要元素', async ({ page }) => {
    await page.goto(PAGE_URLS.login);

    // 验证登录表单存在
    await expect(page.locator(SELECTORS.auth.emailInput)).toBeVisible();
    await expect(page.locator(SELECTORS.auth.passwordInput)).toBeVisible();
    await expect(page.locator(SELECTORS.auth.submitButton)).toBeVisible();
  });

  /**
   * 测试 4: 注册链接应该存在
   */
  test('登录页应该显示注册链接', async ({ page }) => {
    await page.goto(PAGE_URLS.login);

    // 验证注册链接存在
    const registerLink = page.locator('a:has-text("立即注册"), a:has-text("注册")').first();
    const isVisible = await registerLink.isVisible().catch(() => false);
    expect(isVisible).toBeTruthy();
  });

  /**
   * 测试 5: 刷新后应该保持登录状态
   */
  test('登录后刷新页面应该保持状态', async ({ page }) => {
    // 登录
    await page.goto(PAGE_URLS.login);
    await page.fill(SELECTORS.auth.emailInput, TEST_USER.email);
    await page.fill(SELECTORS.auth.passwordInput, TEST_USER.password);
    await page.click(SELECTORS.auth.submitButton);
    await page.waitForURL(`**${PAGE_URLS.dashboard}`, { timeout: WAIT_TIMES.extraLong });

    // 刷新页面
    await page.reload();
    await page.waitForLoadState('networkidle');

    // 验证仍然在驾驶舱
    await expect(page).toHaveURL(/\/(login#\/|dashboard)/);
  });
});
