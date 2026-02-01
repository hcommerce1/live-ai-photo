import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        deliveryEmails: true,
        notificationPhone: true,
        company: {
          select: {
            id: true,
            name: true,
            nip: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Parse deliveryEmails from JSON string
    let deliveryEmailsArray: string[] = [];
    try {
      deliveryEmailsArray = JSON.parse(user.deliveryEmails);
    } catch {
      deliveryEmailsArray = [];
    }

    return NextResponse.json({
      user: {
        ...user,
        deliveryEmails: deliveryEmailsArray,
      },
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, deliveryEmails, notificationPhone } = body;

    // Validate deliveryEmails is an array of valid emails
    let deliveryEmailsJson = "[]";
    if (deliveryEmails && Array.isArray(deliveryEmails)) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const validEmails = deliveryEmails.filter(
        (email: string) => typeof email === "string" && emailRegex.test(email)
      );
      deliveryEmailsJson = JSON.stringify(validEmails);
    }

    // Validate phone number (Polish format)
    let validPhone: string | null = null;
    if (notificationPhone) {
      const phoneRegex = /^(\+48)?[0-9]{9}$/;
      const cleanPhone = notificationPhone.replace(/\s/g, "");
      if (phoneRegex.test(cleanPhone)) {
        validPhone = cleanPhone;
      }
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name && { name }),
        deliveryEmails: deliveryEmailsJson,
        notificationPhone: validPhone,
      },
      select: {
        id: true,
        name: true,
        email: true,
        deliveryEmails: true,
        notificationPhone: true,
      },
    });

    // Parse deliveryEmails for response
    let deliveryEmailsArray: string[] = [];
    try {
      deliveryEmailsArray = JSON.parse(user.deliveryEmails);
    } catch {
      deliveryEmailsArray = [];
    }

    return NextResponse.json({
      user: {
        ...user,
        deliveryEmails: deliveryEmailsArray,
      },
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Failed to update user profile" },
      { status: 500 }
    );
  }
}
