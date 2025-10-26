import { authOptions } from "./auth";
import { prisma } from "./prisma";
import { UserRole } from "@prisma/client";
import { Permission } from "@/types";
import { getServerSession } from "next-auth";
import z from "zod";

export async function authorize(
  restaurantId: string,
  permissionKey: keyof Permission
): Promise<{ authorized: boolean; user: any; error?: string }> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return { authorized: false, user: null, error: "Unauthorized" };
    }

    const user = session.user;

    // Company Owner (ADMIN) has all permissions
    if(user?.status=="blocked" || user.status=="suspended"){
      return { authorized: false, user: null, error: user.status};
    }
    if (user.role === UserRole.ADMIN) {
      return { authorized: true, user };
    }

    // Restaurant Owner needs to check permissions
    if (user.role === UserRole.OWNER) {
      if (user.restaurantId !== restaurantId) {
        return {
          authorized: false,
          user,
          error: "Access denied to this restaurant",
        };
      }

      const restaurant = await prisma.restaurant.findUnique({
        where: { id: restaurantId },
        select: { permissions: true },
      });

      if (!restaurant) {
        return { authorized: false, user, error: "Restaurant not found" };
      }

      const permissions = restaurant.permissions as Permission;

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
  } catch (err: any) {
    console.error("Authorization error:", err);
    return {
      authorized: false,
      user: null,
      error: err?.message || "Unknown error",
    };
  }
}

export async function checkPermission(
  restaurantId: string,
  permissionKey: keyof Permission
): Promise<boolean> {
  try {
    const result = await authorize(restaurantId, permissionKey);
    return result.authorized;
  } catch (err) {
    console.error("checkPermission error:", err);
    return false;
  }
}

export async function getRestaurantPermissions(
  restaurantId: string
): Promise<Permission | null> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) return null;

    // Company Owner has all permissions
    if (session.user.role === UserRole.ADMIN) {
      return {
        "menu.create": true,
        "menu.read": true,
        "menu.update": true,
        "menu.schedule": true,
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
  } catch (err) {
    console.error("getRestaurantPermissions error:", err);
    return null;
  }
}

export const DEFAULT_PERMISSIONS = {
  "menu.create": false,
  "menu.read": true,
  "menu.update": false,
  "menu.schedule": false,
  "menu.delete": false,
  "menu.customize": false,
  "table.create": false,
  "table.read": true,
  "table.update": false,
  "table.delete": false,
  "qrcode.generate": false,
  "qrcode.read": false,
  "qrcode.update": false,
  "qrcode.delete": false,
  "order.create": false,
  "order.read": true,
  "order.update": false,
  "invoice.generate": false,
  "invoice.download": false,
  "analytics.view": false,
  "staff.manage": false,
  "settings.update": false,
  "media.upload": false,
  "media.read": false,
  "media.delete": false,
};
export const Z_PERMISSION = z.object({
  "menu.create": z.boolean().optional(),
  "menu.read": z.boolean().optional(),
  "menu.schedule": z.boolean().optional(),
  "menu.update": z.boolean().optional(),
  "menu.delete": z.boolean().optional(),
  "menu.customize": z.boolean().optional(),
  "table.create": z.boolean().optional(),
  "table.read": z.boolean().optional(),
  "table.update": z.boolean().optional(),
  "table.delete": z.boolean().optional(),
  "qrcode.generate": z.boolean().optional(),
  "qrcode.read": z.boolean().optional(),
  "qrcode.update": z.boolean().optional(),
  "qrcode.delete": z.boolean().optional(),
  "order.create": z.boolean().optional(),
  "order.read": z.boolean().optional(),
  "order.update": z.boolean().optional(),
  "invoice.generate": z.boolean().optional(),
  "invoice.download": z.boolean().optional(),
  "analytics.view": z.boolean().optional(),
  "staff.manage": z.boolean().optional(),
  "settings.update": z.boolean().optional(),
  "media.upload": z.boolean().optional(),
  "media.read": z.boolean().optional(),
  "media.delete": z.boolean().optional(),
});
