export function classifyComplaint(text: string) {
  if (/wifi|wi-fi|internet|network/i.test(text)) return "Wi-Fi";
  if (/computer|laboratory|\blab\b/i.test(text)) return "Laboratory";
  if (/classroom|projector|class/i.test(text)) return "Classroom";
  if (/water|leak|electric|broken|repair/i.test(text)) return "Maintenance";
  return "Other";
}
export function canRateReport(kind: string, status: string) {
  return kind === "Feedback" || status === "Resolved";
}
export function validInterval(start: string, end: string) {
  return Number.isFinite(Date.parse(start)) && Date.parse(end) > Date.parse(start);
}
export function validPhoto(file: { type: string; size: number }) {
  return (
    ["image/jpeg", "image/png", "image/webp"].includes(file.type) && file.size <= 5 * 1024 * 1024
  );
}
