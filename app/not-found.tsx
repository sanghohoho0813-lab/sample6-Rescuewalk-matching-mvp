import Link from "next/link";
import { PawPrint } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container-app flex max-w-lg flex-col items-center py-24 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-cream-200 text-sage-600">
        <PawPrint className="h-8 w-8" />
      </span>
      <h1 className="mt-5 text-2xl font-bold text-ink-900">앗, 길을 잃었어요</h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-500">
        찾으시는 페이지가 없거나 이동했어요.
        <br />
        아이들이 기다리는 곳으로 돌아가볼까요?
      </p>
      <Link href="/" className="btn-primary mt-6">홈으로 돌아가기</Link>
    </div>
  );
}
