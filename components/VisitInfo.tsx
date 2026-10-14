import { ExternalLink, Phone } from "lucide-react";
import { closedDaysLabel } from "@/lib/domain/schedule";
import { mapLink, telLink } from "@/lib/visitGuide";
import { cn } from "@/lib/utils";
import type { Shelter } from "@/lib/types";

/**
 * 보호소 방문 안내 — 상세·신청 상세·보호소 화면이 같은 표를 씁니다.
 * fields 로 필요한 줄만 고를 수 있습니다(신청 상세에서는 '만나는 곳'이 가장 위).
 */
type Field = "address" | "hours" | "meetingPoint" | "transit" | "parking" | "phone" | "course" | "firstVisit";

const LABEL: Record<Field, string> = {
  address: "주소",
  hours: "운영",
  meetingPoint: "만나는 곳",
  transit: "오시는 길",
  parking: "주차",
  phone: "연락처",
  course: "산책 코스",
  firstVisit: "첫 방문",
};

export default function VisitInfo({
  shelter,
  fields = ["address", "hours", "meetingPoint", "transit", "parking", "phone"],
  className,
}: {
  shelter: Shelter;
  fields?: Field[];
  className?: string;
}) {
  const value = (f: Field) => {
    switch (f) {
      case "address":
        return (
          <>
            {shelter.address}
            <a
              href={mapLink(shelter)}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 inline-flex items-center gap-0.5 whitespace-nowrap text-sm font-semibold text-sage-700 underline-offset-4 hover:underline"
            >
              지도 <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              <span className="sr-only">(새 창에서 지도 열기)</span>
            </a>
          </>
        );
      case "hours":
        return (
          <>
            <span className="tnum">{shelter.hours}</span> · {closedDaysLabel(shelter)}
          </>
        );
      case "phone":
        return (
          <a
            href={telLink(shelter.phone)}
            className="tnum inline-flex items-center gap-1 font-semibold text-ink-900 underline-offset-4 hover:underline"
          >
            <Phone className="h-3.5 w-3.5 text-sage-600" aria-hidden />
            {shelter.phone}
          </a>
        );
      default:
        return shelter.visit[f];
    }
  };

  return (
    <dl className={cn("divide-y divide-cream-200 border-y border-cream-200 text-[15px]", className)}>
      {fields.map((f) => (
        <div key={f} className="flex gap-4 py-3">
          <dt className="w-20 shrink-0 text-ink-500">{LABEL[f]}</dt>
          <dd className="min-w-0 leading-relaxed text-ink-900">{value(f)}</dd>
        </div>
      ))}
    </dl>
  );
}
