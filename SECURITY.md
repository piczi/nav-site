# 安全建议的环境变量配置

## 基础配置
```
# 管理员账号（强烈建议修改默认值）
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_strong_password_here

# 数据库连接
DATABASE_URL=sqlite://./prisma/dev.db
```

## 生产环境安全配置
```
# 启用 HTTPS
NEXT_PUBLIC_VERCEL_URL=your-domain.com

# 更强的密码（至少12位，包含大小写字母、数字、特殊字符）
ADMIN_PASSWORD=StrongP@ssw0rd123!

# 自定义会话密钥
NEXTAUTH_SECRET=your_random_32_character_string_here
```

## 安全限制配置
- **登录失败次数**: 5次后IP封禁30分钟
- **请求频率限制**: 每分钟最多10次请求
- **会话有效期**: 7天

## 部署建议
1. **不要使用默认密码** - 部署前务必修改 `ADMIN_PASSWORD`
2. **使用 HTTPS** - 确保生产环境使用 HTTPS
3. **定期更新密码** - 建议每3个月更换一次管理员密码
4. **监控日志** - 关注登录失败和异常访问日志
5. **备份数据** - 定期备份数据库

## 本地开发
```
# .env.local (本地开发使用)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=dev123
```

## 生产环境
```
# 不要将敏感信息提交到版本控制
# 在部署平台（如 Vercel）中设置环境变量
```