import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import Resend from "next-auth/providers/resend";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    // Google OAuth
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // Email Magic Link (via Resend)
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.EMAIL_FROM || "noreply@example.com",
    }),

    // Credentials (email + password)
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      try {
        if (user && user.email) {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
            select: { id: true, role: true, companyId: true, emailVerified: true },
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
            token.companyId = dbUser.companyId;
            token.emailVerified = dbUser.emailVerified;
          }
        }
        // Refresh token data on update trigger
        if (trigger === "update" && token.id && typeof token.id === "string") {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id },
            select: { role: true, companyId: true, emailVerified: true },
          });
          if (dbUser) {
            token.role = dbUser.role;
            token.companyId = dbUser.companyId;
            token.emailVerified = dbUser.emailVerified;
          }
        }
      } catch (error) {
        console.error("Error in JWT callback:", error);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = String(token.id);
        session.user.role = token.role ? String(token.role) : "CLIENT";
        session.user.companyId = token.companyId ? String(token.companyId) : null;
        session.user.emailVerified = token.emailVerified as Date | null;
      }
      return session;
    },
  },
});
