import { z } from "zod";
import { Z_PERMISSION } from "./permissions";

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const restaurantSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  ownerName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  slug: z.string().min(2, "Invalid slug address"),
  description: z.string().min(10, "description must be at least 10 characters"),
  password: z.string().min(8, "password must be at least 8 characters"),
  address: z.string().optional(),
  phone: z.string().optional(),
  logoUrl: z.string().url("Logo url is not found"),
  permission: Z_PERMISSION,
  coverUrl: z.string().url().optional(),
});

export const menuCategorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  sortOrder: z.number().int().min(0).default(0),
});

export const menuItemSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional().default(""),
  price: z.number().positive("Price must be positive"),

  discount: z.number().int().min(0).max(100).optional().default(0),
  imageUrl: z.string().url("Must be a valid URL").optional().default(""),
  isAvailable: z.boolean().default(true),
  isVegetarian: z.boolean().default(false),
  isVegan: z.boolean().default(false),
  isGlutenFree: z.boolean().default(false),
  spiceLevel: z.number().int().min(0).max(5).optional().default(0),
  displayOrder: z.number().int().min(0).default(0),

  // Enhanced metadata
  isPopular: z.boolean().default(false),
  isTrending: z.boolean().default(false),
  isNew: z.boolean().default(false),
  isChefSpecial: z.boolean().default(false),
  rating: z.number().min(0).max(5).optional().default(0),
  orderCount: z.number().int().min(0).default(0),
  prepTime: z.number().int().min(0).optional().default(10), // minutes

  categoryId: z.string().min(1, "Category is required"), // CUID check optional
  restaurantId: z.string().min(1, "Restaurant ID is required"),
});

export const tableSchema = z.object({
  number: z.string().min(1, "Table number is required"),
  capacity: z.number().int().positive().default(4),
});

export const orderSchema = z.object({
  tableId: z.string().cuid().optional(),
  items: z
    .array(
      z.object({
        menuItemId: z.string().cuid(),
        quantity: z.number().int().positive(),
        notes: z.string().optional(),
      })
    )
    .min(1, "Order must have at least one item"),
  customerName: z.string().optional(),
  notes: z.string().optional(),
});
