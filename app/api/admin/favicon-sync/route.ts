import { NextResponse } from "next/server"
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
      continue;
    }
  }
  
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
      continue;
    }
  }
  
  return null;
}

export async function POST(request: Request) {
  try {
    const { all = false, batchSize = 10 } = await request.json();
    
    // 安全验证 - 开发环境禁用
    const authHeader = request.headers.get('authorization');
    if (process.env.NODE_ENV === 'production') {
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }
    
    // 获取没有图标的网站
    const whereCondition = all ? {} : {
      OR: [
        { icon: null },
        { icon: "" }
      ]
    };
    
    const websites = await prisma.website.findMany({
      where: whereCondition,
      select: {
        id: true,
        url: true,
      },
      take: Number(batchSize)
    });
    
    const results: Array<{
      id: string;
      url: string;
      icon: string | null;
      success: boolean;
      error?: string;
    }> = [];
    let updatedCount = 0;
    
    for (const website of websites) {
      try {
        const urlObj = new URL(website.url);
        const domain = urlObj.hostname.replace(/^www\./, "");
        
        const faviconUrl = await fetchFaviconUrl(domain);
        
        if (faviconUrl) {
          await prisma.website.update({
            where: { id: website.id },
            data: { icon: faviconUrl }
          });
          updatedCount++;
          results.push({
            id: website.id,
            url: website.url,
            icon: faviconUrl,
            success: true
          });
        } else {
          results.push({
            id: website.id,
            url: website.url,
            icon: null,
            success: false,
            error: "No favicon found"
          });
        }
      } catch (error) {
        results.push({
          id: website.id,
          url: website.url,
          icon: null,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }
    
    return NextResponse.json({
      message: `Updated ${updatedCount} of ${websites.length} websites`,
      results,
      total: websites.length,
      updated: updatedCount
    });
    
  } catch (error) {
    console.error("Favicon sync error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}