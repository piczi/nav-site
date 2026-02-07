# MySQL 部署配置指南

## 1. 环境变量配置

创建 `.env.local` 文件：

```bash
# MySQL 数据库连接
DATABASE_URL="mysql://username:password@hostname:3306/database_name"

# 管理员账号
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
```

## 2. 数据库初始化

### 方案一：使用 Prisma Migrate（推荐）

```bash
# 生成迁移文件
npx prisma migrate dev --name init

# 部署到生产环境
npx prisma migrate deploy
```

### 方案二：使用 Prisma DB Push（开发环境）

```bash
npx prisma db push
```

## 3. 初始化数据

```bash
npx tsx prisma/seed.ts
```

## 4. 常见问题

### 问题1：新增网站/分类无效

**原因**：数据库表未创建或权限不足

**解决**：
1. 确认 `DATABASE_URL` 正确
2. 运行 `npx prisma migrate deploy` 创建表
3. 检查 MySQL 用户权限

### 问题2：UUID 生成问题

MySQL 8.0+ 支持 UUID，无需额外配置。

### 问题3：连接超时

在连接字符串中添加参数：
```
mysql://user:pass@host/db?connect_timeout=30&pool_timeout=30
```

## 5. 线上部署检查清单

- [ ] 数据库连接字符串正确
- [ ] 所有表已创建（运行 migrate deploy）
- [ ] 初始数据已导入（可选）
- [ ] 管理员账号已设置
- [ ] 数据库用户有读写权限

## 6. 验证数据库连接

```bash
npx prisma studio
```

如果能打开并看到数据，说明连接正常。
