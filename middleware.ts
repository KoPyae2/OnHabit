import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // If user is authenticated and trying to access home/login, redirect to dashboard
    if (req.nextauth.token && (req.nextUrl.pathname === "/" || req.nextUrl.pathname === "/home" || req.nextUrl.pathname === "/login")) {
      return NextResponse.redirect(new URL("/dashboard/today", req.url));
    }

    // If user is not authenticated and trying to access dashboard, redirect to home
    if (!req.nextauth.token && req.nextUrl.pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/home", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to public routes
        if (req.nextUrl.pathname === "/" || req.nextUrl.pathname === "/home" || req.nextUrl.pathname === "/login") {
          return true;
        }
        
        // Require authentication for dashboard routes
        if (req.nextUrl.pathname.startsWith("/dashboard")) {
          return !!token;
        }
        
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};