"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { useToast } from "@/components/ui/use-toast";

interface GuestMenuProps {
  categories: any[];
  customization: any;
}

export function GuestMenu({ categories, customization }: GuestMenuProps) {
  const { addItem } = useCartStore();
  const { toast } = useToast();

  const handleAddToCart = (item: any) => {
    addItem({
      menuItemId: item.id,
      name: item.name,
      price: item.price,
    });
    toast({
      title: "Added to cart",
      description: `${item.name} has been added to your cart`,
    });
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="space-y-8">
        {categories.map((category) => (
          <div key={category.id}>
            <h2
              className="mb-4 text-2xl font-bold"
              style={{ color: customization.primaryColor || "#000000" }}
            >
              {category.name}
            </h2>
            {category.description && (
              <p className="mb-4 text-muted-foreground">
                {category.description}
              </p>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {category.items.map((item: any) => (
                <Card key={item.id} className="overflow-hidden">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-48 w-full object-cover"
                    />
                  )}
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-start justify-between">
                      <h3 className="font-semibold">{item.name}</h3>
                      {!item.available && (
                        <Badge variant="secondary">Unavailable</Badge>
                      )}
                    </div>
                    {item.description && (
                      <p className="mb-3 text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span
                        className="text-lg font-bold"
                        style={{
                          color: customization.primaryColor || "#000000",
                        }}
                      >
                        {formatCurrency(item.price)}
                      </span>
                      <Button
                        size="sm"
                        onClick={() => handleAddToCart(item)}
                        disabled={!item.available}
                        style={{
                          backgroundColor:
                            customization.primaryColor || undefined,
                        }}
                      >
                        <Plus className="mr-1 h-4 w-4" />
                        Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
