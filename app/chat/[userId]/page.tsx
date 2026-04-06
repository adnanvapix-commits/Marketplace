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

  // Get product title and other user's name in parallel
  const [productRes, otherUserRes] = await Promise.all([
    productId
      ? supabase.from("products").select("title").eq("id", productId).single()
      : Promise.resolve({ data: null }),
    supabase.from("users").select("full_name, company_name, email").eq("id", userId).single(),
  ]);

  const product = productRes.data;
  const otherUser = otherUserRes.data;
  const otherUserName =
    otherUser?.full_name ||
    otherUser?.company_name ||
    otherUser?.email?.split("@")[0] ||
    "User";

  return (
    <ChatWindow
      currentUserId={user.id}
      otherUserId={userId}
      otherUserName={otherUserName}
      productId={productId ?? ""}
      productTitle={product?.title ?? ""}
      initialMessages={initialMessages}
    />
  );
}
