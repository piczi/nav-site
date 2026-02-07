import { NextResponse } from "next/server"
import { isIPBanned, checkRateLimit } from "@/lib/security"

export function getClientIP(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  return '127.0.0.1'
}

export async function checkSecurityMiddleware(
  request: Request,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const clientIP = getClientIP(request)
    
    // 检查 IP 是否被封禁
    if (isIPBanned(clientIP)) {
      return NextResponse.json(
        { error: "您的 IP 已被临时封禁，请稍后再试" },
        { status: 429 }
      )
    }
    
    // 检查请求频率限制
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json(
        { error: "请求过于频繁，请稍后再试" },
        { status: 429 }
      )
    }
    
    return await handler()
  } catch (error) {
    console.error("Security middleware error:", error)
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    )
  }
}