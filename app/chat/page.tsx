import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { MessageCircle, ChevronRight } from "lucide-react";
import { fetchConversations, type Conversation } from "@/lib/services/chatService";

export default async function ChatInboxPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  let conversations: Awaited<ReturnType<typeof fetchConversations>> = [];
  try {
    conversations = await fetchConversations(user.id);
  } catch {
    // show empty state on error
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <MessageCircle size={24} className="text-primary" /> Messages
      </h1>

      {conversations.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <MessageCircle size={52} className="mx-auto mb-4 opacity-20" />
          <p className="font-medium">No conversations yet</p>
          <p className="text-sm mt-1">
            Browse listings and click &quot;Chat with Seller&quot; to start
          </p>
          <Link href="/buy" className="btn-primary inline-block mt-4 text-sm">
            Browse Listings
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((m: Conversation) => {
            const otherId = m.sender_id === user.id ? m.receiver_id : m.sender_id;
            return (
              <Link
                key={`${otherId}-${m.product_id}`}
                href={`/chat/${otherId}?product=${m.product_id}`}
                className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
              >
                {/* Avatar */}
                <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                  {otherId.slice(0, 2).toUpperCase()}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate text-sm">
                    {m.products?.title ?? "Product"}
                  </p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{m.message}</p>
                </div>

                {/* Meta */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-xs text-gray-400">
                    {new Date(m.created_at).toLocaleDateString()}
                  </span>
                  <ChevronRight size={14} className="text-gray-300" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
