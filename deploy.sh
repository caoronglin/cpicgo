#!/bin/bash

# 自动部署脚本 - Cloudflare Workers 图床
# 使用方法: ./deploy.sh [环境]

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 默认配置
ENVIRONMENT=${1:-production}
WORKER_NAME="Cpicgo"
BUCKET_NAME="cpicgo-bucket"

# 打印信息函数
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查依赖
print_info "检查依赖..."
if ! command -v wrangler &> /dev/null; then
    print_error "wrangler 未安装，请先安装: npm install -g wrangler"
    exit 1
fi

# 检查配置文件
print_info "检查配置文件..."
if [ ! -f "wrangler.jsonc" ]; then
    print_error "wrangler.jsonc 文件不存在"
    exit 1
fi

# 验证环境变量
print_info "验证环境变量..."
if [ -z "$API_TOKEN" ]; then
    print_warning "API_TOKEN 未设置，使用默认值"
    API_TOKEN="tk_7x8z9a2b3c4d5e6f"
fi

if [ -z "$USERNAME" ]; then
    print_warning "USERNAME 未设置，使用默认值"
    USERNAME="admin"
fi

if [ -z "$PASSWORD" ]; then
    print_warning "PASSWORD 未设置，使用默认值"
    PASSWORD="123456"
fi

# 部署前检查
print_info "运行部署前检查..."

# 检查文件完整性
FILES=("src/index.js" "wrangler.jsonc" "package.json")
for file in "${FILES[@]}"; do
    if [ ! -f "$file" ]; then
        print_error "缺少文件: $file"
        exit 1
    fi
done

# 安装依赖
print_info "安装依赖..."
npm install

# 构建项目（如果需要）
print_info "构建项目..."
# 移除Vite构建步骤，直接使用src/static目录

# 部署到 Cloudflare Workers
print_info "部署到 Cloudflare Workers..."
wrangler deploy --env $ENVIRONMENT

# 部署静态资源（如果有）
if [ -d "src/static" ]; then
    print_info "部署静态资源..."
    # 静态资源已通过wrangler.jsonc配置自动部署
fi

# 设置环境变量
print_info "设置环境变量..."
wrangler secret put API_TOKEN --env $ENVIRONMENT || echo "$API_TOKEN" | wrangler secret put API_TOKEN --env $ENVIRONMENT
wrangler secret put USERNAME --env $ENVIRONMENT || echo "$USERNAME" | wrangler secret put USERNAME --env $ENVIRONMENT
wrangler secret put PASSWORD --env $ENVIRONMENT || echo "$PASSWORD" | wrangler secret put PASSWORD --env $ENVIRONMENT

# 获取部署后的URL
print_info "获取部署信息..."
DEPLOYMENT_URL=$(wrangler tail --format pretty | grep -o 'https://[^[:space:]]*' | head -1)

# 测试部署
print_info "测试部署..."
if command -v curl &> /dev/null; then
    curl -f -H "Authorization: Bearer $API_TOKEN" "$DEPLOYMENT_URL/list" > /dev/null 2>&1 && \
        print_success "部署测试成功" || \
        print_warning "部署测试失败，请手动验证"
fi

# 输出结果
print_success "部署完成！"
echo ""
echo "部署信息:"
echo "环境: $ENVIRONMENT"
echo "Worker名称: $WORKER_NAME"
echo "API Token: $API_TOKEN"
echo "用户名: $USERNAME"
echo "密码: $PASSWORD"
echo ""
echo "访问地址:"
echo "- 前端界面: $DEPLOYMENT_URL/new"
echo "- API文档: $DEPLOYMENT_URL/API.md"
echo ""
echo "使用说明:"
echo "1. 访问前端界面上传图片"
echo "2. 使用API Token: $API_TOKEN"
echo "3. 或使用用户名密码: $USERNAME / $PASSWORD"
echo ""

# 保存部署信息
cat > deployment-info.txt << EOF
部署时间: $(date)
环境: $ENVIRONMENT
Worker名称: $WORKER_NAME
API Token: $API_TOKEN
用户名: $USERNAME
部署URL: $DEPLOYMENT_URL
EOF

print_success "部署信息已保存到 deployment-info.txt"