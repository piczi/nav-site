import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const websites = await prisma.website.findMany({
      where: {
        isShow: true,
        clickCount: {
          gt: 0,
        },
      },
      orderBy: {
        clickCount: "desc",
      },
      take: 10,
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
    console.error("Error fetching hot websites:", error)
    return NextResponse.json(
      { error: "Failed to fetch hot websites" },
      { status: 500 }
    )
  }
}
