import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { checkSecurityMiddleware } from "@/lib/security-middleware"

const SESSION_COOKIE = "admin_session"

export async function POST(request: Request) {
  return checkSecurityMiddleware(request, async () => {
    try {
      // Clear the session cookie
      cookies().delete(SESSION_COOKIE)
      
      return NextResponse.json({ success: true })
    } catch (error) {
      console.error("Logout error:", error)
      return NextResponse.json(
        { error: "退出失败" },
        { status: 500 }
      )
    }
  })
}
