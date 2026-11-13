import { createFileRoute } from "@tanstack/react-router";
import { CampusReports } from "@/components/CampusReports";
import { pageHead } from "@/lib/seo";
export const Route = createFileRoute("/_authenticated/complaints")({
  head: pageHead(
    "Complaint Management",
    "Report and track campus maintenance, classroom and Wi-Fi issues.",
  ),
  component: () => <CampusReports mode="Complaint" />,
});
