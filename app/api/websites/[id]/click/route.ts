import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: websiteId } = await context.params
    const headersList = await headers()
    const userAgent = headersList.get("user-agent") || ""
    const referrer = headersList.get("referer") || ""
    
    // 获取IP（在生产环境中需要正确处理）
    let ip = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown"
    
    // 记录点击
    await prisma.click.create({
      data: {
        websiteId,
        ip: ip.split(',')[0].trim(),
        userAgent,
        referrer,
      },
    })

    // 更新点击计数
    await prisma.website.update({
      where: { id: websiteId },
      data: {
        clickCount: {
          increment: 1,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error recording click:", error)
    return NextResponse.json(
      { error: "Failed to record click" },
      { status: 500 }
    )
  }
}
