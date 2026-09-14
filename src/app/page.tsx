import { Header } from "@/components/Header";
import { JourneyRail } from "@/components/JourneyRail";
import { RoutePlanner } from "@/components/RoutePlanner";

export default function Home() {
  return (
    <main>
      <Header />

      <div className="page-container">
        <RoutePlanner />
        <JourneyRail />
      </div>
    </main>
  );
}