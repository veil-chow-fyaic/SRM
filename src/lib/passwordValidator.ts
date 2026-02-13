/**
 * 密码验证工具
 *
 * 提供密码强度评分和验证规则
 */

/**
 * 密码强度等级
 */
export enum PasswordStrength {
  WEAK = 'weak',         // 弱: 红色
  FAIR = 'fair',         // 一般: 橙色
  GOOD = 'good',         // 良好: 黄色
  STRONG = 'strong'      // 强: 绿色
}

/**
 * 密码验证结果
 */
export interface PasswordValidationResult {
  /** 是否通过验证 */
  valid: boolean
  /** 强度等级 */
  strength: PasswordStrength
  /** 强度分数 (0-4) */
  score: number
  /** 验证规则检查结果 */
  checks: {
    /** 长度至少 8 位 */
    minLength: boolean
    /** 包含大写字母 */
    hasUppercase: boolean
    /** 包含小写字母 */
    hasLowercase: boolean
    /** 包含数字 */
    hasNumber: boolean
    /** 包含特殊字符 */
    hasSpecial: boolean
  }
  /** 错误消息 */
  error?: string
}

/**
 * 密码强度配置
 */
export interface PasswordValidatorConfig {
  /** 最小长度 (默认: 8) */
  minLength?: number
  /** 是否要求大写字母 (默认: true) */
  requireUppercase?: boolean
  /** 是否要求小写字母 (默认: true) */
  requireLowercase?: boolean
  /** 是否要求数字 (默认: true) */
  requireNumber?: boolean
  /** 是否要求特殊字符 (默认: false) */
  requireSpecial?: boolean
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: Required<PasswordValidatorConfig> = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: false,
}

/**
 * 验证密码并返回强度评级
 *
 * @param password - 待验证的密码
 * @param config - 验证配置
 * @returns 验证结果
 *
 * @example
 * ```ts
 * const result = validatePassword('MyPass123')
 * console.log(result.strength) // 'good'
 * console.log(result.valid) // true
 * ```
 */
export function validatePassword(
  password: string,
  config: PasswordValidatorConfig = {}
): PasswordValidationResult {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }

  // 基础检查
  const checks: PasswordValidationResult['checks'] = {
    minLength: password.length >= finalConfig.minLength,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  }

  // 计算通过的规则数量
  let score = 0
  if (checks.minLength) score++
  if (!finalConfig.requireUppercase || checks.hasUppercase) score++
  if (!finalConfig.requireLowercase || checks.hasLowercase) score++
  if (!finalConfig.requireNumber || checks.hasNumber) score++
  if (!finalConfig.requireSpecial || checks.hasSpecial) score++

  // 额外加分项
  if (password.length >= 12) score++ // 长密码加分
  if (checks.hasSpecial && !finalConfig.requireSpecial) score++ // 包含特殊字符加分

  // 确定强度等级
  let strength: PasswordStrength
  if (score <= 2) {
    strength = PasswordStrength.WEAK
  } else if (score === 3) {
    strength = PasswordStrength.FAIR
  } else if (score === 4) {
    strength = PasswordStrength.GOOD
  } else {
    strength = PasswordStrength.STRONG
  }

  // 检查是否通过所有必需的规则
  const valid =
    checks.minLength &&
    (!finalConfig.requireUppercase || checks.hasUppercase) &&
    (!finalConfig.requireLowercase || checks.hasLowercase) &&
    (!finalConfig.requireNumber || checks.hasNumber) &&
    (!finalConfig.requireSpecial || checks.hasSpecial)

  // 生成错误消息
  let error: string | undefined
  if (!valid) {
    const errors: string[] = []
    if (!checks.minLength) {
      errors.push(`密码长度至少 ${finalConfig.minLength} 位`)
    }
    if (finalConfig.requireUppercase && !checks.hasUppercase) {
      errors.push('包含大写字母')
    }
    if (finalConfig.requireLowercase && !checks.hasLowercase) {
      errors.push('包含小写字母')
    }
    if (finalConfig.requireNumber && !checks.hasNumber) {
      errors.push('包含数字')
    }
    if (finalConfig.requireSpecial && !checks.hasSpecial) {
      errors.push('包含特殊字符 (!@#$%^&*)')
    }
    error = '密码要求：' + errors.join('、')
  }

  return {
    valid,
    strength,
    score: Math.min(score, 4), // 限制最大分数为 4
    checks,
    error,
  }
}

/**
 * 获取密码强度对应的文本标签
 *
 * @param strength - 密码强度等级
 * @returns 中文标签
 */
export function getStrengthLabel(strength: PasswordStrength): string {
  const labels: Record<PasswordStrength, string> = {
    [PasswordStrength.WEAK]: '弱',
    [PasswordStrength.FAIR]: '一般',
    [PasswordStrength.GOOD]: '良好',
    [PasswordStrength.STRONG]: '强',
  }
  return labels[strength]
}

/**
 * 获取密码强度对应的 Tailwind CSS 颜色类
 *
 * @param strength - 密码强度等级
 * @returns 颜色类名
 */
export function getStrengthColorClass(strength: PasswordStrength): string {
  const colors: Record<PasswordStrength, string> = {
    [PasswordStrength.WEAK]: 'bg-red-500',
    [PasswordStrength.FAIR]: 'bg-orange-500',
    [PasswordStrength.GOOD]: 'bg-yellow-500',
    [PasswordStrength.STRONG]: 'bg-green-500',
  }
  return colors[strength]
}

/**
 * 获取密码强度对应的文本颜色类
 *
 * @param strength - 密码强度等级
 * @returns 文本颜色类名
 */
export function getStrengthTextColorClass(strength: PasswordStrength): string {
  const colors: Record<PasswordStrength, string> = {
    [PasswordStrength.WEAK]: 'text-red-600',
    [PasswordStrength.FAIR]: 'text-orange-600',
    [PasswordStrength.GOOD]: 'text-yellow-600',
    [PasswordStrength.STRONG]: 'text-green-600',
  }
  return colors[strength]
}
