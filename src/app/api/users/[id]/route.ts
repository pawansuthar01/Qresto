import { authOptions } from "@/lib/auth";
import { uploadMedia } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("id:", params.id);
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body = await req.json();
    console.log(session);
    const imageUrl = await uploadMedia(body.image, {
      folder: "Qresto/users",
      width: 500,
      height: 500,
    });
    body.image = imageUrl;

    // Update user
    const updateUser = await prisma.user.update({
      where: { id: params.id },
      data: body,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        restaurantId: true,
        createdAt: true,
        status: true,
        restaurant: {
          select: {
            id: true,
            slug: true,
            name: true,
            status: true,
          },
        },
      },
    });

    // Conditional: if body.status exists, update restaurant status too
    if (body.status && updateUser.restaurant) {
      await prisma.restaurant.update({
        where: { id: updateUser.restaurant.id },
        data: body,
      });
    }

    return NextResponse.json(updateUser);
  } catch (error: any) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete user
    const deleteUser = await prisma.user.delete({
      where: { id: params.id },
    });

    return NextResponse.json(deleteUser);
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        role: true,
        name: true,
        email: true,
        status: true,
        createdAt: true,
        blockedAt: true,
        suspendedAt: true,
        restaurantId: true,
        image: true,
        reason: true,
      },
    });

    return NextResponse.json(user);
  } catch (error: any) {
    console.error("Error getting user:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
