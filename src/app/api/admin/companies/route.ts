import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const companies = await prisma.company.findMany({
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        packagePurchases: {
          where: {
            creditsLeft: { gt: 0 },
          },
          select: {
            creditsLeft: true,
          },
        },
        _count: {
          select: {
            users: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate total credits for each company
    const companiesWithCredits = companies.map((company) => {
      const packageCredits = company.packagePurchases.reduce(
        (sum, p) => sum + p.creditsLeft,
        0
      );
      return {
        id: company.id,
        name: company.name,
        nip: company.nip,
        email: company.email,
        phone: company.phone,
        isActive: company.isActive,
        createdAt: company.createdAt,
        freeCredits: company.freeCredits,
        packageCredits,
        totalCredits: company.freeCredits + packageCredits,
        usersCount: company._count.users,
        users: company.users,
      };
    });

    return NextResponse.json({ companies: companiesWithCredits });
  } catch (error) {
    console.error("Error fetching companies:", error);
    return NextResponse.json(
      { error: "Failed to fetch companies" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { name, nip, email, phone, address, city, postalCode, freeCredits } = body;

    if (!name || !nip) {
      return NextResponse.json(
        { error: "Name and NIP are required" },
        { status: 400 }
      );
    }

    // Check if company with this NIP already exists
    const existing = await prisma.company.findUnique({
      where: { nip },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Company with this NIP already exists" },
        { status: 400 }
      );
    }

    const company = await prisma.company.create({
      data: {
        name,
        nip,
        email,
        phone,
        address,
        city,
        postalCode,
        freeCredits: freeCredits || 1,
      },
    });

    return NextResponse.json({ company });
  } catch (error) {
    console.error("Error creating company:", error);
    return NextResponse.json(
      { error: "Failed to create company" },
      { status: 500 }
    );
  }
}
