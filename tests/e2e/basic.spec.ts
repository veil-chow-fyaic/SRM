/**
 * 基本 E2E 测试
 */

import { test, expect } from '@playwright/test';

test.describe('基本功能', () => {
  test('登录页面可访问', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await expect(page).toHaveTitle(/frontend|SRM/);
  });

  test('登录页面有输入框', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    const hasEmail = await page.locator('input[type="email"]').count() > 0;
    const hasPassword = await page.locator('input[type="password"]').count() > 0;
    expect(hasEmail && hasPassword).toBeTruthy();
  });
});
