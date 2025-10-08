import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth();

  if (!session) {
    redirect("/signin");
  }

  if (session.user.role === "ADMIN") {
    redirect("/admin/dashboard");
  } else {
    redirect(`/owner/restaurants/${session.user.restaurantId}/dashboard`);
  }

  return null; // ensure component returns something (even if redirect happens)
}
