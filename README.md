# portfolio26

Personal portfolio and case studies of Jacopo Contin, product designer and design engineer. Live at [jacopocontin.com](https://www.jacopocontin.com).

## Stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS v4, shadcn/ui, Magic UI
- Motion for animation
- Content Collections + MDX for case studies, Shiki for code highlighting
- `@shadcn/lint` on top of ESLint
- Deployed on Vercel

## Getting started

```bash
pnpm install
pnpm dev
```

Open [localhost:3000](http://localhost:3000).

## Scripts

| Command         | Description                 |
| --------------- | --------------------------- |
| `pnpm dev`      | Start the dev server        |
| `pnpm build`    | Production build            |
| `pnpm start`    | Serve the production build  |
| `pnpm lint`     | Run ESLint and shadcn lint  |
| `pnpm lint:fix` | Auto-fix lint issues        |
| `pnpm images:dark` | Regenerate dark-mode images |

## Project structure

```
content/            Case studies as MDX files
knowledge/          Extra markdown notes for the Ask AI panel
public/             Images, covers and case study assets
src/app/            Routes (home, case studies, OG image, icons)
src/components/     Feature components, shadcn primitives in ui/
src/data/resume.tsx Profile, links, work history, education
src/lib/            Case study loading, pagination, MDX helpers
```

## Editing content

- **Profile, work and links:** edit `src/data/resume.tsx`.
- **New case study:** add an `.mdx` file to `content/` with this frontmatter, and put its assets in `public/case-studies/<slug>/`.

```yaml
---
title: "JDS"
publishedAt: "2026-09-29"
summary: "One sentence describing the product."
image: "/jds-cover.png"
order: 2
tags: ["Design system", "AI"]
---
```

- The file name becomes the URL slug (`content/jds.mdx` → `/case-studies/jds`).
- `order` is optional: lower numbers come first, and unordered studies follow, newest first.
- Add `draft: true` to hide a study in production. Drafts still show in `pnpm dev`.

## Dark-mode images

Light screenshots and logos get a generated dark twin (`name.dark.png`) that the site swaps in under the dark theme. To add an image or refresh one after replacing it, list it in `scripts/dark-images.mjs` (`logo` or `screenshot`) and run:

```bash
pnpm images:dark
```

This rewrites the `.dark.png` files and `src/data/dark-images.json`. Images that are already dark, like the JDS cover, don't need one.

## Ask AI panel

Highlight any text on the site and an **Ask about this** chip appears. Clicking it opens a chat sidepanel with the passage attached. The asterisk in the dock opens the same panel.

- **Knowledge:** the profile in `src/data/resume.tsx`, every published case study, and any `.md` file in `knowledge/`. Drop new markdown files there, one topic per file, with an optional `title` frontmatter.
- **Model:** any OpenAI-compatible chat API, called from `src/app/api/chat/route.ts`. By default it uses a cheap paid model on OpenRouter (`anthropic/claude-haiku-5.5`), falling back to OpenRouter's free models router (`openrouter/free`). Set a monthly credit limit on the OpenRouter key to cap spend. Copy `.env.example` to `.env.local` and set `LLM_API_KEY` (get one at [openrouter.ai/settings/keys](https://openrouter.ai/settings/keys)). On Vercel, add the same variables under Project Settings → Environment Variables, with Production and Preview both ticked. `LLM_MODEL` takes a comma-separated list; later models are fallbacks.
- **Limits:** 10 questions per minute per visitor, the last 12 messages, and 800 output tokens per answer.

## Credits

Based on [dillionverma/portfolio](https://github.com/dillionverma/portfolio) by Dillion Verma, licensed under MIT. See [LICENSE](./LICENSE).
