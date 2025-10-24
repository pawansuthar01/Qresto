import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/ogg",
  "application/pdf",
];

// GET - List media files with pagination (20 per page) + type filtering
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { authorized, error } = await authorize(params.id, "media.upload");
    if (!authorized) return NextResponse.json({ error }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // image | video | pdf
    const category = searchParams.get("category");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "1", 20);
    const skip = (page - 1) * limit;

    const whereClause: any = {
      restaurantId: params.id,
      ...(type && { type }), // ✅ filter by type if provided
      ...(category && { category }),
    };

    const [media, total, countImages, countVideos, countPdfs] =
      await Promise.all([
        prisma.media.findMany({
          where: whereClause,
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.media.count({ where: whereClause }),
        prisma.media.count({
          where: { restaurantId: params.id, type: "image" },
        }),
        prisma.media.count({
          where: { restaurantId: params.id, type: "video" },
        }),
        prisma.media.count({ where: { restaurantId: params.id, type: "pdf" } }),
      ]);

    return NextResponse.json({
      media,
      counts: {
        images: countImages,
        videos: countVideos,
        pdfs: countPdfs,
      },
      pagination: {
        page,
        totalPages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Error fetching media:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { authorized, error } = await authorize(params.id, "media.upload");
    if (!authorized) return NextResponse.json({ error }, { status: 403 });

    const formData = await request.formData();
    const file = formData.get("file") as File;
    // Validate type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    // Validate size
    if (file.type.startsWith("image") && file.size > MAX_IMAGE_SIZE)
      return NextResponse.json(
        { error: "Image too large. Max 5MB allowed." },
        { status: 400 }
      );

    if (file.type.startsWith("video") && file.size > MAX_VIDEO_SIZE)
      return NextResponse.json(
        { error: "Video too large. Max 50MB allowed." },
        { status: 400 }
      );

    if (file.type === "application/pdf" && file.size > MAX_PDF_SIZE)
      return NextResponse.json(
        { error: "PDF too large. Max 10MB allowed." },
        { status: 400 }
      );
    const category = (formData.get("category") as string) || "other";

    if (!file)
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type", status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to Cloudinary
    const isVideo = file.type.startsWith("video");
    const isPdf = file.type === "application/pdf";

    const uploadOptions: any = {
      resource_type: isVideo ? "video" : "image",
      folder: `restaurants/${params.id}`,
      public_id: file.name.split(".")[0] + "-" + Date.now(),
    };

    let result;
    if (isPdf) {
      // PDFs are uploaded as raw files
      uploadOptions.resource_type = "raw";
      result = await cloudinary.uploader.upload_stream(
        uploadOptions,
        async (error, res) => {
          if (error) throw error;
          return res;
        }
      );
    } else {
      result = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, res) => {
            if (error) reject(error);
            else resolve(res);
          }
        );
        stream.end(buffer);
      });
    }

    // Determine type
    const mediaType = isVideo ? "video" : isPdf ? "pdf" : "image";

    // Save to DB
    const media = await prisma.media.create({
      data: {
        filename: file.name,
        url: result.secure_url,
        mimeType: file.type,
        size: file.size,
        type: mediaType,
        category,
        restaurantId: params.id,
      },
    });

    return NextResponse.json(media, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

// DELETE - Delete media file
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { authorized, error } = await authorize(params.id, "media.upload");
    if (!authorized) return NextResponse.json({ error }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const mediaId = searchParams.get("mediaId");

    if (!mediaId)
      return NextResponse.json({ error: "Media ID required" }, { status: 400 });

    await prisma.media.delete({
      where: {
        id: mediaId,
        restaurantId: params.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting media:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
