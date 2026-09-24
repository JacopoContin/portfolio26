import BlurFade from "@/components/magicui/blur-fade";
import { publishedCaseStudies } from "@/lib/case-studies";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { paginate, normalizePage } from "@/lib/pagination";
import { ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Case Studies",
  description: "Selected product design work, written up end to end.",
  openGraph: {
    title: "Case Studies",
    description: "Selected product design work, written up end to end.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Case Studies",
    description: "Selected product design work, written up end to end.",
  },
};

const PAGE_SIZE = 5;
const BLUR_FADE_DELAY = 0.04;

function formatListDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default async function CaseStudiesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;

  const caseStudies = publishedCaseStudies;
  const sortedCaseStudies = [...caseStudies].sort((a, b) => {
    if (new Date(a.publishedAt) > new Date(b.publishedAt)) {
      return -1;
    }
    return 1;
  });

  const totalPages = Math.ceil(sortedCaseStudies.length / PAGE_SIZE);
  const currentPage = normalizePage(pageParam, totalPages);
  const { items: paginatedCaseStudies, pagination } = paginate(sortedCaseStudies, {
    page: currentPage,
    pageSize: PAGE_SIZE,
  });

  return (
    <section id="case-studies">
      <BlurFade delay={BLUR_FADE_DELAY}>
        <h1 className="text-2xl font-semibold tracking-tight mb-2">Case Studies <span className="ml-1 bg-card border border-border rounded-md px-2 py-1 text-muted-foreground text-sm">{sortedCaseStudies.length} studies</span></h1>
        <p className="text-sm text-muted-foreground mb-8">
          Selected product design work, written up end to end.
        </p>
      </BlurFade>

      {paginatedCaseStudies.length > 0 ? (
        <>
          <BlurFade delay={BLUR_FADE_DELAY * 2}>
            <div className="flex flex-col gap-6">
              {paginatedCaseStudies.map((study, id) => {
                const slug = study._meta.path.replace(/\.mdx$/, "");
                const indexNumber = (pagination.page - 1) * PAGE_SIZE + id + 1;
                return (
                  <BlurFade delay={BLUR_FADE_DELAY * 3 + id * 0.05} key={slug}>
                    <Link
                      className="group -m-3 flex items-start gap-4 rounded-xl p-3 transition-colors duration-300 hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      href={`/case-studies/${slug}`}
                    >
                      <div className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border transition-shadow duration-300 group-hover:ring-foreground/20 sm:w-44">
                        {study.image ? (
                          <Image
                            src={study.image}
                            alt=""
                            fill
                            sizes="(min-width: 640px) 176px, 112px"
                            className="object-cover object-left-top transition-all duration-700 ease-out group-hover:scale-105 dark:brightness-90 dark:group-hover:brightness-100"
                          />
                        ) : (
                          <span className="flex h-full items-center justify-center text-2xl font-semibold text-muted-foreground">
                            {study.title.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
                          <p className="text-lg font-medium tracking-tight">
                            {study.title}
                            <ChevronRight
                              className="ml-1 inline-block size-4 stroke-3 text-muted-foreground opacity-0 -translate-x-2 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
                              aria-hidden
                            />
                          </p>
                          <span className="order-first text-xs tabular-nums text-muted-foreground sm:order-none sm:shrink-0">
                            <span className="font-mono">{String(indexNumber).padStart(2, "0")}</span>
                            <span aria-hidden> · </span>
                            <time dateTime={study.publishedAt}>{formatListDate(study.publishedAt)}</time>
                          </span>
                        </div>
                        <p className="line-clamp-2 text-sm leading-relaxed text-pretty text-muted-foreground">
                          {study.summary}
                        </p>
                      </div>
                    </Link>
                  </BlurFade>
                );
              })}
            </div>
          </BlurFade>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <BlurFade delay={BLUR_FADE_DELAY * 4}>
              <div className="flex gap-3 flex-row items-center justify-between mt-8">
                <div className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages}
                </div>
                <div className="flex gap-2 sm:justify-end">
                  {pagination.hasPreviousPage ? (
                    <Link
                      href={`/case-studies?page=${pagination.page - 1}`}
                      className="h-8 w-fit px-2 flex items-center justify-center text-sm border border-border rounded-lg hover:bg-accent/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      Previous
                    </Link>
                  ) : (
                    <span className="h-8 w-fit px-2 flex items-center justify-center text-sm border border-border rounded-lg opacity-50 cursor-not-allowed">
                      Previous
                    </span>
                  )}
                  {pagination.hasNextPage ? (
                    <Link
                      href={`/case-studies?page=${pagination.page + 1}`}
                      className="h-8 w-fit px-2 flex items-center justify-center text-sm border border-border rounded-lg hover:bg-accent/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      Next
                    </Link>
                  ) : (
                    <span className="h-8 w-fit px-2 flex items-center justify-center text-sm border border-border rounded-lg opacity-50 cursor-not-allowed">
                      Next
                    </span>
                  )}
                </div>
              </div>
            </BlurFade>
          )}
        </>
      ) : (
        <BlurFade delay={BLUR_FADE_DELAY * 2}>
          <div className="flex flex-col items-center justify-center py-12 px-4 border border-border rounded-xl">
            <p className="text-muted-foreground text-center">
              No case studies yet. Check back soon!
            </p>
          </div>
        </BlurFade>
      )}
    </section>
  );
}
