import prisma from "@/lib/db";
import crypto from "crypto";
import { Prisma } from "@prisma/client";
import { WalletService } from "./wallet-service";

export class ApiPlatformService {
  /**
   * Generates a cryptographically secure random API key starting with FoKey_
   */
  static generateApiKeyString(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let result = "FoKey_";
    const bytes = crypto.randomBytes(40);
    for (let i = 0; i < 40; i++) {
      result += chars.charAt(bytes[i] % chars.length);
    }
    return result;
  }

  /**
   * Helper to compute signature of a payload using HMAC SHA256
   */
  static computeSignature(payload: string, secret: string): string {
    return crypto.createHmac("sha256", secret).update(payload).digest("hex");
  }

  /**
   * Creates a bypass token configuration for external applications
   */
  static async createBypassKey({
    applicationId,
    userId,
    mode = "ONE_BYPASS",
    customCount = 1,
    reward = 0.05,
    expiresInSeconds = 86400,
  }: {
    applicationId: string;
    userId: string;
    mode?: "ONE_BYPASS" | "DOUBLE_BYPASS" | "CUSTOM";
    customCount?: number;
    reward?: number;
    expiresInSeconds?: number;
  }) {
    const key = this.generateApiKeyString();
    const expiredAt = new Date(Date.now() + expiresInSeconds * 1000);
    const requiredBypass = mode === "ONE_BYPASS" ? 1 : mode === "DOUBLE_BYPASS" ? 2 : customCount;

    return await prisma.apiKey.create({
      data: {
        applicationId,
        userId,
        key,
        mode,
        requiredBypass,
        reward,
        status: "PENDING",
        expiredAt,
      },
    });
  }

  /**
   * Trigger Callback Webhook for application status notification
   */
  static async triggerWebhook(applicationId: string, apiKey: string, status: string, reward: number) {
    const webhook = await prisma.apiWebhook.findFirst({
      where: { applicationId, status: "ACTIVE" },
    });

    if (!webhook) return;

    const payload = JSON.stringify({
      key: apiKey,
      status,
      reward,
      time: new Date().toISOString(),
    });

    const signature = this.computeSignature(payload, webhook.secret);

    // Queue webhook call via fire-and-forget async operation
    setTimeout(async () => {
      try {
        const res = await fetch(webhook.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Folink-Signature": signature,
          },
          body: payload,
          signal: AbortSignal.timeout(5000), // 5s timeout
        });

        // Log transaction outcome
        await prisma.apiLog.create({
          data: {
            applicationId,
            endpoint: webhook.url,
            request: payload,
            response: `Status: ${res.status}`,
            statusCode: res.status,
            ip: "0.0.0.0",
            duration: 0,
          },
        });
      } catch (err: any) {
        // Record failed attempt
        await prisma.apiLog.create({
          data: {
            applicationId,
            endpoint: webhook.url,
            request: payload,
            response: err.message || "Connection timeout",
            statusCode: 504,
            ip: "0.0.0.0",
            duration: 0,
          },
        });
      }
    }, 0);
  }

  /**
   * Performs validation step bypass logic
   */
  static async completeBypassStep(keyString: string, visitorIp: string, userAgent: string, country?: string) {
    return await prisma.$transaction(async (tx) => {
      const apiKey = await tx.apiKey.findUnique({
        where: { key: keyString },
        include: { application: true },
      });

      if (!apiKey || apiKey.status !== "PENDING") {
        throw new Error("API Key is invalid or already processed.");
      }

      if (new Date() > apiKey.expiredAt) {
        await tx.apiKey.update({
          where: { id: apiKey.id },
          data: { status: "EXPIRED" },
        });
        throw new Error("API Key has expired.");
      }

      const completed = apiKey.completedBypass + 1;
      const remains = apiKey.requiredBypass - completed;
      const isFinished = remains <= 0;

      // Add visit log
      await tx.apiVisit.create({
        data: {
          apiKeyId: apiKey.id,
          userId: apiKey.userId,
          visitorIp,
          browser: userAgent,
          device: "DESKTOP",
          country: country || "VN",
          reward: isFinished ? apiKey.reward : 0,
        },
      });

      // Update Key status
      const updatedKey = await tx.apiKey.update({
        where: { id: apiKey.id },
        data: {
          completedBypass: completed,
          status: isFinished ? "COMPLETED" : "PENDING",
          completedAt: isFinished ? new Date() : null,
        },
      });

      if (isFinished) {
        // Safe Ledger Deposit
        await WalletService.deposit({
          userId: apiKey.userId,
          amount: Number(apiKey.reward),
          type: "EARNING",
          description: `API Get Key reward bypass completed for key: ${apiKey.key}`,
          referenceId: apiKey.id,
          ip: visitorIp,
          userAgent,
        });

        // Trigger Webhook alert
        await this.triggerWebhook(apiKey.applicationId, apiKey.key, "COMPLETED", Number(apiKey.reward));
      }

      return {
        completed,
        required: apiKey.requiredBypass,
        status: updatedKey.status,
        remaining: remains < 0 ? 0 : remains,
      };
    });
  }
}
