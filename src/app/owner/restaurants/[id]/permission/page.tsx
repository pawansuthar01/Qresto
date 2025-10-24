"use client";
import { PermissionCard } from "@/components/owner/PermissionCard";
import Loading from "@/components/ui/loading";
import { useRestaurant } from "@/hooks/useRestaurant";
import { useParams } from "next/navigation";

export default function permission() {
  const params = useParams();

  const restaurantId = params.id as string;
  const { data: restaurant, isLoading } = useRestaurant(restaurantId);
  if (isLoading) {
    return <Loading />;
  }

  return <PermissionCard permissions={restaurant?.permissions || {}} />;
}
