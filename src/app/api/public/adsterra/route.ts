import { NextRequest, NextResponse } from "next/server";
import { getAdsterraConfig } from "@/lib/adsterra";

export async function GET(req: NextRequest) {
  try {
    const config = await getAdsterraConfig();
    
    // Only return safe public data needed for client ad scripts
    return NextResponse.json({
      success: true,
      settings: {
        publisherId: config.publisherId,
        directLink: config.directLink,
        bannerZone: config.bannerZone,
        socialBarZone: config.socialBarZone,
        nativeZone: config.nativeZone,
        popunderZone: config.popunderZone,
        enableDirectLink: config.enableDirectLink,
        enableBanner: config.enableBanner,
        enableSocialBar: config.enableSocialBar,
        enableNative: config.enableNative,
        enablePopunder: config.enablePopunder,
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Lỗi máy chủ khi lấy cấu hình quảng cáo." },
      { status: 500 }
    );
  }
}
