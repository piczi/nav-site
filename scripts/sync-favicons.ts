import { prisma } from "@/lib/prisma"

async function fetchFaviconUrl(domain: string): Promise<string | null> {
  const faviconPaths = [
    '/favicon.ico',
    '/favicon.png',
    '/apple-touch-icon.png',
    '/apple-touch-icon-precomposed.png',
    '/android-chrome-192x192.png',
    '/android-chrome-512x512.png',
    '/mstile-150x150.png'
  ];
  
  // 先尝试常见的 favicon 路径
  for (const path of faviconPaths) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      
      const testUrl = `https://${domain}${path}`
      const response = await fetch(testUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; FaviconFetcher/1.0)',
        },
        signal: controller.signal,
        redirect: 'follow', // 跟随重定向
      });
      
      clearTimeout(timeout);
      
      if (response.ok && response.headers.get('content-type')?.includes('image')) {
        // 返回最终 URL（可能是重定向后的）
        return response.url;
      }
    } catch (error) {
      // 继续尝试下一个路径
      continue;
    }
  }
  
  // 如果直接获取失败，尝试 API 服务
  const apiServices = [
    `https://api.faviconkit.com/${domain}/128`,
    `https://icons.duckduckgo.com/ip3/${domain}.ico`,
    `https://favicon.yandex.net/favicon/${domain}`
  ];
  
  for (const apiUrl of apiServices) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(apiUrl, {
        signal: controller.signal,
        redirect: 'follow',
      });
      
      clearTimeout(timeout);
      
      if (response.ok) {
        return response.url;
      }
    } catch (error) {
      // 继续尝试下一个 API
      continue;
    }
  }
  
  return null;
}

async function syncAllFavicons(batchSize: number = 10) {
  try {
    console.log("开始同步网站图标...")
    
    // 获取所有网站
    const websites = await prisma.website.findMany({
      select: {
        id: true,
        url: true,
        icon: true,
      },
      orderBy: {
        updatedAt: 'asc'
      }
    })
    
    console.log(`找到 ${websites.length} 个网站`)
    
    let updatedCount = 0
    let successCount = 0
    let failCount = 0
    
    // 分批处理，避免内存溢出
    for (let i = 0; i < websites.length; i += batchSize) {
      const batch = websites.slice(i, i + batchSize)
      
      console.log(`处理批次 ${Math.floor(i/batchSize) + 1}/${Math.ceil(websites.length/batchSize)}`)
      
      for (const website of batch) {
        try {
          // 如果已有图标，跳过
          if (website.icon) {
            continue
          }
          
          const urlObj = new URL(website.url)
          const domain = urlObj.hostname.replace(/^www\./, "")
          
          console.log(`获取 ${website.url} 的图标...`)
          const faviconUrl = await fetchFaviconUrl(domain)
          
          if (faviconUrl) {
            await prisma.website.update({
              where: { id: website.id },
              data: { icon: faviconUrl }
            })
            updatedCount++
            successCount++
            console.log(`✅ 更新成功: ${website.url} -> ${faviconUrl}`)
          } else {
            failCount++
            console.log(`❌ 获取失败: ${website.url}`)
          }
          
          // 避免请求太快
          await new Promise(resolve => setTimeout(resolve, 100))
          
        } catch (error) {
          failCount++
          console.error(`❌ 处理失败 ${website.url}:`, error instanceof Error ? error.message : '未知错误')
          continue
        }
      }
      
      console.log(`批次完成，已处理: ${updatedCount} 个`)
    }
    
    console.log("\n同步完成!")
    console.log(`总网站: ${websites.length}`)
    console.log(`已有图标: ${websites.length - updatedCount}`)
    console.log(`新获取: ${successCount}`)
    console.log(`失败: ${failCount}`)
    
  } catch (error) {
    console.error("同步过程出错:", error)
  }
}

// 执行同步
if (require.main === module) {
  syncAllFavicons(5) // 每次处理5个
}