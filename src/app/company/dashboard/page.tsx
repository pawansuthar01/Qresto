import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import CompanyDashboard from "@/components/company/CompanyDashboard";
import { getServerSession } from "next-auth";

export default async function CompanyDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    return redirect("/signin");
  }

  // Fetch restaurants with related owners and counts
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

  // Return the dashboard with props
  return <CompanyDashboard restaurants={restaurants} user={session.user} />;
}
