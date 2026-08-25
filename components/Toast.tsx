"use client";

import { useStore } from "@/lib/store";

export default function Toast() {
  const { toast } = useStore();

  if (!toast) return null;

  return (
    <div
      key={toast.id}
      role="status"
      className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4 md:bottom-10"
    >
      <div className="flex animate-fade-up items-center gap-2 rounded-full bg-ink-900/90 px-5 py-3 text-sm font-medium text-white shadow-card-hover backdrop-blur">
        {toast.emoji && <span aria-hidden>{toast.emoji}</span>}
        {toast.message}
      </div>
    </div>
  );
}
