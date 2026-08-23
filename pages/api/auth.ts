import type { NextApiRequest, NextApiResponse } from "next";
import type { Buffer } from "node:buffer";
import { createHash, timingSafeEqual } from "node:crypto";
import process from "node:process";

interface AuthResponse {
  authorized: boolean;
}

function readInviteCode(body: unknown): string | undefined {
  try {
    if (
      body === null ||
      typeof body !== "object" ||
      Array.isArray(body) ||
      !Object.prototype.hasOwnProperty.call(body, "inviteCode")
    ) {
      return undefined;
    }

    const inviteCode = (body as { inviteCode?: unknown }).inviteCode;
    return typeof inviteCode === "string" && inviteCode.trim().length > 0 ? inviteCode : undefined;
  } catch {
    return undefined;
  }
}

function digest(value: string): Buffer {
  return createHash("sha256").update(value, "utf16le").digest();
}

function handler(req: NextApiRequest, res: NextApiResponse<AuthResponse>) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ authorized: false });
  }

  const configuredInviteCode = process.env.INVITE_CODE;
  if (configuredInviteCode === undefined || configuredInviteCode.trim().length === 0)
    return res.status(503).json({ authorized: false });

  const inviteCode = readInviteCode(req.body);
  if (inviteCode === undefined) return res.status(400).json({ authorized: false });

  if (!timingSafeEqual(digest(configuredInviteCode), digest(inviteCode))) {
    return res.status(401).json({ authorized: false });
  }

  return res.status(200).json({ authorized: true });
}

export default handler;
