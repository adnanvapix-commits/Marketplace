"use client";

import { Toaster, toast } from "react-hot-toast";

export default function ToasterWithDismiss() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 6000,
        style: {
          background: "#fff",
          color: "#1a1209",
          border: "1px solid #FFF3D6",
          borderRadius: "12px",
          fontSize: "13px",
          padding: "10px 14px",
          paddingRight: "8px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          maxWidth: "360px",
        },
      }}
    >
      {(t) => (
        <div
          className={`flex items-start gap-2.5 ${t.visible ? "animate-fade-in" : "opacity-0"}`}
          style={{ minWidth: 0 }}
        >
          {/* Icon */}
          <span className="text-base shrink-0 mt-0.5">
            {t.type === "success" ? "✅" : t.type === "error" ? "❌" : "ℹ️"}
          </span>

          {/* Message */}
          <span className="flex-1 text-sm text-gray-800 leading-snug break-words">
            {typeof t.message === "string"
              ? t.message
              : (t.message as React.ReactNode)}
          </span>

          {/* Dismiss X */}
          <button
            onClick={() => toast.dismiss(t.id)}
            className="shrink-0 ml-1 text-gray-400 hover:text-gray-600 transition-colors rounded-md p-0.5 hover:bg-gray-100"
            aria-label="Dismiss"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M11 3L3 11M3 3l8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}
    </Toaster>
  );
}
