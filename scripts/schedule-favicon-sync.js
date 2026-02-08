#!/usr/bin/env node

/**
 * 定时同步网站图标的脚本
 * 可以配置为cron任务或系统定时任务
 */

const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')

// 日志文件路径
const LOG_DIR = path.join(__dirname, '../logs')
const LOG_FILE = path.join(LOG_DIR, 'favicon-sync.log')

// 确保日志目录存在
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true })
}

function log(message) {
  const timestamp = new Date().toISOString()
  const logMessage = `[${timestamp}] ${message}\n`
  
  console.log(logMessage.trim())
  fs.appendFileSync(LOG_FILE, logMessage)
}

async function runSyncScript() {
  return new Promise((resolve, reject) => {
    log('开始执行图标同步脚本...')
    
    const scriptPath = path.join(__dirname, 'sync-favicons.ts')
    
    // 使用 tsx 运行 TypeScript 脚本
    const command = `npx tsx ${scriptPath}`
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        log(`脚本执行失败: ${error.message}`)
        if (stderr) log(`错误输出: ${stderr}`)
        reject(error)
        return
      }
      
      if (stdout) log(`脚本输出: ${stdout}`)
      if (stderr) log(`警告输出: ${stderr}`)
      
      log('图标同步脚本执行完成')
      resolve()
    })
  })
}

async function main() {
  try {
    log('=== 图标同步任务开始 ===')
    await runSyncScript()
    log('=== 图标同步任务结束 ===\n')
  } catch (error) {
    log(`任务执行失败: ${error.message}`)
    process.exit(1)
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main()
}

module.exports = {
  runSyncScript,
  log
}