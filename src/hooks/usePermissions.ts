import { useSession } from "next-auth/react";
import { Permission, hasPermission } from "@/lib/permissions";

export function usePermissions(restaurantPermissions?: any) {
  const { data: session } = useSession();

  const checkPermission = (permission: Permission): boolean => {
    if (!session?.user) return false;
    if (!restaurantPermissions) return false;

    return hasPermission(session.user.role, restaurantPermissions, permission);
  };

  return {
    user: session?.user,
    hasPermission: checkPermission,
    isAdmin: session?.user?.role === "ADMIN",
    isOwner: session?.user?.role === "OWNER",
  };
}
