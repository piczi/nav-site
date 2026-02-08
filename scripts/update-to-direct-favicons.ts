import { prisma } from "@/lib/prisma"

async function fetchDirectFaviconUrl(domain: string): Promise<string | null> {
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
        redirect: 'follow',
      });
      
      clearTimeout(timeout);
      
      if (response.ok && response.headers.get('content-type')?.includes('image')) {
        // 返回最终 URL（可能是重定向后的）
        const finalUrl = response.url;
        
        // 检查是否是 1x1 像素或其他无效图标
        if (finalUrl.includes('wikipedia.org') || finalUrl.includes('1x1.png')) {
          continue;
        }
        
        return finalUrl;
      }
    } catch (error) {
      // 继续尝试下一个路径
      continue;
    }
  }
  
  return null;
}

async function updateToDirectFavicons() {
  try {
    console.log("开始更新为直接 favicon URLs...")
    
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
        
        // 跳过已经是直接 URL 的（不是 faviconkit）
        if (website.icon && !website.icon.includes('faviconkit.com')) {
          console.log(`⏭️ 已是最新: ${domain}`)
          continue
        }
        
        console.log(`获取 ${domain} 的直接 favicon...`)
        const directFaviconUrl = await fetchDirectFaviconUrl(domain)
        
        if (directFaviconUrl) {
          await prisma.website.update({
            where: { id: website.id },
            data: { icon: directFaviconUrl }
          })
          updatedCount++
          console.log(`✅ 更新: ${domain} -> ${directFaviconUrl}`)
        } else {
          console.log(`❌ 无法获取: ${domain}`)
        }
        
        // 避免请求太快
        await new Promise(resolve => setTimeout(resolve, 500))
        
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
  updateToDirectFavicons()
}