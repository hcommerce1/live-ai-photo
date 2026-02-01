import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const purchases = await prisma.packagePurchase.findMany({
      where: {
        userId: session.user.id,
        creditsLeft: { gt: 0 },
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      include: {
        package: {
          select: {
            name: true,
            photoCount: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ purchases });
  } catch (error) {
    console.error("Error fetching user packages:", error);
    return NextResponse.json(
      { error: "Failed to fetch user packages" },
      { status: 500 }
    );
  }
}
