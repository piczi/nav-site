import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"

async function checkAuth() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("admin_session")
  return !!sessionCookie?.value
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params
    const category = await prisma.category.findUnique({
      where: { id },
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
  request: NextRequest,
  context: RouteContext
) {
  try {
    const isAuthenticated = await checkAuth()
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()
    const { name, slug, description, color, icon, sort, isShow } = body

    // Check if new slug conflicts with other categories
    if (slug) {
      const existing = await prisma.category.findFirst({
        where: {
          slug,
          id: { not: id },
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
      where: { id },
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
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const isAuthenticated = await checkAuth()
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params
    // 检查分类是否存在
    const category = await prisma.category.findUnique({
      where: { id },
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
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error("Error deleting category:", error)
    
    // 详细的错误信息
    let errorMessage = "删除分类失败"
    const errorCode = getErrorCode(error)
    const errorMsg = getErrorMessage(error)
    if (errorCode === "P2003") {
      errorMessage = "该分类下还有网站，无法删除"
    } else if (errorCode === "P2025") {
      errorMessage = "分类不存在"
    } else if (errorMsg) {
      errorMessage = errorMsg
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
