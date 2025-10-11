import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { getRestaurantPermissions } from "@/lib/permissions";
import { MenuList } from "@/components/menu/MenuList";
import { getServerSession } from "next-auth";

export default async function OwnerMenuPage({
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
    select: {
      id: true,
      name: true,
      customization: true,
    },
  });

  const categories = await prisma.menuCategory.findMany({
    where: { restaurantId: params.id },
    include: {
      items: {
        orderBy: { displayOrder: "asc" },
      },
      _count: {
        select: { items: true },
      },
    },
    orderBy: { displayOrder: "asc" },
  });

  if (!restaurant) {
    redirect("/login");
  }

  return <MenuList categories={categories} restaurantId={restaurant.id} />;
}
