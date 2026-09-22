import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireMarketplaceAccess } from "@/lib/supabase/accessCheck";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_MESSAGE_LENGTH = 2000;
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 30;           // max 30 messages per minute per user

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  // Require verified + active subscription — cannot bypass via JWT manipulation
  const access = await requireMarketplaceAccess();
  if (!access.allowed) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  const { userId } = access;

  if (!checkRateLimit(userId)) {
    return NextResponse.json({ error: "Too many messages. Please slow down." }, { status: 429 });
  }

  const { receiverId, productId, message } = await req.json();

  if (!receiverId || !productId || !message?.trim())
    return NextResponse.json({ error: "receiverId, productId and message are required" }, { status: 400 });

  if (!UUID_REGEX.test(receiverId) || !UUID_REGEX.test(productId))
    return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });

  if (message.trim().length > MAX_MESSAGE_LENGTH)
    return NextResponse.json({ error: `Message too long (max ${MAX_MESSAGE_LENGTH} chars)` }, { status: 400 });

  if (receiverId === userId)
    return NextResponse.json({ error: "Cannot send message to yourself" }, { status: 400 });

  const db = createAdminClient();
  const { error } = await db.from("messages").insert({
    sender_id:   userId,
    receiver_id: receiverId,
    product_id:  productId,
    message:     message.trim(),
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
