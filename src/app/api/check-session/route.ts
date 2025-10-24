import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const sessionData = await getServerSession(authOptions);

    const token = sessionData?.sessionToken;

    if (!token) {
      const res = NextResponse.redirect(new URL("/signin", req.url));
      res.cookies.set("next-auth.session-token", "", { maxAge: 0, path: "/" });
      res.cookies.set("__Secure-next-auth.session-token", "", {
        maxAge: 0,
        path: "/",
        secure: true,
        sameSite: "lax",
      });
      return res;
    }

    const session = await prisma.session.findUnique({
      where: { sessionToken: sessionData?.sessionToken },
    });
    if (
      !session ||
      (session?.expires && new Date(session?.expires) < new Date())
    ) {
      const res = NextResponse.redirect(new URL("/signin", req.url));
      res.cookies.set("next-auth.session-token", "", { maxAge: 0, path: "/" });
      res.cookies.set("__Secure-next-auth.session-token", "", {
        maxAge: 0,
        path: "/",
        secure: true,
        sameSite: "lax",
      });
      return res;
    }

    // Valid session → return JSON
    return NextResponse.json({
      valid: true,
    });
  } catch (error) {
    console.error("Error checking session:", error);
    return NextResponse.json(
      { valid: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
