import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_MESSAGE_LENGTH = 2000;
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 30;            // max 30 messages per minute per user

// Simple in-memory rate limiter (resets on server restart — sufficient for edge protection)
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
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Rate limiting
  if (!checkRateLimit(user.id)) {
    return NextResponse.json({ error: "Too many messages. Please slow down." }, { status: 429 });
  }

  const { receiverId, productId, message } = await req.json();

  // Validate required fields
  if (!receiverId || !productId || !message?.trim())
    return NextResponse.json({ error: "receiverId, productId and message are required" }, { status: 400 });

  // Validate UUIDs
  if (!UUID_REGEX.test(receiverId) || !UUID_REGEX.test(productId))
    return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });

  // Enforce message length
  if (message.trim().length > MAX_MESSAGE_LENGTH)
    return NextResponse.json({ error: `Message too long (max ${MAX_MESSAGE_LENGTH} chars)` }, { status: 400 });

  // Prevent self-messaging
  if (receiverId === user.id)
    return NextResponse.json({ error: "Cannot send message to yourself" }, { status: 400 });

  const db = createAdminClient();
  const { error } = await db.from("messages").insert({
    sender_id:   user.id,
    receiver_id: receiverId,
    product_id:  productId,
    message:     message.trim(),
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
