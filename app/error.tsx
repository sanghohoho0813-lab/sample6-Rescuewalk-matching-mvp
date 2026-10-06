"use client";

import Link from "next/link";
import { RotateCcw } from "lucide-react";

/**
 * 화면을 그리다 예기치 않은 오류가 났을 때.
 * 이 데모는 브라우저 저장값으로 동작하므로, 저장값이 꼬였을 때 스스로 복구할 수 있는 길을 함께 둡니다.
 */
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const resetData = () => {
    try {
      localStorage.removeItem("rescuewalk-store-v2");
      sessionStorage.clear();
    } catch {
      /* 무시 */
    }
    window.location.assign("/");
  };

  return (
    <div className="container-app flex max-w-lg flex-col items-center py-24 text-center">
      <h1 className="text-2xl font-bold text-ink-900">화면을 불러오지 못했어요</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-ink-500">
        잠시 후 다시 시도해주세요.
        <br />
        계속 같은 화면이 보이면 데모 데이터를 처음 상태로 되돌려주세요.
      </p>
      <div className="mt-7 flex w-full max-w-xs flex-col gap-2.5">
        <button type="button" onClick={reset} className="btn-primary btn-lg w-full">
          <RotateCcw className="h-4 w-4" /> 다시 시도
        </button>
        <button type="button" onClick={resetData} className="btn-secondary btn-lg w-full">
          데모 데이터 되돌리고 홈으로
        </button>
        <Link href="/" className="mt-1 flex min-h-[44px] items-center justify-center text-[15px] text-ink-500">
          홈으로
        </Link>
      </div>
    </div>
  );
}
