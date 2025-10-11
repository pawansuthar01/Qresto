import { authOptions } from "./auth";
import { prisma } from "./prisma";
import { UserRole } from "@prisma/client";
import { Permission } from "@/types";
import { getServerSession } from "next-auth";

export async function authorize(
  restaurantId: string,
  permissionKey: keyof Permission
): Promise<{ authorized: boolean; user: any; error?: string }> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { authorized: false, user: null, error: "Unauthorized" };
  }

  const user = session.user;

  // Company Owner (ADMIN) has all permissions
  if (user.role === UserRole.ADMIN) {
    return { authorized: true, user };
  }

  // Restaurant Owner needs to check permissions
  if (user.role === UserRole.OWNER) {
    // Check if user belongs to this restaurant
    if (user.restaurantId !== restaurantId) {
      return {
        authorized: false,
        user,
        error: "Access denied to this restaurant",
      };
    }

    // Get restaurant permissions
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { permissions: true },
    });

    if (!restaurant) {
      return { authorized: false, user, error: "Restaurant not found" };
    }

    const permissions = restaurant.permissions as Permission;

    // Check if user has the required permission
    if (!permissions[permissionKey]) {
      return {
        authorized: false,
        user,
        error: `Permission denied: ${permissionKey}`,
      };
    }

    return { authorized: true, user };
  }

  return { authorized: false, user, error: "Invalid role" };
}

export async function checkPermission(
  restaurantId: string,
  permissionKey: keyof Permission
): Promise<boolean> {
  const result = await authorize(restaurantId, permissionKey);
  return result.authorized;
}

export async function getRestaurantPermissions(
  restaurantId: string
): Promise<Permission | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return null;
  }

  // Company Owner has all permissions
  if (session.user.role === UserRole.ADMIN) {
    return {
      "menu.create": true,
      "menu.read": true,
      "menu.update": true,
      "menu.delete": true,
      "menu.customize": true,
      "table.create": true,
      "table.read": true,
      "table.update": true,
      "table.delete": true,
      "qrcode.generate": true,
      "qrcode.read": true,
      "qrcode.update": true,
      "qrcode.delete": true,
      "order.create": true,
      "order.read": true,
      "order.update": true,
      "invoice.generate": true,
      "invoice.download": true,
      "analytics.view": true,
      "staff.manage": true,
      "settings.update": true,
      "media.upload": true,
    };
  }

  // Restaurant Owner gets assigned permissions
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: { permissions: true },
  });

  return restaurant ? (restaurant.permissions as Permission) : null;
}
