# MySQL 线上部署指南

## 快速部署步骤

### 1. 准备线上环境

确保线上服务器已设置环境变量：

```bash
export DATABASE_URL="mysql://username:password@your-host:3306/your_database"
export ADMIN_USERNAME="admin"
export ADMIN_PASSWORD="your_secure_password"
```

### 2. 方案 A：手动部署（推荐）

在本地执行：

```bash
# 1. 切换到 MySQL schema
cp prisma/schema.mysql.prisma prisma/schema.prisma

# 2. 提交代码
git add prisma/schema.prisma
git commit -m "Switch to MySQL for production"
git push

# 3. 在线上服务器执行
git pull
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
npm start
```

### 3. 方案 B：使用部署脚本

在线上服务器执行：

```bash
# 赋予执行权限
chmod +x scripts/deploy-mysql.sh

# 运行部署脚本
./scripts/deploy-mysql.sh
```

### 4. 方案 C：Docker 部署

创建 `docker-compose.yml`：

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=mysql://user:pass@mysql:3306/nav_site
    depends_on:
      - mysql
  
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpass
      MYSQL_DATABASE: nav_site
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

## Vercel 部署

如果使用 Vercel，在 `vercel.json` 中添加：

```json
{
  "buildCommand": "cp prisma/schema.mysql.prisma prisma/schema.prisma && npx prisma generate && npx prisma migrate deploy && next build",
  "env": {
    "DATABASE_URL": "mysql://username:password@host:3306/db"
  }
}
```

## 常见问题

### 问题 1：迁移冲突

如果提示迁移冲突，删除迁移目录重新创建：

```bash
rm -rf prisma/migrations
npx prisma migrate dev --name init
```

### 问题 2：数据库连接失败

检查：
1. MySQL 服务是否运行
2. 用户名密码是否正确
3. 数据库是否存在
4. 防火墙是否允许连接

### 问题 3：权限不足

确保 MySQL 用户有权限：

```sql
GRANT ALL PRIVILEGES ON your_database.* TO 'your_user'@'%';
FLUSH PRIVILEGES;
```

## 本地开发 vs 线上生产

- **本地开发**：使用 SQLite (`prisma/schema.prisma`)
- **线上生产**：使用 MySQL (`prisma/schema.mysql.prisma`)

两个 schema 文件的区别：
- MySQL 版本添加了索引优化
- 其他字段完全一致，数据可以互导

## 数据库初始化

首次部署后，初始化数据：

```bash
npx tsx prisma/seed.ts
```

## 验证部署

部署完成后，检查 API 是否正常：

```bash
curl https://your-domain.com/api/categories
curl https://your-domain.com/api/websites
```

如果返回 JSON 数据，说明部署成功！
