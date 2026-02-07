# 导航站点

一个现代化的网站导航平台，支持分类浏览、高级搜索和管理后台。

## 🚀 功能特性

- **双主题支持**：亮色/暗色主题自动切换
- **智能搜索**：支持按名称、描述、标签搜索
- **分类浏览**：按类别快速找到所需网站
- **网站管理**：完整的后台管理系统
- **安全防护**：防暴力破解、频率限制
- **响应式设计**：适配各种设备屏幕
- **自动图标**：自动获取网站 favicon

## 🛠️ 技术栈

- **前端**：Next.js 14, TypeScript, React, Tailwind CSS
- **后端**：Next.js API Routes
- **数据库**：Prisma (支持 SQLite, MySQL, PostgreSQL)
- **UI 组件**：Radix UI, Lucide React Icons
- **部署**：Vercel, Docker, 或传统服务器

## 🔧 开发环境搭建

### 1. 克隆项目
```bash
git clone your-repo-url
cd nav-site
```

### 2. 安装依赖
```bash
npm install
```

### 3. 配置环境变量
```bash
# 复制示例配置
cp .env.example .env.local

# 编辑 .env.local 文件
nano .env.local
```

**本地开发环境变量**：
```env
# 管理员账号
ADMIN_USERNAME=admin
ADMIN_PASSWORD=dev123

# 数据库（SQLite - 仅用于开发）
DATABASE_URL=sqlite://./prisma/dev.db
```

### 4. 初始化数据库
```bash
# 生成 Prisma Client
npx prisma generate

# 推送 schema 到数据库
npx prisma db push

# （可选）填充示例数据
npm run db:seed
```

### 5. 启动开发服务器
```bash
npm run dev
```

访问 `http://localhost:3000` 查看应用。

## 🚀 生产环境部署

### 方案 A：传统服务器 + MySQL（推荐）

#### 前提条件
- Linux 服务器（Ubuntu 20.04+）
- Node.js 18+
- MySQL 5.7+
- Nginx（可选，但推荐）
- PM2（进程管理器）

#### 步骤 1：准备 MySQL 数据库
```sql
-- 登录 MySQL
mysql -u root -p

-- 创建数据库
CREATE DATABASE nav_site CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建专用用户
CREATE USER 'nav_user'@'%' IDENTIFIED BY 'your_strong_password_here';

-- 授予权限
GRANT ALL PRIVILEGES ON nav_site.* TO 'nav_user'@'%';
FLUSH PRIVILEGES;
EXIT;
```

#### 步骤 2：更新项目配置
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

#### 步骤 3：配置环境变量
```env
# .env.local
DATABASE_URL="mysql://nav_user:your_strong_password_here@your_server_ip:3306/nav_site"
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_strong_admin_password
```

#### 步骤 4：安装依赖
```bash
# 安装 MySQL 驱动
npm install mysql2

# 安装其他依赖
npm install
```

#### 步骤 5：初始化生产数据库
```bash
# 生成 Prisma Client
npx prisma generate

# 推送 schema 到生产数据库
npx prisma db push

# （可选）运行种子数据
npm run db:seed
```

#### 步骤 6：构建和启动
```bash
# 构建生产版本
npm run build

# 使用 PM2 启动（推荐）
npm install -g pm2
pm2 start "npm start" --name "nav-site"

# 设置开机自启
pm2 startup
pm2 save
```

#### 步骤 7：配置 Nginx（可选但推荐）
```nginx
# /etc/nginx/sites-available/nav-site
server {
    listen 80;
    server_name your-domain.com;

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
    }
}
```

启用站点：
```bash
sudo ln -s /etc/nginx/sites-available/nav-site /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 步骤 8：配置 HTTPS（强烈推荐）
```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取 SSL 证书
sudo certbot --nginx -d your-domain.com

# 设置自动续期
sudo crontab -l | { cat; echo "0 12 * * * /usr/bin/certbot renew --quiet"; } | sudo crontab -
```

### 方案 B：Docker 部署

#### 1. 创建 docker-compose.yml
```yaml
version: '3.8'
services:
  nav-site:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=mysql://nav_user:password@db:3306/nav_site
      - ADMIN_USERNAME=admin
      - ADMIN_PASSWORD=strong_password
    depends_on:
      - db
    restart: unless-stopped
  
  db:
    image: mysql:8.0
    environment:
      MYSQL_DATABASE: nav_site
      MYSQL_USER: nav_user
      MYSQL_PASSWORD: password
      MYSQL_ROOT_PASSWORD: root_password
    volumes:
      - mysql_data:/var/lib/mysql
    restart: unless-stopped

volumes:
  mysql_data:
```

#### 2. 创建 Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npx prisma generate

EXPOSE 3000
CMD ["npm", "start"]
```

#### 3. 启动服务
```bash
docker-compose up -d
```

## 🔒 安全配置

### 管理员账户安全
- **必须修改默认密码**：不要使用 `admin123`
- **使用强密码**：至少12位，包含大小写字母、数字、特殊字符
- **定期更换密码**：建议每3个月更换一次

### 网络安全
- **启用 HTTPS**：生产环境必须使用 HTTPS
- **防火墙配置**：只开放必要端口（80, 443, 22）
- **数据库安全**：限制数据库用户权限，避免使用 root

### 防暴力破解
- **登录失败限制**：连续5次失败后IP封禁30分钟
- **请求频率限制**：每个IP每分钟最多10次请求
- **会话安全**：HttpOnly cookies，Secure 标志

## 📊 监控和维护

### 日志查看
```bash
# PM2 应用日志
pm2 logs nav-site

# Nginx 日志
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### 数据库备份
```bash
# 创建备份脚本
#!/bin/bash
mysqldump -u nav_user -p'your_password' nav_site > /backup/nav_site_$(date +%Y%m%d).sql

# 添加到 crontab（每天凌晨2点）
0 2 * * * /path/to/backup.sh
```

### 应用更新
```bash
# 更新代码
git pull

# 重新安装依赖（如果需要）
npm install

# 重新构建
npm run build

# 重启应用
pm2 restart nav-site
```

## 🧪 环境变量说明

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `DATABASE_URL` | 数据库连接字符串 | `mysql://user:pass@host:3306/db` |
| `ADMIN_USERNAME` | 管理员用户名 | `admin` |
| `ADMIN_PASSWORD` | 管理员密码 | `strong_password_123` |

## 📁 项目结构

```
├── app/                 # Next.js App Router
│   ├── api/            # API 路由
│   ├── admin/          # 管理后台
│   ├── category/       # 分类页面
│   └── search/         # 搜索页面
├── components/         # React 组件
├── lib/               # 工具函数和库
├── prisma/            # Prisma 相关文件
├── public/            # 静态资源
└── styles/            # 全局样式
```

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

[MIT License](LICENSE)

---

> **注意**：部署前请务必修改默认管理员密码，并确保生产环境使用 HTTPS！