import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const websites = await prisma.website.findMany({
      where: {
        isShow: true,
        isFeatured: true,
      },
      orderBy: {
        sort: "asc",
      },
      take: 8,
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
    console.error("Error fetching featured websites:", error)
    return NextResponse.json(
      { error: "Failed to fetch featured websites" },
      { status: 500 }
    )
  }
}
