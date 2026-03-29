"use client";

import { useEffect, useRef, useState, useCallback } from "react";
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

const POLL_INTERVAL = 4000;

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
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const supabaseRef = useRef(createClient());

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch latest messages from Supabase
  const fetchLatest = useCallback(async () => {
    const { data, error } = await supabaseRef.current
      .from("messages")
      .select("*")
      .eq("product_id", productId)
      .or(
        `and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),` +
        `and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`
      )
      .order("created_at", { ascending: true });

    if (!error && data) {
      setMessages(data as Message[]);
    }
  }, [currentUserId, otherUserId, productId]);

  // Realtime subscription + polling fallback
  useEffect(() => {
    const supabase = supabaseRef.current;

    // Realtime
    const channel = supabase
      .channel(`chat:${productId}:${[currentUserId, otherUserId].sort().join(":")}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `product_id=eq.${productId}`,
        },
        (payload) => {
          const msg = payload.new as Message;
          const relevant =
            (msg.sender_id === currentUserId && msg.receiver_id === otherUserId) ||
            (msg.sender_id === otherUserId && msg.receiver_id === currentUserId);
          if (relevant) {
            setMessages((prev) =>
              prev.find((m) => m.id === msg.id) ? prev : [...prev, msg]
            );
          }
        }
      )
      .subscribe();

    // Polling as safety net
    pollRef.current = setInterval(fetchLatest, POLL_INTERVAL);

    return () => {
      supabase.removeChannel(channel);
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [productId, currentUserId, otherUserId, fetchLatest]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || sending) return;

    setSending(true);
    const msg = text.trim();
    setText("");

    // Optimistic update
    const optimistic: Message = {
      id: crypto.randomUUID(),
      sender_id: currentUserId,
      receiver_id: otherUserId,
      product_id: productId,
      message: msg,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const { error } = await supabaseRef.current.from("messages").insert({
        sender_id: currentUserId,
        receiver_id: otherUserId,
        product_id: productId,
        message: msg,
      });

      if (error) {
        console.error("[chat] send error:", error.message, error.code, error.details);
        toast.error(`Failed: ${error.message}`);
        // Remove optimistic message on failure
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
        setText(msg);
      } else {
        // Refresh to get real ID from DB
        setTimeout(fetchLatest, 500);
      }
    } catch (err) {
      console.error("[chat] unexpected error:", err);
      toast.error("Failed to send message");
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setText(msg);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen md:min-h-0 md:h-[calc(100vh-4rem)] max-w-2xl mx-auto w-full">

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-white shrink-0 shadow-sm">
        <Link href="/chat"
          className="p-2 -ml-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 text-sm truncate">
            {otherUserId.slice(0, 8)}...
          </p>
          {productTitle && (
            <p className="text-xs text-gray-400 truncate">Re: {productTitle}</p>
          )}
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
        ) : (
          messages.map((msg) => {
            const isMine = msg.sender_id === currentUserId;
            return (
              <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] sm:max-w-[70%] px-3 py-2 sm:px-4 rounded-2xl text-sm shadow-sm ${
                  isMine
                    ? "bg-primary text-white rounded-br-sm"
                    : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm"
                }`}>
                  <p className="break-words leading-relaxed">{msg.message}</p>
                  <p className={`text-xs mt-1 ${isMine ? "text-blue-200" : "text-gray-400"}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend}
        className="flex gap-2 px-4 py-3 border-t bg-white shrink-0 safe-area-bottom">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="input flex-1 min-h-[44px] text-sm"
          disabled={sending}
          autoComplete="off"
        />
        <button type="submit" disabled={!text.trim() || sending}
          className="btn-primary min-w-[44px] min-h-[44px] px-4 flex items-center justify-center shrink-0">
          {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </form>
    </div>
  );
}
