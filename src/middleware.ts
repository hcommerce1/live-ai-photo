import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;
  const emailVerified = req.auth?.user?.emailVerified;

  // Public routes
  const publicRoutes = ["/", "/login", "/register"];
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);

  // Auth routes (login, register)
  const authRoutes = ["/login", "/register"];
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  // Invitation routes (public with token)
  const isInviteRoute = nextUrl.pathname.startsWith("/invite/");

  // Email verification routes
  const isVerifyEmailRoute = nextUrl.pathname.startsWith("/verify-email");
  const isVerifyPendingRoute = nextUrl.pathname === "/verify-pending";

  // Role-specific route patterns
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isDesignerRoute = nextUrl.pathname.startsWith("/designer");
  const isDashboardRoute =
    nextUrl.pathname.startsWith("/dashboard") ||
    nextUrl.pathname.startsWith("/orders") ||
    nextUrl.pathname.startsWith("/new-order") ||
    nextUrl.pathname.startsWith("/packages") ||
    nextUrl.pathname.startsWith("/subscription");

  // API route patterns
  const isAdminAPI = nextUrl.pathname.startsWith("/api/admin");
  const isDesignerAPI = nextUrl.pathname.startsWith("/api/designer");

  // ============================================
  // API ROUTES PROTECTION
  // ============================================
  if (nextUrl.pathname.startsWith("/api")) {
    // Admin API - ADMIN only
    if (isAdminAPI) {
      if (!isLoggedIn || userRole !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }
    // Designer API - DESIGNER only
    if (isDesignerAPI) {
      if (!isLoggedIn || userRole !== "DESIGNER") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }
    return NextResponse.next();
  }

  // ============================================
  // INVITATION ROUTES (public)
  // ============================================
  if (isInviteRoute) {
    return NextResponse.next();
  }

  // ============================================
  // EMAIL VERIFICATION ROUTES
  // ============================================
  if (isVerifyEmailRoute) {
    return NextResponse.next();
  }

  // ============================================
  // REDIRECT LOGGED-IN USERS FROM AUTH PAGES
  // ============================================
  if (isLoggedIn && isAuthRoute) {
    // Redirect based on role
    if (userRole === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", nextUrl));
    } else if (userRole === "DESIGNER") {
      return NextResponse.redirect(new URL("/designer", nextUrl));
    }
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // ============================================
  // ALLOW PUBLIC ROUTES
  // ============================================
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // ============================================
  // VERIFY PENDING PAGE
  // ============================================
  if (isVerifyPendingRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    return NextResponse.next();
  }

  // ============================================
  // CHECK EMAIL VERIFICATION FOR CLIENTS
  // ============================================
  if (isLoggedIn && userRole === "CLIENT" && !emailVerified) {
    // Redirect unverified clients to verification pending page
    if (!isVerifyPendingRoute && !isVerifyEmailRoute) {
      return NextResponse.redirect(new URL("/verify-pending", nextUrl));
    }
  }

  // ============================================
  // PROTECT ADMIN ROUTES - ADMIN ONLY
  // ============================================
  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    if (userRole !== "ADMIN") {
      // Redirect designers to their panel
      if (userRole === "DESIGNER") {
        return NextResponse.redirect(new URL("/designer", nextUrl));
      }
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
    return NextResponse.next();
  }

  // ============================================
  // PROTECT DESIGNER ROUTES - DESIGNER ONLY
  // ============================================
  if (isDesignerRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    if (userRole !== "DESIGNER") {
      // Admins should use admin panel, not designer panel
      if (userRole === "ADMIN") {
        return NextResponse.redirect(new URL("/admin", nextUrl));
      }
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
    return NextResponse.next();
  }

  // ============================================
  // PROTECT DASHBOARD ROUTES (for clients)
  // ============================================
  if (isDashboardRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    return NextResponse.next();
  }

  // ============================================
  // DEFAULT: REQUIRE LOGIN
  // ============================================
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
