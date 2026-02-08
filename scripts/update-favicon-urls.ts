import { prisma } from "@/lib/prisma"

/**
 * 将原始 favicon URL 转换为安全的 API URL
 */
function convertToSafeFaviconUrl(domain: string, originalUrl?: string | null): string {
  // 如果已经是安全 URL，保持原样
  if (originalUrl && (
    originalUrl.includes('duckduckgo.com/ip3') ||
    originalUrl.includes('favicon.yandex.net/favicon') ||
    originalUrl.includes('faviconkit.com') ||
    originalUrl.startsWith('data:')
  )) {
    return originalUrl
  }
  
  // 否则使用 faviconkit API（稳定且可访问）
  return `https://api.faviconkit.com/${domain}/128`
}

async function updateFaviconUrls() {
  try {
    console.log("开始更新 favicon URLs...")
    
    const websites = await prisma.website.findMany({
      select: {
        id: true,
        url: true,
        icon: true,
      }
    })
    
    console.log(`找到 ${websites.length} 个网站`)
    
    let updatedCount = 0
    
    for (const website of websites) {
      try {
        const urlObj = new URL(website.url)
        const domain = urlObj.hostname.replace(/^www\./, "")
        
        const safeIconUrl = convertToSafeFaviconUrl(domain, website.icon)
        
        // 只在需要更新时才更新
        if (website.icon !== safeIconUrl) {
          await prisma.website.update({
            where: { id: website.id },
            data: { icon: safeIconUrl }
          })
          updatedCount++
          console.log(`✅ 更新: ${domain} -> ${safeIconUrl}`)
        } else {
          console.log(`⏭️ 已是最新: ${domain}`)
        }
        
      } catch (error) {
        console.error(`❌ 处理失败 ${website.url}:`, error instanceof Error ? error.message : '未知错误')
        continue
      }
    }
    
    console.log("\n更新完成!")
    console.log(`总网站: ${websites.length}`)
    console.log(`更新数量: ${updatedCount}`)
    
  } catch (error) {
    console.error("更新过程出错:", error)
  }
}

// 执行更新
if (require.main === module) {
  updateFaviconUrls()
}