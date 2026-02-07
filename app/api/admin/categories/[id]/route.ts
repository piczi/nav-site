import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"

async function checkAuth() {
  const sessionCookie = cookies().get("admin_session")
  return !!sessionCookie?.value
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const isAuthenticated = await checkAuth()
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const category = await prisma.category.findUnique({
      where: { id: params.id },
    })

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error("Error fetching category:", error)
    return NextResponse.json({ error: "Failed to fetch category" }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const isAuthenticated = await checkAuth()
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, slug, description, color, icon, sort, isShow } = body

    // Check if new slug conflicts with other categories
    if (slug) {
      const existing = await prisma.category.findFirst({
        where: {
          slug,
          id: { not: params.id },
        },
      })

      if (existing) {
        return NextResponse.json(
          { error: "该标识已被其他分类使用" },
          { status: 400 }
        )
      }
    }

    const category = await prisma.category.update({
      where: { id: params.id },
      data: {
        name,
        slug,
        description,
        color,
        icon,
        sort,
        isShow,
      },
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error("Error updating category:", error)
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const isAuthenticated = await checkAuth()
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.category.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    )
  }
}
