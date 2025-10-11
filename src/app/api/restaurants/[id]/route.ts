import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("Fetching restaurant with ID:", params.id);
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: params.id },
      include: {
        users: { select: { id: true, name: true, email: true, role: true } },
        categories: { include: { items: true }, orderBy: { sortOrder: "asc" } },
        tables: { include: { qrCode: true }, orderBy: { number: "asc" } },
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
      { error: "Internal server error" },
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

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Admin can update anything, Owner can update settings if allowed
    if (session.user.role !== "ADMIN") {
      if (session.user.restaurantId !== params.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const restaurant = await prisma.restaurant.findUnique({
        where: { id: params.id },
      });

      const permissions = restaurant?.permissions as any;
      if (!permissions["settings.update"]) {
        return NextResponse.json(
          { error: "Permission denied" },
          { status: 403 }
        );
      }

      // Owner cannot update permissions
      delete body.permissions;
    }

    const restaurant = await prisma.restaurant.update({
      where: { id: params.id },
      data: body,
    });

    return NextResponse.json(restaurant);
  } catch (error) {
    console.error("Error updating restaurant:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
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
    const { name, slug, address, phone, ownerId } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 }
      );
    }

    const restaurant = await prisma.restaurant.create({
      data: {
        name,
        slug,
        address,
        phone,
        users: {
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
