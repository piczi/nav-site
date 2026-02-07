import { cookies } from "next/headers"

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
 * 创建新会话
 */
export function createSession(): string {
  const sessionId = generateSessionId()
  
  cookies().set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  })
  
  return sessionId
}

/**
 * 验证会话是否有效
 */
export function verifySession(): boolean {
  const sessionCookie = cookies().get(SESSION_COOKIE)
  return !!sessionCookie?.value
}

/**
 * 销毁会话
 */
export function destroySession(): void {
  cookies().set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  })
}
