# Cpicgo - 现代化图床服务

基于Cloudflare Workers和R2存储构建的高性能图片托管服务，采用Vue 3 + Tailwind CSS打造的现代化Web界面。

## ✨ 特性

- **现代化界面**：Vue 3 + Tailwind CSS响应式设计
- **高性能**：基于Cloudflare Workers全球边缘网络
- **无限存储**：集成Cloudflare R2对象存储
- **多种认证**：支持Basic认证和Bearer Token
- **文件夹管理**：支持图片分类整理
- **拖拽上传**：支持批量图片拖拽上传
- **深色模式**：自动/手动主题切换
- **移动友好**：完美适配手机和平板

## 🚀 快速开始

### 1. 准备工作

- [Cloudflare账户](https://dash.cloudflare.com/sign-up)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)
- Node.js 16+ 环境

### 2. 克隆项目

```bash
git clone <repository-url>
cd picgo/r2-worker
```

### 3. 配置环境

编辑 `wrangler.jsonc` 文件：

```json
{
  "name": "your-worker-name",
  "r2_buckets": [
    {
      "binding": "image_host_bucket",
      "bucket_name": "your-r2-bucket-name"
    }
  ],
  "vars": {
    "CUSTOM_DOMAIN": "your-domain.com",
    "USERNAME": "your-username",
    "PASSWORD": "your-password",
    "API_TOKEN": "your-api-token"
  }
}
```

### 4. 部署到Cloudflare

```bash
# 登录Cloudflare
npx wrangler login

# 部署
npx wrangler deploy
```

## 📖 使用指南

### Web界面使用

1. **访问地址**：部署后访问 `https://your-worker.your-subdomain.workers.dev`
2. **认证配置**：点击右上角"认证"按钮配置访问权限
3. **上传图片**：
   - 拖拽图片到上传区域
   - 或点击"选择图片文件"按钮
   - 支持多文件批量上传
4. **文件夹管理**：
   - 点击"新建文件夹"创建分类
   - 上传时选择目标文件夹
5. **图片操作**：
   - 点击图片预览大图
   - 点击删除按钮移除图片
   - 复制图片链接分享

### API使用

#### 上传图片

```bash
curl -X PUT \
  -H "Authorization: Bearer your-token" \
  --data-binary @image.jpg \
  https://your-domain.com/path/image.jpg
```

#### 获取图片列表

```bash
curl -H "Authorization: Bearer your-token" \
  https://your-domain.com/list
```

#### 删除图片

```bash
curl -X DELETE \
  -H "Authorization: Bearer your-token" \
  https://your-domain.com/image-id
```

## 🛠️ 开发指南

### 本地开发

```bash
# 安装依赖
npm install

# 本地预览
npx wrangler dev

# 本地访问 http://localhost:8787
```

### 项目结构

```
r2-worker/
├── src/
│   ├── index.js          # Worker主逻辑
│   └── static/           # Web界面文件
│       ├── index.html    # 主页面
│       ├── main.js       # Vue应用入口
│       ├── styles.css    # 样式文件
│       ├── components/   # Vue组件
│       └── services/     # 工具服务
├── wrangler.jsonc        # Worker配置
└── README.md            # 本文档
```

## 🔧 配置说明

### wrangler.jsonc 配置项

| 配置项 | 说明 | 示例 |
|--------|------|------|
| `name` | Worker名称 | `my-image-host` |
| `r2_buckets.bucket_name` | R2存储桶名称 | `my-images` |
| `vars.CUSTOM_DOMAIN` | 自定义域名 | `img.example.com` |
| `vars.USERNAME` | Basic认证用户名 | `admin` |
| `vars.PASSWORD` | Basic认证密码 | `secure123` |
| `vars.API_TOKEN` | Bearer认证令牌 | `tk_xxx...` |

### 环境变量

- `CUSTOM_DOMAIN`: 自定义域名（可选）
- `USERNAME`: Basic认证用户名
- `PASSWORD`: Basic认证密码
- `API_TOKEN`: Bearer认证令牌

## 📱 移动端支持

- 响应式设计，完美适配各种屏幕尺寸
- 支持触摸手势操作
- 优化的移动端上传体验
- 支持iOS/Android原生分享

## 🤝 贡献指南

1. Fork本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建Pull Request

## 📝 更新日志

### v2.0.0 (2024)
- ✨ 重构为Vue 3 + Tailwind CSS架构
- 🎨 全新现代化界面设计
- 📱 增强移动端体验
- 🌙 添加深色模式支持
- 🔧 优化组件化架构

### v1.0.0 (2024)
- 🎉 初始版本发布
- 🚀 Cloudflare Workers集成
- 📦 R2存储支持
- 🔐 多种认证方式

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🔗 相关链接

- [Cloudflare Workers文档](https://developers.cloudflare.com/workers/)
- [Cloudflare R2文档](https://developers.cloudflare.com/r2/)
- [Vue 3文档](https://vuejs.org/)
- [Tailwind CSS文档](https://tailwindcss.com/)