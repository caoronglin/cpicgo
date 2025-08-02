import React, { useEffect, useState } from 'react'
import { Image, Folder, Search, Grid, List } from 'lucide-react'
import { api } from '../lib/api'

interface ImageFile {
  key: string
  name: string
  url: string
  size: number
  sizeFormatted: string
  uploaded: string
}

interface FolderItem {
  name: string
  path: string
  fullPath: string
}

const Gallery: React.FC = () => {
  const [images, setImages] = useState<ImageFile[]>([])
  const [folders, setFolders] = useState<FolderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFolder, setSelectedFolder] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    fetchData()
  }, [selectedFolder])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      const [imagesResult, foldersResult] = await Promise.all([
        api.getImages(selectedFolder),
        api.getFolders()
      ])

      if (imagesResult.success) {
        setImages((imagesResult.data as any)?.images || [])
      }

      if (foldersResult.success) {
        setFolders((foldersResult.data as any)?.folders || [])
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredImages = images.filter(image =>
    image.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = async (key: string) => {
    if (confirm('确定要删除这张图片吗？')) {
      try {
        const result = await api.deleteImage(key)
        if (result.success) {
          setImages(images.filter(img => img.key !== key))
        }
      } catch (error) {
        console.error('Failed to delete image:', error)
      }
    }
  }

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    // 这里可以添加一个通知提示
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">图库</h1>
        <p className="text-muted-foreground mt-2">
          管理您的所有图片和文件夹
        </p>
      </div>

      {/* 搜索和过滤 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="搜索图片..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={selectedFolder}
            onChange={(e) => setSelectedFolder(e.target.value)}
            className="px-4 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">所有文件夹</option>
            {folders.map((folder) => (
              <option key={folder.path} value={folder.path}>
                {folder.name}
              </option>
            ))}
          </select>

          <div className="flex border rounded-md">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-background'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-background'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 文件夹列表 */}
      {folders.length > 0 && (
        <div className="bg-card border rounded-lg p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">文件夹</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {folders.map((folder) => (
              <button
                key={folder.path}
                onClick={() => setSelectedFolder(folder.path)}
                className={`p-3 border rounded-md text-center transition-colors ${
                  selectedFolder === folder.path
                    ? 'border-primary bg-primary/10'
                    : 'border hover:border-primary/50'
                }`}
              >
                <Folder className="w-8 h-8 mx-auto mb-1 text-muted-foreground" />
                <p className="text-sm truncate">{folder.name}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 图片网格 */}
      {filteredImages.length === 0 ? (
        <div className="text-center py-12">
          <Image className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">暂无图片</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {searchTerm ? '没有找到匹配的图片' : '开始上传您的第一张图片吧'}
          </p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'space-y-2'}>
          {filteredImages.map((image) => (
            <div
              key={image.key}
              className={`border rounded-lg overflow-hidden hover:shadow-lg transition-shadow ${
                viewMode === 'list' ? 'flex items-center p-4' : ''
              }`}
            >
              {viewMode === 'grid' ? (
                <>
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h4 className="font-medium text-sm truncate">{image.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {image.sizeFormatted}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => handleCopyUrl(image.url)}
                        className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded"
                      >
                        复制链接
                      </button>
                      <button
                        onClick={() => handleDelete(image.key)}
                        className="text-xs px-2 py-1 bg-destructive text-destructive-foreground rounded"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="ml-4 flex-1">
                    <h4 className="font-medium">{image.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {image.sizeFormatted} · {new Date(image.uploaded).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopyUrl(image.url)}
                      className="text-sm px-3 py-1 bg-primary text-primary-foreground rounded"
                    >
                      复制
                    </button>
                    <button
                      onClick={() => handleDelete(image.key)}
                      className="text-sm px-3 py-1 bg-destructive text-destructive-foreground rounded"
                    >
                      删除
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Gallery