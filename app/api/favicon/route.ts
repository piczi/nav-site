import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getFaviconStats, updateStats } from "@/lib/favicon.service"

// 内存缓存（生产环境可使用 Redis）
const iconCache = new Map<string, { url: string; timestamp: number }>()
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24小时

export const dynamic = 'force-dynamic'

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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get("url")
    
    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }
    
    // 验证URL格式
    let parsedUrl: URL
    try {
      parsedUrl = new URL(url)
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 })
    }
    
    // 只允许 http/https
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return NextResponse.json({ error: "Invalid protocol" }, { status: 400 })
    }
    
    const domain = parsedUrl.hostname.replace(/^www\./, "")
    
    // 检查内存缓存
    const cached = iconCache.get(domain)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      updateStats(true, true)
      return NextResponse.redirect(cached.url, 302)
    }
    
    updateStats(false, false)
    
    // 检查数据库中是否有该域的图标
    const websites = await prisma.website.findMany({
      where: {
        url: {
          contains: domain,
        }
      },
      select: {
        icon: true,
      },
      take: 1
    })
    
    // 数据库中有图标，检查是否是 faviconkit API（可能重定向到 1x1 像素）
    if (websites.length > 0 && websites[0].icon) {
      const iconUrl = websites[0].icon
      
      // 如果是 faviconkit API，尝试直接获取网站 favicon
      if (iconUrl.includes('faviconkit.com')) {
        try {
          const faviconUrl = await fetchFaviconUrl(domain)
          if (faviconUrl && !faviconUrl.includes('wikipedia.org')) { // 避免 1x1 像素
       iconCache.set(domain, { url: faviconUrl, timestamp: Date.now() })
      updateStats(true, false)
      return NextResponse.redirect(faviconUrl, 302)
          }
        } catch (error) {
          console.error("Failed to fetch favicon directly:", error)
        }
      }
      
       iconCache.set(domain, { url: iconUrl, timestamp: Date.now() })
      updateStats(true, false)
      return NextResponse.redirect(iconUrl, 302)
    }
    
    // 获取 favicon URL
    const faviconUrl = await fetchFaviconUrl(domain)
    
    if (faviconUrl) {
      // 缓存到内存
      iconCache.set(domain, { url: faviconUrl, timestamp: Date.now() })
      
      // 更新数据库中所有使用该域的网站（异步）
      setTimeout(async () => {
        try {
          await prisma.website.updateMany({
            where: {
              url: {
                contains: domain,
              },
              icon: null
            },
            data: { icon: faviconUrl }
          })
        } catch (error) {
          console.error("Failed to update website icons:", error)
        }
      }, 0)
      
      updateStats(true, false)
      return NextResponse.redirect(faviconUrl, 302)
    }
    
    // 返回一个默认的透明图标
    const defaultIcon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128' viewBox='0 0 128 128'%3E%3Crect width='128' height='128' fill='%23e5e7eb' rx='24'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='Arial, sans-serif' font-size='48' fill='%236b7280'%3E?%3C/text%3E%3C/svg%3E"
    
    iconCache.set(domain, { url: defaultIcon, timestamp: Date.now() })
    updateStats(false, false)
    return NextResponse.redirect(defaultIcon, 302)
    
  } catch (error) {
    console.error("Favicon fetch error:", error)
    const defaultIcon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128' viewBox='0 0 128 128'%3E%3Crect width='128' height='128' fill='%23e5e7eb' rx='24'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='Arial, sans-serif' font-size='48' fill='%236b7280'%3E?%3C/text%3E%3C/svg%3E"
    updateStats(false, false)
    return NextResponse.redirect(defaultIcon, 302)
  }
}