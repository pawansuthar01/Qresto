import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import CompanyAdminDashboard from "@/components/admin/CompanyAdminDashboard";
import { getServerSession } from "next-auth";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== UserRole.SUPER_ADMIN) {
    redirect("/login");
  }

  // Get all company pages
  const pages = await prisma.companyPage.findMany({
    orderBy: { updatedAt: "desc" },
  });

  // Get statistics
  const stats = {
    totalPages: pages.length,
    publishedPages: pages.filter((p) => p.isPublished).length,
    totalRestaurants: await prisma.restaurant.count(),
    activeRestaurants: await prisma.restaurant.count({
      where: { status: "active" },
    }),
  };

  return (
    <CompanyAdminDashboard pages={pages} stats={stats} user={session.user} />
  );
}
