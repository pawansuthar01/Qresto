"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useDeleteMenuItem, useUpdateMenuItem } from "@/hooks/useMenu";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface MenuItemCardProps {
  item: any;
  restaurantId: string;
  canUpdate: boolean;
  canDelete: boolean;
}

export function MenuItemCard({
  item,
  restaurantId,
  canUpdate,
  canDelete,
}: MenuItemCardProps) {
  const { toast } = useToast();
  const deleteMenuItem = useDeleteMenuItem(restaurantId);
  const updateMenuItem = useUpdateMenuItem(restaurantId);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: item.name,
    description: item.description || "",
    price: item.price,
    image: item.image || "",
    available: item.available,
  });

  const handleDelete = async () => {
    try {
      await deleteMenuItem.mutateAsync({ itemId: item.id, type: "item" });
      toast({
        title: "Success",
        description: "Menu item deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete menu item",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateMenuItem.mutateAsync({
        itemId: item.id,
        data: formData,
      });

      toast({
        title: "Updated Successfully",
        description: `"${formData.name}" has been updated.`,
      });

      setEditDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update menu item",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardContent className="p-4">
          {item.image && (
            <img
              src={item.image}
              alt={item.name}
              className="mb-3 h-40 w-full rounded-md object-cover"
            />
          )}
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold">{item.name}</h3>
              {!item.available && (
                <Badge variant="secondary">Unavailable</Badge>
              )}
            </div>
            {item.description && (
              <p className="text-sm text-muted-foreground">
                {item.description}
              </p>
            )}
            <p className="text-lg font-bold">{formatCurrency(item.price)}</p>
          </div>
        </CardContent>
        {(canUpdate || canDelete) && (
          <CardFooter className="flex gap-2 p-4 pt-0">
            {canUpdate && (
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => setEditDialogOpen(true)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}
            {canDelete && (
              <Button
                size="sm"
                variant="destructive"
                className="flex-1"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
          </CardFooter>
        )}
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{item.name}" from your menu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Menu Item</DialogTitle>
            <DialogDescription>
              Update the details of your menu item below.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: parseFloat(e.target.value) || 0,
                  })
                }
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                type="url"
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
                disabled={loading}
              />
            </div>

            <div className="flex items-center gap-2 mt-3">
              <input
                id="available"
                type="checkbox"
                checked={formData.available}
                onChange={(e) =>
                  setFormData({ ...formData, available: e.target.checked })
                }
                disabled={loading}
              />
              <Label htmlFor="available">Available</Label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
