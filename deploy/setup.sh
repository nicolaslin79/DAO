#!/bin/bash

# ============================================
# 梅花易数 - 一键部署脚本
# 域名: dao.lets.ren
# ============================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ====== 配置变量 ======
DOMAIN="dao.lets.ren"
APP_NAME="meihua-divination"
APP_DIR="/var/www/meihua-divination"
DB_NAME="meihua_divination"
DB_USER="meihua"
DB_PASSWORD=""  # 留空则自动生成

# API 密钥（请填写）
DEEPSEEK_API_KEY=""
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""
# ======================

print_header() {
    echo -e "${BLUE}============================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}============================================${NC}"
}

print_success() { echo -e "${GREEN}[✓] $1${NC}"; }
print_error() { echo -e "${RED}[✗] $1${NC}"; }
print_warning() { echo -e "${YELLOW}[!] $1${NC}"; }
print_info() { echo -e "${BLUE}[i] $1${NC}"; }

# 检查 root
if [[ $EUID -ne 0 ]]; then
    print_error "请使用 sudo 运行此脚本"
    exit 1
fi

print_header "梅花易数 - 一键部署"
echo -e "域名: ${GREEN}$DOMAIN${NC}"
echo ""

# 1. 更新系统
print_info "更新系统..."
apt update && apt upgrade -y
apt install -y curl wget git build-essential

# 2. 安装 Node.js 20
print_info "安装 Node.js 20..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
fi
print_success "Node.js: $(node -v)"

# 3. 安装 PostgreSQL
print_info "安装 PostgreSQL..."
if ! command -v psql &> /dev/null; then
    apt install -y postgresql postgresql-contrib
fi
systemctl start postgresql
systemctl enable postgresql

# 4. 生成数据库密码
if [[ -z "$DB_PASSWORD" ]]; then
    DB_PASSWORD=$(openssl rand -base64 16 | tr -d '/+=' | head -c 20)
    print_info "生成数据库密码: $DB_PASSWORD"
fi

# 5. 创建数据库
print_info "配置数据库..."
sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" 2>/dev/null || true
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;" 2>/dev/null || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" 2>/dev/null || true
print_success "数据库配置完成"

# 6. 安装 PM2 和 Nginx
print_info "安装 PM2 和 Nginx..."
npm install -g pm2
apt install -y nginx

# 7. 撤销旧 SSL 证书（如果存在）
print_info "检查并清理旧 SSL 证书..."
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    print_warning "发现旧证书，正在撤销..."
    certbot revoke --cert-path /etc/letsencrypt/live/$DOMAIN/cert.pem --non-interactive 2>/dev/null || true
    rm -rf /etc/letsencrypt/live/$DOMAIN
    rm -rf /etc/letsencrypt/renewal/$DOMAIN.conf
    rm -rf /etc/letsencrypt/archive/$DOMAIN
    print_success "旧证书已清理"
fi

# 8. 克隆代码
print_info "克隆代码..."
mkdir -p /var/www
if [[ -d "$APP_DIR" ]]; then
    print_warning "删除旧目录..."
    rm -rf "$APP_DIR"
fi
git clone https://github.com/nicolaslin79/DAO.git "$APP_DIR"
cd "$APP_DIR"
print_success "代码克隆完成"

# 9. 创建环境变量
print_info "配置环境变量..."
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL="https://$DOMAIN"

cat > .env << ENVEOF
DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME"
NEXTAUTH_SECRET="$NEXTAUTH_SECRET"
NEXTAUTH_URL="$NEXTAUTH_URL"
DEEPSEEK_API_KEY="$DEEPSEEK_API_KEY"
STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY"
STRIPE_WEBHOOK_SECRET="$STRIPE_WEBHOOK_SECRET"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
ENVEOF
chmod 600 .env
print_success "环境变量配置完成"

# 10. 安装依赖
print_info "安装依赖..."
npm install
print_success "依赖安装完成"

# 11. 运行数据库迁移
print_info "运行数据库迁移..."
export DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME"
npx prisma generate
npx prisma migrate deploy
print_success "数据库迁移完成"

# 12. 构建应用
print_info "构建应用..."
npm run build
print_success "构建完成"

# 13. 创建测试用户
print_info "创建测试用户..."
# bcrypt hash for password 'test'
PASSWORD_HASH='$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'

sudo -u postgres psql -d $DB_NAME << SQLEOF
-- 删除旧的测试用户（如果存在）
DELETE FROM subscriptions WHERE "userId" IN (SELECT id FROM users WHERE email = 'test');
DELETE FROM users WHERE email = 'test';

-- 创建测试用户
INSERT INTO users (id, email, name, password, role, locale, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'test',
  'Test User',
  '$PASSWORD_HASH',
  'USER',
  'zh',
  NOW(),
  NOW()
);

-- 创建年度会员订阅
INSERT INTO subscriptions (id, "userId", plan, status, "startDate", "endDate", "readingsLeft", "createdAt", "updatedAt")
SELECT
  gen_random_uuid(),
  id,
  'YEARLY',
  'ACTIVE',
  NOW(),
  NOW() + INTERVAL '1 year',
  100,
  NOW(),
  NOW()
FROM users WHERE email = 'test';
SQLEOF
print_success "测试用户创建完成"

# 14. 配置 PM2
print_info "配置 PM2..."
pm2 delete $APP_NAME 2>/dev/null || true
pm2 start npm --name "$APP_NAME" -- start
pm2 save
pm2 startup | tail -n 1 | bash || true
print_success "PM2 配置完成"

# 15. 配置 Nginx
print_info "配置 Nginx..."
cat > /etc/nginx/sites-available/$APP_NAME << NGINXEOF
server {
    listen 80;
    server_name $DOMAIN;
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
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
NGINXEOF

ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
print_success "Nginx 配置完成"

# 16. 配置防火墙
print_info "配置防火墙..."
apt install -y ufw
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
print_success "防火墙配置完成"

# 17. 申请 SSL 证书
print_info "申请 SSL 证书..."
if ! command -v certbot &> /dev/null; then
    apt install -y certbot python3-certbot-nginx
fi
certbot --nginx -d $DOMAIN --non-interactive --agree-tos --register-unsafely-without-email
print_success "SSL 证书配置完成"

# 完成
echo ""
print_header "部署完成!"
echo ""
echo -e "访问地址: ${GREEN}https://$DOMAIN${NC}"
echo ""
echo -e "${YELLOW}测试账号:${NC}"
echo -e "  邮箱: test"
echo -e "  密码: test"
echo -e "  会员: 年度会员 (100次/天)"
echo ""
echo -e "${YELLOW}数据库信息:${NC}"
echo -e "  数据库: $DB_NAME"
echo -e "  用户: $DB_USER"
echo -e "  密码: $DB_PASSWORD"
echo ""
echo -e "${YELLOW}常用命令:${NC}"
echo "  pm2 status              # 查看状态"
echo "  pm2 logs $APP_NAME      # 查看日志"
echo "  pm2 restart $APP_NAME   # 重启服务"
echo ""
echo -e "${YELLOW}更新部署:${NC}"
echo "  cd $APP_DIR && git pull && npm run build && pm2 restart $APP_NAME"
echo ""
