import crypto from "crypto";

const SECRET = process.env.AUTH_SECRET || "fallback-secret-for-tokens-123456";

export function generateToken(payload: any, expiresInSeconds: number = 3600): string {
  const expiresAt = Date.now() + expiresInSeconds * 1000;
  const data = JSON.stringify({ ...payload, expiresAt });
  
  const hmac = crypto.createHmac("sha256", SECRET);
  hmac.update(data);
  const signature = hmac.digest("hex");

  const combined = { data, signature };
  return Buffer.from(JSON.stringify(combined)).toString("base64url");
}

export function verifyToken(token: string): any | null {
  try {
    const decoded = JSON.parse(Buffer.from(token, "base64url").toString("utf8"));
    const { data, signature } = decoded;

    // Verify signature
    const hmac = crypto.createHmac("sha256", SECRET);
    hmac.update(data);
    const expectedSignature = hmac.digest("hex");

    if (signature !== expectedSignature) {
      return null; // Signature invalid
    }

    const payload = JSON.parse(data);
    if (Date.now() > payload.expiresAt) {
      return null; // Token expired
    }

    return payload;
  } catch (error) {
    return null; // Invalid token format
  }
}
