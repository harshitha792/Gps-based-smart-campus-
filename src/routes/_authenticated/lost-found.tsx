import { createFileRoute } from "@tanstack/react-router";
import { CampusReports } from "@/components/CampusReports";
import { pageHead } from "@/lib/seo";
export const Route = createFileRoute("/_authenticated/lost-found")({
  head: pageHead(
    "Lost & Found",
    "Report lost and found items and submit private ownership claims at REVA.",
  ),
  component: () => <CampusReports mode="LostFound" />,
});
