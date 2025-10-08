import { z } from "zod";

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
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens"
    ),
  address: z.string().optional(),
  phone: z.string().optional(),
  logo: z.string().url().optional(),
});

export const menuCategorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  sortOrder: z.number().int().min(0).default(0),
});

export const menuItemSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  image: z.string().url().optional(),
  categoryId: z.string().cuid(),
  available: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
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
