import { Permission } from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useRestaurants() {
  return useQuery({
    queryKey: ["restaurants"],
    queryFn: async () => {
      const res = await fetch("/api/restaurants");
      if (!res.ok) throw new Error("Failed to fetch restaurants");
      return res.json();
    },
  });
}

export function useRestaurant(id?: string) {
  return useQuery({
    queryKey: ["restaurants", id],
    queryFn: async () => {
      if (!id || id == "padding") throw new Error("Restaurant ID is required");

      const res = await fetch(`/api/restaurants/${id}`);
      if (!res.ok) throw new Error("Failed to fetch restaurant");
      return res.json();
    },
    enabled: !!id, // 🔹 Only run if id exists
  });
}

export function getPermission(id?: string) {
  return useQuery<Permission>({
    queryKey: ["permission", id],
    queryFn: async () => {
      if (!id || id == "padding") throw new Error("Restaurant ID is required");

      const res = await fetch(`/api/restaurants/${id}/permission`);

      if (!res.ok) throw new Error("Failed to fetch restaurant permission");
      const data = await res.json();
      return data.permissions;
    },
    enabled: !!id, // 🔹 Only run if id exists
  });
}

export function useCreateRestaurant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/restaurants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create restaurant");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
    },
  });
}

export function useUpdateRestaurant() {
  return useMutation({
    mutationFn: async ({ id, data }: any) => {
      const res = await fetch(`/api/restaurants/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res;
    },
  });
}
