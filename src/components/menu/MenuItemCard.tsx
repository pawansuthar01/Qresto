"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useDeleteMenuItem } from "@/hooks/useMenu";
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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
              <Button size="sm" variant="outline" className="flex-1">
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
    </>
  );
}
