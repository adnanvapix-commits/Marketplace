"use client";

import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

interface Props {
  sellerId: string;
  productId: string;
}

export default function ChatButton({ sellerId, productId }: Props) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  function handleChat() {
    if (!user) {
      toast.error("Please login to chat with the seller");
      router.push("/login");
      return;
    }
    if (user.id === sellerId) {
      toast("This is your own listing");
      return;
    }
    // Navigate to chat with seller about this product
    router.push(`/chat/${sellerId}?product=${productId}`);
  }

  return (
    <button onClick={handleChat} className="btn-primary w-full flex items-center justify-center gap-2">
      <MessageCircle size={18} />
      Chat with Seller
    </button>
  );
}
