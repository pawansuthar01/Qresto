"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X, Leaf, Flame, DollarSign, TrendingUp } from "lucide-react";

interface MenuFiltersProps {
  onFilterChange: (filters: any) => void;
  categories: any[];
}

export function MenuFilters({ onFilterChange, categories }: MenuFiltersProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [dietFilters, setDietFilters] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState("all");
  const [showPopular, setShowPopular] = useState(false);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    applyFilters({ search: value });
  };

  const toggleDietFilter = (filter: string) => {
    const newFilters = dietFilters.includes(filter)
      ? dietFilters.filter((f) => f !== filter)
      : [...dietFilters, filter];

    setDietFilters(newFilters);
    applyFilters({ dietFilters: newFilters });
  };

  const applyFilters = (updates: any = {}) => {
    onFilterChange({
      search: updates.search !== undefined ? updates.search : search,
      category:
        updates.category !== undefined ? updates.category : selectedCategory,
      dietFilters:
        updates.dietFilters !== undefined ? updates.dietFilters : dietFilters,
      priceRange:
        updates.priceRange !== undefined ? updates.priceRange : priceRange,
      showPopular:
        updates.showPopular !== undefined ? updates.showPopular : showPopular,
    });
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("all");
    setDietFilters([]);
    setPriceRange("all");
    setShowPopular(false);
    onFilterChange({});
  };

  const activeFilterCount =
    (search ? 1 : 0) +
    (selectedCategory !== "all" ? 1 : 0) +
    dietFilters.length +
    (priceRange !== "all" ? 1 : 0) +
    (showPopular ? 1 : 0);

  return (
    <div className="space-y-4 sticky top-16 z-30 bg-background/95 backdrop-blur-sm border-b pb-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search menu items..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10"
        />
        {search && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
            onClick={() => handleSearchChange("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {/* Category Filter */}
        <Select
          value={selectedCategory}
          onValueChange={(v) => {
            setSelectedCategory(v);
            applyFilters({ category: v });
          }}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Diet Filters */}
        <Button
          variant={dietFilters.includes("veg") ? "default" : "outline"}
          size="sm"
          onClick={() => toggleDietFilter("veg")}
        >
          🥬 Veg
        </Button>

        <Button
          variant={dietFilters.includes("nonveg") ? "default" : "outline"}
          size="sm"
          onClick={() => toggleDietFilter("nonveg")}
        >
          🍗 Non-Veg
        </Button>

        <Button
          variant={dietFilters.includes("vegan") ? "default" : "outline"}
          size="sm"
          onClick={() => toggleDietFilter("vegan")}
        >
          <Leaf className="mr-1 h-3 w-3" />
          Vegan
        </Button>

        <Button
          variant={dietFilters.includes("spicy") ? "default" : "outline"}
          size="sm"
          onClick={() => toggleDietFilter("spicy")}
        >
          <Flame className="mr-1 h-3 w-3" />
          Spicy
        </Button>

        {/* Price Range */}
        <Select
          value={priceRange}
          onValueChange={(v) => {
            setPriceRange(v);
            applyFilters({ priceRange: v });
          }}
        >
          <SelectTrigger className="w-[120px]">
            <DollarSign className="h-4 w-4 mr-1" />
            <SelectValue placeholder="Price" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Prices</SelectItem>
            <SelectItem value="0-200">₹0 - ₹200</SelectItem>
            <SelectItem value="200-500">₹200 - ₹500</SelectItem>
            <SelectItem value="500+">₹500+</SelectItem>
          </SelectContent>
        </Select>

        {/* Popular Toggle */}
        <Button
          variant={showPopular ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setShowPopular(!showPopular);
            applyFilters({ showPopular: !showPopular });
          }}
        >
          <TrendingUp className="mr-1 h-3 w-3" />
          Popular
        </Button>

        {/* Clear All */}
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="mr-1 h-3 w-3" />
            Clear ({activeFilterCount})
          </Button>
        )}
      </div>
    </div>
  );
}
