export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { getServerSession } from "next-auth";
import { AdminAnalytics } from "@/components/company/AdminAnalytics";

export default async function CompanyAnalytics() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      redirect("/login");
    }

    return <AdminAnalytics />;
  } catch (error: any) {
    throw new Error("Error fetching restaurants: " + error?.message);
  }
}
