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

    // 检查分类是否存在
    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { websites: true }
        }
      }
    })

    if (!category) {
      return NextResponse.json(
        { error: "分类不存在" },
        { status: 404 }
      )
    }

    // 检查分类下是否有网站
    if (category._count.websites > 0) {
      return NextResponse.json(
        { error: `该分类下有 ${category._count.websites} 个网站，请先删除网站或将其移动到其他分类` },
        { status: 400 }
      )
    }

    await prisma.category.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting category:", error)
    
    // 详细的错误信息
    let errorMessage = "删除分类失败"
    if (error.code === 'P2003') {
      errorMessage = "该分类下还有网站，无法删除"
    } else if (error.code === 'P2025') {
      errorMessage = "分类不存在"
    } else if (error.message) {
      errorMessage = error.message
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
