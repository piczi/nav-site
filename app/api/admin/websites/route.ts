import { NextResponse } from "next/server"
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

export async function GET() {
  try {
    // Check auth
    const isAuthenticated = await checkAuth()
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const websites = await prisma.website.findMany({
      orderBy: [
        { createdAt: "desc" },
      ],
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    })

    return NextResponse.json(websites)
  } catch (error) {
    console.error("Error fetching admin websites:", error)
    return NextResponse.json(
      { error: "Failed to fetch websites" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    // Check auth
    const isAuthenticated = await checkAuth()
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { 
      title, 
      url, 
      description, 
      icon, 
      categoryId,
      tags,
      isFeatured,
      isShow,
      sort 
    } = body

    // Validate required fields
    if (!title || !url || !categoryId) {
      return NextResponse.json(
        { error: "名称、网址和分类不能为空" },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: "网址格式不正确" },
        { status: 400 }
      )
    }

    const website = await prisma.website.create({
      data: {
        title,
        url,
        description,
        icon,
        categoryId,
        tags: Array.isArray(tags) ? tags.join(',') : tags || '',
        isFeatured: isFeatured || false,
        isShow: isShow !== false,
        sort: sort || 0,
        clickCount: 0,
      },
    })

    return NextResponse.json(website)
  } catch (error) {
    console.error("Error creating website:", error)
    return NextResponse.json(
      { error: "Failed to create website" },
      { status: 500 }
    )
  }
}
