import React, { useEffect, useState } from 'react'
import { Image, Folder, TrendingUp, HardDrive } from 'lucide-react'
import { api } from '../lib/api'

interface Stats {
  totalImages: number
  totalSize: string
  totalSizeFormatted: string
  dailyStats: Array<{
    date: string
    count: number
    sizeFormatted: string
  }>
  extensionStats: Array<{
    extension: string
    count: number
    sizeFormatted: string
  }>
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const result = await api.getStats()
      if (result.success && result.data) {
        setStats(result.data as Stats)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">仪表盘</h1>
        <p className="text-muted-foreground mt-2">
          查看您的图床使用统计和趋势
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">图片总数</p>
              <p className="text-2xl font-bold">{stats?.totalImages || 0}</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <Image className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">总大小</p>
              <p className="text-2xl font-bold">{stats?.totalSizeFormatted || '0 B'}</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <HardDrive className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">今日上传</p>
              <p className="text-2xl font-bold">
                {stats?.dailyStats?.[0]?.count || 0}
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">文件夹数</p>
              <p className="text-2xl font-bold">
                {stats?.extensionStats?.length || 0}
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <Folder className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* 最近上传 */}
      <div className="bg-card border rounded-lg">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">最近上传</h2>
          <p className="text-sm text-muted-foreground mt-1">
            最近7天的上传趋势
          </p>
        </div>
        <div className="p-6">
          {stats?.dailyStats && stats.dailyStats.length > 0 ? (
            <div className="space-y-4">
              {stats.dailyStats.slice(0, 7).map((day) => (
                <div key={day.date} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{day.date}</p>
                    <p className="text-xs text-muted-foreground">
                      {day.count} 张图片 · {day.sizeFormatted}
                    </p>
                  </div>
                  <div className="w-24 bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${Math.min((day.count / 20) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              暂无上传记录
            </p>
          )}
        </div>
      </div>

      {/* 文件类型分布 */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-card border rounded-lg">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">文件类型分布</h2>
          </div>
          <div className="p-6">
            {stats?.extensionStats && stats.extensionStats.length > 0 ? (
              <div className="space-y-3">
                {stats.extensionStats.map((ext) => (
                  <div key={ext.extension} className="flex items-center justify-between">
                    <span className="text-sm font-medium">.{ext.extension}</span>
                    <span className="text-sm text-muted-foreground">
                      {ext.count} 个 · {ext.sizeFormatted}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                暂无数据
              </p>
            )}
          </div>
        </div>

        <div className="bg-card border rounded-lg">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">快速操作</h2>
          </div>
          <div className="p-6 space-y-3">
            <button className="w-full px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm font-medium transition-colors">
              上传新图片
            </button>
            <button className="w-full px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md text-sm font-medium transition-colors">
              创建文件夹
            </button>
            <button className="w-full px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md text-sm font-medium transition-colors">
              查看图库
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard