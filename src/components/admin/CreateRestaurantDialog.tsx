"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import bcrypt from "bcryptjs";

interface CreateRestaurantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ownerData: string | null; // email if existing owner is passed
}

// Base restaurant schema
const restaurantBaseSchema = z.object({
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
  logo: z.string().url().optional().or(z.literal("")),
});

// Conditional owner schema
const ownerRequiredSchema = z.object({
  ownerName: z.string().min(2, "Owner name must be at least 2 characters"),
  ownerEmail: z.string().email("Invalid email address"),
  ownerPassword: z.string().min(8, "Password must be at least 8 characters"),
});

const ownerExistingSchema = z.object({
  ownerName: z.string().optional(),
  ownerEmail: z.string().email("Invalid email address"),
  ownerPassword: z.string().optional(),
});

export function CreateRestaurantDialog({
  open,
  onOpenChange,
  ownerData,
}: CreateRestaurantDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Use dynamic Zod schema depending on ownerData
  const formSchema = ownerData
    ? restaurantBaseSchema.merge(ownerExistingSchema)
    : restaurantBaseSchema.merge(ownerRequiredSchema);

  type RestaurantFormData = z.infer<typeof formSchema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RestaurantFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: ownerData ? { ownerEmail: ownerData } : {},
  });

  const onSubmit = async (data: RestaurantFormData) => {
    setIsLoading(true);
    try {
      const hashedPassword =
        data.ownerPassword && data.ownerPassword.length >= 8
          ? await bcrypt.hash(data.ownerPassword, 10)
          : null;

      const res = await fetch("/api/admin/restaurants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurant: {
            name: data.name,
            slug: data.slug,
            address: data.address,
            phone: data.phone,
            logo: data.logo || null,
          },
          owner: {
            name: data.ownerName,
            email: data.ownerEmail,
            password: hashedPassword,
          },
        }),
      });

      const result = await res.json();

      if (!res.ok)
        throw new Error(result.message || "Failed to create restaurant");

      toast({
        title: "✅ Success",
        description: `Restaurant "${data.name}" created successfully.`,
      });

      if (!ownerData && data.ownerEmail && data.ownerPassword) {
        toast({
          title: "Owner Credentials",
          description: `Email: ${data.ownerEmail} | Password: ${data.ownerPassword}`,
          duration: 10000,
        });
      }

      reset();
      onOpenChange(false);
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create restaurant",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Restaurant & Owner</DialogTitle>
          <DialogDescription>
            Add a restaurant and owner account in one step (or link an existing
            owner)
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Tabs defaultValue="restaurant" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="restaurant">Restaurant Details</TabsTrigger>
              <TabsTrigger value="owner">Owner Account</TabsTrigger>
            </TabsList>

            {/* Restaurant Info */}
            <TabsContent value="restaurant" className="space-y-4 mt-4">
              <div>
                <Label>Restaurant Name *</Label>
                <Input
                  {...register("name")}
                  placeholder="My Restaurant"
                  disabled={isLoading}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <Label>Slug *</Label>
                <Input
                  {...register("slug")}
                  placeholder="my-restaurant"
                  disabled={isLoading}
                />
                {errors.slug && (
                  <p className="text-sm text-destructive">
                    {errors.slug.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Used in QR URLs: yoursite.com/q/[slug]
                </p>
              </div>

              <div>
                <Label>Address</Label>
                <Input
                  {...register("address")}
                  placeholder="123 Main St"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label>Phone</Label>
                <Input
                  {...register("phone")}
                  placeholder="+91 98765 43210"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label>Logo URL</Label>
                <Input
                  {...register("logo")}
                  placeholder="https://example.com/logo.png"
                  disabled={isLoading}
                />
              </div>
            </TabsContent>

            {/* Owner Info */}
            <TabsContent value="owner" className="space-y-4 mt-4">
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <p className="text-sm font-medium">Owner Account</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {ownerData
                    ? "Existing owner will be linked to this restaurant"
                    : "Enter new owner credentials"}
                </p>
              </div>

              {!ownerData && (
                <div>
                  <Label>Owner Name *</Label>
                  <Input
                    {...register("ownerName")}
                    placeholder="John Doe"
                    disabled={isLoading}
                  />
                  {errors.ownerName && (
                    <p className="text-sm text-destructive">
                      {errors.ownerName.message}
                    </p>
                  )}
                </div>
              )}

              <div>
                <Label>Owner Email *</Label>
                <Input
                  {...register("ownerEmail")}
                  type="email"
                  placeholder="owner@restaurant.com"
                  disabled={!!ownerData || isLoading}
                  value={ownerData || undefined}
                />
                {errors.ownerEmail && (
                  <p className="text-sm text-destructive">
                    {errors.ownerEmail.message}
                  </p>
                )}
              </div>

              {!ownerData && (
                <div>
                  <Label>Password *</Label>
                  <Input
                    {...register("ownerPassword")}
                    type="password"
                    placeholder="••••••••"
                    disabled={isLoading}
                  />
                  {errors.ownerPassword && (
                    <p className="text-sm text-destructive">
                      {errors.ownerPassword.message}
                    </p>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Restaurant"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
