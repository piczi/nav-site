import { NextResponse } from "next/server"

const SESSION_COOKIE = "admin_session"
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

/**
 * 生成会话 ID
 */
function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15)
}

/**
 * 创建新会话 - 在 API 路由中使用
 */
export function createSessionResponse(responseData: any = {}) {
  const sessionId = generateSessionId()
  
  const response = NextResponse.json(responseData)
  response.cookies.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax", // 改为 lax，允许跨站导航时发送 cookie
    maxAge: SESSION_MAX_AGE,
    path: "/",
  })
  
  return response
}

/**
 * 验证会话是否有效 - 在 API 路由中使用
 */
export function verifySession(request: Request): boolean {
  const sessionCookie = request.headers.get('cookie')
  if (!sessionCookie) return false
  
  const match = sessionCookie.match(new RegExp(`(^| )${SESSION_COOKIE}=([^;]+)`))
  return !!match?.[2]
}

/**
 * 销毁会话 - 在 API 路由中使用
 */
export function destroySessionResponse(responseData: any = {}) {
  const response = NextResponse.json(responseData)
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  })
  return response
}
