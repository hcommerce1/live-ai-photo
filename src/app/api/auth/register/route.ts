import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/db";

// Validate NIP checksum
function validateNip(nip: string): boolean {
  if (!/^\d{10}$/.test(nip)) return false;

  const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];
  const digits = nip.split("").map(Number);
  const sum = weights.reduce((acc, w, i) => acc + w * digits[i], 0);
  const checksum = sum % 11;

  return checksum === digits[9];
}

export async function POST(req: NextRequest) {
  try {
    const { name, companyName, nip, email, password } = await req.json();

    // Validation
    if (!email || !password || !nip || !companyName) {
      return NextResponse.json(
        { error: "Wszystkie pola są wymagane" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Hasło musi mieć minimum 8 znaków" },
        { status: 400 }
      );
    }

    if (!validateNip(nip)) {
      return NextResponse.json(
        { error: "Nieprawidłowy numer NIP" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Użytkownik z tym emailem już istnieje" },
        { status: 400 }
      );
    }

    // Check if company with NIP already exists
    const existingCompany = await prisma.company.findUnique({
      where: { nip },
    });

    if (existingCompany) {
      return NextResponse.json(
        { error: "Firma z tym NIP już istnieje. Skontaktuj się z administratorem." },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24);

    // Create company and user in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create company with 1 free credit
      const company = await tx.company.create({
        data: {
          name: companyName,
          nip,
          email,
          freeCredits: 1, // 1 darmowa grafika na start
        },
      });

      // Create user linked to company
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "CLIENT",
          companyId: company.id,
          // emailVerified remains null until verified
        },
      });

      // Create verification token
      await tx.verificationToken.create({
        data: {
          identifier: email,
          token: verificationToken,
          expires: verificationExpires,
        },
      });

      return { user, company };
    });

    // TODO: Send verification email using Resend
    // For now, log the verification link
    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verify-email/${verificationToken}`;
    console.log(`Verification link for ${email}: ${verifyUrl}`);

    // In production, send email:
    // await sendVerificationEmail(email, verifyUrl);

    return NextResponse.json(
      {
        success: true,
        message: "Konto utworzone. Sprawdź email, aby potwierdzić.",
        user: {
          id: result.user.id,
          email: result.user.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Błąd podczas rejestracji" },
      { status: 500 }
    );
  }
}
