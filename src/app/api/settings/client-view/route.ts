import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

// Public endpoint to get default client view
export async function GET() {
  try {
    const settings = await prisma.systemSettings.findUnique({
      where: { id: "settings" },
      select: { defaultClientView: true },
    });

    return NextResponse.json({
      defaultClientView: settings?.defaultClientView || "classic",
    });
  } catch (error) {
    console.error("Error fetching client view:", error);
    return NextResponse.json({ defaultClientView: "classic" });
  }
}
