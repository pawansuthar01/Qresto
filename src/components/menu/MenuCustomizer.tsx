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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useUpdateRestaurant } from "@/hooks/useRestaurant";

interface MenuCustomizerProps {
  restaurant: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MenuCustomizer({
  restaurant,
  open,
  onOpenChange,
}: MenuCustomizerProps) {
  const { toast } = useToast();
  const updateRestaurant = useUpdateRestaurant();
  const [customization, setCustomization] = useState({
    primaryColor: "#000000",
    backgroundColor: "#ffffff",
    fontFamily: "sans-serif",
    cardStyle: "modern",
  });

  useEffect(() => {
    if (restaurant?.customization) {
      setCustomization({ ...customization, ...restaurant.customization });
    }
  }, [restaurant]);

  const handleSave = async () => {
    try {
      await updateRestaurant.mutateAsync({
        id: restaurant?.id,
        data: customization,
      });
      toast({
        title: "Success",
        description: "Menu customization saved successfully",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save customization",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Customize Menu Design</DialogTitle>
          <DialogDescription>
            Personalize how your digital menu looks to customers
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="primaryColor">Primary Color</Label>
            <div className="flex gap-2">
              <Input
                id="primaryColor"
                type="color"
                value={customization.primaryColor}
                onChange={(e) =>
                  setCustomization({
                    ...customization,
                    primaryColor: e.target.value,
                  })
                }
                className="h-10 w-20"
              />
              <Input
                type="text"
                value={customization.primaryColor}
                onChange={(e) =>
                  setCustomization({
                    ...customization,
                    primaryColor: e.target.value,
                  })
                }
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="backgroundColor">Background Color</Label>
            <div className="flex gap-2">
              <Input
                id="backgroundColor"
                type="color"
                value={customization.backgroundColor}
                onChange={(e) =>
                  setCustomization({
                    ...customization,
                    backgroundColor: e.target.value,
                  })
                }
                className="h-10 w-20"
              />
              <Input
                type="text"
                value={customization.backgroundColor}
                onChange={(e) =>
                  setCustomization({
                    ...customization,
                    backgroundColor: e.target.value,
                  })
                }
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fontFamily">Font Family</Label>
            <Input
              id="fontFamily"
              value={customization.fontFamily}
              onChange={(e) =>
                setCustomization({
                  ...customization,
                  fontFamily: e.target.value,
                })
              }
              placeholder="sans-serif"
            />
          </div>

          <div
            className="rounded-lg border p-4"
            style={{
              backgroundColor: customization.backgroundColor,
              color: customization.primaryColor,
              fontFamily: customization.fontFamily,
            }}
          >
            <h3 className="mb-2 text-lg font-bold">Preview</h3>
            <p className="text-sm">This is how your menu will look</p>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={updateRestaurant.isPending}>
              {updateRestaurant.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
