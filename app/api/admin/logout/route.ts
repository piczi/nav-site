import { NextResponse } from "next/server"
import { checkSecurityMiddleware } from "@/lib/security-middleware"
import { destroySessionResponse } from "@/lib/session"

export async function POST(request: Request) {
  return checkSecurityMiddleware(request, async () => {
    try {
      // Clear the session cookie
      return destroySessionResponse({ success: true })
    } catch (error) {
      console.error("Logout error:", error)
      return NextResponse.json(
        { error: "退出失败" },
        { status: 500 }
      )
    }
  })
}
