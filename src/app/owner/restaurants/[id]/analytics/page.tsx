import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { getRestaurantPermissions } from "@/lib/permissions";
import AnalyticsDashboard from "@/components/owner/AnalyticsDashboard";
import { getServerSession } from "next-auth";

export default async function AnalyticsPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (
    session.user.role === UserRole.OWNER &&
    session.user.restaurantId !== params.id
  ) {
    redirect("/login");
  }

  const permissions = await getRestaurantPermissions(params.id);

  if (!permissions?.["analytics.view"]) {
    redirect(`/owner/restaurants/${params.id}/dashboard`);
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: params.id },
    select: { id: true, name: true },
  });

  // Get analytics data
  const orders = await prisma.order.findMany({
    where: {
      restaurantId: params.id,
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      },
    },
    include: {
      items: {
        include: {
          menuItem: true,
        },
      },
      table: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const menuItems = await prisma.menuItem.findMany({
    where: { restaurantId: params.id },
    select: {
      id: true,
      name: true,
      price: true,
      orderCount: true,
    },
  });

  if (!restaurant) {
    redirect("/login");
  }

  return (
    <AnalyticsDashboard
      restaurant={restaurant}
      orders={orders}
      menuItems={menuItems}
      user={session.user}
    />
  );
}
