import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";
import { CreateLinkSchema } from "@/lib/validation";
import { logActivity } from "@/lib/logger";
import { getClientIp } from "@/lib/security";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const ip = getClientIp(req);
  const userAgent = req.headers.get("user-agent");

  try {
    const body = await req.json();
    const validated = CreateLinkSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Dữ liệu liên kết không hợp lệ", details: validated.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const { originalUrl, slug, title, description, password, targetCountry, targetDevice } = validated.data;

    let finalSlug = slug?.trim();
    if (finalSlug) {
      // Check if custom slug is already in use
      const existingLink = await prisma.link.findUnique({
        where: { slug: finalSlug },
      });
      if (existingLink) {
        return NextResponse.json({ error: "Đường dẫn rút gọn (slug) đã được sử dụng." }, { status: 400 });
      }
    } else {
      // Generate a random 6-character slug
      let attempts = 0;
      while (attempts < 10) {
        finalSlug = Math.random().toString(36).substring(2, 8);
        const existingLink = await prisma.link.findUnique({
          where: { slug: finalSlug },
        });
        if (!existingLink) break;
        attempts++;
      }
      if (attempts === 10) {
        return NextResponse.json({ error: "Lỗi hệ thống khi sinh đường dẫn rút gọn." }, { status: 500 });
      }
    }

    // Get default CPM from SiteSettings
    const settings = await prisma.siteSettings.findFirst();
    const cpm = settings?.defaultCpm || 3.00;

    // Create Link
    const newLink = await prisma.link.create({
      data: {
        userId,
        slug: finalSlug!,
        originalUrl,
        title: title || null,
        description: description || null,
        password: password || null,
        cpm,
        targetCountry: targetCountry || null,
        targetDevice: targetDevice || null,
        status: "ACTIVE",
      },
    });

    // Log Activity
    await logActivity({
      userId,
      action: "CREATE_LINK",
      ip,
      url: `/api/user/links`,
      method: "POST",
      userAgent,
      payload: { slug: finalSlug, originalUrl },
    });

    return NextResponse.json({
      success: true,
      message: "Rút gọn liên kết thành công!",
      link: newLink,
    });

  } catch (error) {
    console.error("Create Link API Error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi tạo liên kết." }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const searchParams = req.nextUrl.searchParams;

  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "ALL";
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") || "desc";

  const skip = (page - 1) * limit;

  try {
    // Build query conditions
    const where: any = {
      userId,
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
        { originalUrl: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status !== "ALL") {
      where.status = status;
    }

    const [links, total] = await Promise.all([
      prisma.link.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      prisma.link.count({ where }),
    ]);

    return NextResponse.json({
      links,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error("List Links API Error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi tải danh sách liên kết." }, { status: 500 });
  }
}
