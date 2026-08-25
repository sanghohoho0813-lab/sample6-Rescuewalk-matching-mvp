import Link from "next/link";
import { PawPrint } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-cream-300/60 bg-cream-100">
      <div className="container-app py-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between md:gap-6">
          <div className="max-w-sm md:max-w-xs lg:max-w-sm">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-tangerine-100 text-tangerine-600">
                <PawPrint className="h-4 w-4" />
              </span>
              <span className="text-lg font-extrabold text-sage-700">RescueWalk</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink-500">
              당신의 한 번의 산책이 아이에게 큰 하루가 됩니다.
              <br />
              유기견 보호소의 아이들과 산책 봉사자를 연결합니다.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3 md:gap-6 lg:gap-8">
            <div>
              <h3 className="mb-3 font-bold text-ink-700">둘러보기</h3>
              <ul className="space-y-2 text-ink-500">
                <li><Link className="hover:text-tangerine-600" href="/dogs">강아지 찾기</Link></li>
                <li><Link className="hover:text-tangerine-600" href="/shelters">보호소 소개</Link></li>
                <li><Link className="hover:text-tangerine-600" href="/guide">봉사 가이드</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-3 font-bold text-ink-700">내 활동</h3>
              <ul className="space-y-2 text-ink-500">
                <li><Link className="hover:text-tangerine-600" href="/requests">신청 내역</Link></li>
                <li><Link className="hover:text-tangerine-600" href="/activity">활동 기록</Link></li>
                <li><Link className="hover:text-tangerine-600" href="/me">마이페이지</Link></li>
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <h3 className="mb-3 font-bold text-ink-700">문의</h3>
              <ul className="space-y-2 text-ink-500">
                <li>hello@rescuewalk.kr</li>
                <li>평일 10:00 – 18:00</li>
              </ul>
            </div>
          </div>
        </div>
        <p className="mt-10 border-t border-cream-300/60 pt-6 text-xs text-ink-400">
          © 2026 RescueWalk. 데모 서비스로, 표시되는 보호소·강아지 정보는 예시입니다.
        </p>
      </div>
    </footer>
  );
}
