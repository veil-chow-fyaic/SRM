/**
 * @deprecated 此文件已弃用
 *
 * 类型定义已迁移到 src/types/supplier.ts
 * 数据字典已迁移到 src/lib/dictionaries.ts
 * 硬编码的 SUPPLIERS 数组已删除，系统使用真实数据库数据
 *
 * 为了向后兼容，保留重新导出
 */

export type { Supplier } from '../types/supplier'
export { DICTIONARIES } from '../lib/dictionaries'

// 硬编码的 SUPPLIERS 数组已删除
// 系统现在使用真实数据库数据
