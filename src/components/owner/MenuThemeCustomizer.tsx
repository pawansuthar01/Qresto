"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/DashboardHeader";
import FullMenuCustomizer from "./FullMenuCustomizer";

interface MenuThemeCustomizerProps {
  restaurant: any;
  user: any;
}

export default function MenuThemeCustomizer({
  restaurant,
  user,
}: MenuThemeCustomizerProps) {
  const router = useRouter();

  const handleSave = async (customization: any) => {
    try {
      const response = await fetch(`/api/restaurants/${restaurant.id}/theme`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customization),
      });

      if (response.ok) {
        alert("Theme saved successfully!");
        router.push(`/owner/restaurants/${restaurant.id}/menu`);
      } else {
        alert("Failed to save theme");
      }
    } catch (error) {
      console.error("Error saving theme:", error);
      alert("Error saving theme");
    }
  };

  const handleClose = () => {
    router.push(`/owner/restaurants/${restaurant.id}/menu`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={user} title="Menu Theme Customization" />
      <FullMenuCustomizer
        restaurant={restaurant}
        onSave={handleSave}
        onClose={handleClose}
      />
    </div>
  );
}
