import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useTable(restaurantId: string) {
  return useQuery({
    queryKey: ["table", restaurantId],
    queryFn: async () => {
      const res = await fetch(`/api/restaurants/${restaurantId}/table`);
      if (!res.ok) throw new Error("Failed to fetch table");
      return res.json();
    },
    enabled: !!restaurantId,
  });
}

export function useCreateTable(restaurantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`/api/restaurants/${restaurantId}/tables`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create table");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["table", restaurantId] });
    },
  });
}

export function useUpdateTable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      restaurantId,
      tableId,
      data,
    }: {
      restaurantId: string;
      tableId: string;
      data: any;
    }) => {
      const res = await fetch(
        `/api/restaurants/${restaurantId}/tables/${tableId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["table"] });
    },
  });
}

export function useDeleteTable(restaurantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tableId }: { tableId: string }) => {
      const res = await fetch(
        `/api/restaurants/${restaurantId}/tables/${tableId}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete table");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["table", restaurantId] });
    },
  });
}
