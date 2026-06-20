import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  const user = session?.user as any;
  if (!user?.id || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { directLink, bannerZone } = await req.json();

    // Check if configuration parameters are populated
    const results: Record<string, boolean> = {
      directLinkValid: !!directLink && directLink.startsWith("http"),
      bannerZoneValid: !!bannerZone && /^\d+$/.test(bannerZone),
    };

    return NextResponse.json({ success: true, results });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi kiểm thử cấu hình." }, { status: 500 });
  }
}
