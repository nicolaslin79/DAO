# 部署指南

## 快速开始

### 1. 修改配置

编辑 `setup.sh` 文件顶部的配置变量：

```bash
# 必须配置
DOMAIN="your-domain.com"              # 你的域名
DEEPSEEK_API_KEY="sk-xxx"             # DeepSeek API 密钥

# 支付功能（可选）
STRIPE_SECRET_KEY="sk_live_xxx"       # Stripe 密钥
STRIPE_WEBHOOK_SECRET="whsec_xxx"     # Stripe Webhook 密钥
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_xxx"  # Stripe 公钥
```

### 2. 上传脚本到服务器

```bash
# 方法一：使用 scp
scp deploy/setup.sh root@your-server-ip:/root/

# 方法二：直接在服务器上创建文件
# 复制 setup.sh 内容到服务器
```

### 3. 运行部署脚本

```bash
# 添加执行权限
chmod +x setup.sh

# 运行脚本
sudo bash setup.sh
```

### 4. 等待部署完成

脚本会自动完成以下步骤：
1. 检查系统环境
2. 安装 Node.js 20
3. 安装 PostgreSQL
4. 创建数据库
5. 安装 PM2 和 Nginx
6. 拉取代码
7. 配置环境变量
8. 构建应用
9. 启动服务
10. 配置 SSL 证书

## 更新部署

当有新代码推送到 GitHub 后，运行更新脚本：

```bash
# 上传更新脚本
scp deploy/update.sh root@your-server-ip:/var/www/meihua-divination/

# 运行更新
cd /var/www/meihua-divination
bash update.sh
```

## 常用命令

```bash
# 查看应用状态
pm2 status

# 查看日志
pm2 logs meihua-divination

# 重启应用
pm2 restart meihua-divination

# 停止应用
pm2 stop meihua-divination

# 查看 Nginx 状态
systemctl status nginx

# 重载 Nginx 配置
systemctl reload nginx

# 查看数据库
sudo -u postgres psql -d meihua_divination
```

## 目录结构

```
/var/www/meihua-divination/    # 应用目录
├── .env                       # 环境变量
├── logs/                      # PM2 日志
└── ...

/etc/nginx/sites-available/meihua-divination  # Nginx 配置
```

## 故障排除

### 端口被占用
```bash
lsof -i :3000
kill -9 <PID>
```

### 数据库连接失败
```bash
# 检查 PostgreSQL 状态
systemctl status postgresql

# 重启 PostgreSQL
systemctl restart postgresql
```

### Nginx 502 错误
```bash
# 检查应用是否运行
pm2 status

# 检查 Nginx 日志
tail -f /var/log/nginx/meihua-divination.error.log
```

## 环境变量说明

| 变量名 | 说明 | 必填 |
|--------|------|------|
| DATABASE_URL | PostgreSQL 连接串 | 是 |
| NEXTAUTH_SECRET | NextAuth 密钥 | 是 |
| NEXTAUTH_URL | 应用 URL | 是 |
| DEEPSEEK_API_KEY | DeepSeek API 密钥 | 是 |
| STRIPE_SECRET_KEY | Stripe 密钥 | 否 |
| STRIPE_WEBHOOK_SECRET | Stripe Webhook 密钥 | 否 |
| NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY | Stripe 公钥 | 否 |
