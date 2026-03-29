import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ChatWindow from "./ChatWindow";

export default async function ChatPage({
  params,
  searchParams,
}: {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ product?: string }>;
}) {
  const { userId } = await params;
  const { product: productId } = await searchParams;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Load initial messages using server client (has session)
  let initialMessages: import("@/types").Message[] = [];
  if (productId) {
    try {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("product_id", productId)
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${userId}),` +
          `and(sender_id.eq.${userId},receiver_id.eq.${user.id})`
        )
        .order("created_at", { ascending: true });
      initialMessages = data ?? [];
    } catch {
      initialMessages = [];
    }
  }

  // Get product title
  const { data: product } = productId
    ? await supabase.from("products").select("title").eq("id", productId).single()
    : { data: null };

  return (
    <ChatWindow
      currentUserId={user.id}
      otherUserId={userId}
      productId={productId ?? ""}
      productTitle={product?.title ?? ""}
      initialMessages={initialMessages}
    />
  );
}
