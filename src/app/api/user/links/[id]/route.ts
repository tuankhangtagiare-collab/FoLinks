import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";
import { CreateLinkSchema } from "@/lib/validation";
import { logActivity } from "@/lib/logger";
import { getClientIp } from "@/lib/security";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { id } = await params;

  try {
    const link = await prisma.link.findFirst({
      where: { id, userId, deletedAt: null },
    });

    if (!link) {
      return NextResponse.json({ error: "Không tìm thấy liên kết." }, { status: 404 });
    }

    // Fetch stats for this link: Country, Device, Browser, Referrer
    const countryStats = await prisma.linkVisit.groupBy({
      by: ["country"],
      where: { linkId: id, status: "VALID" },
      _count: { id: true },
      _sum: { reward: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    });

    const deviceStats = await prisma.linkVisit.groupBy({
      by: ["device"],
      where: { linkId: id, status: "VALID" },
      _count: { id: true },
    });

    const browserStats = await prisma.linkVisit.groupBy({
      by: ["browser"],
      where: { linkId: id, status: "VALID" },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    });

    const referrerStats = await prisma.linkVisit.groupBy({
      by: ["referrer"],
      where: { linkId: id, status: "VALID" },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    });

    return NextResponse.json({
      link,
      stats: {
        countries: countryStats.map((c) => ({
          country: c.country || "Khác",
          views: c._count.id,
          revenue: Number(c._sum.reward || 0),
        })),
        devices: deviceStats.map((d) => ({
          device: d.device,
          views: d._count.id,
        })),
        browsers: browserStats.map((b) => ({
          browser: b.browser || "Khác",
          views: b._count.id,
        })),
        referrers: referrerStats.map((r) => ({
          referrer: r.referrer || "Trực tiếp",
          views: r._count.id,
        })),
      },
    });

  } catch (error) {
    console.error("Get Link Detail API Error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi tải chi tiết liên kết." }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { id } = await params;
  const ip = getClientIp(req);
  const userAgent = req.headers.get("user-agent");

  try {
    const link = await prisma.link.findFirst({
      where: { id, userId, deletedAt: null },
    });

    if (!link) {
      return NextResponse.json({ error: "Không tìm thấy liên kết." }, { status: 404 });
    }

    const body = await req.json();
    
    // We allow updating title, description, password, targetCountry, targetDevice, status
    const { title, description, password, targetCountry, targetDevice, status } = body;

    const updatedLink = await prisma.link.update({
      where: { id },
      data: {
        title: title !== undefined ? title : link.title,
        description: description !== undefined ? description : link.description,
        password: password !== undefined ? password : link.password,
        targetCountry: targetCountry !== undefined ? targetCountry : link.targetCountry,
        targetDevice: targetDevice !== undefined ? targetDevice : link.targetDevice,
        status: status !== undefined ? status : link.status,
      },
    });

    await logActivity({
      userId,
      action: "EDIT_LINK",
      ip,
      url: `/api/user/links/${id}`,
      method: "PUT",
      userAgent,
      payload: { id, slug: link.slug },
    });

    return NextResponse.json({
      success: true,
      message: "Cập nhật liên kết thành công!",
      link: updatedLink,
    });

  } catch (error) {
    console.error("Update Link API Error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi cập nhật liên kết." }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { id } = await params;
  const ip = getClientIp(req);
  const userAgent = req.headers.get("user-agent");

  try {
    const link = await prisma.link.findFirst({
      where: { id, userId, deletedAt: null },
    });

    if (!link) {
      return NextResponse.json({ error: "Không tìm thấy liên kết." }, { status: 404 });
    }

    // Soft delete
    await prisma.link.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: "DELETED",
      },
    });

    await logActivity({
      userId,
      action: "DELETE_LINK",
      ip,
      url: `/api/user/links/${id}`,
      method: "DELETE",
      userAgent,
      payload: { id, slug: link.slug },
    });

    return NextResponse.json({
      success: true,
      message: "Xóa liên kết thành công!",
    });

  } catch (error) {
    console.error("Delete Link API Error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi xóa liên kết." }, { status: 500 });
  }
}
