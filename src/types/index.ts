import { UserRole, OrderStatus } from "@prisma/client";

export type { UserRole, OrderStatus };

export interface Permission {
  "menu.create"?: boolean;
  "menu.read"?: boolean;
  "menu.update"?: boolean;
  "menu.delete"?: boolean;
  "menu.customize"?: boolean;
  "table.create"?: boolean;
  "table.read"?: boolean;
  "table.update"?: boolean;
  "table.delete"?: boolean;
  "qrcode.generate"?: boolean;
  "qrcode.read"?: boolean;
  "qrcode.update"?: boolean;
  "qrcode.delete"?: boolean;
  "order.create"?: boolean;
  "order.read"?: boolean;
  "order.update"?: boolean;
  "invoice.generate"?: boolean;
  "invoice.download"?: boolean;
  "analytics.view"?: boolean;
  "staff.manage"?: boolean;
  "settings.update"?: boolean;
  "media.upload"?: boolean;
}

export interface Customization {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  layout: "grid" | "list";
  cardStyle?: "modern" | "classic" | "minimal";
  showImages?: boolean;
  showPrices?: boolean;
}

export interface RestaurantWithPermissions {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
  coverUrl?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  permissions: Permission;
  customization: Customization;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithRestaurant {
  id: string;
  email: string;
  name?: string | null;
  role: UserRole;
  image?: string | null;
  restaurantId?: string | null;
  restaurant?: RestaurantWithPermissions | null;
}

export interface MenuCategoryWithItems {
  id: string;
  name: string;
  description?: string | null;
  displayOrder: number;
  isActive: boolean;
  items: MenuItemType[];
}

export interface MenuItemType {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  isAvailable: boolean;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  spiceLevel?: number | null;
  displayOrder: number;
  categoryId: string;
}

export interface TableType {
  id: string;
  number: string;
  name?: string | null;
  capacity: number;
  isActive: boolean;
  restaurantId: string;
}

export interface QRCodeType {
  id: string;
  shortCode: string;
  dataUrl: string;
  isActive: boolean;
  scans: number;
  tableId: string;
  table: TableType;
}

export interface OrderType {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  notes?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  tableId: string;
  table: TableType;
  items: OrderItemType[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItemType {
  id: string;
  quantity: number;
  price: number;
  notes?: string | null;
  menuItem: MenuItemType;
}

export interface CartItem {
  menuItem: MenuItemType;
  quantity: number;
  notes?: string;
}
