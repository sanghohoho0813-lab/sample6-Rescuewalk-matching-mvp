"use client";

import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";

export default function FavoriteButton({
  dogId,
  dogName,
  className,
}: {
  dogId: string;
  dogName: string;
  className?: string;
}) {
  const { isFavorite, toggleFavorite, showToast, hydrated } = useStore();
  const active = hydrated && isFavorite(dogId);

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? `${dogName} 찜 해제` : `${dogName} 찜하기`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(dogId);
        showToast(
          active ? `${dogName}를 찜 목록에서 뺐어요.` : `${dogName}를 찜했어요!`,
          active ? "🤍" : "🧡"
        );
      }}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-card backdrop-blur transition-all duration-200 hover:scale-110 active:scale-95",
        className
      )}
    >
      <Heart
        className={cn(
          "h-5 w-5 transition-all duration-200",
          active ? "scale-110 fill-tangerine-500 text-tangerine-500" : "text-ink-400"
        )}
      />
    </button>
  );
}
