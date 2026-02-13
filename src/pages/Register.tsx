/**
 * 注册页面
 */

import { useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { UserPlus, Mail, Lock, User, AlertCircle, Check, X } from 'lucide-react'
import {
  validatePassword,
  getStrengthLabel,
  getStrengthColorClass,
  getStrengthTextColorClass,
  PasswordStrength,
} from '../lib/passwordValidator'
import { validateEmail as validateEmailFormat } from '../lib/emailValidator'

/**
 * 密码强度指示器组件
 */
function PasswordStrengthIndicator({ result }: { result: ReturnType<typeof validatePassword> }) {
  if (!result || result.score === 0) return null

  const width = (result.score / 4) * 100

  return (
    <div className="space-y-2">
      {/* 强度条 */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${getStrengthColorClass(result.strength)}`}
            style={{ width: `${width}%` }}
          />
        </div>
        <span className={`text-xs font-medium ${getStrengthTextColorClass(result.strength)}`}>
          {getStrengthLabel(result.strength)}
        </span>
      </div>

      {/* 规则检查列表 */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs">
          {result.checks.minLength ? (
            <Check className="h-3.5 w-3.5 text-green-600" />
          ) : (
            <X className="h-3.5 w-3.5 text-gray-400" />
          )}
          <span className={result.checks.minLength ? 'text-green-700' : 'text-gray-500'}>
            至少 8 位
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {result.checks.hasUppercase ? (
            <Check className="h-3.5 w-3.5 text-green-600" />
          ) : (
            <X className="h-3.5 w-3.5 text-gray-400" />
          )}
          <span className={result.checks.hasUppercase ? 'text-green-700' : 'text-gray-500'}>
            包含大写字母
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {result.checks.hasLowercase ? (
            <Check className="h-3.5 w-3.5 text-green-600" />
          ) : (
            <X className="h-3.5 w-3.5 text-gray-400" />
          )}
          <span className={result.checks.hasLowercase ? 'text-green-700' : 'text-gray-500'}>
            包含小写字母
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {result.checks.hasNumber ? (
            <Check className="h-3.5 w-3.5 text-green-600" />
          ) : (
            <X className="h-3.5 w-3.5 text-gray-400" />
          )}
          <span className={result.checks.hasNumber ? 'text-green-700' : 'text-gray-500'}>
            包含数字
          </span>
        </div>
      </div>
    </div>
  )
}

export default function Register() {
  const navigate = useNavigate()
  const { signUp } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false)
  const [passwordTouched, setPasswordTouched] = useState(false)
  const [emailTouched, setEmailTouched] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)

  // 实时验证密码强度
  const passwordValidation = useMemo(() => {
    if (!password) return null
    return validatePassword(password, {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumber: true,
      requireSpecial: false,
    })
  }, [password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)
    setNeedsEmailConfirmation(false)

    // 验证邮箱
    const emailValidation = validateEmailFormat(email)
    if (!emailValidation.valid) {
      setError(emailValidation.error || '邮箱地址格式不正确')
      return
    }

    // 验证密码
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    // 使用新的密码验证器
    const validation = validatePassword(password, {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumber: true,
      requireSpecial: false,
    })

    if (!validation.valid) {
      setError(validation.error || '密码强度不符合要求')
      return
    }

    setLoading(true)

    try {
      const result = await signUp(email, password, name)

      if (result.success) {
        setSuccessMessage(result.message)
        setNeedsEmailConfirmation(result.needsEmailConfirmation)

        // 如果不需要邮箱确认，自动跳转
        if (!result.needsEmailConfirmation) {
          setTimeout(() => navigate('/'), 2000)
        }
      } else {
        setError(result.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="max-w-md w-full">
        {/* Logo 和标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">SRM 供应商关系管理</h1>
          <p className="text-gray-600">创建您的账号</p>
        </div>

        {/* 注册表单 */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center justify-center mb-6">
            <div className="p-3 bg-brand/10 rounded-full">
              <UserPlus className="h-8 w-8 text-brand" />
            </div>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
            创建新账号
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {successMessage && !error && (
            <div className={`mb-4 p-3 rounded-lg flex items-start gap-2 ${
              needsEmailConfirmation
                ? 'bg-blue-50 border border-blue-200'
                : 'bg-green-50 border border-green-200'
            }`}>
              <AlertCircle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                needsEmailConfirmation ? 'text-blue-600' : 'text-green-600'
              }`} />
              <p className={`text-sm ${
                needsEmailConfirmation ? 'text-blue-800' : 'text-green-800'
              }`}>
                {successMessage}
              </p>
            </div>
          )}

          {needsEmailConfirmation && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">📧 接下来的步骤：</h3>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>检查您的邮箱收件箱（包括垃圾邮件文件夹）</li>
                <li>找到主题为"确认您的注册"的邮件</li>
                <li>点击邮件中的确认链接</li>
                <li>返回本页面登录</li>
              </ol>
            </div>
          )}

          {loading && !successMessage && !error && (
            <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-700">正在处理注册请求...</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 姓名输入 */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                姓名
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
                  placeholder="张三"
                  disabled={loading}
                />
              </div>
            </div>

            {/* 邮箱输入 */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                邮箱地址
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setEmailTouched(true)
                    // 实时验证邮箱格式
                    const result = validateEmailFormat(e.target.value)
                    setEmailError(result.valid ? null : result.error)
                  }}
                  required
                  className={`block w-full pl-10 pr-3 py-2 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent ${
                    emailTouched && emailError
                      ? 'border-red-300'
                      : 'border-gray-300'
                  }`}
                  placeholder="your@email.com"
                  disabled={loading}
                />
              </div>
              {/* 邮箱格式错误提示 */}
              {emailTouched && emailError && (
                <p className="mt-1 text-xs text-red-600">{emailError}</p>
              )}
            </div>

            {/* 密码输入 */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                密码
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setPasswordTouched(true)
                  }}
                  required
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
                  placeholder="至少 8 位，包含大小写字母和数字"
                  disabled={loading}
                />
              </div>
              {/* 密码强度指示器 */}
              {passwordTouched && passwordValidation && (
                <div className="mt-2">
                  <PasswordStrengthIndicator result={passwordValidation} />
                </div>
              )}
            </div>

            {/* 确认密码 */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                确认密码
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
                  placeholder="再次输入密码"
                  disabled={loading}
                />
              </div>
            </div>

            {/* 注册按钮 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand text-white py-2.5 rounded-lg font-medium hover:bg-brand/90 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '注册中...' : '注册'}
            </button>
          </form>

          {/* 登录链接 */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              已有账号？{' '}
              <Link to="/login" className="text-brand font-medium hover:underline">
                立即登录
              </Link>
            </p>
          </div>
        </div>

        {/* 底部信息 */}
        <p className="mt-6 text-center text-xs text-gray-500">
          © 2026 SRM. All rights reserved.
        </p>
      </div>
    </div>
  )
}
