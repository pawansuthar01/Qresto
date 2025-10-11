import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { getRestaurantPermissions } from "@/lib/permissions";
import MenuThemeCustomizer from "@/components/owner/MenuThemeCustomizer";
import { getServerSession } from "next-auth";

export default async function MenuThemePage({
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

  if (!permissions?.["menu.customize"]) {
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

  if (!restaurant) {
    redirect("/login");
  }

  return <MenuThemeCustomizer restaurant={restaurant} user={session.user} />;
}
