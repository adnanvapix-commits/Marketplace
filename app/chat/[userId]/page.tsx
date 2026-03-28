import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ChatWindow from "./ChatWindow";
import { fetchMessages } from "@/lib/services/chatService";

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

  // Load initial messages
  let initialMessages: import("@/types").Message[] = [];
  try {
    initialMessages = productId
      ? await fetchMessages(user.id, userId, productId)
      : [];
  } catch {
    initialMessages = [];
  }

  // Get product title for header
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
