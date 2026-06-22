import { useSession } from "next-auth/react";
import { Permission } from "@/types";

export function usePermissions(restaurantPermissions?: Permission) {
  const { data: session, status } = useSession();
  const user = session?.user;

  const hasPermission = (permission: keyof Permission): boolean => {
    if (!user) return false;

    // Admin roles have all permissions
    if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") return true;

    // If no permissions provided for restaurant, block
    if (!restaurantPermissions) return false;

    // Check if permission exists and is true
    return Boolean(restaurantPermissions[permission]);
  };

  return {
    user,
    hasPermission,
    isSessionLoading: status === "loading",
    isAdmin: user?.role === "ADMIN" || user?.role === "SUPER_ADMIN",
    isOwner: user?.role === "OWNER",
  };
}
