import { DeviceType } from "@prisma/client";

export interface ParsedUserAgent {
  device: DeviceType;
  browser: string;
  os: string;
}

export function parseUserAgent(uaString: string | null): ParsedUserAgent {
  if (!uaString) {
    return {
      device: DeviceType.DESKTOP,
      browser: "Unknown",
      os: "Unknown",
    };
  }

  const ua = uaString.toLowerCase();
  
  // 1. Device detection
  let device: DeviceType = DeviceType.DESKTOP;
  if (/ipad|tablet|playbook|silk/i.test(ua)) {
    device = DeviceType.TABLET;
  } else if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile|wpdesktop/i.test(ua)) {
    device = DeviceType.MOBILE;
  }

  // 2. Browser detection
  let browser = "Unknown Browser";
  if (ua.includes("firefox")) {
    browser = "Firefox";
  } else if (ua.includes("opera") || ua.includes("opr")) {
    browser = "Opera";
  } else if (ua.includes("chrome") && !ua.includes("edge") && !ua.includes("edg")) {
    browser = "Chrome";
  } else if (ua.includes("safari") && !ua.includes("chrome")) {
    browser = "Safari";
  } else if (ua.includes("edge") || ua.includes("edg")) {
    browser = "Edge";
  } else if (ua.includes("trident") || ua.includes("msie")) {
    browser = "Internet Explorer";
  }

  // 3. OS detection
  let os = "Unknown OS";
  if (ua.includes("windows")) {
    os = "Windows";
  } else if (ua.includes("macintosh") || ua.includes("mac os")) {
    os = "macOS";
  } else if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ipod")) {
    os = "iOS";
  } else if (ua.includes("android")) {
    os = "Android";
  } else if (ua.includes("linux")) {
    os = "Linux";
  }

  return { device, browser, os };
}
