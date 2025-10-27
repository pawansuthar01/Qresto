"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { menuCategorySchema, menuItemSchema } from "@/lib/validations";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { useCreateMenuItem, useUpdateMenuItem } from "@/hooks/useMenu";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import Slider from "../ui/sidebar";

interface CreateMenuItemDialogProps {
  restaurantId: string;
  restaurantName: string;
  categories: any[];
  MenuData?: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onData: (Data: any, type: "category" | "item") => void;
}

export function CreateMenuItemDialog({
  restaurantId,
  onData,
  restaurantName,
  MenuData = null,
  categories,
  open,
  onOpenChange,
}: CreateMenuItemDialogProps) {
  const { toast } = useToast();
  const createMenuItem = useCreateMenuItem(restaurantId);
  const updateMenuItem = useUpdateMenuItem(restaurantId);
  const [selectedType, setSelectedType] = useState<
    "category" | "item" | "update_item"
  >("category");

  const categoryForm = useForm({
    resolver: zodResolver(menuCategorySchema),
  });

  const itemForm = useForm({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      isAvailable: true,
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      spiceLevel: 0,
      isPopular: false,
      isTrending: false,
      isNew: false,
      isChefSpecial: false,
      prepTime: 10,
      discount: 0,
      restaurantId,
    },
  });
  useEffect(() => {
    if (MenuData) {
      setSelectedType("update_item");
      itemForm.reset({
        ...itemForm.getValues(),
        ...MenuData,
      });
    }
  }, [MenuData]);

  const onSubmitCategory = async (data: any) => {
    try {
      const same = categories.some((cat) => cat.name == data.name);
      if (same) {
        toast({
          title: "Menu name is already edit..",
          description: "please change the Menu name",
          variant: "destructive",
        });
        return;
      }
      const res = await createMenuItem.mutateAsync({
        type: "category",
        ...data,
      });
      toast({ title: "Success", description: "Category created successfully" });
      categoryForm.reset();
      onData(res, "category");
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
      const payload = { restaurantId, ...data, type: "item" };
      let res = {};
      MenuData
        ? (res = await updateMenuItem.mutateAsync({
            itemId: MenuData.id,
            data,
          }))
        : (res = await createMenuItem.mutateAsync(payload));

      toast({
        title: "Success",
        description: "Menu item created successfully",
      });
      itemForm.reset();

      onData(res, "item");
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
      <DialogContent className="w-full max-w-lg p-6 sm:p-8 overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {selectedType === "category"
              ? "Add Menu"
              : selectedType === "update_item"
              ? "Update Menu Item"
              : "Add Menu Item"}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 mt-1">
            Restaurant: <strong>{restaurantName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-4">
          {/* Type Selector */}
          <div className="flex gap-4">
            <Button
              disabled={selectedType == "update_item"}
              variant={selectedType === "category" ? "default" : "outline"}
              onClick={() => setSelectedType("category")}
              className="flex-1"
            >
              Menu
            </Button>
            <Button
              variant={
                ["update_item", "item"].includes(selectedType)
                  ? "default"
                  : "outline"
              }
              onClick={() => setSelectedType("item")}
              className="flex-1"
            >
              {selectedType === "update_item" ? "Update Menu " : "Menu Item"}
            </Button>
          </div>

          {/* Category Form */}
          {selectedType === "category" && (
            <form
              onSubmit={categoryForm.handleSubmit(onSubmitCategory)}
              className="space-y-4 mt-4"
            >
              <div className="space-y-2">
                <Label htmlFor="catName">Menu Name</Label>
                <Input
                  id="catName"
                  placeholder="Appetizers"
                  {...categoryForm.register("name")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="catDescription">Description</Label>
                <Textarea
                  id="catDescription"
                  placeholder="Delicious starters..."
                  {...categoryForm.register("description")}
                />
              </div>
              <DialogFooter className="mt-2 flex justify-end gap-2">
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

          {/* Menu Item Form */}
          {["update_item", "item"].includes(selectedType) && (
            <form
              onSubmit={itemForm.handleSubmit(onSubmitItem)}
              className="space-y-4 mt-4"
            >
              <div className="space-y-2">
                <Label>Menu</Label>
                <select
                  className="w-full border rounded px-3 py-2"
                  {...itemForm.register("categoryId")}
                >
                  <option value="" disabled>
                    Select Menu
                  </option>

                  {categories.length <= 0 ? (
                    <option value="" disabled className="text-center">
                      Create first menu
                    </option>
                  ) : (
                    categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Item Name</Label>
                  <Input
                    placeholder="Chicken Wings"
                    {...itemForm.register("name")}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Price (₹)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...itemForm.register("price", { valueAsNumber: true })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Discount (%)</Label>
                <Input
                  type="number"
                  step="1"
                  {...itemForm.register("discount", { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Crispy fried wings..."
                  {...itemForm.register("description")}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="imageUrl">Image URL*</Label>
                <Input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  {...itemForm.register("imageUrl")}
                />
              </div>

              {/* Advanced Metadata */}
              <Accordion type="single">
                <AccordionItem value="advanced">
                  <AccordionTrigger>Advanced Metadata</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 mt-2">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          {...itemForm.register("isAvailable")}
                          id="isAvailable"
                        />
                        <Label htmlFor="isAvailable" className="m-0">
                          Available
                        </Label>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            {...itemForm.register("isVegetarian")}
                            id="isVegetarian"
                          />
                          <Label htmlFor="isVegetarian" className="m-0">
                            Vegetarian
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            {...itemForm.register("isVegan")}
                            id="isVegan"
                          />
                          <Label htmlFor="isVegan" className="m-0">
                            Vegan
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            {...itemForm.register("isGlutenFree")}
                            id="isGlutenFree"
                          />
                          <Label htmlFor="isGlutenFree" className="m-0">
                            Gluten Free
                          </Label>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="spiceLevel">Spice Level</Label>
                        <Slider
                          min={0}
                          max={5}
                          step={1}
                          value={itemForm.watch("spiceLevel")}
                          onChange={(val) =>
                            itemForm.setValue("spiceLevel", val)
                          }
                        />
                        <div className="text-sm text-gray-500">
                          Current: {itemForm.watch("spiceLevel")}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          "isPopular",
                          "isTrending",
                          "isNew",
                          "isChefSpecial",
                        ].map((field) => (
                          <div className="flex items-center gap-2" key={field}>
                            <Checkbox
                              {...itemForm.register(field as any)}
                              id={field}
                            />
                            <Label htmlFor={field} className="m-0">
                              {field.replace("is", "")}
                            </Label>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="prepTime">Preparation Time (min)</Label>
                        <Input
                          type="number"
                          {...itemForm.register("prepTime", {
                            valueAsNumber: true,
                          })}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <DialogFooter className="mt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createMenuItem.isPending}>
                  {selectedType === "update_item"
                    ? updateMenuItem.isPending
                      ? "Updating..."
                      : "Update"
                    : createMenuItem.isPending
                    ? "Creating..."
                    : "Create"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
