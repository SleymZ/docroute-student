import { RouteLoader } from "@/components/RouteLoader";

// Shown while the full site opens after "Start your journey".
export default function HomeLoading() {
  return (
    <main
      style={{
        display: "grid",
        placeItems: "center",
        minHeight: "100svh",
        background: "var(--background)",
      }}
    >
      <RouteLoader label="Opening DocRoute" />
    </main>
  );
}
