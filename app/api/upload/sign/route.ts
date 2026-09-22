import { NextResponse } from "next/server";
import { requireMarketplaceAccess } from "@/lib/supabase/accessCheck";
import crypto from "crypto";

// Server-side signed Cloudinary upload endpoint.
// Requires verified + active subscription — prevents unsubscribed users
// from uploading images to our Cloudinary account.
export async function POST() {
  const access = await requireMarketplaceAccess();
  if (!access.allowed) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const apiKey    = process.env.CLOUDINARY_API_KEY;
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  if (!apiSecret || !apiKey || !cloudName)
    return NextResponse.json({ error: "Upload not configured" }, { status: 500 });

  const timestamp = Math.round(Date.now() / 1000);
  const folder    = "bulkora/chat";

  const toSign    = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash("sha1").update(toSign).digest("hex");

  return NextResponse.json({ signature, timestamp, apiKey, cloudName, folder });
}
