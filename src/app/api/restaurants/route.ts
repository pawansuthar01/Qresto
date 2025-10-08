import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { restaurantSchema } from "@/lib/validations";
import { DEFAULT_PERMISSIONS } from "@/lib/permissions";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Admin can see all restaurants, Owner sees only their restaurant
    const where =
      session.user.role === "ADMIN" ? {} : { id: session.user.restaurantId! };

    const restaurants = await prisma.restaurant.findMany({
      where,
      include: {
        users: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
        _count: {
          select: {
            categories: true,
            tables: true,
            orders: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(restaurants);
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    console.log(body);
    const validatedData = restaurantSchema.parse(body);

    const restaurant = await prisma.restaurant.create({
      data: {
        ...validatedData,
        permissions: DEFAULT_PERMISSIONS,
        customization: {},
      },
    });

    return NextResponse.json(restaurant, { status: 201 });
  } catch (error) {
    console.error("Error creating restaurant:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// export async function POST(req: NextRequest) {
//   try {
//     const session = await getServerSession(authOptions);

//     // Only ADMIN (Company Owner) can create restaurants
//     if (!session?.user || session.user.role !== "ADMIN") {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
//     }

//     const body = await req.json();
//     const validatedData = restaurantSchema.parse(body);

//     const { email, ...restaurantData } = validatedData;

//     // Check if ownerEmail provided
//     if (!ownerEmail) {
//       return NextResponse.json(
//         { error: "Owner email is required" },
//         { status: 400 }
//       );
//     }

//     // Find user with that email
//     const existingUser = await prisma.user.findUnique({
//       where: { email: ownerEmail },
//     });

//     // If user exists but already linked to another restaurant → error
//     if (existingUser && existingUser.restaurantId) {
//       return NextResponse.json(
//         {
//           error: `User with email ${ownerEmail} is already linked to another restaurant.`,
//         },
//         { status: 400 }
//       );
//     }

//     // Create restaurant
//     const restaurant = await prisma.restaurant.create({
//       data: {
//         ...restaurantData,
//         permissions: DEFAULT_PERMISSIONS,
//         customization: {},
//       },
//     });

//     // If user exists and not linked → update their restaurantId
//     if (existingUser) {
//       await prisma.user.update({
//         where: { email: ownerEmail },
//         data: { restaurantId: restaurant.id, role: "OWNER" },
//       });
//     } else {
//       // Optionally, auto-create a user for this restaurant
//       await prisma.user.create({
//         data: {
//           email: ownerEmail,
//           role: "OWNER",
//           restaurantId: restaurant.id,
//           name: restaurantData.name || "Restaurant Owner",
//           password: null, // will set later or via invite link
//         },
//       });
//     }

//     return NextResponse.json(restaurant, { status: 201 });
//   } catch (error: any) {
//     console.error("Error creating restaurant:", error);

//     if (error.name === "ZodError") {
//       return NextResponse.json(
//         { error: error.errors.map((e: any) => e.message).join(", ") },
//         { status: 400 }
//       );
//     }

//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }
