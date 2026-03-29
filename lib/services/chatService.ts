import { createClient } from "@/lib/supabase/client";
import type { Message } from "@/types";

/** Fetch all messages for a conversation (buyer ↔ seller about a product) */
export async function fetchMessages(
  currentUserId: string,
  otherUserId: string,
  productId: string
): Promise<Message[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("product_id", productId)
    .or(
      `and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),` +
      `and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`
    )
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data as Message[]) ?? [];
}

/** Send a message */
export async function sendMessage(params: {
  senderId: string;
  receiverId: string;
  productId: string;
  message: string;
}): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("messages").insert({
    sender_id: params.senderId,
    receiver_id: params.receiverId,
    product_id: params.productId,
    message: params.message,
  });
  if (error) {
    console.error("[sendMessage] error:", error.message, error.code);
    throw new Error(error.message);
  }
}

export interface Conversation {
  id: string;
  sender_id: string;
  receiver_id: string;
  product_id: string;
  message: string;
  created_at: string;
  products?: { title: string; image_url: string } | null;
}

/** Fetch all conversations for inbox (deduplicated) */
export async function fetchConversations(userId: string): Promise<Conversation[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("messages")
    .select("*, products(title, image_url)")
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  // Deduplicate by (other_user_id + product_id)
  const seen = new Set<string>();
  return (data ?? []).filter((m: Conversation) => {
    const otherId = m.sender_id === userId ? m.receiver_id : m.sender_id;
    const key = `${otherId}-${m.product_id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
