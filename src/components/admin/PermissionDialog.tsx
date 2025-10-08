"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useUpdateRestaurant } from "@/hooks/useRestaurant";
import { Permission } from "@/lib/permissions";

interface PermissionDialogProps {
  restaurant: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PERMISSION_GROUPS = {
  "Menu Management": [
    { key: "menu.create", label: "Create Menu Items" },
    { key: "menu.read", label: "View Menu" },
    { key: "menu.update", label: "Update Menu Items" },
    { key: "menu.delete", label: "Delete Menu Items" },
    { key: "menu.customize", label: "Customize Menu Card Design" },
  ],
  "Table Management": [
    { key: "table.create", label: "Create Tables" },
    { key: "table.read", label: "View Tables" },
    { key: "table.update", label: "Update Tables" },
    { key: "table.delete", label: "Delete Tables" },
  ],
  "QR Code Management": [
    { key: "qrcode.generate", label: "Generate QR Codes" },
    { key: "qrcode.read", label: "View QR Codes" },
    { key: "qrcode.update", label: "Update QR Codes" },
    { key: "qrcode.delete", label: "Delete QR Codes" },
  ],
  "Order Management": [
    { key: "order.create", label: "Receive Orders" },
    { key: "order.read", label: "View Orders" },
    { key: "order.update", label: "Update Order Status" },
  ],
  Other: [
    { key: "invoice.generate", label: "Generate Invoices" },
    { key: "invoice.download", label: "Download Invoices" },
    { key: "analytics.view", label: "View Analytics" },
    { key: "staff.manage", label: "Manage Staff" },
    { key: "settings.update", label: "Update Settings" },
    { key: "media.upload", label: "Upload Media" },
  ],
};

export function PermissionDialog({
  restaurant,
  open,
  onOpenChange,
}: PermissionDialogProps) {
  const { toast } = useToast();
  const updateRestaurant = useUpdateRestaurant(restaurant.id);
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (restaurant?.permissions) {
      setPermissions(restaurant.permissions);
    }
  }, [restaurant]);

  const handleToggle = (key: string, checked: boolean) => {
    setPermissions((prev) => ({ ...prev, [key]: checked }));
  };

  const handleSave = async () => {
    try {
      await updateRestaurant.mutateAsync({ permissions });
      toast({
        title: "Success",
        description: "Permissions updated successfully",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update permissions",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Permissions - {restaurant.name}</DialogTitle>
          <DialogDescription>
            Control what features the restaurant owner can access
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {Object.entries(PERMISSION_GROUPS).map(([group, items]) => (
            <div key={group} className="space-y-3">
              <h3 className="font-semibold">{group}</h3>
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <Label htmlFor={item.key} className="cursor-pointer">
                      {item.label}
                    </Label>
                    <Switch
                      id={item.key}
                      checked={permissions[item.key] || false}
                      onCheckedChange={(checked) =>
                        handleToggle(item.key, checked)
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={updateRestaurant.isPending}>
            {updateRestaurant.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
