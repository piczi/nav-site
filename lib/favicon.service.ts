import { prisma } from "@/lib/prisma"

// 统计接口
export interface FaviconStats {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  cacheHits: number
  cacheMisses: number
  lastUpdated: Date
}

// 内存统计
let stats: FaviconStats = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  cacheHits: 0,
  cacheMisses: 0,
  lastUpdated: new Date()
}

// 获取统计信息
export function getFaviconStats(): FaviconStats {
  return { ...stats }
}

// 重置统计信息
export function resetFaviconStats(): void {
  stats = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    lastUpdated: new Date()
  }
}

// 更新统计信息
export function updateStats(success: boolean, cacheHit: boolean): void {
  stats.totalRequests++
  if (success) {
    stats.successfulRequests++
  } else {
    stats.failedRequests++
  }
  if (cacheHit) {
    stats.cacheHits++
  } else {
    stats.cacheMisses++
  }
  stats.lastUpdated = new Date()
}

export async function fetchFaviconFromDomain(domain: string): Promise<string | null> {
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
      
      const response = await fetch(`https://${domain}${path}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; FaviconFetcher/1.0)',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeout);
      
      if (response.ok && response.headers.get('content-type')?.includes('image')) {
        return `https://${domain}${path}`;
      }
    } catch (error) {
      // 继续尝试下一个路径
      continue;
    }
  }

  // 如果直接获取失败，尝试 API 服务
  const apiServices = [
    `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
    `https://icons.duckduckgo.com/ip3/${domain}.ico`,
    `https://favicon.yandex.net/favicon/${domain}`
  ];

  for (const apiUrl of apiServices) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(apiUrl, {
        signal: controller.signal,
      });
      
      clearTimeout(timeout);
      
      if (response.ok) {
        return apiUrl;
      }
    } catch (error) {
      // 继续尝试下一个 API
      continue;
    }
  }

  return null;
}

/**
 * 获取或更新网站的 favicon
 */
export async function getOrUpdateWebsiteIcon(websiteId: string, url: string): Promise<string | null> {
  try {
    // 从数据库获取网站信息
    const website = await prisma.website.findUnique({
      where: { id: websiteId },
      select: { icon: true }
    });

    if (website?.icon) {
      updateStats(true, true);
      return website.icon;
    }

    // 没有图标，尝试获取
    let domain = "";
    try {
      const urlObj = new URL(url);
      domain = urlObj.hostname.replace(/^www\./, "");
    } catch {
      updateStats(false, false);
      return null;
    }

    const iconUrl = await fetchFaviconFromDomain(domain);
    
    if (iconUrl) {
      // 更新数据库
      await prisma.website.update({
        where: { id: websiteId },
        data: { icon: iconUrl }
      });
      
      updateStats(true, false);
      return iconUrl;
    }

    updateStats(false, false);
    return null;
  } catch (error) {
    console.error("Error fetching website icon:", error);
    updateStats(false, false);
    return null;
  }
}

/**
 * 批量获取网站图标
 */
export async function batchGetOrUpdateIcons(
  websites: Array<{ id: string; url: string; icon?: string | null }>
): Promise<Array<{ id: string; icon: string | null }>> {
  const results = [];
  
  for (const website of websites) {
    if (website.icon) {
      results.push({ id: website.id, icon: website.icon });
    } else {
      const iconUrl = await getOrUpdateWebsiteIcon(website.id, website.url);
      results.push({ id: website.id, icon: iconUrl });
    }
  }
  
  return results;
}

/**
 * 定时更新所有网站的图标（用于后台任务）
 */
export async function updateAllWebsiteIcons() {
  try {
    // 获取所有没有图标的网站
    const websites = await prisma.website.findMany({
      where: {
        OR: [
          { icon: null },
          { icon: "" }
        ]
      },
      select: {
        id: true,
        url: true,
        icon: true
      },
      take: 50 // 每次最多处理50个，避免超时
    });

    for (const website of websites) {
      try {
        let domain = "";
        try {
          const urlObj = new URL(website.url);
          domain = urlObj.hostname.replace(/^www\./, "");
        } catch {
          continue;
        }

        const iconUrl = await fetchFaviconFromDomain(domain);
        
        if (iconUrl) {
          await prisma.website.update({
            where: { id: website.id },
            data: { icon: iconUrl }
          });
          console.log(`Updated icon for website ${website.id}: ${iconUrl}`);
        }
      } catch (error) {
        console.error(`Failed to update icon for website ${website.id}:`, error);
        continue;
      }
    }
  } catch (error) {
    console.error("Error updating all website icons:", error);
  }
}