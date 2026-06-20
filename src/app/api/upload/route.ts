import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";
import { uploadImage, replaceImage, deleteImage } from "@/lib/cloudinary";
import { logActivity } from "@/lib/logger";
import { getClientIp } from "@/lib/security";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "image/avif",
];

const FOLDER_LIMITS: { [key: string]: number } = {
  avatars: 2 * 1024 * 1024,      // 2MB
  logos: 3 * 1024 * 1024,        // 3MB
  banners: 5 * 1024 * 1024,      // 5MB
  backgrounds: 5 * 1024 * 1024,  // 5MB
  proofs: 10 * 1024 * 1024,      // 10MB
  ads: 8 * 1024 * 1024,          // 8MB
  misc: 5 * 1024 * 1024,         // 5MB
  news: 5 * 1024 * 1024,         // 5MB
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const ip = getClientIp(req);
  const userAgent = req.headers.get("user-agent");

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folder = formData.get("folder") as string || "misc";

    // 1. Validation checks
    if (!file) {
      return NextResponse.json({ error: "Vui lòng chọn file để upload." }, { status: 400 });
    }

    const folderLimit = FOLDER_LIMITS[folder] || 5 * 1024 * 1024;
    if (file.size > folderLimit) {
      return NextResponse.json(
        { error: `Dung lượng file vượt quá giới hạn cho phép của thư mục (${(folderLimit / (1024 * 1024))}MB).` },
        { status: 413 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Định dạng file không được hỗ trợ." }, { status: 415 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Apply transformation parameters based on folder type
    const uploadOptions: any = {};
    if (folder === "avatars") {
      uploadOptions.transformation = [
        { width: 512, height: 512, crop: "fill", gravity: "auto" },
      ];
    } else if (folder === "backgrounds") {
      uploadOptions.transformation = [
        { width: 1920, height: 1080, crop: "fill" },
      ];
    } else if (folder === "logos") {
      uploadOptions.transformation = [
        { width: 512, height: 512, crop: "fit" },
      ];
    } else if (folder === "banners") {
      uploadOptions.transformation = [
        { width: 1600, height: 900, crop: "fill" },
      ];
    }

    // 2. Perform Cloudinary upload
    const result = await uploadImage(buffer, folder, uploadOptions);

    // 3. Save details to database
    const asset = await prisma.cloudinaryAsset.create({
      data: {
        userId,
        publicId: result.public_id,
        url: result.secure_url,
        folder,
        bytes: result.bytes,
        width: result.width,
        height: result.height,
        format: result.format,
      },
    });

    // 4. Update user profile directly if it matches profile asset folders
    if (["avatars", "backgrounds", "banners", "logos"].includes(folder)) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      const updateData: any = {};

      if (folder === "avatars") {
        updateData.avatar = result.secure_url;
        // Delete old avatar asset from DB/Cloudinary if applicable (optional clean checks)
      } else if (folder === "backgrounds") {
        updateData.background = result.secure_url;
      } else if (folder === "banners") {
        updateData.banner = result.secure_url;
      } else if (folder === "logos") {
        updateData.logo = result.secure_url;
      }

      await prisma.user.update({
        where: { id: userId },
        data: updateData,
      });
    }

    // Write Log
    await logActivity({
      userId,
      action: `UPLOAD_IMAGE_${folder}`,
      ip,
      url: "/api/upload",
      method: "POST",
      userAgent,
      payload: { publicId: result.public_id, bytes: result.bytes },
    });

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      asset,
    });

  } catch (error) {
    console.error("Upload API Error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi tải ảnh lên." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const ip = getClientIp(req);
  const userAgent = req.headers.get("user-agent");

  try {
    const { searchParams } = req.nextUrl;
    const publicId = searchParams.get("publicId");

    if (!publicId) {
      return NextResponse.json({ error: "Thiếu publicId ảnh cần xóa." }, { status: 400 });
    }

    // Find asset in DB
    const asset = await prisma.cloudinaryAsset.findUnique({
      where: { publicId },
    });

    if (!asset) {
      return NextResponse.json({ error: "Không tìm thấy ảnh trong cơ sở dữ liệu." }, { status: 404 });
    }

    // Check permissions: only owners or admins can delete
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (asset.userId !== userId && user?.role !== "ADMIN" && user?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Quyền hạn không cho phép xóa ảnh này." }, { status: 403 });
    }

    // Delete from Cloudinary
    await deleteImage(publicId);

    // Delete from DB
    await prisma.cloudinaryAsset.delete({
      where: { publicId },
    });

    // Write Log
    await logActivity({
      userId,
      action: `DELETE_IMAGE_${publicId}`,
      ip,
      url: "/api/upload",
      method: "DELETE",
      userAgent,
    });

    return NextResponse.json({
      success: true,
      message: "Xóa hình ảnh thành công!",
    });

  } catch (error) {
    console.error("Delete Image API Error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi xóa ảnh." }, { status: 500 });
  }
}
