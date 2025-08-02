# R2 Worker - 现代化Cloudflare R2图床服务

基于Cloudflare Workers和R2存储的现代化图床服务，提供完整的图片上传、管理和CDN分发功能。

## ✨ 特性

- 🚀 **现代化架构**：基于Cloudflare Workers的无服务器架构
- 🖼️ **图片管理**：支持多文件夹管理、批量操作
- 📊 **实时统计**：图片数量、存储用量、访问统计
- 🔐 **安全认证**：Bearer Token和Basic Auth双重认证
- 🎨 **响应式设计**：基于React + TypeScript的现代化前端
- ⚡ **高性能**：全球CDN分发，毫秒级响应
- 🛠️ **开发者友好**：完整API文档和开发工具链

## 🏗️ 技术栈

### 后端
- **Cloudflare Workers** - 无服务器运行时
- **Cloudflare R2** - 对象存储
- **JavaScript/ES6+** - 后端语言

### 前端
- **React 18** - UI框架
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式框架
- **Vite** - 构建工具
- **React Router** - 路由管理

## 🚀 快速开始

### 环境要求
- Node.js 18+
- Cloudflare账户
- R2存储桶

### 安装依赖

```bash
# 安装根目录依赖
npm install

# 安装客户端依赖
cd client && npm install
```

### 配置环境

1. 复制环境配置模板：
```bash
cp .env.example .env
```

2. 编辑`.env`文件，填入你的配置：
```bash
# Cloudflare配置
R2_BUCKET_NAME=your-bucket-name
R2_ACCOUNT_ID=your-account-id

# 认证配置
AUTH_USERNAME=admin
AUTH_PASSWORD=your-secure-password

# 客户端配置
VITE_API_BASE_URL=https://your-worker-domain.workers.dev

# 可选：自定义域名
CUSTOM_DOMAIN=https://your-custom-domain.com
CDN_DOMAIN=https://your-cdn-domain.com
```

### 开发运行

```bash
# 启动开发服务器（前端）
npm run dev:client

# 启动Worker开发服务器（后端）
npm run dev
```

### 构建部署

```bash
# 构建前端
npm run build:client

# 部署到Cloudflare
npm run deploy
```

## 📁 项目结构

```
r2-worker/
├── src/                    # 后端源代码
│   ├── handlers/          # 路由处理器
│   │   ├── image.js       # 图片管理
│   │   ├── folder.js      # 文件夹管理
│   │   ├── stats.js       # 统计信息
│   │   └── static.js      # 静态资源
│   ├── utils/             # 工具函数
│   │   ├── auth.js        # 认证工具
│   │   ├── cors.js        # CORS处理
│   │   └── file.js        # 文件工具
│   └── index.js           # 入口文件
├── client/                # 前端应用
│   ├── src/
│   │   ├── components/    # React组件
│   │   ├── contexts/      # React上下文
│   │   ├── pages/         # 页面组件
│   │   ├── lib/           # API客户端
│   │   └── index.css      # 全局样式
│   ├── package.json
│   └── vite.config.ts
├── wrangler.jsonc         # Cloudflare配置
├── tailwind.config.js     # Tailwind配置
└── package.json           # 项目配置
```

## 🔧 API文档

### 认证
所有API请求都需要包含认证头：
```
Authorization: Bearer your-api-token
```

### 端点

#### 图片管理
- `GET /api/images` - 获取图片列表
- `POST /api/images/upload` - 上传图片
- `DELETE /api/images/:key` - 删除图片
- `GET /api/images/:key` - 获取图片详情

#### 文件夹管理
- `GET /api/folders` - 获取文件夹列表
- `POST /api/folders` - 创建文件夹
- `DELETE /api/folders/:name` - 删除文件夹

#### 统计信息
- `GET /api/stats` - 获取统计信息
- `GET /api/stats/overview` - 总览统计
- `GET /api/stats/by-date` - 按日期统计
- `GET /api/stats/by-type` - 按类型统计

## 🎨 界面预览

### 仪表盘
- 实时统计卡片
- 上传趋势图表
- 文件类型分布

### 图库管理
- 网格/列表视图切换
- 文件夹管理
- 图片预览和删除
- 链接复制功能

### 设置页面
- API密钥管理
- 存储配置
- 账户设置
- 危险操作警告

## 🔐 安全配置

### 认证方式
1. **Bearer Token认证**：在请求头中添加`Authorization: Bearer <token>`
2. **Basic Auth认证**：使用用户名密码进行HTTP基本认证

### 环境变量
- 所有敏感配置都通过环境变量管理
- 支持开发、测试、生产多环境配置

## 🚀 部署指南

### Cloudflare部署

1. 安装Wrangler CLI：
```bash
npm install -g wrangler
```

2. 登录Cloudflare：
```bash
wrangler login
```

3. 配置R2存储桶：
```bash
wrangler r2 bucket create your-bucket-name
```

4. 配置Workers绑定：
在`wrangler.jsonc`中确保已配置R2绑定：
```json
{
  "r2_buckets": [
    {
      "binding": "R2_BUCKET",
      "bucket_name": "your-bucket-name"
    }
  ]
}
```

4. 部署应用：
```bash
npm run deploy
```

### 自定义域名
在`wrangler.jsonc`中配置自定义域名：
```json
{
  "vars": {
    "CUSTOM_DOMAIN": "https://your-domain.com"
  }
}
```

## 🧪 开发指南

### 代码规范
- 使用ESLint进行代码检查
- 使用Prettier进行代码格式化
- TypeScript严格模式

### 调试技巧
- 使用`wrangler dev`进行本地开发
- 查看Cloudflare Dashboard日志
- 使用console.log进行调试

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🤝 贡献指南

1. Fork本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

## 📞 支持

如有问题，请通过以下方式联系：
- GitHub Issues
- Email: your-email@example.com