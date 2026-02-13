/**
 * 格式化工具函数
 *
 * 提供日期、数字、货币等格式化功能
 */

/**
 * 格式化日期为本地化字符串
 *
 * @param date - 日期对象、字符串或时间戳
 * @param format - 格式类型 (default: 'date-time')
 * @returns 格式化后的字符串
 *
 * @example
 * ```ts
 * formatDate(new Date(), 'date')        // '2026年2月12日'
 * formatDate(new Date(), 'time')        // '14:30'
 * formatDate(new Date(), 'date-time')   // '2026年2月12日 14:30'
 * ```
 */
export function formatDate(
  date: Date | string | number,
  format: 'date' | 'time' | 'date-time' | 'short' | 'long' | 'iso' = 'date-time'
): string {
  let dateObj: Date

  if (typeof date === 'string') {
    dateObj = new Date(date)
  } else if (typeof date === 'number') {
    dateObj = new Date(date)
  } else {
    dateObj = date
  }

  // 无效日期处理
  if (isNaN(dateObj.getTime())) {
    return '无效日期'
  }

  if (format === 'iso') {
    return dateObj.toISOString()
  }

  const year = dateObj.getFullYear()
  const month = dateObj.getMonth() + 1
  const day = dateObj.getDate()
  const hours = dateObj.getHours()
  const minutes = dateObj.getMinutes()
  const seconds = dateObj.getSeconds()

  switch (format) {
    case 'date':
      return `${year}年${month}月${day}日`

    case 'time':
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`

    case 'short':
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

    case 'long':
      return `${year}年${month}月${day}日 ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`

    case 'date-time':
    default:
      return `${year}年${month}月${day}日 ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
  }
}

/**
 * 格式化相对时间（多久前）
 *
 * @param date - 日期对象、字符串或时间戳
 * @returns 相对时间字符串
 *
 * @example
 * ```ts
 * formatRelativeTime(new Date(Date.now() - 1000 * 60))  // '1分钟前'
 * formatRelativeTime(new Date(Date.now() - 1000 * 3600)) // '1小时前'
 * ```
 */
export function formatRelativeTime(date: Date | string | number): string {
  let dateObj: Date

  if (typeof date === 'string') {
    dateObj = new Date(date)
  } else if (typeof date === 'number') {
    dateObj = new Date(date)
  } else {
    dateObj = date
  }

  if (isNaN(dateObj.getTime())) {
    return '无效日期'
  }

  const now = new Date()
  const diffMs = now.getTime() - dateObj.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffMonths = Math.floor(diffDays / 30)
  const diffYears = Math.floor(diffDays / 365)

  if (diffSecs < 60) {
    return `${diffSecs}秒前`
  } else if (diffMins < 60) {
    return `${diffMins}分钟前`
  } else if (diffHours < 24) {
    return `${diffHours}小时前`
  } else if (diffDays < 30) {
    return `${diffDays}天前`
  } else if (diffMonths < 12) {
    return `${diffMonths}个月前`
  } else {
    return `${diffYears}年前`
  }
}

/**
 * 格式化数字（添加千分位分隔符）
 *
 * @param num - 数字
 * @param options - 格式化选项
 * @returns 格式化后的字符串
 *
 * @example
 * ```ts
 * formatNumber(1234567.89)        // '1,234,567.89'
 * formatNumber(1234567.89, { decimals: 0 })  // '1,234,568'
 * ```
 */
export function formatNumber(
  num: number,
  options: { decimals?: number; locale?: string } = {}
): string {
  const { decimals = 2, locale = 'zh-CN' } = options

  if (isNaN(num)) {
    return '0'
  }

  return num.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/**
 * 格式化货币
 *
 * @param amount - 金额
 * @param options - 格式化选项
 * @returns 格式化后的货币字符串
 *
 * @example
 * ```ts
 * formatCurrency(1234567.89)                   // '¥1,234,567.89'
 * formatCurrency(1234567.89, { symbol: 'CNY' }) // 'CNY 1,234,567.89'
 * formatCurrency(1234567.89, { decimals: 0 })     // '¥1,234,568'
 * ```
 */
export function formatCurrency(
  amount: number,
  options: { decimals?: number; symbol?: string; locale?: string } = {}
): string {
  const { decimals = 2, symbol = '¥', locale = 'zh-CN' } = options

  if (isNaN(amount)) {
    return `${symbol}0.00`
  }

  const formatted = amount.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

  return `${symbol}${formatted}`
}

/**
 * 格式化百分比
 *
 * @param value - 数值（0-1 之间）
 * @param options - 格式化选项
 * @returns 格式化后的百分比字符串
 *
 * @example
 * ```ts
 * formatPercent(0.8567)                    // '85.67%'
 * formatPercent(0.8567, { decimals: 0 })    // '86%'
 * formatPercent(0.8567, { multiply: false }) // '0.86'
 * ```
 */
export function formatPercent(
  value: number,
  options: { decimals?: number; multiply?: boolean } = {}
): string {
  const { decimals = 2, multiply = true } = options

  if (isNaN(value)) {
    return '0%'
  }

  const displayValue = multiply ? value * 100 : value

  return `${displayValue.toFixed(decimals)}%`
}

/**
 * 格式化文件大小
 *
 * @param bytes - 字节数
 * @param options - 格式化选项
 * @returns 格式化后的文件大小字符串
 *
 * @example
 * ```ts
 * formatFileSize(1024)           // '1 KB'
 * formatFileSize(1048576)         // '1 MB'
 * formatFileSize(1073741824)       // '1 GB'
 * formatFileSize(1234, { decimals: 1 }) // '1.2 KB'
 * ```
 */
export function formatFileSize(
  bytes: number,
  options: { decimals?: number; locale?: string } = {}
): string {
  const { decimals = 0, locale = 'zh-CN' } = options

  if (isNaN(bytes) || bytes < 0) {
    return '0 B'
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  const formatted = size.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

  return `${formatted} ${units[unitIndex]}`
}

/**
 * 截断文本（添加省略号）
 *
 * @param text - 原文本
 * @param maxLength - 最大长度
 * @param options - 选项
 * @returns 截断后的文本
 *
 * @example
 * ```ts
 * truncateText('这是一个很长的文本', 8)              // '这是一个很...'
 * truncateText('这是一个很长的文本', 8, { suffix: '...' }) // '这是一个很...'
 * ```
 */
export function truncateText(
  text: string,
  maxLength: number,
  options: { suffix?: string; breakWord?: boolean } = {}
): string {
  const { suffix = '...', breakWord = false } = options

  if (!text || text.length <= maxLength) {
    return text
  }

  const truncateLength = maxLength - suffix.length

  if (truncateLength <= 0) {
    return suffix
  }

  let truncated = text.substring(0, truncateLength)

  // 如果不在单词边界断开，尝试找到最后一个空格
  if (!breakWord && truncated.length < text.length) {
    const lastSpace = truncated.lastIndexOf(' ')
    if (lastSpace > 0) {
      truncated = truncated.substring(0, lastSpace)
    }
  }

  return truncated + suffix
}

/**
 * 格式化电话号码（中国）
 *
 * @param phone - 电话号码（纯数字）
 * @param options - 格式化选项
 * @returns 格式化后的电话号码
 *
 * @example
 * ```ts
 * formatPhoneNumber('13800138000')                    // '138-0013-8000'
 * formatPhoneNumber('010-12345678')                  // '010-12345678'
 * formatPhoneNumber('13800138000', { mobile: true }) // '138 0013 8000'
 * ```
 */
export function formatPhoneNumber(
  phone: string,
  options: { mobile?: boolean; separator?: string } = {}
): string {
  const { mobile, separator = '-' } = options

  // 移除非数字字符
  const cleaned = phone.replace(/\D/g, '')

  // 手机号 (11位，1开头)
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    if (mobile) {
      return `${cleaned.substring(0, 3)} ${cleaned.substring(3, 7)} ${cleaned.substring(7)}`
    }
    return `${cleaned.substring(0, 3)}${separator}${cleaned.substring(3, 7)}${separator}${cleaned.substring(7)}`
  }

  // 座机 (区号+号码)
  if (cleaned.length >= 7 && cleaned.length <= 12) {
    // 尝试分离区号
    if (cleaned.length >= 10 && cleaned.startsWith('0')) {
      const areaCode = cleaned.substring(0, cleaned.length - 8)
      const number = cleaned.substring(cleaned.length - 8)
      return `${areaCode}${separator}${number.substring(0, 4)}${separator}${number.substring(4)}`
    }

    // 7-8位号码
    if (cleaned.length === 7) {
      return `${cleaned.substring(0, 3)}${separator}${cleaned.substring(3)}`
    } else if (cleaned.length === 8) {
      return `${cleaned.substring(0, 4)}${separator}${cleaned.substring(4)}`
    }
  }

  // 无法识别格式，返回原始值
  return phone
}

/**
 * 高亮搜索关键词
 *
 * @param text - 原文本
 * @param keyword - 搜索关键词
 * @param options - 选项
 * @returns 带高亮标记的 HTML 字符串
 *
 * @example
 * ```ts
 * highlightKeyword('这是一个测试文本', '测试')
 * // '这是一个<mark>测试</mark>文本'
 * ```
 */
export function highlightKeyword(
  text: string,
  keyword: string,
  options: { className?: string; caseSensitive?: boolean } = {}
): string {
  const { className = 'bg-yellow-200', caseSensitive = false } = options

  if (!text || !keyword) {
    return text
  }

  const flags = caseSensitive ? 'g' : 'gi'
  const regex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags)

  return text.replace(regex, (match) => {
    return `<mark class="${className}">${match}</mark>`
  })
}

/**
 * 获取安全的文件名
 *
 * @param filename - 原文件名
 * @returns 安全的文件名
 *
 * @example
 * ```ts
 * getSafeFilename('test/file?.txt') // 'test_file_.txt'
 * ```
 */
export function getSafeFilename(filename: string): string {
  if (!filename) {
    return 'unnamed'
  }

  // 替换不安全的字符
  let safe = filename
    .replace(/[<>:"/\\|?*]/g, '_')  // 不安全字符
    .replace(/\s+/g, '_')              // 空格
    .replace(/\.+/g, '.')              // 多个点
    .replace(/^\.+/, '')                // 开头的点
    .replace(/\.+$/, '')               // 结尾的点

  // 如果处理后为空，使用默认名
  if (!safe) {
    return 'unnamed'
  }

  return safe
}

/**
 * 生成随机 ID
 *
 * @param length - ID 长度
 * @param prefix - 前缀
 * @returns 随机 ID
 *
 * @example
 * ```ts
 * generateId(8)           // 'a3f2b9c1'
 * generateId(8, 'temp_') // 'temp_a3f2b9c1'
 * ```
 */
export function generateId(length = 8, prefix = ''): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = prefix

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  return result
}

/**
 * 深度比较两个值（用于 useEffect 等场景）
 *
 * @param obj1 - 第一个值
 * @param obj2 - 第二个值
 * @returns 是否深度相等
 */
export function deepEqual(obj1: unknown, obj2: unknown): boolean {
  if (obj1 === obj2) {
    return true
  }

  if (typeof obj1 !== typeof obj2) {
    return false
  }

  if (typeof obj1 !== 'object' || obj1 === null || obj2 === null) {
    return false
  }

  const keys1 = Object.keys(obj1 as object)
  const keys2 = Object.keys(obj2 as object)

  if (keys1.length !== keys2.length) {
    return false
  }

  for (const key of keys1) {
    if (!keys2.includes(key)) {
      return false
    }

    if (
      !deepEqual(
        (obj1 as Record<string, unknown>)[key],
        (obj2 as Record<string, unknown>)[key]
      )
    ) {
      return false
    }
  }

  return true
}
