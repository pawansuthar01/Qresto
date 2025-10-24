import { useState, useEffect } from "react";

export type PreviewFile = {
  file: File;
  previewUrl: string;
  type: "image" | "video" | "pdf";
};

export function usePreview(files: File[] | null) {
  const [previews, setPreviews] = useState<PreviewFile[]>([]);

  useEffect(() => {
    if (!files || files.length === 0) {
      setPreviews([]);
      return;
    }

    const newPreviews = files.map((file) => {
      let type: PreviewFile["type"] = "image";
      if (file.type.startsWith("video")) type = "video";
      else if (file.type === "application/pdf") type = "pdf";

      const previewUrl =
        type === "pdf"
          ? "" // PDFs don't need data URL for preview
          : URL.createObjectURL(file);

      return { file, previewUrl, type };
    });

    setPreviews(newPreviews);

    // cleanup
    return () => {
      newPreviews.forEach((p) => {
        if (p.previewUrl) URL.revokeObjectURL(p.previewUrl);
      });
    };
  }, [files]);

  return previews;
}
