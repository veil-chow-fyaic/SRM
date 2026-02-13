/**
 * 简化认证测试
 */

import { test, expect } from '@playwright/test';
import { TEST_USER, PAGE_URLS, WAIT_TIMES } from '../../fixtures/test-data';

test.describe('认证', () => {
  test('登录功能', async ({ page }) => {
    await page.goto(PAGE_URLS.login);
    await expect(page.locator('input[type="email"], input[placeholder*="邮箱"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();

    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"], button:has-text("登录")');

    await page.waitForURL(`**${PAGE_URLS.dashboard}`, { timeout: WAIT_TIMES.extraLong });
    await expect(page).toHaveURL(/\/(login#\/|dashboard)/);
  });

  test('登录页面加载', async ({ page }) => {
    await page.goto(PAGE_URLS.login);
    await expect(page).toHaveTitle(/frontend|SRM/);
  });
});
