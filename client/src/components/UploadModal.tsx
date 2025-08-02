import React, { useState } from 'react'
import { X, Upload, FileImage } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [folder, setFolder] = useState('')
  const { token } = useAuth()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setSelectedFiles(files)
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return

    setIsUploading(true)

    try {
      const formData = new FormData()
      selectedFiles.forEach(file => {
        formData.append('files', file)
      })
      if (folder) {
        formData.append('folder', folder)
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error('上传失败')
      }

      const result = await response.json()
      console.log('上传成功:', result)
      
      // 重置状态并关闭
      setSelectedFiles([])
      setFolder('')
      onClose()
      
      // 刷新页面
      window.location.reload()
    } catch (error) {
      console.error('上传错误:', error)
      alert('上传失败，请重试')
    } finally {
      setIsUploading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">上传图片</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              选择图片
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="w-full p-2 border border-input rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              文件夹 (可选)
            </label>
            <input
              type="text"
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
              placeholder="例如: blog/2024"
              className="w-full p-2 border border-input rounded-md"
            />
          </div>

          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                已选择 {selectedFiles.length} 个文件
              </p>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <FileImage className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span className="truncate">{file.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={isUploading}
              className="flex-1 px-4 py-2 border border-input rounded-md hover:bg-accent transition-colors disabled:opacity-50"
            >
              取消
            </button>
            <button
              onClick={handleUpload}
              disabled={isUploading || selectedFiles.length === 0}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isUploading ? (
                <div className="flex items-center justify-center">
                  <Upload className="w-4 h-4 mr-2 animate-spin" />
                  上传中...
                </div>
              ) : (
                '上传'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UploadModal