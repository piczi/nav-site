import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"

// Middleware to check admin auth
async function checkAuth() {
  const sessionCookie = cookies().get("admin_session")
  if (!sessionCookie?.value) {
    return false
  }
  return true
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const isAuthenticated = await checkAuth()
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const website = await prisma.website.findUnique({
      where: { id: params.id },
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
  request: Request,
  { params }: { params: { id: string } }
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

    const { id } = params
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
  request: Request,
  { params }: { params: { id: string } }
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

    const { id } = params

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
  } catch (error: any) {
    console.error("Error deleting website:", error)
    
    // Detailed error message
    let errorMessage = "删除网站失败"
    if (error.code === 'P2025') {
      errorMessage = "网站不存在或已被删除"
    } else if (error.message) {
      errorMessage = error.message
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
