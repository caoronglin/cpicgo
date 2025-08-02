import React, { useState } from 'react'
import { X, FolderPlus } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface CreateFolderModalProps {
  isOpen: boolean
  onClose: () => void
}

const CreateFolderModal: React.FC<CreateFolderModalProps> = ({ isOpen, onClose }) => {
  const [folderName, setFolderName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const { token } = useAuth()

  const handleCreateFolder = async () => {
    if (!folderName.trim()) return

    setIsCreating(true)

    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: folderName.trim() })
      })

      if (!response.ok) {
        throw new Error('创建文件夹失败')
      }

      const result = await response.json()
      console.log('创建成功:', result)
      
      // 重置状态并关闭
      setFolderName('')
      onClose()
      
      // 刷新页面
      window.location.reload()
    } catch (error) {
      console.error('创建文件夹错误:', error)
      alert('创建文件夹失败，请重试')
    } finally {
      setIsCreating(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">创建文件夹</h2>
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
              文件夹名称
            </label>
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="输入文件夹名称"
              className="w-full p-2 border border-input rounded-md"
              autoFocus
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={isCreating}
              className="flex-1 px-4 py-2 border border-input rounded-md hover:bg-accent transition-colors disabled:opacity-50"
            >
              取消
            </button>
            <button
              onClick={handleCreateFolder}
              disabled={isCreating || !folderName.trim()}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isCreating ? (
                <div className="flex items-center justify-center">
                  <FolderPlus className="w-4 h-4 mr-2 animate-spin" />
                  创建中...
                </div>
              ) : (
                '创建'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateFolderModal