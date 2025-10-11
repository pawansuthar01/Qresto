"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

interface CreateRestaurantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
];

export default function CreateRestaurantDialog({
  open,
  onOpenChange,
}: CreateRestaurantDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([
    "menu.read",
    "order.read",
    "order.create",
  ]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    ownerName: "",
    description: "",
    phone: "",
    address: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const permissions = Object.fromEntries(
        ALL_PERMISSIONS.map((p) => [p, selectedPermissions.includes(p)])
      );

      const response = await fetch("/api/company/restaurants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, permissions }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create restaurant");
      }

      router.refresh();
      onOpenChange(false);
      setFormData({
        name: "",
        email: "",
        password: "",
        ownerName: "",
        description: "",
        phone: "",
        address: "",
      });
      setSelectedPermissions(["menu.read", "order.read", "order.create"]);
    } catch (err: any) {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Restaurant</DialogTitle>
          <DialogDescription>
            Add a new restaurant and create an owner account
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
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="My Restaurant"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="Street, City"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Fine dining experience..."
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Owner Account</h3>

            <div className="space-y-2">
              <Label htmlFor="ownerName">Owner Name *</Label>
              <Input
                id="ownerName"
                value={formData.ownerName}
                onChange={(e) =>
                  setFormData({ ...formData, ownerName: e.target.value })
                }
                placeholder="John Doe"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="owner@restaurant.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Min 8 characters"
                minLength={8}
                required
              />
            </div>
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
