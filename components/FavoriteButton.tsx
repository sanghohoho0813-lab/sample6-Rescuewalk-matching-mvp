"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { cn, withJosa } from "@/lib/utils";
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
  // 찜할 때만 한 번 튀어 오름(해제는 조용히). key 를 바꿔 연속으로 눌러도 매번 다시 재생
  const [pop, setPop] = useState(0);

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? `${dogName} 찜 해제` : `${dogName} 찜하기`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(dogId);
        if (active) {
          // 빼는 건 실수일 수 있으니 확인 창 대신 바로 되돌릴 수 있게
          showToast(`${withJosa(dogName, "를")} 찜 목록에서 뺐어요`, {
            label: "되돌리기",
            onClick: () => toggleFavorite(dogId),
          });
        } else {
          setPop((n) => n + 1);
          showToast(`${withJosa(dogName, "를")} 찜했어요`);
        }
      }}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-card backdrop-blur transition-all duration-200 hover:scale-110 active:scale-95",
        className
      )}
    >
      <Heart
        key={pop}
        aria-hidden
        className={cn(
          "h-5 w-5 transition-colors duration-200",
          active ? "scale-110 fill-tangerine-500 text-tangerine-500" : "text-ink-400",
          pop > 0 && active && "animate-heart-pop motion-reduce:animate-none"
        )}
      />
    </button>
  );
}
