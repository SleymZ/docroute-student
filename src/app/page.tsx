import { Header } from "@/components/Header";
import { JourneyRail } from "@/components/JourneyRail";
import { RoutePlanner } from "@/components/RoutePlanner";
import { StartJourney } from "@/components/StartJourney";

export default function Home() {
  return (
    <main>
      <Header />

      <div className="page-container">
        <StartJourney />
        <RoutePlanner />
        <JourneyRail />
      </div>
    </main>
  );
}