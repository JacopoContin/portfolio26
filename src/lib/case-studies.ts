import { allCaseStudies } from "content-collections";

/** Drafts are hidden in production builds but readable in `next dev`. */
const showDrafts = process.env.NODE_ENV === "development";

export const publishedCaseStudies = allCaseStudies.filter((study) => showDrafts || !study.draft);

/** List order: explicit `order` first (ascending), then newest first. */
export const sortedCaseStudies = [...publishedCaseStudies].sort((a, b) => {
  const orderA = a.order ?? Number.POSITIVE_INFINITY;
  const orderB = b.order ?? Number.POSITIVE_INFINITY;
  if (orderA !== orderB) return orderA - orderB;
  return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
});
