import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import PermissionsManager from "@/components/company/PermissionsManager";
import { getServerSession } from "next-auth";

export default async function PermissionsPage({
  params,
}: {
  params: { id: string };
}) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      redirect("/login");
    }
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: params.id },
      include: {
        owners: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!restaurant) {
      redirect("/company/dashboard");
    }

    return <PermissionsManager restaurant={restaurant} user={session.user} />;
  } catch (_) {
    throw Error("Something went wrong");
  }
}
