import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    let settings = await prisma.systemSettings.findUnique({
      where: { id: "settings" },
      select: {
        expressEnabled: true,
        urgentEnabled: true,
        packagesEnabled: true,
        expressTimeReduction: true,
        urgentTimeReduction: true,
        pricePerGraphic: true,
        expressPriceMultiplier: true,
        urgentPriceMultiplier: true,
        minutesPerGraphic: true,
      },
    });

    if (!settings) {
      // Return defaults if settings don't exist
      settings = {
        expressEnabled: true,
        urgentEnabled: true,
        packagesEnabled: true,
        expressTimeReduction: 0.5,
        urgentTimeReduction: 0.25,
        pricePerGraphic: 4900,
        expressPriceMultiplier: 2.0,
        urgentPriceMultiplier: 4.0,
        minutesPerGraphic: 30,
      };
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Error fetching feature settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}
