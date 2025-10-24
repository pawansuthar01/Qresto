import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function uploadMedia(
  media: string,
  options?: {
    folder?: string;
    width?: number;
    height?: number;
    crop?: "fill" | "scale" | "limit" | "fit";
  }
): Promise<string> {
  if (media.startsWith("https://")) return media;

  const uploadOptions: Record<string, any> = {
    folder: options?.folder || "Qresto/media",
  };

  if (options?.width || options?.height) {
    uploadOptions.transformation = [
      {
        width: options.width,
        height: options.height,
        crop: options.crop || "fill",
      },
    ];
  }

  const result = await cloudinary.uploader.upload(media, uploadOptions);
  return result.secure_url;
}
