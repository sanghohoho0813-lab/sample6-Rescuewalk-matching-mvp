import ShelterCard from "@/components/ShelterCard";
import { shelters } from "@/lib/data/shelters";

export const metadata = { title: "보호소 소개" };

export default function SheltersPage() {
  return (
    <div className="container-app py-8 md:py-10">
      <header className="mb-8">
        <h1 className="page-title">보호소</h1>
        <p className="mt-1.5 text-[15px] text-ink-500">
          RescueWalk와 함께하는 보호소 <strong className="tnum font-semibold text-ink-900">{shelters.length}곳</strong>
        </p>
      </header>
      <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {shelters.map((shelter) => (
          <ShelterCard key={shelter.id} shelter={shelter} />
        ))}
      </div>
    </div>
  );
}
