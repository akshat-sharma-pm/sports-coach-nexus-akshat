import { createFileRoute } from "@tanstack/react-router";
import { DigitalTwin } from "@/components/digital-twin";

export const Route = createFileRoute("/twin/$athleteId")({
  head: () => ({ meta: [{ title: "Digital Twin · USI" }] }),
  component: TwinPage,
});

function TwinPage() {
  const { athleteId } = Route.useParams();
  return <DigitalTwin athleteId={athleteId} />;
}
