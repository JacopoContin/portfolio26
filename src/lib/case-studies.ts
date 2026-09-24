import { allCaseStudies } from "content-collections";

export const publishedCaseStudies = allCaseStudies.filter((study) => !study.draft);
