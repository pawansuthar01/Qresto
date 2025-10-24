"use client";

import React, { useEffect, useState } from "react";
import MediaCard from "@/components/media/MediaCard";
import { useParams } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Settings } from "lucide-react";
import GlobeUpload from "@/components/media/Upload";

type MediaItem = {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  type: "image" | "video" | "pdf" | string;
  category?: string | null;
  createdAt?: string;
};
type MediaCache = Record<string, Record<number, MediaItem[]>>;

const FILTERS = [
  { key: "all", label: "All" },
  { key: "image", label: "Images" },
  { key: "video", label: "Videos" },
  { key: "pdf", label: "PDFs" },
];

export default function MediaPage() {
  const params = useParams();
  const restaurantId = params.id as string;

  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "image" | "video" | "pdf">(
    "all"
  );
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [filterData, setFilterData] = useState<MediaItem[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey] = useState<number>(0);
  const [mediaCache, setMediaCache] = useState<MediaCache>({});

  // If restaurantId invalid
  if (
    !restaurantId ||
    restaurantId === "padding" ||
    restaurantId === "undefined"
  ) {
    return (
      <MainLayout>
        <Card className="p-12 text-center">
          <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No restaurant assigned
          </h3>
          <p className="text-gray-600">
            Contact your administrator to get access to features
          </p>
        </Card>
      </MainLayout>
    );
  }

  // Fetch media
  useEffect(() => {
    const controller = new AbortController();

    if (mediaCache[filter]?.[page]) {
      setMedia(mediaCache[filter][page]);
      return;
    }

    async function fetchMedia() {
      try {
        setLoading(true);
        const typeQuery = filter === "all" ? "" : `&type=${filter}`;
        const res = await fetch(
          `/api/restaurants/${restaurantId}/media?page=${page}&limit=20${typeQuery}`,
          { signal: controller.signal }
        );
        const json = await res.json();
        const newData: MediaItem[] = json.media || [];

        setMedia(newData);

        // Update cache page-wise
        setMediaCache((prev: MediaCache) => {
          const pageCache = prev[filter] || {};
          return {
            ...prev,
            [filter]: {
              ...pageCache,
              [page]: newData,
            },
          };
        });

        setTotalPages(json.pagination?.totalPages || 1);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Fetch media error", err);
          setError(err.message || "Error fetching media");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchMedia();
    return () => controller.abort();
  }, [restaurantId, filter, page, refreshKey]);
  useEffect(() => {
    if (filter === "all") {
      setFilterData(media);
    } else {
      setFilterData(media.filter((m) => m.type === filter));
    }
  }, [filter, media]);

  const onFilterClick = (key: "all" | "image" | "video" | "pdf") => {
    setFilter(key);
    setPage(1);

    if (mediaCache[key]?.[1]) {
      setMedia(mediaCache[key][1]);
    } else {
      setMedia([]);
    }
  };

  const handleDelete = (id: string) => {
    setMedia((prev) => prev.filter((m) => m.id !== id));
    setFilterData((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <MainLayout>
      <div className="p-6 max-sm:p-2 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Media Gallery</h1>
          <div className="text-sm text-gray-600">
            Showing:{" "}
            <span className="font-medium">
              {filter === "all" ? "All" : filter}
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded"
          >
            Open Upload
          </button>
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => onFilterClick(f.key as any)}
              className={`px-3 py-1 rounded-md border transition-colors ${
                filter === f.key
                  ? "bg-slate-900 text-white border-transparent"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && <div className="mb-4 text-red-600">{error}</div>}

        {/* Media Grid */}
        {loading ? (
          <div className="text-center py-20">Loading...</div>
        ) : filterData.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No media found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filterData?.map((m) => (
              <MediaCard
                key={m.id}
                item={m}
                restaurantId={restaurantId!}
                onDeleted={(id) => handleDelete(id)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {filterData.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Page {page} of {totalPages} — {media.length} items shown
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1 rounded-md border disabled:opacity-50"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pg = idx + 1;
                if (Math.abs(pg - page) > 3 && pg !== 1 && pg !== totalPages)
                  return null;
                return (
                  <button
                    key={pg}
                    onClick={() => setPage(pg)}
                    className={`px-3 py-1 rounded-md border ${
                      pg === page ? "bg-slate-900 text-white" : ""
                    }`}
                  >
                    {pg}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1 rounded-md border disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Upload */}
        <GlobeUpload
          open={open}
          onClose={() => setOpen(false)}
          restaurantId={restaurantId}
          onUploadSuccess={(data) => {
            setMedia((prev) => [data, ...prev]);
            setFilterData((prev) => [data, ...prev]);
          }}
          maxFiles={12}
        />
      </div>
    </MainLayout>
  );
}
