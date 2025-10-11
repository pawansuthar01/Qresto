import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/permissions";

export async function GET(
  req: NextRequest,
  { params }: { params: { restaurantId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: params.restaurantId },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    const permissions = restaurant.permissions as any;
    authorize(session.user.role, permissions, "analytics.view");

    // Get date range from query params (default: last 30 days)
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "30");
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [
      totalOrders,
      totalRevenue,
      avgOrderValue,
      topItems,
      recentOrders,
      ordersByStatus,
      ordersByDay,
      uniqueCustomers,
      avgItemsPerOrder,
    ] = await Promise.all([
      // Total orders count
      prisma.order.count({
        where: {
          restaurantId: params.restaurantId,
          createdAt: { gte: startDate },
        },
      }),

      // Total revenue
      prisma.order.aggregate({
        where: {
          restaurantId: params.restaurantId,
          status: { not: "CANCELLED" },
          createdAt: { gte: startDate },
        },
        _sum: { total: true },
      }),

      // Average order value
      prisma.order.aggregate({
        where: {
          restaurantId: params.restaurantId,
          status: { not: "CANCELLED" },
          createdAt: { gte: startDate },
        },
        _avg: { total: true },
      }),

      // Top selling items
      prisma.orderItem.groupBy({
        by: ["menuItemId"],
        where: {
          order: {
            restaurantId: params.restaurantId,
            status: { not: "CANCELLED" },
            createdAt: { gte: startDate },
          },
        },
        _sum: { quantity: true, price: true },
        _count: true,
        orderBy: { _sum: { quantity: "desc" } },
        take: 10,
      }),

      // Recent orders
      prisma.order.findMany({
        where: {
          restaurantId: params.restaurantId,
          createdAt: { gte: startDate },
        },
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          table: true,
          items: {
            include: { menuItem: true },
          },
        },
      }),

      // Orders by status
      prisma.order.groupBy({
        by: ["status"],
        where: {
          restaurantId: params.restaurantId,
          createdAt: { gte: startDate },
        },
        _count: true,
      }),

      // Orders by day (for charts)
      prisma.order.findMany({
        where: {
          restaurantId: params.restaurantId,
          status: { not: "CANCELLED" },
          createdAt: { gte: startDate },
        },
        select: {
          createdAt: true,
          total: true,
        },
        orderBy: { createdAt: "asc" },
      }),

      // Unique customers
      prisma.order.findMany({
        where: {
          restaurantId: params.restaurantId,
          createdAt: { gte: startDate },
          customerName: { not: null },
        },
        distinct: ["customerName"],
        select: { customerName: true },
      }),

      // Average items per order
      prisma.orderItem.groupBy({
        by: ["orderId"],
        where: {
          order: {
            restaurantId: params.restaurantId,
            createdAt: { gte: startDate },
          },
        },
        _sum: { quantity: true },
      }),
    ]);

    // Fetch menu item details for top items
    const menuItemIds = topItems.map((item: any) => item.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: menuItemIds } },
      include: { category: true },
    });

    const topItemsWithDetails = topItems.map((item: any) => {
      const menuItem = menuItems.find((mi: any) => mi.id === item.menuItemId);
      return {
        ...item,
        menuItem,
        revenue: item._sum.price || 0,
      };
    });

    // Calculate average items per order
    const avgItems =
      avgItemsPerOrder.length > 0
        ? avgItemsPerOrder.reduce(
            (sum: any, o: any) => sum + (o._sum.quantity || 0),
            0
          ) / avgItemsPerOrder.length
        : 0;

    return NextResponse.json({
      summary: {
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        avgOrderValue: avgOrderValue._avg.total || 0,
        uniqueCustomers: uniqueCustomers.length,
        avgItemsPerOrder: avgItems,
        period: `Last ${days} days`,
      },
      topItems: topItemsWithDetails,
      recentOrders,
      ordersByStatus,
      ordersByDay,
    });
  } catch (error: any) {
    console.error("Error fetching analytics:", error);
    if (error.message?.includes("Permission denied")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
