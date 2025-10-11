import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { AdminAnalytics } from "@/components/company/AdminAnalytics";

export default async function CompanyAnalytics() {
  const session = await getServerSession(authOptions);

  // Company Owner (ADMIN) can only create and manage restaurants
  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    redirect("/login");
  }

  const restaurants = await prisma.restaurant.findMany({
    include: {
      owners: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
      _count: {
        select: {
          items: true,
          tables: true,
          orders: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return <AdminAnalytics restaurants={restaurants} />;
}
