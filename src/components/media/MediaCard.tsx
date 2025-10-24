"use client";

import { handleCopy } from "@/lib/utils";
import React, { useState } from "react";

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

export default function MediaCard({
  item,
  restaurantId,
  onDeleted,
}: {
  item: MediaItem;
  restaurantId: string;
  onDeleted: (id: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this media?")) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/restaurants/${restaurantId}/media/${item.id}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json?.error || `Failed to delete (${res.status})`);
      }
      // success
      onDeleted(item.id);
    } catch (err: any) {
      console.error("Delete error", err);
      setError(err.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  function humanSize(size: number) {
    if (!size && size !== 0) return "";
    const i = Math.floor(Math.log(size) / Math.log(1024));
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    return `${(size / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  }

  return (
    <div className="bg-white rounded-md border p-2 shadow-sm flex flex-col">
      <div className="relative w-full aspect-[4/3] bg-slate-50 rounded-md overflow-hidden flex items-center justify-center">
        {item.type === "image" && (
          <img
            src={item.url}
            alt={item.filename}
            className="object-cover w-full h-full"
            loading="lazy"
          />
        )}

        {item.type === "video" && (
          <video
            controls
            className="w-full h-full object-cover"
            preload="metadata"
          >
            <source src={item.url} type={item.mimeType} />
            Your browser does not support the video tag.
          </video>
        )}

        {item.type === "pdf" && (
          <div className="w-full h-full flex items-center justify-center">
            {/* small embedded preview using object - fallback to icon if browser blocks */}
            <object
              data={item.url}
              type="application/pdf"
              className="w-full h-full"
            >
              <div className="flex flex-col items-center justify-center p-4">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="mb-2"
                >
                  <path
                    d="M6 2h7l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M13 2v6h6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="text-sm">PDF</div>
                <a
                  className="mt-2 text-sm underline"
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open PDF
                </a>
              </div>
            </object>
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{item.filename}</div>
          <div className="text-xs text-gray-500">
            {item.mimeType} · {humanSize(item.size)}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="text-xs underline"
          >
            Open
          </a>

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-xs px-2 cursor-pointer py-1 rounded border hover:bg-red-50 disabled:opacity-50"
            title="Delete"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
          <button
            onClick={() => handleCopy(item.url)}
            disabled={deleting}
            className="text-xs px-2 py-1 cursor-pointer rounded border hover:bg-red-50 disabled:opacity-50"
            title="copy"
          >
            {"Copy"}
          </button>
        </div>
      </div>

      {error && <div className="mt-2 text-xs text-red-600">{error}</div>}
    </div>
  );
}
