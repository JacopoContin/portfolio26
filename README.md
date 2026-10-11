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

## Project structure

```
content/            Case studies as MDX files
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

## Credits

Based on [dillionverma/portfolio](https://github.com/dillionverma/portfolio) by Dillion Verma, licensed under MIT. See [LICENSE](./LICENSE).
