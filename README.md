# R2 图床服务

基于Cloudflare Workers和R2存储的现代化图床服务，提供图片上传、查看和CDN分发功能。

## 功能特性

- 基于 Cloudflare Workers 和 R2 存储构建
- 支持图片上传和管理
- 支持图片CDN加速访问
- 响应式设计，支持桌面端和移动端访问
- 暗黑/明亮主题切换
- 文件夹分类管理
- 图片预览

## API 接口

### 图片相关

- `GET /api/images` - 获取图片列表
- `POST /api/upload` - 上传图片

### 文件夹相关

- `GET /api/folders` - 获取文件夹列表

### 统计相关

- `GET /api/stats` - 获取统计信息

## 部署

### 环境要求

- Cloudflare 账户
- Wrangler CLI
- Node.js >= 16

### 部署步骤

1. 克隆项目代码
2. 安装依赖: `npm install`
3. 配置环境变量
4. 部署: `npm run deploy`

## 环境变量

- `CUSTOM_DOMAIN` - 自定义域名
- `CDN_DOMAIN` - CDN域名（配置后上传图片将返回CDN域名的URL）
- `CUSTOM_PATH` - 自定义存储路径前缀

## CDN配置说明

当配置了`CDN_DOMAIN`环境变量后，上传图片接口将返回CDN域名的URL，以提供更快的访问速度。

## 许可证

MIT
