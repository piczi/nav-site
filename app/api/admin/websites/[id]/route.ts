import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"

// Middleware to check admin auth
async function checkAuth() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("admin_session")
  if (!sessionCookie?.value) {
    return false
  }
  return true
}

type RouteContext = {
  params: Promise<{ id: string }>
}

function getErrorCode(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null) return undefined
  if (!("code" in error)) return undefined
  const code = (error as Record<string, unknown>).code
  return typeof code === "string" ? code : undefined
}

function getErrorMessage(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null) return undefined
  if (!("message" in error)) return undefined
  const message = (error as Record<string, unknown>).message
  return typeof message === "string" ? message : undefined
}

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const isAuthenticated = await checkAuth()
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await context.params
    const website = await prisma.website.findUnique({
      where: { id },
    })

    if (!website) {
      return NextResponse.json(
        { error: "Website not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(website)
  } catch (error) {
    console.error("Error fetching website:", error)
    return NextResponse.json(
      { error: "Failed to fetch website" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    // Check auth
    const isAuthenticated = await checkAuth()
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await context.params
    const body = await request.json()
    const { tags, ...otherData } = body

    // 处理 tags 字段：如果是数组则转为逗号分隔的字符串
    const updateData = {
      ...otherData,
      tags: Array.isArray(tags) ? tags.join(',') : tags,
    }

    const website = await prisma.website.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(website)
  } catch (error) {
    console.error("Error updating website:", error)
    return NextResponse.json(
      { error: "Failed to update website" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    // Check auth
    const isAuthenticated = await checkAuth()
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await context.params

    // Check if website exists
    const website = await prisma.website.findUnique({
      where: { id },
    })

    if (!website) {
      return NextResponse.json(
        { error: "网站不存在" },
        { status: 404 }
      )
    }

    await prisma.website.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error("Error deleting website:", error)
    
    // Detailed error message
    let errorMessage = "删除网站失败"
    const errorCode = getErrorCode(error)
    const errorMsg = getErrorMessage(error)
    if (errorCode === "P2025") {
      errorMessage = "网站不存在或已被删除"
    } else if (errorMsg) {
      errorMessage = errorMsg
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
