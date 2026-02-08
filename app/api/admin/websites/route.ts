import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { fetchWebsiteFaviconAsync } from "@/lib/background-tasks"

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

    const body = (await request.json()) as Record<string, unknown>

    const title = body.title
    const url = body.url
    const description = body.description
    const categoryId = body.categoryId
    const tags = body.tags
    const isFeatured = body.isFeatured
    const isShow = body.isShow
    const sort = body.sort

    const iconProvided = Object.prototype.hasOwnProperty.call(body, "icon")
    const normalizedIcon: string | null | undefined = (() => {
      if (!iconProvided) return undefined
      const raw = body.icon
      if (raw === null) return null
      if (typeof raw !== "string") return undefined
      const trimmed = raw.trim()
      return trimmed.length > 0 ? trimmed : null
    })()

    if (iconProvided && normalizedIcon === undefined) {
      return NextResponse.json({ error: "icon 字段格式不正确" }, { status: 400 })
    }

    // Validate required fields
    if (typeof title !== "string" || typeof url !== "string" || typeof categoryId !== "string") {
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
        description: typeof description === "string" ? description : undefined,
        categoryId,
        ...(iconProvided ? { icon: normalizedIcon } : {}),
        tags: Array.isArray(tags) ? tags.join(",") : typeof tags === "string" ? tags : "",
        isFeatured: typeof isFeatured === "boolean" ? isFeatured : false,
        isShow: isShow !== false,
        sort: typeof sort === "number" ? sort : 0,
        clickCount: 0,
      },
    })

    // 如果没有提供 icon，异步获取 favicon
    const shouldFetchFavicon = !iconProvided || normalizedIcon === null
    if (shouldFetchFavicon) {
      // 使用 setImmediate 或 setTimeout 来确保不阻塞主请求
      setTimeout(async () => {
        try {
          await fetchWebsiteFaviconAsync(website.id, url)
        } catch (error) {
          console.error("Background favicon fetch failed:", error)
        }
      }, 0)
    }

    return NextResponse.json(website)
  } catch (error) {
    console.error("Error creating website:", error)
    return NextResponse.json(
      { error: "Failed to create website" },
      { status: 500 }
    )
  }
}
