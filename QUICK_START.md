# R2 图床服务 - 快速入门

## 🚀 5分钟快速部署

### 步骤1：准备工作
1. 注册 [Cloudflare](https://dash.cloudflare.com/sign-up) 账户
2. 安装 Node.js (>= 16)
3. 安装 Wrangler CLI:
   ```bash
   npm install -g wrangler
   ```

### 步骤2：创建R2存储桶
1. 登录 [Cloudflare控制台](https://dash.cloudflare.com)
2. 导航到 **R2** → **存储桶**
3. 点击 **创建存储桶**
4. 设置名称：`image-host-bucket`
5. 点击 **创建存储桶**

### 步骤3：一键部署
```bash
# 克隆项目
git clone https://github.com/your-username/r2-worker.git
cd r2-worker

# 安装依赖
npm install

# 登录Wrangler
wrangler login

# 配置环境变量
wrangler secret put USERNAME
echo "admin"  # 输入用户名

wrangler secret put PASSWORD
echo "your-secure-password"  # 输入密码

# 部署
npm run deploy
```

### 步骤4：配置域名（可选）
1. 在 Cloudflare Workers 控制台找到你的服务
2. 点击 **设置** → **触发器**
3. 添加自定义域名：`img.yourdomain.com`
4. 配置CDN域名（可选）：`cdn.yourdomain.com`

### 步骤5：开始使用
1. 打开部署的域名
2. 使用设置的用户名密码登录
3. 开始上传图片！

## 📱 立即使用

### Web界面
- **上传图片**：拖拽或点击上传区域
- **复制链接**：点击图片卡片上的复制按钮
- **管理图片**：预览、删除、查看统计

### 快速API调用
```bash
# 1. 获取认证令牌
TOKEN=$(curl -s -X POST https://img.yourdomain.com/api/auth \
  -H "Content-Type: application/json" \
  -d '{"username":"admin