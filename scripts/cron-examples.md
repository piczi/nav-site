# 定时同步图标任务配置

## Linux/Mac (crontab)

### 每天凌晨2点执行
```bash
# 编辑crontab
crontab -e

# 添加以下行
0 2 * * * cd /path/to/nav-site && node scripts/schedule-favicon-sync.js >> logs/favicon-cron.log 2>&1
```

### 每小时执行一次
```bash
0 * * * * cd /path/to/nav-site && node scripts/schedule-favicon-sync.js >> logs/favicon-cron.log 2>&1
```

### 每6小时执行一次
```bash
0 */6 * * * cd /path/to/nav-site && node scripts/schedule-favicon-sync.js >> logs/favicon-cron.log 2>&1
```

## Windows (任务计划程序)

### 创建基本任务
1. 打开"任务计划程序"
2. 点击"创建基本任务"
3. 输入名称："网站图标同步"
4. 选择触发器："每天"或"每小时"
5. 设置开始时间
6. 操作："启动程序"
7. 程序或脚本：`node`
8. 参数：`scripts/schedule-favicon-sync.js`
9. 起始于：`E:\workspace\explore\nav-site`

## Docker 容器

### 在Dockerfile中添加cron
```dockerfile
# 安装cron
RUN apt-get update && apt-get install -y cron

# 添加cron配置
COPY scripts/crontab /etc/cron.d/favicon-sync
RUN chmod 0644 /etc/cron.d/favicon-sync

# 启动cron服务
CMD cron && npm start
```

### crontab文件内容
```bash
# 每天凌晨2点执行
0 2 * * * root cd /app && node scripts/schedule-favicon-sync.js >> logs/favicon-cron.log 2>&1
```

## PM2 进程管理

### 使用PM2定时任务
```bash
# 安装PM2
npm install -g pm2

# 创建定时任务
pm2 start scripts/schedule-favicon-sync.js --name "favicon-sync" --cron "0 2 * * *"

# 保存PM2配置
pm2 save

# 设置开机自启
pm2 startup
```

### 使用PM2模块
```bash
# 安装PM2模块
pm2 install pm2-cron

# 配置定时任务
pm2 set pm2-cron:rule "0 2 * * *"
pm2 set pm2-cron:script "scripts/schedule-favicon-sync.js"
```

## 手动测试

### 直接运行脚本
```bash
# 使用Node.js运行
node scripts/schedule-favicon-sync.js

# 或使用npm脚本
npm run favicon:sync
```

### 在package.json中添加脚本
```json
{
  "scripts": {
    "favicon:sync": "node scripts/schedule-favicon-sync.js",
    "favicon:sync:manual": "tsx scripts/sync-favicons.ts"
  }
}
```

## 监控日志

### 查看实时日志
```bash
# Linux/Mac
tail -f logs/favicon-sync.log

# Windows
Get-Content logs/favicon-sync.log -Wait
```

### 日志轮转配置 (logrotate)
```bash
# /etc/logrotate.d/favicon-sync
/path/to/nav-site/logs/favicon-sync.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 644 root root
}
```

## 环境变量配置

### .env文件
```env
# 图标同步配置
FAVICON_SYNC_ENABLED=true
FAVICON_SYNC_CRON="0 2 * * *"
FAVICON_SYNC_BATCH_SIZE=50
FAVICON_SYNC_TIMEOUT=30000
```

### 在脚本中使用环境变量
```javascript
const BATCH_SIZE = process.env.FAVICON_SYNC_BATCH_SIZE || 50
const TIMEOUT = process.env.FAVICON_SYNC_TIMEOUT || 30000
```

## 注意事项

1. **权限设置**：确保脚本有执行权限
   ```bash
   chmod +x scripts/schedule-favicon-sync.js
   ```

2. **路径问题**：确保在正确的目录下执行

3. **依赖安装**：确保所有依赖已安装
   ```bash
   npm install
   ```

4. **数据库连接**：确保数据库服务正在运行

5. **错误处理**：配置错误通知（邮件、Slack等）

6. **性能考虑**：根据网站数量调整批处理大小和频率

7. **备份**：定期备份数据库，特别是生产环境

8. **监控**：设置监控告警，确保任务正常运行