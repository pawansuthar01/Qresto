// src/hooks/usePagination.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { PaginationState, PaginatedResponse } from "@/types";

interface UsePaginationOptions<T> {
  fetchFn: (page: number, filters: any) => Promise<PaginatedResponse<T>>;
  initialLimit?: number;
  initialFilters?: any;
}

export function usePagination<T = any>({
  fetchFn,
  initialLimit = 25,
  initialFilters = {},
}: UsePaginationOptions<T>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState(initialFilters);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: initialLimit,
    total: 0,
    totalPages: 1,
  });

  const fetchData = useCallback(
    async (page: number = pagination.page) => {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchFn(page, filters);
        setData(result.data);
        setPagination(result.pagination);
      } catch (err) {
        setError(err as Error);
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    },
    [fetchFn, filters]
  );

  // Fetch data when filters change
  useEffect(() => {
    fetchData(1);
  }, [filters]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setPagination({ ...pagination, page });
      fetchData(page);
    }
  };

  const nextPage = () => goToPage(pagination.page + 1);
  const prevPage = () => goToPage(pagination.page - 1);
  const firstPage = () => goToPage(1);
  const lastPage = () => goToPage(pagination.totalPages);

  const updateFilters = (newFilters: Partial<typeof filters>) => {
    setFilters({ ...filters, ...newFilters });
  };

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  const refresh = () => fetchData(pagination.page);

  return {
    data,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    resetFilters,
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    refresh,
  };
}