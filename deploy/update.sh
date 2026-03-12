#!/bin/bash

# ============================================
# 梅花易数 - 更新部署脚本
# 使用方法: bash update.sh
# ============================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

APP_NAME="meihua-divination"
APP_DIR="/var/www/meihua-divination"

print_header() {
    echo -e "${BLUE}============================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}============================================${NC}"
}

print_success() {
    echo -e "${GREEN}[✓] $1${NC}"
}

print_error() {
    echo -e "${RED}[✗] $1${NC}"
}

print_info() {
    echo -e "${BLUE}[i] $1${NC}"
}

print_header "更新部署"

cd "$APP_DIR"

# 保存当前版本
CURRENT_COMMIT=$(git rev-parse HEAD)
print_info "当前版本: $CURRENT_COMMIT"

# 拉取最新代码
print_info "拉取最新代码..."
git fetch origin
git pull origin master

# 检查是否有更新
NEW_COMMIT=$(git rev-parse HEAD)
if [[ "$CURRENT_COMMIT" == "$NEW_COMMIT" ]]; then
    print_info "没有新的更新"
    exit 0
fi

print_info "新版本: $NEW_COMMIT"

# 安装依赖
print_info "安装依赖..."
npm install

# 生成 Prisma 客户端
print_info "生成 Prisma 客户端..."
npx prisma generate

# 运行数据库迁移
print_info "运行数据库迁移..."
npx prisma migrate deploy

# 构建应用
print_info "构建应用..."
npm run build

# 重启服务
print_info "重启服务..."
pm2 restart "$APP_NAME"

print_success "更新完成!"
pm2 status
