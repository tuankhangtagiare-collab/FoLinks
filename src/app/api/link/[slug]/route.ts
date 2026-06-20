import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const link = await prisma.link.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        password: true, // we check if exists: password ? true : false
        status: true,
        expiredAt: true,
      },
    });

    if (!link || link.status === "DELETED") {
      return NextResponse.json({ error: "Liên kết không tồn tại." }, { status: 404 });
    }

    if (link.status === "PAUSED") {
      return NextResponse.json({ error: "Liên kết đã bị tạm dừng." }, { status: 403 });
    }

    if (link.expiredAt && new Date() > link.expiredAt) {
      return NextResponse.json({ error: "Liên kết đã hết hạn." }, { status: 410 });
    }

    return NextResponse.json({
      id: link.id,
      slug: link.slug,
      title: link.title || "Tải liên kết",
      description: link.description || "",
      hasPassword: !!link.password,
    });

  } catch (error) {
    console.error("Public Link Get API Error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi tải thông tin liên kết." }, { status: 500 });
  }
}
