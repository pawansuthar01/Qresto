import { UserRole } from "@prisma/client";

export type Permission =
  | "menu.create"
  | "menu.read"
  | "menu.update"
  | "menu.delete"
  | "menu.customize"
  | "table.create"
  | "table.read"
  | "table.update"
  | "table.delete"
  | "qrcode.generate"
  | "qrcode.read"
  | "qrcode.update"
  | "qrcode.delete"
  | "order.create"
  | "order.read"
  | "order.update"
  | "invoice.generate"
  | "invoice.download"
  | "analytics.view"
  | "staff.manage"
  | "settings.update"
  | "media.upload";

export interface PermissionSet {
  [key: string]: boolean;
}

export const DEFAULT_PERMISSIONS: PermissionSet = {
  "menu.create": false,
  "menu.read": true,
  "menu.update": false,
  "menu.delete": false,
  "menu.customize": false,
  "table.create": false,
  "table.read": true,
  "table.update": false,
  "table.delete": false,
  "qrcode.generate": false,
  "qrcode.read": true,
  "qrcode.update": false,
  "qrcode.delete": false,
  "order.create": true,
  "order.read": true,
  "order.update": false,
  "invoice.generate": false,
  "invoice.download": false,
  "analytics.view": false,
  "staff.manage": false,
  "settings.update": false,
  "media.upload": false,
};

export function hasPermission(
  userRole: UserRole,
  restaurantPermissions: PermissionSet,
  permission: Permission
): boolean {
  // Admin has all permissions
  if (userRole === "ADMIN") return true;

  // Owner permissions based on restaurant settings
  return restaurantPermissions[permission] === true;
}

export function authorize(
  userRole: UserRole,
  restaurantPermissions: PermissionSet,
  permission: Permission
): void {
  if (!hasPermission(userRole, restaurantPermissions, permission)) {
    throw new Error(`Permission denied: ${permission}`);
  }
}
