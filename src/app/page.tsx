import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/signin");

  if (session.user.role === "ADMIN") {
    redirect("/admin/dashboard");
  } else {
    redirect(`/owner/restaurants/${session.user.restaurantId}/dashboard`);
  }

  return null;
}
