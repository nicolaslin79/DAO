#!/bin/bash

# ============================================
# 梅花易数 - 一键部署脚本
# 使用方法: sudo bash setup.sh
# ============================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量（请修改这些值）
APP_NAME="meihua-divination"
APP_DIR="/var/www/meihua-divination"
GITHUB_REPO="https://github.com/nicolaslin79/DAO.git"
DOMAIN=""  # 留空则不配置 Nginx
DB_NAME="meihua_divination"
DB_USER="meihua"
DB_PASSWORD=""  # 留空则自动生成

# 环境变量（请填写）
DEEPSEEK_API_KEY=""
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""

# ============================================
# 辅助函数
# ============================================

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

print_warning() {
    echo -e "${YELLOW}[!] $1${NC}"
}

print_info() {
    echo -e "${BLUE}[i] $1${NC}"
}

check_root() {
    if [[ $EUID -ne 0 ]]; then
        print_error "此脚本需要 root 权限运行"
        echo "请使用: sudo bash setup.sh"
        exit 1
    fi
}

# ============================================
# 步骤 1: 环境检查
# ============================================

check_environment() {
    print_header "步骤 1: 环境检查"

    # 检查操作系统
    if [[ -f /etc/os-release ]]; then
        . /etc/os-release
        print_info "操作系统: $NAME $VERSION"
    fi

    # 检查是否为 Ubuntu/Debian
    if ! command -v apt &> /dev/null; then
        print_error "此脚本仅支持 Ubuntu/Debian 系统"
        exit 1
    fi

    print_success "环境检查通过"
}

# ============================================
# 步骤 2: 安装系统依赖
# ============================================

install_system_deps() {
    print_header "步骤 2: 安装系统依赖"

    print_info "更新软件包列表..."
    apt update

    print_info "安装基础工具..."
    apt install -y curl wget git build-essential

    print_success "系统依赖安装完成"
}

# ============================================
# 步骤 3: 安装 Node.js
# ============================================

install_nodejs() {
    print_header "步骤 3: 安装 Node.js"

    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v)
        print_info "Node.js 已安装: $NODE_VERSION"

        # 检查版本是否 >= 18
        MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'v' -f2 | cut -d'.' -f1)
        if [[ $MAJOR_VERSION -lt 18 ]]; then
            print_warning "Node.js 版本过低，正在升级..."
        else
            print_success "Node.js 版本符合要求"
            return 0
        fi
    fi

    print_info "安装 Node.js 20.x..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs

    NODE_VERSION=$(node -v)
    NPM_VERSION=$(npm -v)
    print_success "Node.js 安装完成: $NODE_VERSION"
    print_success "NPM 安装完成: $NPM_VERSION"
}

# ============================================
# 步骤 4: 安装 PostgreSQL
# ============================================

install_postgresql() {
    print_header "步骤 4: 安装 PostgreSQL"

    if command -v psql &> /dev/null; then
        print_success "PostgreSQL 已安装"
        return 0
    fi

    print_info "安装 PostgreSQL..."
    apt install -y postgresql postgresql-contrib

    # 启动服务
    systemctl start postgresql
    systemctl enable postgresql

    print_success "PostgreSQL 安装完成"
}

# ============================================
# 步骤 5: 配置数据库
# ============================================

setup_database() {
    print_header "步骤 5: 配置数据库"

    # 生成随机密码（如果未设置）
    if [[ -z "$DB_PASSWORD" ]]; then
        DB_PASSWORD=$(openssl rand -base64 16 | tr -d '/+=' | head -c 20)
        print_info "已生成数据库密码: $DB_PASSWORD"
    fi

    # 检查数据库是否已存在
    DB_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'")

    if [[ "$DB_EXISTS" == "1" ]]; then
        print_warning "数据库 $DB_NAME 已存在"
    else
        print_info "创建数据库用户和数据库..."
        sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
        sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
        sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
        print_success "数据库创建完成"
    fi

    # 保存数据库连接字符串
    DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME"
}

# ============================================
# 步骤 6: 安装 PM2
# ============================================

install_pm2() {
    print_header "步骤 6: 安装 PM2"

    if command -v pm2 &> /dev/null; then
        print_success "PM2 已安装"
        return 0
    fi

    print_info "安装 PM2..."
    npm install -g pm2

    print_success "PM2 安装完成"
}

# ============================================
# 步骤 7: 安装 Nginx
# ============================================

install_nginx() {
    print_header "步骤 7: 安装 Nginx"

    if command -v nginx &> /dev/null; then
        print_success "Nginx 已安装"
        return 0
    fi

    print_info "安装 Nginx..."
    apt install -y nginx

    systemctl start nginx
    systemctl enable nginx

    print_success "Nginx 安装完成"
}

# ============================================
# 步骤 8: 拉取代码
# ============================================

clone_repository() {
    print_header "步骤 8: 拉取代码"

    # 创建目录
    mkdir -p /var/www

    if [[ -d "$APP_DIR" ]]; then
        print_warning "目录 $APP_DIR 已存在"
        read -p "是否删除并重新克隆? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            rm -rf "$APP_DIR"
        else
            print_info "跳过克隆，使用现有目录"
            cd "$APP_DIR"
            return 0
        fi
    fi

    print_info "从 GitHub 克隆代码..."
    git clone "$GITHUB_REPO" "$APP_DIR"
    cd "$APP_DIR"

    print_success "代码克隆完成"
}

# ============================================
# 步骤 9: 配置环境变量
# ============================================

setup_env() {
    print_header "步骤 9: 配置环境变量"

    cd "$APP_DIR"

    # 生成 NEXTAUTH_SECRET
    NEXTAUTH_SECRET=$(openssl rand -base64 32)

    # 设置 NEXTAUTH_URL
    if [[ -n "$DOMAIN" ]]; then
        NEXTAUTH_URL="https://$DOMAIN"
    else
        NEXTAUTH_URL="http://localhost:3000"
    fi

    # 检查 .env 是否存在
    if [[ -f ".env" ]]; then
        print_warning ".env 文件已存在"
        read -p "是否覆盖? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "保留现有 .env 文件"
            return 0
        fi
    fi

    # 创建 .env 文件
    print_info "创建 .env 文件..."
    cat > .env << EOF
# 数据库配置
DATABASE_URL="$DATABASE_URL"

# NextAuth 配置
NEXTAUTH_SECRET="$NEXTAUTH_SECRET"
NEXTAUTH_URL="$NEXTAUTH_URL"

# DeepSeek API
DEEPSEEK_API_KEY="$DEEPSEEK_API_KEY"

# Stripe 配置
STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY"
STRIPE_WEBHOOK_SECRET="$STRIPE_WEBHOOK_SECRET"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
EOF

    chmod 600 .env
    print_success ".env 文件创建完成"

    # 显示配置信息
    echo ""
    print_info "====== 数据库配置信息 ======"
    echo "数据库: $DB_NAME"
    echo "用户: $DB_USER"
    echo "密码: $DB_PASSWORD"
    echo "连接串: $DATABASE_URL"
    echo ""
    print_warning "请保存以上信息！"
    echo ""
}

# ============================================
# 步骤 10: 安装依赖 & 构建
# ============================================

build_app() {
    print_header "步骤 10: 安装依赖 & 构建"

    cd "$APP_DIR"

    print_info "安装 npm 依赖..."
    npm install

    print_info "生成 Prisma 客户端..."
    npx prisma generate

    print_info "运行数据库迁移..."
    npx prisma migrate deploy

    print_info "构建应用..."
    npm run build

    print_success "构建完成"
}

# ============================================
# 步骤 11: 配置 PM2
# ============================================

setup_pm2() {
    print_header "步骤 11: 配置 PM2"

    cd "$APP_DIR"

    # 创建 PM2 配置文件
    cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '$APP_NAME',
    script: 'npm',
    args: 'start',
    cwd: '$APP_DIR',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: '$APP_DIR/logs/error.log',
    out_file: '$APP_DIR/logs/out.log',
    log_file: '$APP_DIR/logs/combined.log',
    time: true
  }]
}
EOF

    # 创建日志目录
    mkdir -p logs

    # 停止旧进程（如果存在）
    pm2 delete $APP_NAME 2>/dev/null || true

    # 启动应用
    print_info "启动应用..."
    pm2 start ecosystem.config.js

    # 保存 PM2 配置
    pm2 save

    # 设置开机自启
    pm2 startup | tail -n 1 | bash || true

    print_success "PM2 配置完成"
}

# ============================================
# 步骤 12: 配置 Nginx
# ============================================

setup_nginx() {
    print_header "步骤 12: 配置 Nginx"

    if [[ -z "$DOMAIN" ]]; then
        print_warning "未配置域名，跳过 Nginx 配置"
        print_info "应用运行在 http://localhost:3000"
        return 0
    fi

    # 创建 Nginx 配置
    cat > /etc/nginx/sites-available/$APP_NAME << EOF
server {
    listen 80;
    server_name $DOMAIN;

    # 日志
    access_log /var/log/nginx/$APP_NAME.access.log;
    error_log /var/log/nginx/$APP_NAME.error.log;

    # 客户端请求限制
    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;

        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Stripe webhook 需要
    location /api/payment/webhook {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

    # 启用配置
    ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/

    # 删除默认配置
    rm -f /etc/nginx/sites-enabled/default

    # 测试配置
    nginx -t

    # 重载 Nginx
    systemctl reload nginx

    print_success "Nginx 配置完成"
    print_info "网站可通过 http://$DOMAIN 访问"
}

# ============================================
# 步骤 13: 配置 SSL
# ============================================

setup_ssl() {
    print_header "步骤 13: 配置 SSL 证书"

    if [[ -z "$DOMAIN" ]]; then
        print_warning "未配置域名，跳过 SSL 配置"
        return 0
    fi

    # 检查是否安装 certbot
    if ! command -v certbot &> /dev/null; then
        print_info "安装 Certbot..."
        apt install -y certbot python3-certbot-nginx
    fi

    print_info "申请 SSL 证书..."
    print_warning "请确保域名已正确解析到本服务器"

    read -p "是否继续申请 SSL 证书? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        certbot --nginx -d $DOMAIN --non-interactive --agree-tos --register-unsafely-without-email || {
            print_warning "SSL 证书申请失败，请手动配置"
            print_info "手动命令: certbot --nginx -d $DOMAIN"
        }
    fi
}

# ============================================
# 步骤 14: 配置防火墙
# ============================================

setup_firewall() {
    print_header "步骤 14: 配置防火墙"

    if ! command -v ufw &> /dev/null; then
        print_info "安装 UFW..."
        apt install -y ufw
    fi

    # 配置规则
    ufw --force reset
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow 22/tcp    # SSH
    ufw allow 80/tcp    # HTTP
    ufw allow 443/tcp   # HTTPS

    # 启用防火墙
    ufw --force enable

    print_success "防火墙配置完成"
    ufw status
}

# ============================================
# 步骤 15: 显示完成信息
# ============================================

show_completion() {
    print_header "部署完成!"

    echo ""
    echo -e "${GREEN}============================================${NC}"
    echo -e "${GREEN}           梅花易数部署成功！              ${NC}"
    echo -e "${GREEN}============================================${NC}"
    echo ""

    if [[ -n "$DOMAIN" ]]; then
        echo -e "访问地址: ${BLUE}https://$DOMAIN${NC}"
    else
        echo -e "访问地址: ${BLUE}http://localhost:3000${NC}"
    fi

    echo ""
    echo "常用命令:"
    echo "  查看状态:   pm2 status"
    echo "  查看日志:   pm2 logs $APP_NAME"
    echo "  重启服务:   pm2 restart $APP_NAME"
    echo "  停止服务:   pm2 stop $APP_NAME"
    echo "  更新部署:   cd $APP_DIR && git pull && npm run build && pm2 restart $APP_NAME"
    echo ""
    echo "数据库信息:"
    echo "  数据库: $DB_NAME"
    echo "  用户:   $DB_USER"
    echo "  密码:   $DB_PASSWORD"
    echo ""
    echo "配置文件位置:"
    echo "  应用目录: $APP_DIR"
    echo "  环境变量: $APP_DIR/.env"
    echo "  Nginx:   /etc/nginx/sites-available/$APP_NAME"
    echo ""
    print_warning "请妥善保存以上信息！"
}

# ============================================
# 主程序
# ============================================

main() {
    clear
    print_header "梅花易数 - 一键部署脚本"
    echo ""

    # 检查配置
    if [[ -z "$DEEPSEEK_API_KEY" ]]; then
        print_warning "DEEPSEEK_API_KEY 未配置"
    fi
    if [[ -z "$STRIPE_SECRET_KEY" ]]; then
        print_warning "STRIPE_SECRET_KEY 未配置 (支付功能将不可用)"
    fi

    echo ""
    read -p "按 Enter 键开始部署..."
    echo ""

    # 执行部署步骤
    check_root
    check_environment
    install_system_deps
    install_nodejs
    install_postgresql
    setup_database
    install_pm2
    install_nginx
    clone_repository
    setup_env
    build_app
    setup_pm2
    setup_nginx
    setup_ssl
    setup_firewall
    show_completion
}

# 运行主程序
main
