import { NextResponse } from "next/server"
import { isIPBanned, recordLoginFailure, checkRateLimit } from "@/lib/security"
import { createSession } from "@/lib/session"

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin"
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123"

function getClientIP(request: Request): string {
  // 在 Vercel 环境中，真实 IP 在 x-forwarded-for 头中
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  
  // 本地开发环境
  return '127.0.0.1'
}

export async function POST(request: Request) {
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

    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: "请填写用户名和密码" },
        { status: 400 }
      )
    }

    // Check credentials
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      // 记录登录失败
      recordLoginFailure(clientIP)
      
      return NextResponse.json(
        { error: "用户名或密码错误" },
        { status: 401 }
      )
    }

    // Create session
    createSession()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "登录失败，请重试" },
      { status: 500 }
    )
  }
}
