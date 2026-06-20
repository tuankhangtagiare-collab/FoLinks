import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";
import { z } from "zod";
import { getClientIp } from "@/lib/security";

const adsterraSchema = z.object({
  publisherId: z.string().optional().nullable(),
  directLink: z.string().url("Direct Link phải là URL hợp lệ").or(z.literal("")).optional().nullable(),
  bannerZone: z.string().regex(/^\d*$/, "Zone ID chỉ được chứa số").optional().nullable(),
  socialBarZone: z.string().regex(/^\d*$/, "Zone ID chỉ được chứa số").optional().nullable(),
  nativeZone: z.string().regex(/^\d*$/, "Zone ID chỉ được chứa số").optional().nullable(),
  // popunderZone stores either a numeric Zone ID OR a full https:// Anti-Adblock JS script URL
  popunderZone: z.string().optional().nullable(),
  enableDirectLink: z.boolean().default(false),
  enableBanner: z.boolean().default(false),
  enableSocialBar: z.boolean().default(false),
  enableNative: z.boolean().default(false),
  enablePopunder: z.boolean().default(false),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  const user = session?.user as any;
  if (!user?.id || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    let settings = await prisma.adsterraSettings.findFirst();
    if (!settings) {
      settings = await prisma.adsterraSettings.create({
        data: {
          publisherId: process.env.ADSTERRA_PUBLISHER_ID || "",
          directLink: process.env.ADSTERRA_DIRECT_LINK || "",
          bannerZone: process.env.ADSTERRA_BANNER_ZONE || "",
          socialBarZone: process.env.ADSTERRA_SOCIAL_BAR_ZONE || "",
          nativeZone: process.env.ADSTERRA_NATIVE_ZONE || "",
          popunderZone: process.env.ADSTERRA_POPUNDER_ZONE || "",
          enableDirectLink: !!process.env.ADSTERRA_DIRECT_LINK,
          enableBanner: !!process.env.ADSTERRA_BANNER_ZONE,
          enableSocialBar: !!process.env.ADSTERRA_SOCIAL_BAR_ZONE,
          enableNative: !!process.env.ADSTERRA_NATIVE_ZONE,
          enablePopunder: !!process.env.ADSTERRA_POPUNDER_ZONE,
        },
      });
    }

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi máy chủ khi tải cấu hình quảng cáo." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  const user = session?.user as any;
  if (!user?.id || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const ip = getClientIp(req);

  try {
    const body = await req.json();
    const validated = adsterraSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Dữ liệu cấu hình không hợp lệ", details: validated.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const val = validated.data;
    
    // Enforcement validation: Do not allow enabling active fields if values are missing
    if (val.enableDirectLink && !val.directLink) {
      return NextResponse.json({ error: "Không được bật Direct Link khi trường URL trống." }, { status: 400 });
    }
    if (val.enableBanner && !val.bannerZone) {
      return NextResponse.json({ error: "Không được bật Banner khi trường Zone ID trống." }, { status: 400 });
    }
    if (val.enableSocialBar && !val.socialBarZone) {
      return NextResponse.json({ error: "Không được bật Social Bar khi trường Zone ID trống." }, { status: 400 });
    }
    if (val.enableNative && !val.nativeZone) {
      return NextResponse.json({ error: "Không được bật Native Banner khi trường Zone ID trống." }, { status: 400 });
    }
    if (val.enablePopunder && !val.popunderZone) {
      return NextResponse.json({ error: "Không được bật Popunder khi trường Zone ID trống." }, { status: 400 });
    }

    let settings = await prisma.adsterraSettings.findFirst();

    const dataPayload = {
      publisherId: val.publisherId || "",
      directLink: val.directLink || "",
      bannerZone: val.bannerZone || "",
      socialBarZone: val.socialBarZone || "",
      nativeZone: val.nativeZone || "",
      popunderZone: val.popunderZone || "",
      enableDirectLink: val.enableDirectLink,
      enableBanner: val.enableBanner,
      enableSocialBar: val.enableSocialBar,
      enableNative: val.enableNative,
      enablePopunder: val.enablePopunder,
    };

    const oldSettingsString = settings ? JSON.stringify(settings) : "{}";

    if (!settings) {
      settings = await prisma.adsterraSettings.create({ data: dataPayload });
    } else {
      settings = await prisma.adsterraSettings.update({
        where: { id: settings.id },
        data: dataPayload,
      });
    }

    // Write Audit Log entry
    await prisma.auditLog.create({
      data: {
        adminId: (session?.user?.id as string) || "system",
        action: "UPDATE_ADSTERRA_CONFIG",
        oldValue: oldSettingsString,
        newValue: JSON.stringify(settings),
      },
    });

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi máy chủ khi cập nhật cấu hình quảng cáo." }, { status: 500 });
  }
}
