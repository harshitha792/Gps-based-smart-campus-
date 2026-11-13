import { createFileRoute } from "@tanstack/react-router";
import { CampusReports } from "@/components/CampusReports";
import { pageHead } from "@/lib/seo";
export const Route = createFileRoute("/_authenticated/feedback")({
  head: pageHead(
    "Student Feedback",
    "Rate campus facilities and share service feedback and suggestions.",
  ),
  component: () => <CampusReports mode="Feedback" />,
});
