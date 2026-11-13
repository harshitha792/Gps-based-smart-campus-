export const pageHead = (title: string, description: string) => () => ({
  meta: [
    { title: `${title} — REVA Smart Campus` },
    { name: "description", content: description },
    { property: "og:title", content: `${title} — REVA Smart Campus` },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ],
});
