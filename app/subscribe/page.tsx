"use client";

import { Building2, MessageCircle, Zap } from "lucide-react";

const WHATSAPP_NUMBER = "97556331247";

export default function SubscribePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-sm mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Zap size={14} /> Subscription Required
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Choose Your Plan</h1>
          <p className="text-gray-500">
            Get full access to the B2B marketplace. Connect with verified buyers and sellers worldwide.
          </p>
        </div>

        <div className="card p-6 flex flex-col border-2 border-primary shadow-lg relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full">
            Most Popular
          </div>

          <div className="mb-5">
            <div className="flex items-center gap-2 mb-2">
              <Building2 size={18} className="text-primary" />
              <h2 className="font-bold text-gray-800">Enterprise</h2>
            </div>
            <div className="flex items-end gap-1">
              <span className="text-3xl font-bold text-gray-900">Custom</span>
            </div>
          </div>

          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 rounded-lg font-semibold text-sm bg-primary text-white hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <MessageCircle size={16} /> Contact for Subscription
          </a>
        </div>
      </div>
    </div>
  );
}
