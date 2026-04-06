"use client";

import { useEffect, useRef, useState } from "react";
import { Send, ArrowLeft, Loader2, MessageCircle, ImagePlus, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { uploadImage } from "@/lib/cloudinary";
import type { Message } from "@/types";
import toast from "react-hot-toast";

interface Props {
  currentUserId: string;
  otherUserId: string;
  otherUserName: string;
  productId: string;
  productTitle: string;
  initialMessages: Message[];
}

export default function ChatWindow({ currentUserId, otherUserId, otherUserName, productId, productTitle, initialMessages }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastMessageCountRef = useRef(initialMessages.length);
  const isAtBottomRef = useRef(true);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Track if user is near the bottom
  function handleScroll() {
    const el = messagesContainerRef.current;
    if (!el) return;
    const threshold = 80;
    isAtBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
  }

  // Scroll to bottom on initial load
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "instant" });
  }, []);

  // Only auto-scroll when a NEW message arrives AND user is already at bottom
  useEffect(() => {
    const newCount = messages.length;
    if (newCount > lastMessageCountRef.current && isAtBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    lastMessageCountRef.current = newCount;
  }, [messages]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(
          `/api/chat/messages?productId=${productId}&otherUserId=${otherUserId}`
        );
        if (!res.ok) return;
        const { messages: data } = await res.json();
        // Only update if message count changed to avoid unnecessary re-renders
        if (data && data.length !== lastMessageCountRef.current) {
          setMessages(data);
        }
      } catch (err) {
        console.error("fetch messages error:", err);
      }
    }
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, [productId, currentUserId, otherUserId]);

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("Image must be under 10MB"); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function clearImage() {
    setImageFile(null);
    setImagePreview(null);
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() && !imageFile) return;
    setSending(true);

    try {
      let messageText = text.trim();

      // Upload image if selected
      if (imageFile) {
        const imageUrl = await uploadImage(imageFile);
        messageText = messageText ? `${messageText}\n[img]${imageUrl}[/img]` : `[img]${imageUrl}[/img]`;
        clearImage();
      }

      setText("");

      const res = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: otherUserId,
          productId,
          message: messageText,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Failed to send");
      }
    } catch (err) {
      console.error("send error:", err);
      toast.error("Failed to send");
    } finally {
      setSending(false);
    }
  }

  // Filter contact info from text only — preserve [img] tags
  function sanitizeMessage(msg: string): string {
    // Split on [img]...[/img] tags, sanitize only text parts
    const parts = msg.split(/(\[img\][\s\S]*?\[\/img\])/);
    return parts.map((part) => {
      if (part.startsWith("[img]")) return part; // keep image tags untouched
      return part
        .replace(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g, "[contact hidden]")
        .replace(/(\+?\d[\d\s\-().]{7,}\d)/g, "[contact hidden]")
        .replace(/wa\.me\/\S+/gi, "[contact hidden]")
        .replace(/whatsapp[:\s]+\S+/gi, "[contact hidden]");
    }).join("");
  }

  // Render message — detect image tags
  function renderMessage(msg: string) {
    const imgRegex = /\[img\](.*?)\[\/img\]/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = imgRegex.exec(msg)) !== null) {
      if (match.index > lastIndex) {
        parts.push(<span key={lastIndex}>{msg.slice(lastIndex, match.index)}</span>);
      }
      parts.push(
        <div key={match.index} className="mt-1 rounded-lg overflow-hidden max-w-[200px]">
          <Image src={match[1]} alt="Shared image" width={200} height={150}
            className="object-cover w-full rounded-lg" />
        </div>
      );
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < msg.length) {
      parts.push(<span key={lastIndex}>{msg.slice(lastIndex)}</span>);
    }

    return parts.length > 0 ? parts : msg;
  }

  return (
    <div className="flex flex-col min-h-screen md:min-h-0 md:h-[calc(100vh-4rem)] max-w-2xl mx-auto w-full">
      {/* Header — sticky below navbar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-white shrink-0 shadow-sm sticky top-16 z-10">
        <Link href="/chat" className="p-2 -ml-2 rounded-lg text-gray-500 hover:bg-gray-100 min-w-[40px] min-h-[40px] flex items-center justify-center">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 text-sm truncate">{otherUserName}</p>
          {productTitle && <p className="text-xs text-gray-400 truncate">Re: {productTitle}</p>}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50"
      >
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
                <div className="break-words">{renderMessage(sanitizeMessage(msg.message))}</div>
                <p className={`text-xs mt-1 ${isMine ? "text-blue-200" : "text-gray-400"}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Image preview above input */}
      {imagePreview && (
        <div className="px-4 pt-2 bg-white border-t">
          <div className="relative inline-block">
            <Image src={imagePreview} alt="Preview" width={80} height={60}
              className="rounded-lg object-cover border border-gray-200" />
            <button onClick={clearImage}
              className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
              <X size={10} />
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSend} className="flex gap-2 px-4 py-3 border-t bg-white shrink-0">
        {/* Image upload button */}
        <label className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer text-gray-500 hover:text-primary transition-colors shrink-0">
          <ImagePlus size={18} />
          <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
        </label>

        <input type="text" value={text} onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..." className="input flex-1 min-h-[44px] text-sm"
          disabled={sending} autoComplete="off" />

        <button type="submit" disabled={(!text.trim() && !imageFile) || sending}
          className="btn-primary min-w-[44px] min-h-[44px] px-4 flex items-center justify-center shrink-0">
          {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </form>
    </div>
  );
}
