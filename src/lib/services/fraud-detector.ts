import prisma from "@/lib/db";
import { DeviceType } from "@prisma/client";

export interface FraudCheckResult {
  isFraud: boolean;
  reason: string[];
  riskScore: number; // 0 to 100
  vpn: boolean;
  proxy: boolean;
  bot: boolean;
  emulator: boolean;
}

export async function detectFraud({
  ip,
  fingerprint,
  userAgent,
  webdriver = false,
  headless = false,
  screenResolution = "",
  timezone = "",
}: {
  ip: string;
  fingerprint?: string;
  userAgent?: string;
  webdriver?: boolean;
  headless?: boolean;
  screenResolution?: string;
  timezone?: string;
}): Promise<FraudCheckResult> {
  const reasons: string[] = [];
  let riskScore = 0;
  let vpn = false;
  let proxy = false;
  let bot = false;
  let emulator = false;

  // 1. Bot check via webdriver or headless indicators
  if (webdriver) {
    bot = true;
    riskScore += 50;
    reasons.push("WebDriver automation flag detected");
  }
  if (headless) {
    bot = true;
    riskScore += 40;
    reasons.push("Headless browser signatures detected");
  }

  // 2. User-Agent checks
  const ua = (userAgent || "").toLowerCase();
  if (/headlesschrome|puppeteer|selenium|playwright|bot|crawl|spider/i.test(ua)) {
    bot = true;
    riskScore += 60;
    reasons.push("Bot or headless crawler signature in User-Agent");
  }

  // 3. Timezone/IP/Location mismatches
  // (In high-end setup, query ip-api or ipqualityscore. Here we do standard checks)
  // Check if IP is from a common cloud hosting provider range (optional/advanced, let's keep it simple)
  
  // 4. Duplicate checks: check if this IP has visited too many times within the last 24 hours
  const duplicateIpCount = await prisma.linkVisit.count({
    where: {
      visitorIp: ip,
      visitTime: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // last 24 hours
      },
    },
  });

  if (duplicateIpCount >= 5) {
    riskScore += 30;
    reasons.push(`High frequency IP access (${duplicateIpCount} visits in 24 hours)`);
  }

  if (fingerprint) {
    const duplicateFpCount = await prisma.linkVisit.count({
      where: {
        fingerprint,
        visitTime: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });

    if (duplicateFpCount >= 3) {
      riskScore += 35;
      reasons.push(`High frequency browser fingerprint access (${duplicateFpCount} visits in 24 hours)`);
    }
  }

  // Cap risk score at 100
  riskScore = Math.min(riskScore, 100);
  const isFraud = riskScore >= 50;

  return {
    isFraud,
    reason: reasons,
    riskScore,
    vpn,
    proxy,
    bot,
    emulator,
  };
}

export async function isDuplicateVisit(
  ip: string,
  fingerprint: string | null,
  linkId: string,
  duplicateTimeMinutes: number = 1440 // 24 hours default
): Promise<boolean> {
  const cutoffTime = new Date(Date.now() - duplicateTimeMinutes * 60 * 1000);

  const duplicate = await prisma.linkVisit.findFirst({
    where: {
      linkId,
      status: "VALID",
      visitTime: { gte: cutoffTime },
      OR: [
        { visitorIp: ip },
        fingerprint ? { fingerprint } : {},
      ].filter((condition) => Object.keys(condition).length > 0),
    },
  });

  return !!duplicate;
}
