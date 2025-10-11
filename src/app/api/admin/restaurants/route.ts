import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DEFAULT_PERMISSIONS } from "@/lib/permissions";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Only ADMIN (Company Owner) can create restaurants
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { restaurant, owner } = body;

    // Validate input
    if (!restaurant?.name || !owner?.email) {
      return NextResponse.json(
        { message: "Restaurant details and owner email are required" },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingRestaurant = await prisma.restaurant.findUnique({
      where: { slug: restaurant.slug },
    });

    if (existingRestaurant) {
      return NextResponse.json(
        { message: "Slug already taken" },
        { status: 400 }
      );
    }

    // Find existing user by email
    const existingUser = await prisma.user.findUnique({
      where: { email: owner.email },
    });

    // If user exists and already linked to a restaurant → reject
    if (existingUser && existingUser.restaurantId) {
      return NextResponse.json(
        {
          message: `User with email ${owner.email} is already linked to another restaurant.`,
        },
        { status: 400 }
      );
    }

    // Create restaurant + handle user assignment in a transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Create restaurant
      const newRestaurant = await tx.restaurant.create({
        data: {
          name: restaurant.name,
          slug: restaurant.slug,
          address: restaurant.address,
          phone: restaurant.phone,
          logo: restaurant.logo,
          permissions: DEFAULT_PERMISSIONS,
          customization: {},
        },
      });

      // If existing user → link restaurantId and set role OWNER
      if (existingUser) {
        await tx.user.update({
          where: { email: owner.email },
          data: {
            restaurantId: newRestaurant.id,
            role: "OWNER",
          },
        });

        return { restaurant: newRestaurant, owner: existingUser };
      }

      // Otherwise, create a new user as OWNER
      const newOwner = await tx.user.create({
        data: {
          name: owner.name || "Restaurant Owner",
          email: owner.email,
          password: owner.password,
          role: "OWNER",
          restaurantId: newRestaurant.id,
        },
      });

      return { restaurant: newRestaurant, owner: newOwner };
    });

    return NextResponse.json(
      {
        message: existingUser
          ? "Existing user linked to restaurant successfully"
          : "Restaurant and owner created successfully",
        restaurant: result.restaurant,
        owner: {
          id: result.owner.id,
          email: result.owner.email,
          name: result.owner.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating restaurant:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
