import { NextResponse } from "next/server"
import { verifySession } from "@/lib/session"
import { checkSecurityMiddleware } from "@/lib/security-middleware"

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  return checkSecurityMiddleware(request, async () => {
    try {
      const isAuthenticated = verifySession(request)
      
      if (!isAuthenticated) {
        return NextResponse.json(
          { authenticated: false },
          { status: 401 }
        )
      }

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
