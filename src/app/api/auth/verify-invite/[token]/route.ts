import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

interface Props {
  params: Promise<{ token: string }>;
}

export async function GET(request: Request, { params }: Props) {
  try {
    const { token } = await params;

    const invitation = await prisma.invitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Zaproszenie nie istnieje" },
        { status: 404 }
      );
    }

    if (invitation.usedAt) {
      return NextResponse.json(
        { error: "Zaproszenie zostało już wykorzystane" },
        { status: 400 }
      );
    }

    if (new Date() > invitation.expiresAt) {
      return NextResponse.json(
        { error: "Zaproszenie wygasło" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      invitation: {
        email: invitation.email,
        role: invitation.role,
      },
    });
  } catch (error) {
    console.error("Error verifying invitation:", error);
    return NextResponse.json(
      { error: "Nie udało się zweryfikować zaproszenia" },
      { status: 500 }
    );
  }
}
