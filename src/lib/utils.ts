import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 导出验证器工具
export * from './passwordValidator'
export * from './emailValidator'

// 导出格式化工具
export * from './formatUtils'
