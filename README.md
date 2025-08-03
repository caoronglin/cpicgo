# R2 图床服务 - 完整文档

基于 Cloudflare Workers 和 R2 存储的现代化图床服务，提供高性能、低成本的图片托管解决方案。

## 🚀 项目介绍

R2 图床服务是一个开源的图片托管平台，利用 Cloudflare 的全球网络提供快速、可靠的图片存储和分发服务。支持多种图片格式，提供友好的 Web 界面和完整的 REST API。

### 核心优势
- **全球加速**：基于 Cloudflare 边缘网络，全球访问速度优异
- **成本低廉**：使用 Cloudflare R2 存储，成本比传统云存储低 90%+
- **无限扩展**：自动扩展，无需担心存储容量限制
- **安全可靠**：支持身份验证，防止未授权访问
- **响应式设计**：完美适配桌面端和移动端

## 📋 功能特性

### 图片管理
- ✅ 支持 JPG、PNG、GIF、WebP、SVG 等多种格式
- ✅ 拖拽上传和点击上传
- ✅ 实时上传进度显示
- ✅ 图片预览和全屏查看
- ✅ 一键复制图片链接（支持CDN和原始域名）
- ✅ 图片删除功能

### 用户界面
- ✅ 现代化的响应式设计
- ✅ 暗黑/明亮主题自动切换
- ✅ 图片网格布局和列表视图
- ✅ 实时统计信息展示
- ✅ 文件夹分类管理

### API 功能
- ✅ 完整的 RESTful API
- ✅ JWT 身份验证
- ✅ 分页查询支持
- ✅ 错误处理和状态码

## 🛠️ 技术架构

### 技术栈
- **运行时**：Cloudflare Workers
- **存储**：Cloudflare R2
- **前端**：原生 JavaScript + CSS Grid/Flexbox
- **认证**：JWT Token
- **部署**：Wrangler CLI

### 项目结构
```
r2-worker/
├── src/
│   ├── handlers/          # 请求处理模块
│   │   ├── main.js       # 主路由处理
│   │   ├── upload.js     # 图片上传处理
│   │   ├── image.js      # 图片管理API
│   │   ├── stats.js      # 统计信息API
│   │   └── folder.js     # 文件夹管理API
│   ├── static/           # 静态资源
│   │   ├── index.html    # 主页面
│   │   ├── styles.css    # 样式文件
│   │   └── js/           # 前端JavaScript
│   └── utils/            # 工具函数
│       ├── auth.js       # 认证工具
│       ├── cors.js       # CORS处理
│       └── file.js       # 文件处理工具
├── wrangler.jsonc        # Workers配置
└── package.json         # 项目配置
```

## 🔧 部署指南

### 环境要求
- Node.js >= 16
- npm 或 yarn
- Cloudflare 账户
- Wrangler CLI

### 1. 准备工作

#### 安装 Wrangler CLI
```bash
npm install -g wrangler
```

#### 登录 Cloudflare
```bash
wrangler login
```

### 2. 创建 R2 存储桶
```bash
# 创建 R2 存储桶（在Cloudflare控制台操作）
# 存储桶名称：image-host-bucket
```

### 3. 项目配置

#### 克隆项目
```bash
git clone <repository-url>
cd r2-worker
```

#### 安装依赖
```bash
npm install
```

#### 配置 wrangler.jsonc
```json
{
  "name": "r2-image-host",
  "main": "src/index.js",
  "compatibility_date": "2023-12-01",
  "r2_buckets": [
    {
      "binding": "image_host_bucket",
      "bucket_name": "image-host-bucket"
    }
  ],
  "vars": {
    "CUSTOM_DOMAIN": "your-domain.com",
    "CDN_DOMAIN": "cdn.your-domain.com",
    "CUSTOM_PATH": "uploads"
  }
}
```

### 4. 环境变量配置

#### 开发环境 (.dev.vars)
```
USERNAME=admin
PASSWORD=your-secure-password
```

#### 生产环境 (Wrangler Secrets)
```bash
wrangler secret put USERNAME
wrangler secret put PASSWORD
```

### 5. 部署

#### 开发部署
```bash
npm run dev
```

#### 生产部署
```bash
npm run deploy
```

## 📖 API 文档

### 认证
所有需要认证的接口都需要在请求头中包含：
```
Authorization: Bearer <your-jwt-token>
```

### 接口详情

#### 1. 用户认证

##### POST /api/auth
用户登录获取访问令牌

**请求格式：**
```json
{
  "username": "admin",
  "password": "password"
}
```

**响应格式：**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 2. 图片管理

##### GET /api/images
获取图片列表

**查询参数：**
- `page` (可选): 页码，默认1
- `limit` (可选): 每页数量，默认50
- `folder` (可选): 文件夹筛选

**响应格式：**
```json
{
  "images": [
    {
      "key": "uploads/image123.jpg",
      "name": "example.jpg",
      "url": "https://your-domain.com/uploads/image123.jpg",
      "cdnUrl": "https://cdn.your-domain.com/uploads/image123.jpg",
      "size": 102400,
      "uploaded": "2024-01-15T10:30:00Z",
      "folder": "uploads"
    }
  ],
  "total": 100,
  "page": 1,
  "pages": 2
}
```

##### POST /api/upload
上传图片

**请求格式：**
- Content-Type: multipart/form-data
- 文件字段: `file`

**响应格式：**
```json
{
  "key": "uploads/image123.jpg",
  "name": "example.jpg",
  "url": "https://your-domain.com/uploads/image123.jpg",
  "cdnUrl": "https://cdn.your-domain.com/uploads/image123.jpg",
  "size": 102400,
  "message": "Upload successful"
}
```

##### DELETE /api/images/{key}
删除指定图片

**响应格式：**
```json
{
  "message": "Image deleted successfully"
}
```

#### 3. 文件夹管理

##### GET /api/folders
获取文件夹列表

**响应格式：**
```json
{
  "folders": [
    {
      "name": "avatars",
      "count": 15,
      "size": 5242880
    },
    {
      "name": "screenshots",
      "count": 32,
      "size": 10485760
    }
  ]
}
```

#### 4. 统计信息

##### GET /api/stats
获取系统统计信息

**响应格式：**
```json
{
  "totalImages": 147,
  "totalSize": 52428800,
  "todayUploads": 5,
  "thisWeekUploads": 23,
  "thisMonthUploads": 89
}
```

## 🎨 使用指南

### Web 界面使用

#### 1. 首次访问
1. 打开部署的域名地址
2. 输入用户名和密码登录
3. 开始使用图床服务

#### 2. 上传图片
- **拖拽上传**：将图片拖拽到上传区域
- **点击上传**：点击上传区域选择图片
- **多文件上传**：支持同时选择多个文件

#### 3. 管理图片
- **预览图片**：点击图片缩略图打开预览
- **复制链接**：
  - 在图片卡片上点击"复制CDN"或"复制原始"
  - 在预览模态框中选择链接类型
- **删除图片**：点击删除按钮确认删除
- **查看统计**：页面顶部显示实时统计信息

#### 4. 文件夹管理
- 图片按上传日期自动组织到文件夹
- 支持按文件夹筛选查看图片

### API 使用示例

#### JavaScript 示例
```javascript
// 用户认证
const authResponse = await fetch('/api/auth', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'admin',
    password: 'password'
  })
});

const { token } = await authResponse.json();

// 上传图片
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const uploadResponse = await fetch('/api/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const result = await uploadResponse.json();
console.log('图片链接:', result.cdnUrl || result.url);
```

#### cURL 示例
```bash
# 获取认证令牌
curl -X POST https://your-domain.com/api/auth \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'

# 上传图片
curl -X POST https://your-domain.com/api/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/image.jpg"

# 获取图片列表
curl -X GET https://your-domain.com/api/images \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## ⚙️ 配置选项

### 环境变量详解

| 变量名 | 说明 | 示例 | 必需 |
|--------|------|------|------|
| `USERNAME` | 管理员用户名 | admin | ✅ |
| `PASSWORD` | 管理员密码 | secure123 | ✅ |
| `CUSTOM_DOMAIN` | 自定义域名 | img.example.com | ❌ |
| `CDN_DOMAIN` | CDN加速域名 | cdn.example.com | ❌ |
| `CUSTOM_PATH` | 存储路径前缀 | uploads/2024 | ❌ |

### CDN 配置
当配置了 `CDN_DOMAIN` 后：
- 上传接口会返回 `cdnUrl` 字段
- Web界面会显示"复制CDN"和"复制原始"两个选项
- 推荐使用 Cloudflare CDN 获得最佳性能

## 🔍 故障排除

### 常见问题

#### 1. 上传失败 401
**原因**：未认证或令牌过期
**解决**：重新登录获取新的访问令牌

#### 2. 图片不显示
**原因**：域名配置错误或CDN未生效
**解决**：检查 `CUSTOM_DOMAIN` 和 `CDN_DOMAIN` 配置

#### 3. 部署失败
**原因**：R2存储桶未创建或权限不足
**解决**：在Cloudflare控制台创建存储桶并绑定

### 调试模式
开发环境下可以开启调试日志：
```javascript
// 在浏览器控制台
localStorage.setItem('debug', 'true');
```

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发环境设置
```bash
git clone <repository-url>
cd r2-worker
npm install
npm run dev
```

### 提交规范
- 使用清晰的提交信息
- 添加适当的测试
- 更新相关文档

## 📞 联系方式

如有问题或建议，请通过以下方式联系：
- 提交 GitHub Issue
- 发送邮件到项目维护者

---

**项目地址**：https://github.com/your-username/r2-worker
**在线演示**：https://demo.r2-image-host.com
