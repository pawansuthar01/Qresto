"use client";

import { useState } from "react";
import { Search, Filter, X, TrendingUp, DollarSign, Leaf } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface MenuFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  categories: any[];
}

export interface FilterState {
  search: string;
  category: string;
  dietary: string[];
  priceRange: [number, number];
  sortBy: "popular" | "price-low" | "price-high" | "name";
  showAvailableOnly: boolean;
}

export default function MenuFilters({
  onFilterChange,
  categories,
}: MenuFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    category: "all",
    dietary: [],
    priceRange: [0, 1000],
    sortBy: "popular",
    showAvailableOnly: true,
  });

  const [filtersOpen, setFiltersOpen] = useState(false);

  const updateFilters = (updates: Partial<FilterState>) => {
    const newFilters = { ...filters, ...updates };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const toggleDietary = (option: string) => {
    const newDietary = filters.dietary.includes(option)
      ? filters.dietary.filter((d) => d !== option)
      : [...filters.dietary, option];
    updateFilters({ dietary: newDietary });
  };

  const activeFiltersCount =
    (filters.category !== "all" ? 1 : 0) +
    filters.dietary.length +
    (filters.sortBy !== "popular" ? 1 : 0) +
    (!filters.showAvailableOnly ? 1 : 0);

  const clearAllFilters = () => {
    const defaultFilters: FilterState = {
      search: "",
      category: "all",
      dietary: [],
      priceRange: [0, 1000],
      sortBy: "popular",
      showAvailableOnly: true,
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          type="text"
          placeholder="Search dishes..."
          value={filters.search}
          onChange={(e) => updateFilters({ search: e.target.value })}
          className="pl-10 pr-10 h-12 text-base"
        />
        {filters.search && (
          <button
            onClick={() => updateFilters({ search: "" })}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Quick Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {/* Category Filter */}
        <select
          value={filters.category}
          onChange={(e) => updateFilters({ category: e.target.value })}
          className="px-4 py-2 rounded-full border bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* Sort By */}
        <select
          value={filters.sortBy}
          onChange={(e) => updateFilters({ sortBy: e.target.value as any })}
          className="px-4 py-2 rounded-full border bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="popular">🔥 Popular</option>
          <option value="price-low">💰 Price: Low to High</option>
          <option value="price-high">💎 Price: High to Low</option>
          <option value="name">🔤 Name: A to Z</option>
        </select>

        {/* More Filters Dialog */}
        <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="rounded-full relative">
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Filter Menu</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Dietary Preferences */}
              <div>
                <Label className="text-base font-semibold mb-3 block">
                  Dietary Preferences
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      value: "vegetarian",
                      label: "🥗 Vegetarian",
                      icon: <Leaf className="w-4 h-4" />,
                    },
                    { value: "vegan", label: "🥦 Vegan", icon: "🥦" },
                    {
                      value: "gluten-free",
                      label: "🌾 Gluten-Free",
                      icon: "🌾",
                    },
                    { value: "halal", label: "☪️ Halal", icon: "☪️" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => toggleDietary(option.value)}
                      className={cn(
                        "px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all",
                        filters.dietary.includes(option.value)
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <Label className="text-base font-semibold mb-3 block flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Price Range
                </Label>
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.priceRange[0]}
                      onChange={(e) =>
                        updateFilters({
                          priceRange: [
                            Number(e.target.value),
                            filters.priceRange[1],
                          ],
                        })
                      }
                      className="flex-1"
                    />
                    <span className="text-gray-500">to</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.priceRange[1]}
                      onChange={(e) =>
                        updateFilters({
                          priceRange: [
                            filters.priceRange[0],
                            Number(e.target.value),
                          ],
                        })
                      }
                      className="flex-1"
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="50"
                    value={filters.priceRange[1]}
                    onChange={(e) =>
                      updateFilters({
                        priceRange: [
                          filters.priceRange[0],
                          Number(e.target.value),
                        ],
                      })
                    }
                    className="w-full"
                  />
                </div>
              </div>

              {/* Availability */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.showAvailableOnly}
                    onChange={(e) =>
                      updateFilters({ showAvailableOnly: e.target.checked })
                    }
                    className="w-5 h-5 rounded"
                  />
                  <span className="text-sm font-medium">
                    Show available items only
                  </span>
                </label>
              </div>

              {/* Clear All */}
              {activeFiltersCount > 0 && (
                <Button
                  onClick={() => {
                    clearAllFilters();
                    setFiltersOpen(false);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Clear Filters */}
        {activeFiltersCount > 0 && (
          <Button
            onClick={clearAllFilters}
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700"
          >
            <X className="w-4 h-4 mr-1" />
            Clear ({activeFiltersCount})
          </Button>
        )}
      </div>

      {/* Active Filter Tags */}
      {(filters.dietary.length > 0 || filters.category !== "all") && (
        <div className="flex flex-wrap gap-2">
          {filters.category !== "all" && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
              {categories.find((c) => c.id === filters.category)?.name}
              <button
                onClick={() => updateFilters({ category: "all" })}
                className="hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.dietary.map((d) => (
            <span
              key={d}
              className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm capitalize"
            >
              {d.replace("-", " ")}
              <button
                onClick={() => toggleDietary(d)}
                className="hover:bg-green-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
