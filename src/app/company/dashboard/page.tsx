import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import CompanyDashboard from "@/components/company/CompanyDashboard";
import { getServerSession } from "next-auth";

export default async function CompanyDashboardPage() {
  const session = await getServerSession(authOptions);

  if (
    !session?.user ||
    !session.sessionToken ||
    session.user.role !== UserRole.ADMIN
  ) {
    return redirect("/signin");
  }

  // Return the dashboard with props
  return <CompanyDashboard />;
}
