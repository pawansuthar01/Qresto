"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { generateSlug, isValidEmail, isValidNumber } from "@/lib/utils";
import { toast } from "../ui/use-toast";

interface CreateRestaurantDialogProps {
  open: boolean;
  onUsers?: (owner: any) => void;
  onRestaurant?: (restaurant: any) => void;
  onOpenChange: (open: boolean) => void;
  onRegister?: () => void;
  registerEmail?: string | null;
}

const ALL_PERMISSIONS = [
  "menu.create",
  "menu.read",
  "menu.update",
  "menu.delete",
  "menu.customize",
  "table.create",
  "table.read",
  "table.update",
  "table.delete",
  "qrcode.generate",
  "qrcode.read",
  "qrcode.update",
  "qrcode.delete",
  "order.create",
  "order.read",
  "order.update",
  "invoice.generate",
  "invoice.download",
  "analytics.view",
  "staff.manage",
  "settings.update",
  "media.upload",
  "media.read",
  "media.delete",
];

export default function CreateRestaurantDialog({
  open,
  onOpenChange,
  onRegister,
  registerEmail,
  onUsers,
  onRestaurant,
}: CreateRestaurantDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([
    "menu.read",
    "order.read",
    "media.read",
    "order.create",
  ]);

  const [formData, setFormData] = useState({
    restaurant: {
      name: "",
      email: "",
      logoUrl: "",
      slug: "",
      coverUrl: "",
      description: "",
      phone: "",
      address: "",
    },
    owner: {
      email: "",
      password: "",
      image: "",
      name: "",
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const permissions = Object.fromEntries(
        ALL_PERMISSIONS.map((p) => [p, selectedPermissions.includes(p)])
      );
      if (formData.restaurant.name.length > 20) {
        setError("restaurant name is 20 char max.. length");
        setLoading(false);
        toast({
          title: "type Error..",
          description: "restaurant name is 20 char max.. length",
          variant: "destructive",
        });
        return;
      }
      if (formData.owner.name.length > 12) {
        setError("owner name is 12 char max.. length");
        setLoading(false);
        toast({
          title: "type Error..",
          description: "owner name is 12 char max.. length",
          variant: "destructive",
        });
        return;
      }

      if (!isValidEmail(formData.restaurant?.email)) {
        setLoading(false);
        toast({
          title: "Type Error",
          description: "please enter valid restaurant email address",
          variant: "destructive",
        });
        return;
      }
      if (!isValidEmail(formData.owner?.email)) {
        setLoading(false);
        toast({
          title: "Type Error",
          description: "please enter valid owner email address",
          variant: "destructive",
        });
        return;
      }
      if (!isValidNumber(formData.restaurant?.phone)) {
        setLoading(false);
        toast({
          title: "Type Error",
          description: "please enter valid phone number",
          variant: "destructive",
        });
        return;
      }
      const response = await fetch("/api/company/restaurants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, permissions }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to create restaurant");
      }
      toast({
        title: "successfully..",
        description: data?.message || "account create success...",
        variant: "default",
      });
      onOpenChange(false);
      onUsers?.(data.owner);
      onRestaurant?.(data.restaurant);
      setFormData({
        restaurant: {
          name: "",
          email: "",
          slug: "",
          logoUrl: "",
          coverUrl: "",
          description: "",
          phone: "",
          address: "",
        },
        owner: {
          email: "",
          password: "",
          image: "",
          name: "",
        },
      });
      setSelectedPermissions(["menu.read", "order.read", "order.create"]);
    } catch (err: any) {
      toast({
        title: "Register Error",
        description: err.message,
        variant: "destructive",
      });
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (permission: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };
  useEffect(() => {
    if (registerEmail) {
      setFormData({
        ...formData,
        owner: { ...formData.owner, email: registerEmail },
      });
    }
  }, [onRegister, registerEmail]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Restaurant</DialogTitle>
          <DialogDescription>
            {registerEmail
              ? "setup restaurant "
              : " Add a new restaurant and create an owner account"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Restaurant Details</h3>

            <div className="space-y-2">
              <Label htmlFor="name">Restaurant Name *</Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.restaurant.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    restaurant: {
                      ...formData.restaurant,
                      name: e.target.value,
                      slug: generateSlug(e.target.value),
                    },
                  })
                }
                placeholder="My Restaurant"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Restaurant slug *</Label>
              <Input
                id="slug"
                type="text"
                value={formData.restaurant.slug}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    restaurant: {
                      ...formData.restaurant,
                      slug: e.target.value,
                    },
                  })
                }
                placeholder="my-Restaurant"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Restaurant Email *</Label>
              <Input
                id="resto_Email"
                type="email"
                value={formData.restaurant.email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    restaurant: {
                      ...formData.restaurant,
                      email: e.target.value,
                    },
                  })
                }
                placeholder="restaurant@restaurant.com"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Logo Url</Label>
                <Input
                  id="logo"
                  type="url"
                  value={formData.restaurant.logoUrl}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      restaurant: {
                        ...formData.restaurant,
                        logoUrl: e.target.value,
                      },
                    })
                  }
                  placeholder="https://"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">coverUrl</Label>
                <Input
                  id="coverUrl"
                  type="url"
                  value={formData.restaurant.coverUrl}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      restaurant: {
                        ...formData.restaurant,
                        coverUrl: e.target.value,
                      },
                    })
                  }
                  placeholder="https://"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="number"
                  value={formData.restaurant.phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      restaurant: {
                        ...formData.restaurant,
                        phone: e.target.value,
                      },
                    })
                  }
                  placeholder="+91 98765 43210"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  type="text"
                  value={formData.restaurant.address}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      restaurant: {
                        ...formData.restaurant,
                        address: e.target.value,
                      },
                    })
                  }
                  placeholder="Street, City"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                type="text"
                value={formData.restaurant.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    restaurant: {
                      ...formData.restaurant,
                      description: e.target.value,
                    },
                  })
                }
                placeholder="Fine dining experience..."
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Owner Account</h3>

            {!registerEmail && (
              <div className="space-y-2">
                <Label htmlFor="ownerName">Owner Name *</Label>
                <Input
                  id="ownerName"
                  type="text"
                  value={formData.owner.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      owner: { ...formData.owner, name: e.target.value },
                    })
                  }
                  placeholder="John Doe"
                  required
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.owner.email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    owner: { ...formData.owner, email: e.target.value },
                  })
                }
                placeholder="owner@restaurant.com"
                required
              />
            </div>
            {!registerEmail && (
              <div className="space-y-2">
                <Label htmlFor="email">image *</Label>
                <Input
                  id="image"
                  type="url"
                  value={formData.owner.image}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      owner: { ...formData.owner, image: e.target.value },
                    })
                  }
                  placeholder="https://"
                  required
                />
              </div>
            )}
            {!registerEmail && (
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.owner.password}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      owner: { ...formData.owner, password: e.target.value },
                    })
                  }
                  placeholder="Min 8 characters"
                  minLength={8}
                  required
                />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Permissions</h3>
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto p-4 border rounded-lg">
              {ALL_PERMISSIONS.map((permission) => (
                <label
                  key={permission}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedPermissions.includes(permission)}
                    onChange={() => togglePermission(permission)}
                    className="rounded"
                  />
                  <span className="text-sm">{permission}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Restaurant"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
