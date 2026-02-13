/**
 * 测试辅助函数
 *
 * 提供 E2E 测试中常用的工具函数
 */

import { Page, expect } from '@playwright/test';
import { TEST_USER, PAGE_URLS, WAIT_TIMES, SELECTORS } from '../fixtures/test-data';

/**
 * 登录测试用户
 */
export async function loginUser(page: Page): Promise<void> {
  // 导航到登录页
  await page.goto(PAGE_URLS.login);

  // 等待登录表单加载
  await page.waitForSelector(SELECTORS.auth.emailInput, { timeout: WAIT_TIMES.long });

  // 填写登录凭据
  await page.fill(SELECTORS.auth.emailInput, TEST_USER.email);
  await page.fill(SELECTORS.auth.passwordInput, TEST_USER.password);

  // 提交登录表单
  await page.click(SELECTORS.auth.submitButton);

  // 等待登录完成（导航到驾驶舱或 Dashboard）
  await page.waitForURL(`**${PAGE_URLS.dashboard}`, { timeout: WAIT_TIMES.extraLong });
  await page.waitForLoadState('networkidle', { timeout: WAIT_TIMES.long });

  // 验证登录成功
  await expect(page).toHaveURL(/\/(login#\/|dashboard)/);
}

/**
 * 登出当前用户
 */
export async function logoutUser(page: Page): Promise<void> {
  // 点击登出按钮
  const logoutButton = page.locator(SELECTORS.auth.logoutButton).first();
  await logoutButton.click();

  // 等待重定向到登录页
  await page.waitForURL(`**${PAGE_URLS.login}`, { timeout: WAIT_TIMES.long });
}

/**
 * 等待加载指示器消失
 */
export async function waitForLoadingToFinish(page: Page): Promise<void> {
  const loadingSelector = SELECTORS.common.loadingSpinner;

  // 检查是否存在加载指示器
  const isVisible = await page.locator(loadingSelector).isVisible().catch(() => false);

  if (isVisible) {
    await page.waitForSelector(loadingSelector, { state: 'hidden', timeout: WAIT_TIMES.extraLong });
  }
}

/**
 * 等待并验证错误消息
 */
export async function expectErrorMessage(page: Page, expectedMessage: string): Promise<void> {
  await page.waitForSelector(SELECTORS.common.errorMessage, { timeout: WAIT_TIMES.medium });
  const errorText = await page.locator(SELECTORS.common.errorMessage).textContent();
  expect(errorText).toContain(expectedMessage);
}

/**
 * 清除本地存储和会话
 */
export async function clearAuthStorage(page: Page): Promise<void> {
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

/**
 * 导航到页面并等待加载完成
 */
export async function navigateAndWait(
  page: Page,
  path: string,
  options?: { timeout?: number }
): Promise<void> {
  const timeout = options?.timeout || WAIT_TIMES.long;

  await page.goto(path);
  await page.waitForLoadState('networkidle', { timeout });
  await waitForLoadingToFinish(page);
}

/**
 * 截图（带文件名）
 */
export async function takeScreenshot(
  page: Page,
  name: string
): Promise<void> {
  await page.screenshot({
    path: `test-results/screenshots/${name}.png`,
    fullPage: true,
  });
}

/**
 * 验证页面标题
 */
export async function expectPageTitle(
  page: Page,
  expectedTitle: string
): Promise<void> {
  const title = await page.title();
  expect(title).toContain(expectedTitle);
}

/**
 * 获取当前日期字符串
 */
export function getCurrentDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * 生成未来的日期
 */
export function getFutureDate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

/**
 * 生成过去的日期
 */
export function getPastDate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}

/**
 * 等待 API 响应（通过监听网络请求）
 */
export async function waitForAPIResponse(
  page: Page,
  urlPattern: string | RegExp,
  timeout?: number
): Promise<any> {
  return page.waitForResponse(
    response => {
      const url = response.url();
      if (typeof urlPattern === 'string') {
        return url.includes(urlPattern);
      }
      return urlPattern.test(url);
    },
    { timeout: timeout || WAIT_TIMES.long }
  );
}

/**
 * 验证统计数据不为空
 */
export async function expectStatsNotEmpty(page: Page): Promise<void> {
  const statsText = await page.locator(SELECTORS.dashboard.statsGrid).textContent();
  expect(statsText).not.toBe('0');
  expect(statsText).not.toBe('');
}

/**
 * 验证列表有数据
 */
export async function expectListNotEmpty(page: Page, selector: string): Promise<void> {
  const count = await page.locator(selector).count();
  expect(count).toBeGreaterThan(0);
}

/**
 * 安全点击（等待元素可交互）
 */
export async function safeClick(
  page: Page,
  selector: string
): Promise<void> {
  await page.waitForSelector(selector, { state: 'visible', timeout: WAIT_TIMES.long });
  await page.click(selector);
}

/**
 * 安全填表（等待元素可见）
 */
export async function safeFill(
  page: Page,
  selector: string,
  value: string
): Promise<void> {
  await page.waitForSelector(selector, { state: 'visible', timeout: WAIT_TIMES.long });
  await page.fill(selector, value);
}
