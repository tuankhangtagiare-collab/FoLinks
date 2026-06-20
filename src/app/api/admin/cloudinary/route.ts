import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  const userSession = session?.user as any;

  if (!session || (userSession?.role !== "ADMIN" && userSession?.role !== "SUPER_ADMIN" && userSession?.role !== "MODERATOR")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "15");
  const folder = searchParams.get("folder") || "ALL";

  const skip = (page - 1) * limit;

  try {
    const where: any = {};
    if (folder !== "ALL") {
      where.folder = folder;
    }

    const [assets, total] = await Promise.all([
      prisma.cloudinaryAsset.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              username: true,
            },
          },
        },
      }),
      prisma.cloudinaryAsset.count({ where }),
    ]);

    // Aggregate statistics
    const totalCount = await prisma.cloudinaryAsset.count();
    
    const totalBytes = await prisma.cloudinaryAsset.aggregate({
      _sum: { bytes: true },
    });

    const folderStats = await prisma.cloudinaryAsset.groupBy({
      by: ["folder"],
      _count: { id: true },
    });

    return NextResponse.json({
      assets: assets.map((a) => ({
        id: a.id,
        publicId: a.publicId,
        url: a.url,
        folder: a.folder,
        bytes: a.bytes,
        width: a.width,
        height: a.height,
        format: a.format,
        createdAt: a.createdAt,
        uploader: a.user.username,
      })),
      stats: {
        totalImages: totalCount,
        totalBytes: totalBytes._sum.bytes || 0,
        folders: folderStats.map((f) => ({ name: f.folder, count: f._count.id })),
      },
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error("Admin Media Manager API Error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi tải Media." }, { status: 500 });
  }
}
