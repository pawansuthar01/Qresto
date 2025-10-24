import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    if (!token || !token.sessionToken) {
      return NextResponse.redirect(new URL("/signin", req.url));
    }
    if (token?.status === "suspended") {
      return NextResponse.redirect(new URL("/suspended", req.url));
    }

    if (token?.status === "blocked") {
      return NextResponse.redirect(new URL("/blocked", req.url));
    }

    if (req.nextUrl.pathname.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    return NextResponse.next();
  },
  {
    secret: process.env.NEXTAUTH_SECRET,

    callbacks: {
      authorized: ({ token }) => {
        return !!token && !!token.role && !!token.status;
      },
    },
    pages: {
      signIn: "/signin",
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/owner/:path*",
    "/company/:path*",
    "/account/profile",
  ],
};
