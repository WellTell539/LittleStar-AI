# 🚀 LITTLE STAR AI AI Dashboard - 部署指南

## 📋 部署选项概览

| 部署方式 | 难度 | 成本 | 推荐度 | 适用场景 |
|---------|------|------|--------|----------|
| Vercel | ⭐ | 免费起步 | ⭐⭐⭐⭐⭐ | 个人项目、快速原型 |
| Netlify | ⭐⭐ | 免费起步 | ⭐⭐⭐⭐ | 静态部署、小型团队 |
| Railway | ⭐⭐ | 付费 | ⭐⭐⭐⭐ | 全栈应用、数据库需求 |
| Docker | ⭐⭐⭐ | 取决于托管 | ⭐⭐⭐ | 自定义环境、企业级 |
| VPS/服务器 | ⭐⭐⭐⭐ | 中等 | ⭐⭐⭐ | 完全控制、高性能需求 |

## 🌟 Vercel 部署（推荐）

### 为什么选择 Vercel？
- ✅ 专为 Next.js 优化
- ✅ 零配置部署
- ✅ 全球 CDN 加速
- ✅ 自动 HTTPS
- ✅ 免费额度充足

### 快速部署步骤

#### 方法一：GitHub 连接（推荐）
```bash
# 1. 推送代码到 GitHub
git add .
git commit -m "Ready for deployment"
git push origin main

# 2. 访问 Vercel Dashboard
# https://vercel.com/dashboard

# 3. 点击 "New Project"
# 4. 连接 GitHub 仓库
# 5. 选择 claude-ai-dashboard 仓库
# 6. 点击 "Deploy"
```

#### 方法二：CLI 部署
```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 登录 Vercel
vercel login

# 3. 在项目根目录运行
vercel

# 4. 按照提示配置项目
# 5. 部署完成！
```

### 环境变量配置
```bash
# 在 Vercel Dashboard 设置以下环境变量：

# 基础配置
NEXT_PUBLIC_APP_NAME="LITTLE STAR AI AI Dashboard"
NEXT_PUBLIC_APP_VERSION="1.0.0"

# API 配置（可选）
OPENAI_API_KEY=your_openai_key_here
NEXT_PUBLIC_API_BASE_URL=https://your-domain.vercel.app

# Web3 配置（可选）
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_INFURA_PROJECT_ID=your_infura_id

# 分析配置（可选）
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 自定义域名设置
```bash
# 1. 在 Vercel Dashboard 中进入项目
# 2. 点击 "Settings" -> "Domains"
# 3. 添加自定义域名
# 4. 配置 DNS 记录：
#    类型: CNAME
#    名称: your-subdomain（或 @）
#    值: cname.vercel-dns.com
```

### 性能优化配置
```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/_next/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/home",
      "destination": "/",
      "permanent": true
    }
  ]
}
```

## 🐳 Docker 部署

### 多阶段构建 Dockerfile
```dockerfile
# 阶段1: 依赖安装
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 复制包文件
COPY package.json package-lock.json* ./
RUN npm ci --only=production --frozen-lockfile

# 阶段2: 应用构建
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 设置构建环境变量
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# 构建应用
RUN npm run build

# 阶段3: 生产运行
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制构建产物
COPY --from=builder /app/public ./public

# 设置正确的权限
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Docker Compose 配置
```yaml
# docker-compose.yml
version: '3.8'

services:
  claude-ai:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_APP_NAME=LITTLE STAR AI AI Dashboard
    restart: unless-stopped
    volumes:
      - ./data:/app/data
    networks:
      - claude-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - claude-ai
    restart: unless-stopped
    networks:
      - claude-network

networks:
  claude-network:
    driver: bridge
```

### 构建和运行
```bash
# 构建镜像
docker build -t claude-ai-dashboard .

# 运行容器
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e NEXT_PUBLIC_APP_NAME="LITTLE STAR AI AI Dashboard" \
  claude-ai-dashboard

# 使用 Docker Compose
docker-compose up -d
```

## 🖥️ VPS/服务器部署

### 服务器要求
```bash
# 最小要求
- CPU: 1 核心
- 内存: 2GB RAM
- 存储: 20GB SSD
- 网络: 10Mbps 带宽

# 推荐配置
- CPU: 2+ 核心
- 内存: 4GB+ RAM  
- 存储: 50GB+ SSD
- 网络: 100Mbps 带宽
```

### Ubuntu 20.04+ 部署步骤

#### 1. 环境准备
```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 PM2
sudo npm install pm2 -g

# 安装 Nginx
sudo apt install nginx -y

# 安装 Git
sudo apt install git -y
```

#### 2. 项目部署
```bash
# 克隆项目
git clone <your-repo-url> /var/www/claude-ai-dashboard
cd /var/www/claude-ai-dashboard

# 安装依赖
npm ci --only=production

# 构建项目
npm run build

# 配置环境变量
cp .env.example .env.local
nano .env.local

# 设置权限
sudo chown -R www-data:www-data /var/www/claude-ai-dashboard
```

#### 3. PM2 进程管理
```bash
# 创建 PM2 配置
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'claude-ai-dashboard',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/claude-ai-dashboard',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
EOF

# 启动应用
pm2 start ecosystem.config.js

# 保存 PM2 配置
pm2 save

# 设置开机自启
pm2 startup
```

#### 4. Nginx 反向代理
```nginx
# /etc/nginx/sites-available/claude-ai-dashboard
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL 配置
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # SSL 安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # 静态文件缓存
    location /_next/static/ {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # 健康检查
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

#### 5. SSL 证书设置
```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取 SSL 证书
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 测试自动续期
sudo certbot renew --dry-run

# 设置自动续期 cron job
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

#### 6. 启用配置
```bash
# 启用站点配置
sudo ln -s /etc/nginx/sites-available/claude-ai-dashboard /etc/nginx/sites-enabled/

# 测试 Nginx 配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx

# 设置开机自启
sudo systemctl enable nginx
```

## 📊 监控和维护

### 系统监控
```bash
# 安装监控工具
sudo apt install htop iotop nethogs -y

# PM2 监控
pm2 monit

# 查看应用日志
pm2 logs claude-ai-dashboard

# 系统资源监控
htop
```

### 备份策略
```bash
# 创建备份脚本
cat > /home/backup/backup-claude-ai.sh << 'EOF'
#!/bin/bash

# 备份目录
BACKUP_DIR="/home/backup"
APP_DIR="/var/www/claude-ai-dashboard"
DATE=$(date +%Y%m%d_%H%M%S)

# 创建备份
tar -czf "$BACKUP_DIR/claude-ai-$DATE.tar.gz" \
  --exclude="node_modules" \
  --exclude=".git" \
  --exclude=".next" \
  "$APP_DIR"

# 保留最近 7 天的备份
find "$BACKUP_DIR" -name "claude-ai-*.tar.gz" -mtime +7 -delete

echo "Backup completed: claude-ai-$DATE.tar.gz"
EOF

# 设置权限
chmod +x /home/backup/backup-claude-ai.sh

# 设置定时备份（每天凌晨 2 点）
echo "0 2 * * * /home/backup/backup-claude-ai.sh" | crontab -
```

### 更新部署
```bash
# 更新脚本
cat > update-claude-ai.sh << 'EOF'
#!/bin/bash

cd /var/www/claude-ai-dashboard

# 拉取最新代码
git pull origin main

# 安装依赖
npm ci --only=production

# 构建项目
npm run build

# 重启应用
pm2 restart claude-ai-dashboard

echo "Update completed successfully!"
EOF

chmod +x update-claude-ai.sh
```

## 🔍 故障排除

### 常见问题

#### 1. 应用无法启动
```bash
# 检查端口占用
sudo netstat -tlnp | grep :3000

# 查看 PM2 进程状态
pm2 status

# 查看应用日志
pm2 logs claude-ai-dashboard --lines 50
```

#### 2. Nginx 502 错误
```bash
# 检查 Nginx 错误日志
sudo tail -f /var/log/nginx/error.log

# 检查应用是否运行
curl http://localhost:3000

# 测试 Nginx 配置
sudo nginx -t
```

#### 3. SSL 证书问题
```bash
# 检查证书状态
sudo certbot certificates

# 手动续期证书
sudo certbot renew

# 检查 SSL 配置
openssl s_client -connect your-domain.com:443
```

#### 4. 性能问题
```bash
# 监控系统资源
htop
iotop
free -h
df -h

# PM2 性能监控
pm2 monit

# 优化 Node.js 内存
pm2 start ecosystem.config.js --node-args="--max-old-space-size=2048"
```

## 🚀 生产环境优化

### 性能优化清单
- [ ] 启用 Gzip 压缩
- [ ] 配置适当的缓存头
- [ ] 使用 CDN 加速静态资源
- [ ] 启用 HTTP/2
- [ ] 优化图片大小和格式
- [ ] 配置适当的 PM2 集群数量
- [ ] 设置监控和告警
- [ ] 配置日志轮转
- [ ] 定期备份数据
- [ ] 设置防火墙规则

### 安全加固
```bash
# 防火墙配置
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# 禁用 root SSH 登录
sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl restart ssh

# 安装 fail2ban
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
```

---

## 🎉 部署完成！

恭喜！你已经成功部署了 LITTLE STAR AI AI Dashboard。现在你的AI伙伴可以在互联网上与全世界的用户互动了！

**记住定期更新和维护你的部署，以确保最佳的性能和安全性。**

---

*需要帮助？查看 [PROJECT_GUIDE.md](./PROJECT_GUIDE.md) 或提交 Issue。* 