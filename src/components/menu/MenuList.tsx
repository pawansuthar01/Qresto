"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { usePermissions } from "@/hooks/usePermissions";
import { useRestaurant } from "@/hooks/useRestaurant";
import {
  Edit,
  Eye,
  EyeOff,
  Palette,
  Plus,
  Trash2,
  Search,
  Filter,
  ChevronDown,
  Download,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { formatCurrency } from "@/lib/utils";
import { useState, useEffect } from "react";
import { notificationSound } from "@/lib/notification-sound";
import { CreateMenuItemDialog } from "./CreateMenuItemDialog";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { PaginationState } from "@/types";
import { toast } from "../ui/use-toast";
import { useRouter } from "next/navigation";
import Loading from "../ui/loading";

interface MenuListProps {
  restaurantId: string;
}

export function MenuList({ restaurantId }: MenuListProps) {
  const router = useRouter();
  const { data: restaurant } = useRestaurant(restaurantId);
  const { hasPermission } = usePermissions(restaurant?.permissions);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [updating, setUpdating] = useState<string | null>(null);

  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 1,
  });

  const [filters, setFilters] = useState({
    search: "",
    categoryId: "ALL",
    isAvailable: "ALL",
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    sortBy: "name",
  });

  const canUpdate = hasPermission("menu.update");
  const canDelete = hasPermission("menu.delete");
  const canCreate = hasPermission("menu.create");
  const canCustomize = hasPermission("menu.customize");

  // Fetch menu data
  const fetchMenu = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/restaurants/${restaurantId}/menu`);
      if (!res.ok) throw new Error("Failed to fetch menu");
      const data = await res.json();
      setCategories(data.categories || data || []);
      applyFilters();
    } catch (error) {
      console.error("Error fetching menu:", error);
      toast({
        title: "Error",
        description: "Failed to fetch menu items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (restaurantId) {
      fetchMenu();
    }
  }, [restaurantId]);

  // Apply filters
  const applyFilters = () => {
    // Map over categories and filter their items
    const filteredCats = categories?.map((cat) => {
      let items = [...cat.items];

      // Search filter applies to category name/description and item name/description
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();

        // Filter items based on search
        items = items.filter(
          (item: any) =>
            item.name.toLowerCase().includes(searchLower) ||
            item.description?.toLowerCase().includes(searchLower)
        );

        // Keep category if its name or description matches
        if (
          cat.name.toLowerCase().includes(searchLower) ||
          cat.description?.toLowerCase().includes(searchLower)
        ) {
          // keep all items (or filtered items if any)
        }
      }

      // Availability filter
      if (filters.isAvailable !== "ALL") {
        items = items.filter(
          (item: any) => item.isAvailable === (filters.isAvailable === "true")
        );
      }

      // Dietary filters
      if (filters.isVegetarian) {
        items = items.filter((item: any) => item.isVegetarian);
      }
      if (filters.isVegan) {
        items = items.filter((item: any) => item.isVegan);
      }
      if (filters.isGlutenFree) {
        items = items.filter((item: any) => item.isGlutenFree);
      }

      // Sort items
      if (filters.sortBy === "name") {
        items.sort((a: any, b: any) => a.name.localeCompare(b.name));
      } else if (filters.sortBy === "price-low") {
        items.sort((a: any, b: any) => a.price - b.price);
      } else if (filters.sortBy === "price-high") {
        items.sort((a: any, b: any) => b.price - a.price);
      }

      return {
        ...cat,
        items,
      };
    });

    setFilteredItems(filteredCats);

    // Update total items count for pagination
    const totalItemsCount = filteredCats.reduce(
      (sum, cat) => sum + cat.items.length,
      0
    );

    setPagination({
      ...pagination,
      total: totalItemsCount,
      totalPages: Math.ceil(totalItemsCount / pagination.limit),
      page: 1,
    });
  };

  useEffect(() => {
    applyFilters();
  }, [filters, categories]);

  // Get paginated items
  const getPaginatedItems = () => {
    const start = (pagination.page - 1) * pagination.limit;
    const end = start + pagination.limit;
    return filteredItems.slice(start, end);
  };

  const handlePageChange = (newPage: number) => {
    setPagination({ ...pagination, page: newPage });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleAvailability = async (itemId: string, currentStatus: boolean) => {
    setUpdating(itemId);

    try {
      const response = await fetch(
        `/api/restaurants/${restaurantId}/menu/${itemId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isAvailable: !currentStatus }),
        }
      );

      if (response.ok) {
        setCategories((prev) =>
          prev.map((cat) => ({
            ...cat,
            items: cat?.items.map((t: any) =>
              t.id === itemId ? { ...t, isAvailable: !currentStatus } : t
            ),
          }))
        );
        notificationSound.playSuccess();
      }
    } catch (error) {
      console.error("Error toggling availability:", error);
    } finally {
      setUpdating(null);
    }
  };

  const deleteItem = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    setUpdating(itemId);

    try {
      const response = await fetch(
        `/api/restaurants/${restaurantId}/menu/${itemId}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        setCategories((prev) =>
          prev.map((cat) => ({
            ...cat,
            items: cat.items.filter((t: any) => t.id !== itemId),
          }))
        );
        notificationSound.playSuccess();
        toast({
          title: "Success",
          description: "Item deleted successfully",
        });
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    } finally {
      setUpdating(null);
    }
  };
  const exportMenu = () => {
    const csv = [
      [
        "Name",
        "Category",
        "Price",
        "Available",
        "Vegetarian",
        "Vegan",
        "Gluten Free",
      ],
      ...filteredItems.map((item) => [
        item.name,
        item.categoryName,
        item.price,
        item.isAvailable ? "Yes" : "No",
        item.isVegetarian ? "Yes" : "No",
        item.isVegan ? "Yes" : "No",
        item.isGlutenFree ? "Yes" : "No",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `menu-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Menu exported successfully",
    });
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      categoryId: "ALL",
      isAvailable: "ALL",
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      sortBy: "name",
    });
  };

  const totalItems = categories?.reduce(
    (sum: any, cat: any) => sum + cat.items?.length,
    0
  );
  const availableItems = categories?.reduce(
    (sum: any, cat: any) =>
      sum + cat.items.filter((item: any) => item?.isAvailable)?.length,
    0
  );
  const totalValue = categories?.reduce(
    (sum: any, cat: any) =>
      sum + cat?.items?.reduce((s: number, item: any) => s + item?.price, 0),
    0
  );
  return (
    <div className="space-y-6 overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Items
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalItems}</div>
            <p className="text-sm text-gray-600 mt-1">
              {availableItems} available • {totalItems - availableItems} hidden
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Average Price
            </CardTitle>
            <DollarSign className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(totalItems > 0 ? totalValue / totalItems : 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Categories
            </CardTitle>
            <Palette className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{categories?.length}</div>
          </CardContent>
        </Card>
      </div>
      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search menu items..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              <ChevronDown
                className={`w-4 h-4 ml-2 transition-transform ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
            </Button>
            <Button variant="default" onClick={exportMenu}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Category Filter */}
                <div>
                  <Label>Category</Label>
                  <select
                    value={filters.categoryId}
                    onChange={(e) =>
                      setFilters({ ...filters, categoryId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ALL">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Availability Filter */}
                <div>
                  <Label>Availability</Label>
                  <select
                    value={filters.isAvailable}
                    onChange={(e) =>
                      setFilters({ ...filters, isAvailable: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ALL">All Items</option>
                    <option value="true">Available Only</option>
                    <option value="false">Hidden Only</option>
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <Label>Sort By</Label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) =>
                      setFilters({ ...filters, sortBy: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="name">Name (A-Z)</option>
                    <option value="price-low">Price (Low to High)</option>
                    <option value="price-high">Price (High to Low)</option>
                  </select>
                </div>

                {/* Clear Filters */}
              </div>{" "}
              {/* Dietary Filters */}
              <div className="flex gap-4 mt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.isVegetarian}
                    onChange={(e) =>
                      setFilters({ ...filters, isVegetarian: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm">🥬 Vegetarian</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.isVegan}
                    onChange={(e) =>
                      setFilters({ ...filters, isVegan: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm">🌱 Vegan</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.isGlutenFree}
                    onChange={(e) =>
                      setFilters({ ...filters, isGlutenFree: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm">🌾 Gluten Free</span>
                </label>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="text-sm text-gray-600">
        Showing {getPaginatedItems().length} of {filteredItems.length} items
        {filters.search && ` matching "${filters.search}"`}
      </div>
      <div className="flex justify-end gap-2">
        {(filters.search !== "" ||
          filters.categoryId !== "ALL" ||
          filters.isGlutenFree ||
          filters.isVegan ||
          filters.isAvailable !== "ALL" ||
          filters.isVegetarian ||
          filters.search !== "" ||
          filters.sortBy !== "name") && (
          <div className="flex items-end">
            <Button
              variant="secondary"
              onClick={clearFilters}
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        )}
        {canCustomize ? (
          <Button
            variant="outline"
            onClick={() =>
              router.push(`/owner/restaurants/${restaurant.id}/menu/theme`)
            }
          >
            <Palette className="w-4 h-4 mr-2" />
            Customize Theme
          </Button>
        ) : (
          <Button disabled variant={"destructive"}>
            No Customize permission{" "}
          </Button>
        )}
        {canCreate ? (
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Menu
          </Button>
        ) : (
          <Button disabled variant={"ghost"}>
            No adding permission{" "}
          </Button>
        )}
      </div>
      {/* Menu Items */}
      {loading ? (
        <Loading h="h-full" />
      ) : getPaginatedItems().length === 0 ? (
        <Card className="p-12 text-center">
          <Palette className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Menu found
          </h3>
          <p className="text-gray-600 mb-6">
            Try adjusting your filters or search query
          </p>
          {canCreate && (
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Menu
            </Button>
          )}
        </Card>
      ) : (
        <Card>
          <div className="space-y-3 ">
            {getPaginatedItems().map((cat: any) => (
              <div key={cat.id} className="space-y-3">
                {/* Category Header */}
                <Card className="bg-gray-50">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 text-lg line-clamp-2">
                      Menu: {cat.name}
                    </h3>
                    {cat.description && (
                      <CardDescription className=" break-all">
                        {cat.description}
                      </CardDescription>
                    )}
                  </CardContent>
                </Card>

                {/* Items of this menu */}
                {cat.items.length === 0 ? (
                  <Card className="p-4 text-center">
                    <p className="text-gray-500">No items in this Menu</p>
                  </Card>
                ) : (
                  cat.items.map((item: any) => (
                    <Card key={item.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            {item.imageUrl && (
                              <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-semibold  break-all text-gray-900 text-lg">
                                  {item.name}
                                </h4>
                                {!item.isAvailable && (
                                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                                    Hidden
                                  </span>
                                )}
                                {item.isPopular && (
                                  <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">
                                    🔥 Popular
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600  break-all mt-1 line-clamp-4">
                                {item.description}
                              </p>
                              <div className="flex items-center gap-3 mt-2">
                                <span className="font-bold text-blue-600 text-lg">
                                  {formatCurrency(item.price)}
                                </span>
                                {item.isVegetarian && (
                                  <span className="text-xs">🥬</span>
                                )}
                                {item.isVegan && (
                                  <span className="text-xs">🌱</span>
                                )}
                                {item.isGlutenFree && (
                                  <span className="text-xs">🌾</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            {canUpdate && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    toggleAvailability(
                                      item.id,
                                      item.isAvailable
                                    )
                                  }
                                  disabled={updating === item.id}
                                  title={
                                    item.isAvailable ? "Hide item" : "Show item"
                                  }
                                >
                                  {item.isAvailable ? (
                                    <Eye className="w-4 h-4" />
                                  ) : (
                                    <EyeOff className="w-4 h-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setUpdateDialogOpen(item)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                            {canDelete && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteItem(item.id)}
                                disabled={updating === item.id}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            ))}
          </div>
          {/* Pagination */}
          {pagination.total > pagination.limit && (
            <Card>
              <CardContent className="p-4">
                <PaginationControls
                  pagination={pagination}
                  onPageChange={handlePageChange}
                  showFirstLast={true}
                />
              </CardContent>
            </Card>
          )}
        </Card>
      )}

      {/* Create Dialog */}
      {canCreate && (
        <CreateMenuItemDialog
          onData={(data, type) => {
            if (type === "item") {
              // Find the category where this item belongs
              const categoryIndex = categories.findIndex(
                (cat) => cat.id === data.categoryId
              );

              if (categoryIndex !== -1) {
                const updatedCategories = [...categories];
                const items = updatedCategories[categoryIndex].items || [];

                // Check if the item already exists
                const itemIndex = items.findIndex(
                  (item: any) => item.id === data.id
                );

                if (itemIndex !== -1) {
                  // Update existing item
                  items[itemIndex] = { ...data };
                } else {
                  // Add new item
                  items.push({ ...data });
                }

                // Update the category with new items
                updatedCategories[categoryIndex] = {
                  ...updatedCategories[categoryIndex],
                  items,
                };

                setCategories(updatedCategories);
              }
            } else if (type === "category") {
              setCategories((prev) => {
                const index = prev.findIndex((cat) => cat.id === data.id);
                if (index !== -1) {
                  const updated = [...prev];
                  updated[index] = {
                    ...data,
                    items: updated[index].items || [],
                  };
                  return updated;
                } else {
                  return [...prev, { ...data, items: [] }];
                }
              });
            }
          }}
          restaurantId={restaurantId}
          restaurantName={restaurant?.name}
          categories={categories}
          MenuData={updateDialogOpen}
          open={createDialogOpen || updateDialogOpen ? true : false}
          onOpenChange={() => {
            setCreateDialogOpen(false), setUpdateDialogOpen(null);
          }}
        />
      )}
    </div>
  );
}
