# 🚀 自动部署到Cloudflare Workers

本指南将帮助您将图床服务自动部署到Cloudflare Workers，支持多种部署方式。

## 📋 准备工作

### 1. 安装必要工具
```bash
# 全局安装wrangler
npm install -g wrangler

# 登录Cloudflare
wrangler login
```

### 2. 创建R2存储桶
```bash
# 创建存储桶
wrangler r2 bucket create image-host-bucket
```

### 3. 设置环境变量
```bash
# 设置认证信息
wrangler secret put API_TOKEN
# 输入: tk_7x8z9a2b3c4d5e6f

wrangler secret put USERNAME
# 输入: admin

wrangler secret put PASSWORD
# 输入: 123456
```

## 🎯 部署方式

### 方式1: 一键脚本部署

#### Windows用户
```batch
# 运行Windows批处理脚本
deploy.bat
```

#### Linux/Mac用户
```bash
# 运行Shell脚本
chmod +x deploy.sh
./deploy.sh
```

### 方式2: NPM脚本部署
```bash
# 快速部署
npm run deploy

# 开发环境部署
npm run deploy:dev

# 生产环境部署
npm run deploy:prod
```

### 方式3: GitHub Actions自动部署

#### 1. 配置GitHub Secrets
在GitHub仓库设置中添加以下Secrets：
- `CLOUDFLARE_API_TOKEN`: 您的Cloudflare API Token
- `CLOUDFLARE_ACCOUNT_ID`: 您的Cloudflare账户ID
- `API_TOKEN`: 图床API Token (如: tk_7x8z9a2b3c4d5e6f)
- `USERNAME`: 用户名 (如: admin)
- `PASSWORD`: 密码 (如: 123456)

#### 2. 获取Cloudflare API Token
1. 访问 https://dash.cloudflare.com/profile/api-tokens
2. 创建API Token，使用"Edit Cloudflare Workers"模板
3. 复制Token到GitHub Secrets

#### 3. 获取账户ID
在Cloudflare Dashboard的右侧边栏可以找到您的账户ID。

#### 4. 推送代码自动部署
每次推送到main/master分支都会自动触发部署。

## 🔧 配置文件说明

### wrangler.jsonc
```json
{
  "name": "image-host",           // Worker名称
  "main": "src/index.js",        // 入口文件
  "assets": {
    "directory": "./src/static",  // 静态资源目录
    "binding": "ASSETS"
  },
  "vars": {
    "CUSTOM_DOMAIN": "img.837838.xyz",
    "CDN_DOMAIN": "img.cnortles.top",
    "CUSTOM_PATH": "uploads"
  },
  "r2_buckets": [
    {
      "bucket_name": "image-host-bucket",
      "binding": "image_host_bucket"
    }
  ]
}
```

### package.json脚本
```json
{
  "scripts": {
    "deploy": "wrangler deploy",
    "deploy:prod": "wrangler deploy",
    "deploy:dev": "wrangler deploy --env development",
    "setup": "npm run setup:secrets && npm run setup:bucket",
    "auto-deploy": "npm run build && npm run deploy"
  }
}
```

## 🌐 部署后访问

部署成功后，您可以通过以下地址访问：

- **前端界面**: `https://[worker-name].[subdomain].workers.dev/new`
- **API文档**: `https://[worker-name].[subdomain].workers.dev/API.md`
- **API测试**: `https://[worker-name].[subdomain].workers.dev/list`

## 📊 验证部署

### 1. 测试API
```bash
# 测试获取图片列表
curl -H "Authorization: Bearer tk_7x8z9a2b3c4d5e6f" \
  https://[worker-name].[subdomain].workers.dev/list

# 测试上传图片
curl -X PUT -H "Authorization: Bearer tk_7x8z9a2b3c4d5e6f" \
  --data-binary @test.jpg \
  https://[worker-name].[subdomain].workers.dev/test.jpg
```

### 2. 测试前端
访问 `https://[worker-name].[subdomain].workers.dev/new` 查看优化后的前端界面。

## 🛠️ 故障排除

### 常见问题

1. **部署失败**
   ```bash
   # 检查wrangler配置
   wrangler config list
   
   # 重新登录
   wrangler login
   ```

2. **认证失败**
   ```bash
   # 检查环境变量
   wrangler secret list
   
   # 重新设置
   wrangler secret put API_TOKEN
   ```

3. **存储桶访问问题**
   ```bash
   # 检查存储桶权限
   wrangler r2 bucket list
   
   # 重新绑定存储桶
   wrangler r2 bucket bind image-host-bucket --binding image_host_bucket
   ```

## 🚀 高级配置

### 自定义域名
1. 在Cloudflare Dashboard添加自定义域名
2. 更新wrangler.jsonc中的CUSTOM_DOMAIN
3. 重新部署

### 多环境部署
```bash
# 开发环境
npm run deploy:dev

# 预发布环境
npm run deploy:staging

# 生产环境
npm run deploy:prod
```

## 📞 支持

如遇到问题，请检查：
1. Cloudflare账户权限
2. R2存储桶配置
3. 环境变量设置
4. 网络连接状态

部署完成后，您将拥有一个功能完整的图床服务！