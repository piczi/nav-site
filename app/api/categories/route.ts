import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: {
        isShow: true,
      },
      orderBy: {
        sort: "asc",
      },
      include: {
        _count: {
          select: {
            websites: {
              where: {
                isShow: true,
              },
            },
          },
        },
      },
    })

    // 禁用缓存，确保数据实时性
    const response = NextResponse.json(categories)
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    )
  }
}
