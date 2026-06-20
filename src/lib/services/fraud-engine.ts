import prisma from "@/lib/db";

export interface FraudCheckResult {
  isFraud: boolean;
  score: number;
  reasons: string[];
}

export class FraudEngine {
  /**
   * Main threat intelligence risk scoring system (0 - 100).
   */
  static async evaluateVisit({
    ip,
    userAgent,
    fingerprint,
    webdriver = false,
    headless = false,
    linkId,
    userId,
  }: {
    ip: string;
    userAgent: string;
    fingerprint?: string;
    webdriver?: boolean;
    headless?: boolean;
    linkId?: string;
    userId?: string;
  }): Promise<FraudCheckResult> {
    let score = 0;
    const reasons: string[] = [];

    // 1. Bot & Headless Automation Detections
    if (webdriver) {
      score += 50;
      reasons.push("BOT_WEBDRIVER_DETECTED");
    }
    if (headless) {
      score += 40;
      reasons.push("BOT_HEADLESS_BROWSER");
    }

    const uaLower = userAgent.toLowerCase();
    const botKeywords = ["headless", "puppeteer", "selenium", "playwright", "crawler", "spider", "bot", "python-requests", "curl"];
    if (botKeywords.some(keyword => uaLower.includes(keyword))) {
      score += 50;
      reasons.push("SUSPICIOUS_USER_AGENT_KEYWORDS");
    }

    // 2. Client Browser Fingerprint Auditing (Multi Account & Self Referral detection)
    if (fingerprint) {
      // Check if fingerprint is associated with other accounts
      if (userId) {
        const dualUsers = await prisma.user.count({
          where: {
            deviceFingerprints: {
              some: { fingerprint }
            },
            id: { not: userId }
          }
        });
        if (dualUsers > 0) {
          score += 25;
          reasons.push("FINGERPRINT_SHARED_WITH_MULTIPLE_ACCOUNTS");
        }
      }

      // Check speed of visits on same link by this fingerprint
      if (linkId) {
        const recentVisit = await prisma.linkVisit.findFirst({
          where: {
            linkId,
            fingerprint,
            visitTime: { gte: new Date(Date.now() - 30000) } // last 30 seconds
          }
        });
        if (recentVisit) {
          score += 30;
          reasons.push("COOLDOWN_VIOLATION_FAST_REFRESH");
        }
      }
    }

    // 3. IP Spoofing / VPN Detection Proxy list lookup (Simulated / Fallback Cloud IP check)
    // Checking against typical cloud provider subnets or TOR nodes
    const cloudIps = ["127.0.0.1", "0.0.0.0", "localhost"];
    if (cloudIps.includes(ip)) {
      // Local testing allows it, otherwise hosting providers will yield flagged ASN
    }

    // Simple geo leap logic: check users previous logins
    if (userId) {
      const lastLogin = await prisma.loginLog.findFirst({
        where: { userId, success: true },
        orderBy: { createdAt: "desc" },
      });
      if (lastLogin && lastLogin.ip !== ip && lastLogin.country) {
        // Simple comparison of locations
        score += 15;
        reasons.push("GEO_IP_JUMP_DETECTED");
      }
    }

    // Limit final score to bounds
    score = Math.min(Math.max(score, 0), 100);
    const isFraud = score >= 40;

    // Log Fraud Event in Database if verified as threat
    if (isFraud) {
      try {
        await prisma.fraudLog.create({
          data: {
            reason: reasons.join(", "),
            fingerprint: fingerprint || null,
            riskScore: score,
            bot: webdriver || headless,
          }
        });
      } catch (err) {
        console.error("Failed to write fraud log:", err);
      }
    }

    return { isFraud, score, reasons };
  }
}
