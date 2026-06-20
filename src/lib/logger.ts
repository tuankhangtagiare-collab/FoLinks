import prisma from "./db";
import { parseUserAgent } from "./device";

export async function logActivity({
  userId,
  action,
  ip,
  url,
  method,
  userAgent,
  payload,
}: {
  userId?: string;
  action: string;
  ip: string;
  url: string;
  method: string;
  userAgent?: string | null;
  payload?: any;
}) {
  try {
    const { device, browser } = parseUserAgent(userAgent || null);
    await prisma.activityLog.create({
      data: {
        userId: userId || null,
        action,
        ip,
        device: device.toString(),
        browser,
        url,
        method,
        payload: payload ? JSON.stringify(payload) : null,
      },
    });
  } catch (error) {
    console.error("Failed to write activity log:", error);
  }
}

export async function logLogin({
  userId,
  email,
  ip,
  userAgent,
  success,
  reason,
  country,
  city,
}: {
  userId?: string;
  email?: string;
  ip: string;
  userAgent?: string | null;
  success: boolean;
  reason?: string;
  country?: string;
  city?: string;
}) {
  try {
    const { device, browser, os } = parseUserAgent(userAgent || null);
    await prisma.loginLog.create({
      data: {
        userId: userId || null,
        email: email || null,
        ip,
        country: country || "Unknown",
        city: city || "Unknown",
        device: device.toString(),
        browser,
        os,
        success,
        reason: reason || null,
      },
    });
  } catch (error) {
    console.error("Failed to write login log:", error);
  }
}

export async function logFraud({
  visitId,
  reason,
  fingerprint,
  vpn = false,
  proxy = false,
  bot = false,
  emulator = false,
  riskScore = 0,
}: {
  visitId?: string;
  reason: string;
  fingerprint?: string;
  vpn?: boolean;
  proxy?: boolean;
  bot?: boolean;
  emulator?: boolean;
  riskScore?: number;
}) {
  try {
    await prisma.fraudLog.create({
      data: {
        visitId: visitId || null,
        reason,
        fingerprint: fingerprint || null,
        vpn,
        proxy,
        bot,
        emulator,
        riskScore,
      },
    });
  } catch (error) {
    console.error("Failed to write fraud log:", error);
  }
}
