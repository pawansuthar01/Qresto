"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, GripVertical } from "lucide-react";

interface CategoriesManagerProps {
  restaurant: any;
  categories: any[];
  permissions: any;
  user: any;
}

export default function CategoriesManager({
  restaurant,
  categories: initialCategories,
  permissions,
  user,
}: CategoriesManagerProps) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    displayOrder: 0,
  });
  const [loading, setLoading] = useState(false);

  const openCreateDialog = () => {
    setEditingCategory(null);
    setFormData({ name: "", description: "", displayOrder: categories.length });
    setDialogOpen(true);
  };

  const openEditDialog = (category: any) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      displayOrder: category.displayOrder,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert("Category name is required");
      return;
    }

    setLoading(true);

    try {
      const url = editingCategory
        ? `/api/restaurants/${restaurant.id}/categories/${editingCategory.id}`
        : `/api/restaurants/${restaurant.id}/categories`;

      const response = await fetch(url, {
        method: editingCategory ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.refresh();
        setDialogOpen(false);
        alert(
          `Category ${editingCategory ? "updated" : "created"} successfully!`
        );
      } else {
        alert("Failed to save category");
      }
    } catch (error) {
      console.error("Error saving category:", error);
      alert("Error saving category");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this category? All items in this category will also be deleted."
      )
    ) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `/api/restaurants/${restaurant.id}/categories/${categoryId}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        setCategories((prev) => prev.filter((c) => c.id !== categoryId));
        alert("Category deleted successfully");
      } else {
        alert("Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Error deleting category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={user} title="Categories" />

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
              Menu Categories
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Organize your menu into categories
            </p>
          </div>
          {permissions?.["menu.create"] && (
            <Button
              onClick={openCreateDialog}
              className="min-h-[44px] w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          )}
        </div>

        {categories.length === 0 ? (
          <Card className="p-8 sm:p-12 text-center shadow-md">
            <div className="text-5xl sm:text-6xl mb-4">📂</div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              No categories yet
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              Create your first category to organize your menu
            </p>
            {permissions?.["menu.create"] && (
              <Button onClick={openCreateDialog} className="min-h-[44px]">
                <Plus className="w-4 h-4 mr-2" />
                Create Category
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {categories.map((category) => (
              <Card
                key={category.id}
                className="hover:shadow-lg transition-all duration-200 border shadow-sm"
              >
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-base sm:text-lg truncate">
                        {category.name}
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm font-normal text-gray-600 whitespace-nowrap">
                      {category._count.items} items
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  {category.description && (
                    <p className="text-xs sm:text-sm text-gray-600 mb-4 line-clamp-2">
                      {category.description}
                    </p>
                  )}

                  <div className="flex gap-2">
                    {permissions?.["menu.update"] && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(category)}
                        className="flex-1 min-h-[44px]"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    )}
                    {permissions?.["menu.delete"] && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(category.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 min-h-[44px] min-w-[44px]"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              {editingCategory ? "Edit Category" : "Create Category"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 sm:space-y-5">
            <div>
              <Label htmlFor="name" className="text-sm font-medium">
                Category Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Appetizers, Main Course, Desserts"
                className="mt-2 min-h-[44px]"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Brief description (optional)"
                className="w-full mt-2 p-3 border rounded-lg min-h-[100px] text-sm"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="displayOrder" className="text-sm font-medium">
                Display Order
              </Label>
              <Input
                id="displayOrder"
                type="number"
                value={formData.displayOrder}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    displayOrder: parseInt(e.target.value),
                  })
                }
                className="mt-2 min-h-[44px]"
              />
              <p className="text-xs text-gray-500 mt-1">
                Lower numbers appear first
              </p>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="min-h-[44px]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={loading}
                className="min-h-[44px]"
              >
                {loading ? "Saving..." : editingCategory ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
