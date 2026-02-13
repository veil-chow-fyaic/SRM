/**
 * 邮箱验证工具
 *
 * 提供增强的邮箱地址验证功能
 */

/**
 * 邮箱验证结果
 */
export interface EmailValidationResult {
  /** 是否通过验证 */
  valid: boolean
  /** 错误消息 */
  error?: string
  /** 邮箱用户名部分 */
  username?: string
  /** 邮箱域名部分 */
  domain?: string
}

/**
 * 常见免费邮箱域名
 */
const FREE_EMAIL_DOMAINS = new Set([
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'live.com',
  'qq.com',
  '163.com',
  '126.com',
  'sina.com',
  'sohu.com',
  'tom.com',
  '21cn.com',
  'yeah.net',
  'foxmail.com',
])

/**
 * 企业邮箱域名模式 (简化版，实际应用中需要更完整的列表)
 */
const CORPORATE_DOMAIN_PATTERNS = [
  /\.com\.cn$/,
  /\.cn$/,
  /\.net$/,
  /\.org$/,
  /\.gov\.cn$/,
  /\.edu\.cn$/,
  /\.ac\.cn$/,
]

/**
 * 验证邮箱地址格式
 *
 * @param email - 待验证的邮箱地址
 * @returns 验证结果
 *
 * @example
 * ```ts
 * const result = validateEmail('user@example.com')
 * console.log(result.valid) // true
 * ```
 */
export function validateEmail(email: string): EmailValidationResult {
  // 基本格式检查
  if (!email || email.trim() === '') {
    return { valid: false, error: '邮箱地址不能为空' }
  }

  const trimmedEmail = email.trim().toLowerCase()

  // 检查邮箱长度
  if (trimmedEmail.length > 254) {
    return { valid: false, error: '邮箱地址过长' }
  }

  // 基本格式验证 (使用更严格的正则表达式)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  if (!emailRegex.test(trimmedEmail)) {
    return { valid: false, error: '邮箱地址格式不正确' }
  }

  // 分割邮箱地址
  const atIndex = trimmedEmail.lastIndexOf('@')
  if (atIndex === -1) {
    return { valid: false, error: '邮箱地址必须包含 @ 符号' }
  }

  const username = trimmedEmail.substring(0, atIndex)
  const domain = trimmedEmail.substring(atIndex + 1)

  // 验证用户名部分
  if (username.length === 0) {
    return { valid: false, error: '邮箱用户名不能为空' }
  }

  if (username.length > 64) {
    return { valid: false, error: '邮箱用户名过长' }
  }

  // 检查用户名是否以点开头或结尾
  if (username.startsWith('.') || username.endsWith('.')) {
    return { valid: false, error: '邮箱用户名不能以点开头或结尾' }
  }

  // 检查用户名中是否有连续的点
  if (username.includes('..')) {
    return { valid: false, error: '邮箱用户名不能包含连续的点' }
  }

  // 验证域名部分
  if (domain.length === 0) {
    return { valid: false, error: '邮箱域名不能为空' }
  }

  if (domain.length > 253) {
    return { valid: false, error: '邮箱域名过长' }
  }

  // 检查域名是否包含至少一个点
  if (!domain.includes('.')) {
    return { valid: false, error: '邮箱域名格式不正确' }
  }

  // 检查顶级域名是否有效
  const domainParts = domain.split('.')
  const tld = domainParts[domainParts.length - 1]

  if (tld.length < 2) {
    return { valid: false, error: '邮箱域名顶级域名不能少于 2 个字符' }
  }

  return {
    valid: true,
    username,
    domain,
  }
}

/**
 * 检查是否为常见免费邮箱
 *
 * @param email - 邮箱地址
 * @returns 是否为免费邮箱
 */
export function isFreeEmail(email: string): boolean {
  const result = validateEmail(email)
  if (!result.valid || !result.domain) {
    return false
  }

  return FREE_EMAIL_DOMAINS.has(result.domain)
}

/**
 * 检查是否可能为企业邮箱
 *
 * @param email - 邮箱地址
 * @returns 是否可能为企业邮箱
 */
export function isCorporateEmail(email: string): boolean {
  const result = validateEmail(email)
  if (!result.valid || !result.domain) {
    return false
  }

  // 如果不是免费邮箱，则认为是企业邮箱
  return !isFreeEmail(email)
}

/**
 * 获取邮箱类型描述
 *
 * @param email - 邮箱地址
 * @returns 邮箱类型描述
 */
export function getEmailTypeDescription(email: string): string {
  const result = validateEmail(email)
  if (!result.valid) {
    return '无效邮箱'
  }

  if (isFreeEmail(email)) {
    return '个人邮箱'
  }

  if (isCorporateEmail(email)) {
    return '企业邮箱'
  }

  return '其他邮箱'
}

/**
 * 规范化邮箱地址
 *
 * @param email - 待规范化的邮箱地址
 * @returns 规范化后的邮箱地址
 */
export function normalizeEmail(email: string): string {
  const result = validateEmail(email)
  if (!result.valid) {
    return email
  }

  // 转换为小写并去除前后空格
  let normalized = email.trim().toLowerCase()

  // Gmail 特殊处理：忽略点号和后面的别名
  if (result.domain === 'gmail.com') {
    const [username, domain] = normalized.split('@')
    // 移除用户名中的点号
    const cleanUsername = username.replace(/\./g, '')
    // 移除 + 号及其后面的内容
    const aliasRemoved = cleanUsername.split('+')[0]
    normalized = `${aliasRemoved}@${domain}`
  }

  return normalized
}
