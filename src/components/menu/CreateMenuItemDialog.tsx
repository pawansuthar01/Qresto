"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { menuCategorySchema, menuItemSchema } from "@/lib/validations";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useCreateMenuItem } from "@/hooks/useMenu";

interface CreateMenuItemDialogProps {
  restaurantId: string;
  categories: any[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateMenuItemDialog({
  restaurantId,
  categories,
  open,
  onOpenChange,
}: CreateMenuItemDialogProps) {
  const { toast } = useToast();
  const createMenuItem = useCreateMenuItem(restaurantId);
  const [itemType, setItemType] = useState<"category" | "item">("category");

  const categoryForm = useForm({
    resolver: zodResolver(menuCategorySchema),
  });

  const itemForm = useForm({
    resolver: zodResolver(menuItemSchema),
  });

  const onSubmitCategory = async (data: any) => {
    try {
      await createMenuItem.mutateAsync({ type: "category", ...data });
      toast({
        title: "Success",
        description: "Category created successfully",
      });
      categoryForm.reset();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create category",
        variant: "destructive",
      });
    }
  };

  const onSubmitItem = async (data: any) => {
    try {
      await createMenuItem.mutateAsync({ type: "item", ...data });
      toast({
        title: "Success",
        description: "Menu item created successfully",
      });
      itemForm.reset();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create menu item",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Menu Item</DialogTitle>
          <DialogDescription>
            Create a new category or menu item
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={itemType} onValueChange={(v: any) => setItemType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="category">Category</SelectItem>
                <SelectItem value="item">Menu Item</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {itemType === "category" ? (
            <form
              onSubmit={categoryForm.handleSubmit(onSubmitCategory)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  placeholder="Appetizers"
                  {...categoryForm.register("name")}
                />
                {categoryForm.formState.errors.name && (
                  <p className="text-sm text-destructive">
                    {categoryForm.formState.errors.name.message as string}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Delicious starters..."
                  {...categoryForm.register("description")}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createMenuItem.isPending}>
                  {createMenuItem.isPending ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <form
              onSubmit={itemForm.handleSubmit(onSubmitItem)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="categoryId">Category</Label>
                <Select
                  onValueChange={(v) => itemForm.setValue("categoryId", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {itemForm.formState.errors.categoryId && (
                  <p className="text-sm text-destructive">
                    {itemForm.formState.errors.categoryId.message as string}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="itemName">Item Name</Label>
                <Input
                  id="itemName"
                  placeholder="Chicken Wings"
                  {...itemForm.register("name")}
                />
                {itemForm.formState.errors.name && (
                  <p className="text-sm text-destructive">
                    {itemForm.formState.errors.name.message as string}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="itemDescription">Description (Optional)</Label>
                <Textarea
                  id="itemDescription"
                  placeholder="Crispy fried wings..."
                  {...itemForm.register("description")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price (₹)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="299"
                  {...itemForm.register("price", { valueAsNumber: true })}
                />
                {itemForm.formState.errors.price && (
                  <p className="text-sm text-destructive">
                    {itemForm.formState.errors.price.message as string}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Image URL (Optional)</Label>
                <Input
                  id="image"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  {...itemForm.register("image")}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createMenuItem.isPending}>
                  {createMenuItem.isPending ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
