"use client";

import { useEffect, useRef, useState } from "react";
import { Send, ArrowLeft, Loader2, MessageCircle } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Message } from "@/types";
import toast from "react-hot-toast";

interface Props {
  currentUserId: string;
  otherUserId: string;
  productId: string;
  productTitle: string;
  initialMessages: Message[];
}

export default function ChatWindow({
  currentUserId,
  otherUserId,
  productId,
  productTitle,
  initialMessages,
}: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load messages on mount + poll every 3s
  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("product_id", productId)
        .or(
          `and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),` +
          `and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`
        )
        .order("created_at", { ascending: true });

      if (error) {
        console.error("fetch messages error:", error.message);
        return;
      }
      if (data) setMessages(data as Message[]);
    }

    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, currentUserId, otherUserId]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || sending) return;

    const msg = text.trim();
    setText("");
    setSending(true);

    const { error } = await supabase.from("messages").insert({
      sender_id: currentUserId,
      receiver_id: otherUserId,
      product_id: productId,
      message: msg,
    });

    if (error) {
      console.error("send error:", error.message, error.code);
      toast.error(error.message);
      setText(msg);
    }

    setSending(false);
  }

  return (
    <div className="flex flex-col min-h-screen md:min-h-0 md:h-[calc(100vh-4rem)] max-w-2xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-white shrink-0 shadow-sm">
        <Link href="/chat"
          className="p-2 -ml-2 rounded-lg text-gray-500 hover:bg-gray-100 min-w-[40px] min-h-[40px] flex items-center justify-center">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 text-sm truncate">{otherUserId.slice(0, 8)}...</p>
          {productTitle && <p className="text-xs text-gray-400 truncate">Re: {productTitle}</p>}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-gray-400">
            <MessageCircle size={44} className="mb-3 opacity-20" />
            <p className="text-sm font-medium">No messages yet</p>
            <p className="text-xs mt-1">Say hello to start the conversation</p>
          </div>
        ) : messages.map((msg) => {
          const isMine = msg.sender_id === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm shadow-sm ${
                isMine ? "bg-primary text-white rounded-br-sm" : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm"
              }`}>
                <p className="break-words">{msg.message}</p>
                <p className={`text-xs mt-1 ${isMine ? "text-blue-200" : "text-gray-400"}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex gap-2 px-4 py-3 border-t bg-white shrink-0">
        <input type="text" value={text} onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..." className="input flex-1 min-h-[44px] text-sm"
          disabled={sending} autoComplete="off" />
        <button type="submit" disabled={!text.trim() || sending}
          className="btn-primary min-w-[44px] min-h-[44px] px-4 flex items-center justify-center shrink-0">
          {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </form>
    </div>
  );
}
