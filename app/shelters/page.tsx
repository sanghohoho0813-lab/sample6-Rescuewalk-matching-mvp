import ShelterCard from "@/components/ShelterCard";
import { shelters } from "@/lib/data/shelters";

export const metadata = { title: "보호소 소개" };

export default function SheltersPage() {
  return (
    <div className="container-app py-8 md:py-10">
      <header className="mb-6">
        <p className="section-label">아이들이 지내는 곳</p>
        <h1 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
          보호소 소개
        </h1>
        <p className="mt-1.5 text-sm text-ink-500">
          RescueWalk와 함께하는 {shelters.length}곳의 보호소를 소개해요.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {shelters.map((shelter) => (
          <ShelterCard key={shelter.id} shelter={shelter} />
        ))}
      </div>
    </div>
  );
}
