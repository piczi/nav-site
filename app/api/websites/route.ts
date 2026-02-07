import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const featured = searchParams.get("featured")
    const search = searchParams.get("search")
    const sortBy = searchParams.get("sortBy") || "clickCount"

    const where: Prisma.WebsiteWhereInput = {
      isShow: true,
    }

    if (category) {
      where.category = {
        slug: category,
      }
    }

    if (featured === "true") {
      where.isFeatured = true
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { tags: { contains: search } },
      ]
    }

    // 构建排序
    let orderBy: any[] = []
    if (sortBy === "createdAt") {
      orderBy = [{ createdAt: "desc" }]
    } else {
      orderBy = [{ clickCount: "desc" }, { sort: "asc" }]
    }

    const websites = await prisma.website.findMany({
      where,
      orderBy,
      include: {
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    })

    return NextResponse.json(websites)
  } catch (error) {
    console.error("Error fetching websites:", error)
    return NextResponse.json(
      { error: "Failed to fetch websites" },
      { status: 500 }
    )
  }
}