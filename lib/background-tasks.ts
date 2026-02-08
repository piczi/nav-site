import { prisma } from "@/lib/prisma"
import { fetchFaviconFromDomain } from "@/lib/favicon.service"

/**
 * 异步获取网站 favicon
 * 在网站创建后调用，不会阻塞主请求
 */
export async function fetchWebsiteFaviconAsync(websiteId: string, url: string): Promise<void> {
  try {
    // 检查是否已经有 icon
    const website = await prisma.website.findUnique({
      where: { id: websiteId },
      select: { icon: true }
    })

    if (website?.icon) {
      return
    }

    // 解析域名
    let domain = ""
    try {
      const urlObj = new URL(url)
      domain = urlObj.hostname.replace(/^www\./, "")
    } catch {
      return
    }

    // 获取 favicon
    const faviconUrl = await fetchFaviconFromDomain(domain)
    
    if (faviconUrl) {
      // 更新数据库
      await prisma.website.update({
        where: { id: websiteId },
        data: { icon: faviconUrl }
      })
    }
  } catch (error) {
    console.error(`Failed to fetch favicon for website ${websiteId}:`, error)
  }
}