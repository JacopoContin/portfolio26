import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";
import remarkGfm from "remark-gfm";
import { z } from "zod";
import { remarkCodeMeta } from "./src/lib/remark-code-meta";

const caseStudies = defineCollection({
    name: "caseStudies",
    directory: "content",
    include: "**/*.mdx",
    schema: z.object({
        title: z.string(),
        publishedAt: z.string(),
        updatedAt: z.string().optional(),
        author: z.string().optional(),
        summary: z.string(),
        image: z.string().optional(),
        draft: z.boolean().optional(),
        /** Manual position on the list page; lower comes first, unset sorts by date after. */
        order: z.number().optional(),
        tags: z.array(z.string()).optional(),
        content: z.string(),
    }),
    transform: async (document, context) => {
        const mdx = await compileMDX(context, document, {
            remarkPlugins: [remarkGfm, remarkCodeMeta],
        });
        return {
        ...document,
            mdx,
        };
    },
});

export default defineConfig({
    collections: [caseStudies],
});

