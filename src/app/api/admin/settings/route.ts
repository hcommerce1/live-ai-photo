import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get or create settings
    let settings = await prisma.systemSettings.findUnique({
      where: { id: "settings" },
    });

    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: {
          id: "settings",
          pricePerGraphic: 4900, // 49 PLN
          expressPriceMultiplier: 2.0,
          urgentPriceMultiplier: 4.0,
          designerRatePerGraphic: 2000, // 20 PLN
          designerRatePerRevision: 500, // 5 PLN
          minutesPerGraphic: 30,
          confirmationTimeout: 5,
          queueMode: "round_robin",
        },
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const {
      pricePerGraphic,
      expressPriceMultiplier,
      urgentPriceMultiplier,
      designerRatePerGraphic,
      designerRatePerRevision,
      minutesPerGraphic,
      confirmationTimeout,
      queueMode,
      defaultClientView,
      // Nowe pola - feature flags
      expressEnabled,
      urgentEnabled,
      packagesEnabled,
      // Nowe pola - czasy realizacji
      expressTimeReduction,
      urgentTimeReduction,
    } = body;

    const settings = await prisma.systemSettings.upsert({
      where: { id: "settings" },
      update: {
        pricePerGraphic,
        expressPriceMultiplier,
        urgentPriceMultiplier,
        designerRatePerGraphic,
        designerRatePerRevision,
        minutesPerGraphic,
        confirmationTimeout,
        queueMode,
        defaultClientView,
        // Nowe pola
        expressEnabled,
        urgentEnabled,
        packagesEnabled,
        expressTimeReduction,
        urgentTimeReduction,
      },
      create: {
        id: "settings",
        pricePerGraphic: pricePerGraphic || 4900,
        expressPriceMultiplier: expressPriceMultiplier || 2.0,
        urgentPriceMultiplier: urgentPriceMultiplier || 4.0,
        designerRatePerGraphic: designerRatePerGraphic || 2000,
        designerRatePerRevision: designerRatePerRevision || 500,
        minutesPerGraphic: minutesPerGraphic || 30,
        confirmationTimeout: confirmationTimeout || 5,
        queueMode: queueMode || "round_robin",
        defaultClientView: defaultClientView || "classic",
        // Nowe pola z domyślnymi wartościami
        expressEnabled: expressEnabled ?? true,
        urgentEnabled: urgentEnabled ?? true,
        packagesEnabled: packagesEnabled ?? true,
        expressTimeReduction: expressTimeReduction || 0.5,
        urgentTimeReduction: urgentTimeReduction || 0.25,
      },
    });

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
