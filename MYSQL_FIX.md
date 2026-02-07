# MySQL 部署问题诊断

## 问题描述
新增网站和分类在线上 MySQL 数据库中无效。

## 根本原因
项目默认配置为 SQLite，线上使用 MySQL 时需要：
1. 修改 Prisma schema 支持 MySQL
2. 创建数据库表结构
3. 配置正确的环境变量

## 解决方案

### 1. 检查环境变量

确保 `.env.local` 中配置正确的 MySQL 连接字符串：

```bash
DATABASE_URL="mysql://username:password@hostname:3306/database_name"
```

### 2. 创建数据库表

**方法一：使用 Prisma Migrate（推荐）**

```bash
# 安装依赖
npm install

# 生成 Prisma Client
npx prisma generate

# 部署迁移到 MySQL
npx prisma migrate deploy
```

**方法二：手动执行 SQL**

如果 Migrate 失败，可以直接执行 SQL 文件：

```bash
# 登录 MySQL
mysql -u your_username -p your_database_name

# 执行 SQL 文件
source prisma/mysql-schema.sql
```

### 3. 验证表是否创建成功

```bash
# 查看所有表
npx prisma studio

# 或在 MySQL 中执行
SHOW TABLES;
```

### 4. 检查错误日志

如果仍然失败，检查：

1. **Vercel/服务器日志**：查看是否有数据库连接错误
2. **浏览器控制台**：查看 API 返回的错误信息
3. **Prisma 日志**：添加 `DEBUG=*` 环境变量查看详细日志

### 5. 常见错误

#### 错误 1：表不存在
```
Error: The table `Category` does not exist in the current database.
```
**解决**：运行 `npx prisma migrate deploy`

#### 错误 2：连接超时
```
Error: Can't reach database server
```
**解决**：检查 `DATABASE_URL` 和网络连接

#### 错误 3：权限不足
```
Error: Access denied for user
```
**解决**：确认 MySQL 用户有 CREATE、INSERT、UPDATE 权限

### 6. 快速修复步骤

```bash
# 1. 确保 schema 是 MySQL 版本
cat prisma/schema.prisma

# 2. 生成 Client
npx prisma generate

# 3. 推送数据库结构
npx prisma db push

# 4. 验证连接
npx prisma studio
```

## 已完成的修改

✅ 已将 `prisma/schema.prisma` 从 SQLite 改为 MySQL 配置
✅ 已添加 MySQL 连接驱动 (`@planetscale/database`)
✅ 已创建 MySQL 表结构 SQL 文件 (`prisma/mysql-schema.sql`)
✅ 已更新 `.env.example` 示例
✅ 已创建部署文档 (`DEPLOY.md`)

## 部署到线上

1. 确保线上环境变量 `DATABASE_URL` 指向 MySQL
2. 在部署前运行 `npx prisma migrate deploy`
3. 如果使用 Vercel，在 Build Command 中添加：
   ```json
   {
     "buildCommand": "prisma migrate deploy && next build"
   }
   ```
