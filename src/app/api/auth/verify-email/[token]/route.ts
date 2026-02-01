import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

interface Props {
  params: Promise<{ token: string }>;
}

export async function POST(request: Request, { params }: Props) {
  try {
    const { token } = await params;

    // Find verification token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Link weryfikacyjny jest nieprawidłowy" },
        { status: 400 }
      );
    }

    if (new Date() > verificationToken.expires) {
      // Delete expired token
      await prisma.verificationToken.delete({
        where: { token },
      });
      return NextResponse.json(
        { error: "Link weryfikacyjny wygasł. Zarejestruj się ponownie." },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Użytkownik nie został znaleziony" },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: "Email został już zweryfikowany" },
        { status: 400 }
      );
    }

    // Verify email and delete token
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      }),
      prisma.verificationToken.delete({
        where: { token },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Email został zweryfikowany",
    });
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd podczas weryfikacji" },
      { status: 500 }
    );
  }
}
