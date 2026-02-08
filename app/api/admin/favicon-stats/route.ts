import { NextResponse } from "next/server"
import { getFaviconStats, resetFaviconStats } from "@/lib/favicon.service"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const stats = getFaviconStats()
    
    // 计算成功率
    const successRate = stats.totalRequests > 0 
      ? (stats.successfulRequests / stats.totalRequests * 100).toFixed(2)
      : "0.00"
    
    // 计算缓存命中率
    const cacheHitRate = stats.totalRequests > 0
      ? (stats.cacheHits / stats.totalRequests * 100).toFixed(2)
      : "0.00"
    
    return NextResponse.json({
      ...stats,
      successRate: `${successRate}%`,
      cacheHitRate: `${cacheHitRate}%`,
      lastUpdated: stats.lastUpdated.toISOString()
    })
  } catch (error) {
    console.error("Error getting favicon stats:", error)
    return NextResponse.json(
      { error: "Failed to get favicon statistics" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { action } = await request.json()
    
    if (action === 'reset') {
      resetFaviconStats()
      return NextResponse.json({ message: "Statistics reset successfully" })
    }
    
    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Error processing favicon stats action:", error)
    return NextResponse.json(
      { error: "Failed to process action" },
      { status: 500 }
    )
  }
}