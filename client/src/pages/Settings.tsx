import React, { useState } from 'react'
import { Settings as SettingsIcon, User, Shield, Key, AlertTriangle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const Settings: React.FC = () => {
  const { token, logout } = useAuth()
  const [apiKey, setApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [loading, setLoading] = useState(false)

  const generateApiKey = async () => {
    try {
      setLoading(true)
      // 这里应该调用后端API生成新的API密钥
      // 暂时使用随机字符串模拟
      const newKey = `r2_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
      setApiKey(newKey)
    } catch (error) {
      console.error('Failed to generate API key:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClearStorage = () => {
    if (confirm('确定要清除所有本地存储数据吗？这将不会删除云端图片。')) {
      localStorage.clear()
      window.location.reload()
    }
  }

  const handleDeleteAll = async () => {
    if (confirm('⚠️ 警告：这将删除所有图片和文件夹！此操作不可撤销！')) {
      try {
        // 这里应该调用后端API删除所有数据
        console.log('Deleting all data...')
        alert('删除功能需要在后端实现')
      } catch (error) {
        console.error('Failed to delete all data:', error)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">设置</h1>
        <p className="text-muted-foreground mt-2">
          管理您的账户设置和API配置
        </p>
      </div>

      {/* API密钥管理 */}
      <div className="bg-card border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Key className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">API密钥</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">当前API密钥</label>
            <div className="flex gap-2">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={token || '未设置'}
                readOnly
                className="flex-1 px-3 py-2 border rounded-md bg-muted text-sm"
              />
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="px-3 py-2 border rounded-md hover:bg-muted"
              >
                {showApiKey ? '隐藏' : '显示'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">生成新密钥</label>
            <button
              onClick={generateApiKey}
              disabled={loading}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? '生成中...' : '生成新密钥'}
            </button>
            {apiKey && (
              <div className="mt-2 p-3 bg-muted rounded-md">
                <p className="text-sm font-medium mb-1">新的API密钥：</p>
                <code className="text-sm bg-background px-2 py-1 rounded">{apiKey}</code>
                <p className="text-xs text-muted-foreground mt-1">
                  请妥善保存此密钥，它只会显示一次
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 存储管理 */}
      <div className="bg-card border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">存储管理</h2>
        </div>
        
        <div className="space-y-4">
          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-2">本地存储</h3>
            <p className="text-sm text-muted-foreground mb-3">
              清除浏览器本地存储的设置和缓存数据
            </p>
            <button
              onClick={handleClearStorage}
              className="px-4 py-2 border border-destructive text-destructive rounded-md hover:bg-destructive/10"
            >
              清除本地存储
            </button>
          </div>

          <div className="border border-destructive rounded-md p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <h3 className="font-medium text-destructive">危险区域</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              删除所有存储的图片和文件夹，此操作不可撤销
            </p>
            <button
              onClick={handleDeleteAll}
              className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90"
            >
              删除所有数据
            </button>
          </div>
        </div>
      </div>

      {/* 账户信息 */}
      <div className="bg-card border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">账户信息</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">账户状态</label>
            <p className="text-sm text-muted-foreground">已登录</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">服务地址</label>
            <p className="text-sm text-muted-foreground">
              {(import.meta.env as any).VITE_API_BASE_URL || '默认服务地址'}
            </p>
          </div>

          <button
            onClick={logout}
            className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90"
          >
            退出登录
          </button>
        </div>
      </div>

      {/* 关于 */}
      <div className="bg-card border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">          <SettingsIcon className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">关于</h2>
        </div>
        
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>R2 Worker - Cloudflare R2 图床服务</p>
          <p>版本: 1.0.0</p>
          <p>构建时间: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  )
}

export default Settings