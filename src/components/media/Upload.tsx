"use client";

import React, { useEffect, useRef, useState, DragEvent } from "react";
import { usePreview, PreviewFile } from "@/hooks/usePreview";
import { useUpload } from "@/hooks/useUpload";

interface GlobeUploadModalProps {
  open: boolean;
  onClose: () => void;
  restaurantId: string;
  onUploadSuccess?: (data: any) => void;
  maxFiles?: number; // optional limit
}

export default function GlobeUploadModal({
  open,
  onClose,
  restaurantId,
  onUploadSuccess,
  maxFiles = 20,
}: GlobeUploadModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const previews = usePreview(selectedFiles);
  const { progress, uploading, error, uploadFiles } = useUpload();
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      setSelectedFiles([]);
    }
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Validate & add incoming FileList
  function addFiles(files: FileList | null) {
    if (!files) return;
    const arr = Array.from(files);
    const valid = arr.filter((file) => {
      const type = file.type.split("/")[0];
      return (
        type === "image" || type === "video" || file.type === "application/pdf"
      );
    });

    // enforce maxFiles
    const combined = [...selectedFiles, ...valid].slice(0, maxFiles);
    setSelectedFiles(combined);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    addFiles(e.target.files);
    // reset input value so same file can be selected again if user wants
    e.currentTarget.value = "";
  }

  function handleRemove(index: number) {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  }

  function onDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }

  function onDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    // close if click outside modal dialog
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  }

  function handleUpload() {
    if (!selectedFiles.length || uploading) return;
    uploadFiles(selectedFiles, restaurantId, (data) => {
      // on success
      setSelectedFiles([]);
      onUploadSuccess?.(data);
      onClose();
    });
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
      onMouseDown={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Modal card */}
      <div
        ref={modalRef}
        className="relative z-10 w-full max-w-3xl mx-4 md:mx-0 bg-white rounded-lg shadow-lg overflow-hidden"
        style={{ maxWidth: 720 }}
        onMouseDown={(e) => e.stopPropagation()} // prevent bubbling to backdrop
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="text-lg font-semibold">Upload Media</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              Only images, videos, PDFs
            </span>
            <button
              onClick={onClose}
              aria-label="Close"
              className="ml-3 rounded-md p-1 hover:bg-gray-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-600"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 8.586L15.95 2.636a1 1 0 011.414 1.414L11.414 10l5.95 5.95a1 1 0 01-1.414 1.414L10 11.414l-5.95 5.95A1 1 0 012.636 15.95L8.586 10 2.636 4.05A1 1 0 014.05 2.636L10 8.586z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          {/* Drag & Drop area */}
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            className={`w-full rounded-md p-4 border-2 border-dashed transition ${
              dragOver
                ? "border-indigo-500 bg-indigo-50"
                : "border-gray-200 bg-white"
            }`}
          >
            <div className="flex flex-col items-center justify-center gap-3">
              <p className="text-sm text-gray-600 text-center">
                Drag & drop files here, or click to select files
              </p>

              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*,.pdf"
                  onChange={handleInputChange}
                  className="hidden"
                />
                <span className="px-3 py-1.5 rounded-md bg-indigo-600 text-white text-sm hover:bg-indigo-700">
                  Choose files
                </span>
              </label>

              <div className="text-xs text-gray-400">
                {selectedFiles.length}/{maxFiles} files selected
              </div>
            </div>
          </div>

          {/* Preview grid */}
          {previews.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
              {previews.map((p: PreviewFile, idx: number) => (
                <div
                  key={idx}
                  className="relative border rounded-md overflow-hidden bg-white"
                >
                  <button
                    onClick={() => handleRemove(idx)}
                    className="absolute top-1 right-1 z-10 bg-red-500 text-white text-xs px-1 rounded"
                    aria-label="Remove file"
                  >
                    ✕
                  </button>

                  {p.type === "image" && (
                    <img
                      src={p.previewUrl}
                      alt={p?.file.name || `preview-${idx}`}
                      className="w-full h-28 object-cover"
                    />
                  )}

                  {p.type === "video" && (
                    <video
                      src={p.previewUrl}
                      className="w-full h-28 object-cover"
                    />
                  )}

                  {p.type === "pdf" && (
                    <div className="flex flex-col items-center justify-center h-28 p-2 text-gray-700">
                      <div className="text-3xl">📄</div>
                      <div className="text-xs mt-1">
                        {p?.file.name || "PDF file"}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {error && <div className="mt-3 text-sm text-red-600">{error}</div>}

          {/* Upload progress */}
          {uploading && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 h-2 rounded overflow-hidden">
                <div
                  className="h-2 bg-indigo-600 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {Math.round(progress)}% uploading
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t">
          <button
            onClick={() => {
              setSelectedFiles([]);
              onClose();
            }}
            className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200"
          >
            Cancel
          </button>

          <button
            onClick={handleUpload}
            disabled={uploading || selectedFiles.length === 0}
            className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {uploading ? "Uploading..." : `Upload (${selectedFiles.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}
