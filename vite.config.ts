import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// 该错误通常表示依赖未安装，建议在项目根目录下运行以下命令安装依赖：
// npm install @vitejs/plugin-react --save-dev 或 yarn add @vitejs/plugin-react --dev
import path from 'path'

export default defineConfig({
  plugins: [react()],
  root: 'client',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'client/index.html')
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@components': path.resolve(__dirname, './client/src/components'),
      '@utils': path.resolve(__dirname, './client/src/utils'),
      '@types': path.resolve(__dirname, './client/src/types'),
      '@hooks': path.resolve(__dirname, './client/src/hooks'),
      '@store': path.resolve(__dirname, './client/src/store')
    }
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
        secure: false
      }
    }
  }
})