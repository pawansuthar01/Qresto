import { useState } from "react";

export function useUpload() {
  const [progress, setProgress] = useState<number>(0);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function uploadFiles(
    files: File[],
    restaurantId: string,
    onSuccess?: (data: any) => void
  ) {
    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      const uploadedData: any[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch(`/api/restaurants/${restaurantId}/media`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          throw new Error(json?.error || `Upload failed (${res.status})`);
        }

        const data = await res.json();
        uploadedData.push(data);

        setProgress(Math.round(((i + 1) / files.length) * 100));
      }

      onSuccess?.(uploadedData);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return { progress, uploading, error, uploadFiles };
}
