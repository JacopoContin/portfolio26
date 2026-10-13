export type SideProject = {
  title: string;
  href: string;
  summary: string;
  year: string;
  image?: string;
  tags?: string[];
};

/** Small live builds that link out instead of having a write-up. */
export const sideProjects: SideProject[] = [
  {
    title: "Deecide",
    href: "https://deecide.vercel.app/",
    summary: "A decision matrix tool I use for product prioritization, design trade-offs and personal decisions alike.",
    year: "2026",
    image: "/side-projects/deecide.png",
    tags: ["Decision making", "Web app"],
  },
];
