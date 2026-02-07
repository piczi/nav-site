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

    const categories = await prisma.category.findMany({
      orderBy: {
        sort: "asc",
      },
      include: {
        _count: {
          select: {
            websites: true,
          },
        },
      },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching admin categories:", error)
    return NextResponse.json(
      { error: "Failed to fetch categories" },
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
    const { name, slug, description, color, icon, sort } = body

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
        { error: "名称和标识不能为空" },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existing = await prisma.category.findUnique({
      where: { slug },
    })

    if (existing) {
      return NextResponse.json(
        { error: "该标识已被使用" },
        { status: 400 }
      )
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        color,
        icon,
        sort: sort || 0,
        isShow: true,
      },
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    )
  }
}
