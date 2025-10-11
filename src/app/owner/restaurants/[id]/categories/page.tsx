import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { getRestaurantPermissions } from "@/lib/permissions";
import CategoriesManager from "@/components/owner/CategoriesManager";
import { getServerSession } from "next-auth";

export default async function CategoriesPage({
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

  if (!permissions?.["menu.read"]) {
    redirect(`/owner/restaurants/${params.id}/dashboard`);
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: params.id },
    select: { id: true, name: true },
  });

  const categories = await prisma.menuCategory.findMany({
    where: { restaurantId: params.id },
    include: {
      _count: {
        select: { items: true },
      },
    },
    orderBy: { displayOrder: "asc" },
  });

  if (!restaurant) {
    redirect("/login");
  }

  return (
    <CategoriesManager
      restaurant={restaurant}
      categories={categories}
      permissions={permissions}
      user={session.user}
    />
  );
}
