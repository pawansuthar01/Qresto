import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadMedia } from "@/lib/cloudinary";
export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: params.id },
      include: {
        owners: { select: { id: true, name: true, email: true, role: true } },
        categories: {
          include: { items: true },
          orderBy: { displayOrder: "asc" },
        },
        tables: { include: { qrCodes: true }, orderBy: { number: "asc" } },
      },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    // Access check
    if (
      session.user.role !== "ADMIN" &&
      session.user.restaurantId !== params.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(restaurant);
  } catch (error) {
    console.error("Error fetching restaurant:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // 🔒 Auth check
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized access." },
        { status: 401 }
      );
    }

    const restaurantId = params.id;
    const body = await req.json();

    // ✅ Fetch existing restaurant
    const existingRestaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!existingRestaurant) {
      return NextResponse.json(
        { message: "Restaurant not found." },
        { status: 404 }
      );
    }

    const isAdmin = session.user.role === "ADMIN";
    const isOwner = session.user.restaurantId === restaurantId;

    // 🔐 Role-based restriction
    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { message: "Forbidden: No access." },
        { status: 403 }
      );
    }

    // 🧠 Always check for duplicate email (admin or owner)
    if (body.email) {
      const emailExists = await prisma.restaurant.findFirst({
        where: {
          email: body.email,
          NOT: { id: restaurantId },
        },
      });

      if (emailExists) {
        return NextResponse.json(
          {
            message:
              "This email address is already used by another restaurant.",
          },
          { status: 400 }
        );
      }
    }

    // 🛡️ Owner restriction
    if (!isAdmin) {
      const permissions = (existingRestaurant.permissions || {}) as Record<
        string,
        boolean
      >;
      if (!permissions["settings.update"]) {
        return NextResponse.json(
          { error: "Permission denied." },
          { status: 403 }
        );
      }

      delete body.permissions; // prevent permission escalation
    }

    // 🖼️ Handle logo upload
    if (body.logoUrl && !body.logoUrl.startsWith("https://")) {
      try {
        const imageUrl = await uploadMedia(body.logoUrl, {
          folder: "Qresto/users",
          width: 500,
          height: 500,
        });
        body.logoUrl = imageUrl;
      } catch (uploadError) {
        console.error("❌ Logo upload failed:", uploadError);
        return NextResponse.json(
          { message: "Failed to upload logo image." },
          { status: 500 }
        );
      }
    }

    // 💾 Safe update
    const updatedRestaurant = await prisma.restaurant.update({
      where: { id: restaurantId },
      data: body,
      include: {
        owners: { select: { id: true, name: true, email: true, role: true } },
        categories: {
          include: { items: true },
          orderBy: { displayOrder: "asc" },
        },
        tables: {
          include: { qrCodes: true },
          orderBy: { number: "asc" },
        },
      },
    });

    return NextResponse.json(updatedRestaurant, { status: 200 });
  } catch (error: any) {
    console.error("❌ Error updating restaurant:", error);

    if (error.code === "P2002") {
      // Prisma unique constraint
      return NextResponse.json(
        { message: "Duplicate entry: This email is already registered." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error. Please try again later." },
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

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.restaurant.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting restaurant:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, slug, address, phone, email, ownerId } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { message: "Name and slug are required" },
        { status: 400 }
      );
    }

    const restaurant = await prisma.restaurant.create({
      data: {
        name,
        slug,
        email,
        address,
        phone,
        owners: {
          connect: ownerId ? { id: ownerId } : undefined,
        },
      },
    });
    await prisma.user.update({
      where: { id: ownerId },
      data: { restaurantId: restaurant.id },
    });

    return NextResponse.json(restaurant);
  } catch (error: any) {
    console.error("Error creating restaurant:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
