import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { checkSecurityMiddleware } from "@/lib/security-middleware"

export const dynamic = 'force-dynamic'

const SESSION_COOKIE = "admin_session"

export async function GET(request: Request) {
  return checkSecurityMiddleware(request, async () => {
    try {
      const sessionCookie = cookies().get(SESSION_COOKIE)
      
      if (!sessionCookie?.value) {
        return NextResponse.json(
          { authenticated: false },
          { status: 401 }
        )
      }

      // In production, verify session against database/Redis
      // For now, we just check if cookie exists
      return NextResponse.json({ authenticated: true })
    } catch (error) {
      console.error("Auth check error:", error)
      return NextResponse.json(
        { authenticated: false },
        { status: 500 }
      )
    }
  })
}
