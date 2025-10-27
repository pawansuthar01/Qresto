import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!params.id) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    const currentToken = session?.sessionToken;
    if (!session?.user || !currentToken) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Please sign in first." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { current, new: newPassword, confirm, otp, logout } = body;
    if (newPassword !== confirm) {
      return NextResponse.json(
        { error: "New password and confirm password does not match." },
        { status: 400 }
      );
    }
    const existingUser = await prisma.user.findUnique({
      where: params.id.includes("@") ? { email: params.id } : { id: params.id },
      select: {
        id: true,
        email: true,
        password: true,
        otp: true,
        otpExpiresAt: true,
      },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // 🔐 Restrict access (user can only update their own account unless admin)
    const isAdmin = session.user.role === "ADMIN";
    if (session.user.id !== params.id && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 🧩 Prepare update data
    const updateData: any = {};

    // ✅ Handle password update via current password
    if (current && newPassword) {
      const match = existingUser.password
        ? await bcrypt.compare(current, existingUser?.password)
        : true;
      if (!match) {
        return NextResponse.json(
          { error: "Incorrect current password." },
          { status: 400 }
        );
      }

      updateData.password = await hashPassword(newPassword);
    }

    // ✅ Handle password update via OTP
    else if (otp && newPassword) {
      if (!existingUser.otp || !existingUser.otpExpiresAt) {
        return NextResponse.json(
          { error: "No OTP found. Request a new one." },
          { status: 400 }
        );
      }

      const now = new Date();
      if (
        existingUser.otp !== otp ||
        new Date(existingUser.otpExpiresAt) < now
      ) {
        return NextResponse.json(
          { error: "Invalid or expired OTP." },
          { status: 400 }
        );
      }

      updateData.password = await hashPassword(newPassword);

      // Clear OTP after successful use
      updateData.otp = null;
      updateData.otpExpiresAt = null;
    }

    // 🚫 If trying to change password but missing required fields
    if (
      (current && !newPassword) ||
      (otp && !newPassword) ||
      (!otp && !current)
    ) {
      return NextResponse.json(
        { error: "Please provide a full details to update password." },
        { status: 400 }
      );
    }

    // 💾 Update user in DB
    const updatedUser = await prisma.user.update({
      where: params.id.includes("@") ? { email: params.id } : { id: params.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
      },
    });
    if (logout || otp) {
      // Delete all sessions including current
      await prisma.session.deleteMany({
        where: { userId: updatedUser.id },
      });
    } else if (currentToken) {
      // Delete all sessions except current
      await prisma.session.deleteMany({
        where: {
          userId: updatedUser.id,
          NOT: { sessionToken: currentToken },
        },
      });
    }

    let response;

    if (logout) {
      response = NextResponse.redirect(new URL("/signin", req.url));
      response.cookies.set("next-auth.session-token", "", {
        maxAge: 0,
        path: "/",
      });
      response.cookies.set("__Secure-next-auth.session-token", "", {
        maxAge: 0,
        path: "/",
        secure: true,
        sameSite: "lax",
      });
    } else {
      response = NextResponse.json({
        success: true,
        logout,
        message: "password updated successfully.",
        user: updatedUser,
      });
    }

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
