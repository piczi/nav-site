#!/bin/bash

# MySQL 部署脚本
# 在线上服务器执行此脚本

echo "=== 开始部署到 MySQL ==="

# 检查环境变量
if [ -z "$DATABASE_URL" ]; then
    echo "❌ 错误: DATABASE_URL 环境变量未设置"
    echo "请设置 MySQL 连接字符串，例如:"
    echo 'export DATABASE_URL="mysql://username:password@hostname:3306/database_name"'
    exit 1
fi

# 备份当前的 schema
cp prisma/schema.prisma prisma/schema.sqlite.prisma.bak

# 使用 MySQL schema
cp prisma/schema.mysql.prisma prisma/schema.prisma

echo "✅ 已切换到 MySQL schema"

# 生成 Prisma Client
echo "正在生成 Prisma Client..."
npx prisma generate

# 创建迁移（如果是首次部署）
if [ ! -d "prisma/migrations" ] || [ -z "$(ls -A prisma/migrations 2>/dev/null)" ]; then
    echo "创建初始迁移..."
    npx prisma migrate dev --name init --create-only
fi

# 部署迁移
echo "正在部署数据库迁移..."
npx prisma migrate deploy

# 恢复 SQLite schema（用于本地开发）
cp prisma/schema.sqlite.prisma.bak prisma/schema.prisma
rm prisma/schema.sqlite.prisma.bak

echo "✅ MySQL 部署完成！"
echo ""
echo "注意：本地开发配置已恢复为 SQLite"
