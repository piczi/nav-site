import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkDatabase() {
  console.log('=== 数据库状态检查 ===\n')

  try {
    // 检查连接
    await prisma.$connect()
    console.log('✅ 数据库连接成功')

    // 检查表是否存在
    const tables = ['Category', 'Website', 'Click', 'Admin']
    
    for (const table of tables) {
      try {
        // 使用原始查询检查表是否存在
        const result = await prisma.$queryRawUnsafe(`
          SELECT COUNT(*) as count FROM ${table}
        `)
        console.log(`✅ ${table} 表存在`)
      } catch (e: any) {
        if (e.message?.includes("doesn't exist") || e.message?.includes("does not exist")) {
          console.log(`❌ ${table} 表不存在`)
        } else {
          console.log(`❌ ${table} 表错误:`, e.message)
        }
      }
    }

    // 统计记录数
    console.log('\n=== 数据统计 ===')
    try {
      const categoryCount = await prisma.category.count()
      console.log(`📊 Category: ${categoryCount} 条记录`)
    } catch (e) {
      console.log('📊 Category: 无法统计')
    }

    try {
      const websiteCount = await prisma.website.count()
      console.log(`📊 Website: ${websiteCount} 条记录`)
    } catch (e) {
      console.log('📊 Website: 无法统计')
    }

    try {
      const clickCount = await prisma.click.count()
      console.log(`📊 Click: ${clickCount} 条记录`)
    } catch (e) {
      console.log('📊 Click: 无法统计')
    }

  } catch (error: any) {
    console.error('❌ 数据库连接失败:', error.message)
    console.log('\n请检查:')
    console.log('1. DATABASE_URL 环境变量是否正确设置')
    console.log('2. MySQL 服务器是否运行')
    console.log('3. 数据库和用户权限是否正确')
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabase()
