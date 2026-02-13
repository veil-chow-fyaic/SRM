/**
 * 文件上传对话框组件
 *
 * 用于供应商文件上传的模态对话框
 */

import { useState, useRef } from 'react'
import { X, Upload, File, AlertCircle } from 'lucide-react'
import { cn } from '../lib/utils'
import type { SupplierFileType } from '../services/files'

interface FileUploadDialogProps {
  supplierId: string
  isOpen: boolean
  onClose: () => void
  onUpload: (file: File, fileType: SupplierFileType, description?: string) => Promise<void>
}

/**
 * 文件类型选项
 */
const FILE_TYPE_OPTIONS: Array<{ value: SupplierFileType; label: string; color: string }> = [
  { value: 'License', label: '营业执照', color: 'bg-blue-50 text-blue-600 border-blue-200' },
  { value: 'Cert', label: '认证证书', color: 'bg-green-50 text-green-600 border-green-200' },
  { value: 'Contract', label: '合同文件', color: 'bg-purple-50 text-purple-600 border-purple-200' },
  { value: 'Finance', label: '财务文件', color: 'bg-amber-50 text-amber-600 border-amber-200' },
  { value: 'Other', label: '其他文件', color: 'bg-slate-50 text-slate-600 border-slate-200' },
]

/**
 * 允许的文件类型
 */
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/msword', // .doc
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'text/plain', // .txt (临时添加用于测试)
]

/**
 * 最大文件大小 (50MB)
 */
const MAX_FILE_SIZE = 50 * 1024 * 1024

export function FileUploadDialog({ supplierId: _supplierId, isOpen, onClose, onUpload }: FileUploadDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileType, setFileType] = useState<SupplierFileType>('Other')
  const [description, setDescription] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 重置表单
  const resetForm = () => {
    setSelectedFile(null)
    setFileType('Other')
    setDescription('')
    setError(null)
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // 处理关闭
  const handleClose = () => {
    if (!isUploading) {
      resetForm()
      onClose()
    }
  }

  // 验证文件
  const validateFile = (file: File): string | null => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return '不支持的文件类型。请上传 PDF、图片或 Office 文档。'
    }
    if (file.size > MAX_FILE_SIZE) {
      return `文件大小超过限制 (最大 50MB)`
    }
    return null
  }

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      setSelectedFile(null)
      setPreview(null)
      return
    }

    setError(null)
    setSelectedFile(file)

    // 如果是图片，生成预览
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setPreview(null)
    }
  }

  // 处理拖拽
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const file = e.dataTransfer.files[0]
    if (file) {
      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        return
      }

      setError(null)
      setSelectedFile(file)

      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        setPreview(null)
      }
    }
  }

  // 处理上传
  const handleUpload = async () => {
    if (!selectedFile) {
      setError('请选择文件')
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      await onUpload(selectedFile, fileType, description || undefined)
      resetForm()
      onClose()
    } catch (err) {
      console.error('文件上传失败:', err)
      setError(err instanceof Error ? err.message : '文件上传失败，请重试')
    } finally {
      setIsUploading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">上传文件</h2>
            <p className="text-sm text-slate-500">支持 PDF、图片、Word、Excel 格式，最大 50MB</p>
          </div>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* 文件选择区域 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">选择文件</label>
            <div
              className={cn(
                'border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer',
                error ? 'border-red-300 bg-red-50' : 'border-slate-300 hover:border-brand-400 hover:bg-slate-50'
              )}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept={ALLOWED_FILE_TYPES.join(',')}
                onChange={handleFileSelect}
                disabled={isUploading}
              />

              {selectedFile ? (
                <div className="space-y-3">
                  {preview ? (
                    <div className="flex justify-center">
                      <img src={preview} alt="Preview" className="max-h-40 rounded object-contain" />
                    </div>
                  ) : (
                    <div className="flex justify-center">
                      <File className="w-12 h-12 text-brand-500" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-slate-900">{selectedFile.name}</p>
                    <p className="text-sm text-slate-500">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-10 h-10 text-slate-400 mx-auto" />
                  <p className="text-sm text-slate-600">点击选择文件或拖拽文件到此处</p>
                  <p className="text-xs text-slate-400">PDF, JPG, PNG, DOCX, XLSX</p>
                </div>
              )}
            </div>
          </div>

          {/* 文件类型选择 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">文件类型</label>
            <div className="grid grid-cols-3 gap-2">
              {FILE_TYPE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFileType(option.value)}
                  disabled={isUploading}
                  className={cn(
                    'px-3 py-2 text-sm font-medium rounded-lg border transition-colors',
                    fileType === option.value
                      ? option.color
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* 文件描述 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">文件描述（可选）</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isUploading}
              placeholder="请输入文件描述..."
              rows={3}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
          >
            取消
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2',
              selectedFile && !isUploading
                ? 'bg-brand-500 text-white hover:bg-brand-600'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            )}
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                上传中...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                上传文件
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
