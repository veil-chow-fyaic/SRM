/**
 * 简单测试示例
 */

import { test, expect } from '@playwright/test';

test.describe('示例测试', () => {
  test('应该通过简单测试', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await expect(page).toHaveTitle(/frontend|SRM/);
  });

  test('应该显示登录页面', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    const title = await page.title();
    expect(title).toBeTruthy();
  });
});
