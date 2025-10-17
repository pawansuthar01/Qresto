"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FullMenuCustomizer from "./FullMenuCustomizer";
import { useRestaurant } from "@/hooks/useRestaurant";
import { Toaster } from "../ui/toaster";

interface MenuThemeCustomizerProps {
  restaurant: any;
  user: any;
}

export default function MenuThemeCustomizer({
  restaurant,
}: MenuThemeCustomizerProps) {
  const [isSaving, setSaving] = useState(false);
  const { data } = useRestaurant(restaurant.id);
  console.log(data);
  const router = useRouter();
  const handleSave = async (customization: any) => {
    try {
      setSaving(true);
      const response = await fetch(`/api/restaurants/${restaurant.id}/theme`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customization),
      });
      setSaving(false);
      if (response.ok) {
        alert("Theme saved successfully!");
      } else {
        alert("Failed to save theme");
      }
    } catch (error) {
      setSaving(false);
      console.error("Error saving theme:", error);
      alert("Error saving theme");
    }
  };

  const handleClose = () => {
    router.push(`/owner/restaurants/${restaurant.id}/menu`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />
      <FullMenuCustomizer
        restaurant={restaurant}
        onSave={handleSave}
        isSaving={isSaving}
        onClose={handleClose}
      />
    </div>
  );
}
