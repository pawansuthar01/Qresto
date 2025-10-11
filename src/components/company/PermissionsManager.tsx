"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, ArrowLeft, CheckCircle, XCircle } from "lucide-react";

interface PermissionsManagerProps {
  restaurant: any;
  user: any;
}

const PERMISSION_GROUPS = {
  "Menu Management": [
    {
      key: "menu.create",
      label: "Create Menu Items",
      description: "Add new items to menu",
    },
    {
      key: "menu.read",
      label: "View Menu",
      description: "View menu items and categories",
    },
    {
      key: "menu.update",
      label: "Update Menu Items",
      description: "Edit existing menu items",
    },
    {
      key: "menu.delete",
      label: "Delete Menu Items",
      description: "Remove items from menu",
    },
    {
      key: "menu.customize",
      label: "Customize Theme",
      description: "Full menu theme customization",
    },
    {
      key: "menu.schedule",
      label: "Menu Scheduling",
      description: "Set time-based menus",
    },
  ],
  "Table Management": [
    {
      key: "table.create",
      label: "Create Tables",
      description: "Add new tables",
    },
    { key: "table.read", label: "View Tables", description: "View all tables" },
    {
      key: "table.update",
      label: "Update Tables",
      description: "Edit table details",
    },
    {
      key: "table.delete",
      label: "Delete Tables",
      description: "Remove tables",
    },
  ],
  "QR Code Management": [
    {
      key: "qrcode.generate",
      label: "Generate QR Codes",
      description: "Create QR codes for tables",
    },
    {
      key: "qrcode.read",
      label: "View QR Codes",
      description: "View existing QR codes",
    },
    {
      key: "qrcode.update",
      label: "Update QR Codes",
      description: "Regenerate QR codes",
    },
    {
      key: "qrcode.delete",
      label: "Delete QR Codes",
      description: "Remove QR codes",
    },
  ],
  "Order Management": [
    {
      key: "order.create",
      label: "Create Orders",
      description: "Enable guest ordering",
    },
    { key: "order.read", label: "View Orders", description: "View all orders" },
    {
      key: "order.update",
      label: "Update Orders",
      description: "Change order status",
    },
  ],
  "Documents & Media": [
    {
      key: "media.upload",
      label: "Upload Media",
      description: "Upload images and files",
    },
    {
      key: "document.manage",
      label: "Manage Documents",
      description: "Create and edit documents",
    },
  ],
  "Advanced Features": [
    {
      key: "invoice.generate",
      label: "Generate Invoices",
      description: "Create order invoices",
    },
    {
      key: "invoice.download",
      label: "Download Invoices",
      description: "Download invoice PDFs",
    },
    {
      key: "analytics.view",
      label: "View Analytics",
      description: "Access analytics dashboard",
    },
    {
      key: "staff.manage",
      label: "Manage Staff",
      description: "Add/remove staff members",
    },
    {
      key: "settings.update",
      label: "Update Settings",
      description: "Modify restaurant settings",
    },
  ],
};

export default function PermissionsManager({
  restaurant,
  user,
}: PermissionsManagerProps) {
  const router = useRouter();
  const [permissions, setPermissions] = useState<Record<string, boolean>>(
    restaurant.permissions || {}
  );
  const [loading, setLoading] = useState(false);

  const togglePermission = (key: string) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleGroup = (groupPermissions: any[], enable: boolean) => {
    const updates: Record<string, boolean> = {};
    groupPermissions.forEach((perm) => {
      updates[perm.key] = enable;
    });
    setPermissions((prev) => ({ ...prev, ...updates }));
  };

  const handleSave = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        `/api/company/restaurants/${restaurant.id}/permissions`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ permissions }),
        }
      );

      if (response.ok) {
        alert("Permissions updated successfully!");
        router.push("/company/dashboard");
      } else {
        alert("Failed to update permissions");
      }
    } catch (error) {
      console.error("Error updating permissions:", error);
      alert("Error updating permissions");
    } finally {
      setLoading(false);
    }
  };

  const enabledCount = Object.values(permissions).filter(Boolean).length;
  const totalCount = Object.keys(PERMISSION_GROUPS).reduce(
    (sum, group) =>
      sum + PERMISSION_GROUPS[group as keyof typeof PERMISSION_GROUPS].length,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={user} title="Permission Management" />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => router.push("/company/dashboard")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {restaurant.name}
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage permissions for restaurant owner
                </p>
              </div>
            </div>
          </div>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Saving..." : "Save Permissions"}
          </Button>
        </div>

        {/* Summary */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Permission Summary
                </h3>
                <p className="text-gray-600">
                  {enabledCount} of {totalCount} permissions enabled
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const allPerms: Record<string, boolean> = {};
                    Object.values(PERMISSION_GROUPS).forEach((group) => {
                      group.forEach((perm) => {
                        allPerms[perm.key] = true;
                      });
                    });
                    setPermissions(allPerms);
                  }}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Enable All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPermissions({})}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Disable All
                </Button>
              </div>
            </div>

            {/* Owner Info */}
            <div className="mt-4 pt-4 border-t">
              <h4 className="font-medium text-gray-900 mb-2">
                Restaurant Owner
              </h4>
              {restaurant.owners.map((owner: any) => (
                <div key={owner.id} className="text-sm text-gray-600">
                  {owner.name} ({owner.email})
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Permission Groups */}
        <div className="space-y-6">
          {Object.entries(PERMISSION_GROUPS).map(
            ([groupName, groupPermissions]) => {
              const groupEnabled = groupPermissions.filter(
                (p) => permissions[p.key]
              ).length;

              return (
                <Card key={groupName}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-3">
                        {groupName}
                        <span className="text-sm font-normal text-gray-600">
                          ({groupEnabled}/{groupPermissions.length} enabled)
                        </span>
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleGroup(groupPermissions, true)}
                        >
                          Enable All
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleGroup(groupPermissions, false)}
                        >
                          Disable All
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {groupPermissions.map((permission) => (
                        <label
                          key={permission.key}
                          className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            permissions[permission.key]
                              ? "border-blue-600 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={permissions[permission.key] || false}
                            onChange={() => togglePermission(permission.key)}
                            className="w-5 h-5 mt-0.5 rounded"
                          />
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">
                              {permission.label}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {permission.description}
                            </div>
                            <div className="text-xs text-gray-500 mt-1 font-mono">
                              {permission.key}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            }
          )}
        </div>

        {/* Save Button (Bottom) */}
        <div className="mt-8 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => router.push("/company/dashboard")}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading} size="lg">
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Saving..." : "Save Permissions"}
          </Button>
        </div>
      </main>
    </div>
  );
}
