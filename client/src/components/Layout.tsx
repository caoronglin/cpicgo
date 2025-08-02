import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  Image, 
  Settings, 
  Menu, 
  X, 
  Upload,
  FolderPlus,
  Sun,
  Moon
} from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import UploadModal from './UploadModal.tsx'
import CreateFolderModal from './CreateFolderModal.tsx'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false)
  const location = useLocation()
  const { theme, setTheme } = useTheme()
  const { isAuthenticated } = useAuth()

  const navigation = [
    { name: '仪表盘', href: '/', icon: Home },
    { name: '图库', href: '/gallery', icon: Image },
    { name: '设置', href: '/settings', icon: Settings },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Image className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">Cpicgo</span>
              </Link>
            </div>

            {/* 桌面端导航 */}
            <nav className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <item.icon className="w-4 h-4 inline-block mr-2" />
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* 右侧操作按钮 */}
            <div className="flex items-center space-x-4">
              {isAuthenticated && (
                <>
                  <button
                    onClick={() => setIsCreateFolderModalOpen(true)}
                    className="hidden sm:inline-flex items-center px-3 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md text-sm font-medium transition-colors"
                  >
                    <FolderPlus className="w-4 h-4 mr-2" />
                    新建文件夹
                  </button>
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="inline-flex items-center px-3 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm font-medium transition-colors"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    上传
                  </button>
                </>
              )}
              
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </button>

              {/* 移动端菜单按钮 */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 移动端菜单 */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <item.icon className="w-4 h-4 inline-block mr-2" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* 主内容区域 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* 模态框 */}
      <UploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
      />
      <CreateFolderModal 
        isOpen={isCreateFolderModalOpen} 
        onClose={() => setIsCreateFolderModalOpen(false)} 
      />
    </div>
  )
}

export default Layout