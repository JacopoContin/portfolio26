import type { ComponentType, SVGProps } from "react";
import { Icons } from "@/components/icons";
import { HomeIcon, NotebookIcon } from "lucide-react";
import { ReactLight } from "@/components/ui/svgs/reactLight";
import { NextjsIconDark } from "@/components/ui/svgs/nextjsIconDark";
import { Typescript } from "@/components/ui/svgs/typescript";

type Skill = {
  name: string;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
};

const SKILLS: Skill[] = [
  { name: "Product Design" },
  { name: "UX Research" },
  { name: "Design Systems" },
  { name: "Prototyping" },
  { name: "AI Product UX" },
  { name: "Figma" },
  { name: "React", icon: ReactLight },
  { name: "Next.js", icon: NextjsIconDark },
  { name: "Typescript", icon: Typescript },
  { name: "Tailwind CSS" },
  { name: "Framer Motion" },
];

export const DATA = {
  name: "Jacopo Contin",
  initials: "JC",
  url: "https://www.jacopocontin.com",
  location: "Barcelona, Spain",
  locationLink: "https://www.google.com/maps/place/barcelona",
  description:
    "Senior Product Designer building complex B2B SaaS products in design and code.",
  summary:
    "I spent almost three years at [**Nory**](https://nory.ai), designing intelligent scheduling and payroll systems for restaurant groups, and two years at [**Qonto**](https://qonto.com), working on invoice management for European SMEs.\n\nI studied Communication Sciences in Padova, ran a design studio in Bangkok, and lived in Australia and Thailand before settling in Barcelona. Outside work, **I run** marathons, **play guitar**, and **make electronic music**.",
  avatarUrl: "/avatar.jpg",
  avatarDarkUrl: "/avatar-night.jpg",
  skills: SKILLS,
  navbar: [
    { href: "/", icon: HomeIcon, label: "Home" },
    { href: "/case-studies", icon: NotebookIcon, label: "Case Studies" },
  ],
  contact: {
    email: "jacopocontin1986@gmail.com",
    tel: "",
    social: {
      LinkedIn: {
        name: "LinkedIn",
        url: "https://www.linkedin.com/in/jacopocontin/",
        icon: Icons.linkedin,
        navbar: true,
      },
      GitHub: {
        name: "GitHub",
        url: "https://github.com/JacopoContin",
        icon: Icons.github,
        navbar: true,
      },
      email: {
        name: "Send Email",
        url: "mailto:jacopocontin1986@gmail.com",
        icon: Icons.email,
        navbar: false,
      },
    },
  },

  work: [
    {
      company: "Freelance",
      href: "",
      badges: [],
      location: "Barcelona, Spain",
      title: "Product Builder & Designer",
      logoUrl: "/me.png",
      start: "January 2026",
      end: "Present",
      description:
        "Designing directly in coded prototypes with AI-powered tools like Claude Code and Cursor. An AI-first design workflow where ideas go from concept to functional code, skipping static mockups entirely.",
    },
    {
      company: "Nory",
      href: "https://nory.ai",
      badges: ["Series B"],
      location: "Barcelona, Spain",
      title: "Senior Product Designer",
      logoUrl: "/nory.png",
      start: "June 2023",
      end: "January 2026",
      description:
        "Nory is the first AI-powered operating system for hospitality. I led design for the intelligent systems that help restaurant groups forecast sales, schedule staff, and run payroll: the Intelligent Scheduling platform and Nory Pay, an embedded payroll automation product. The scheduling beta helped sign Nory's largest enterprise customer, with £5M+ in projected labour savings, and became a proof point for the AI strategy ahead of the Series B. Raised Series A in 2024 and Series B in 2025.",
    },
    {
      company: "Qonto",
      href: "https://qonto.com",
      badges: [],
      location: "Barcelona, Spain",
      title: "Senior Product Designer",
      logoUrl: "/qonto.png",
      start: "November 2021",
      end: "May 2023",
      description:
        "Qonto is a European business-finance platform for SMEs (220,000 clients, €622M raised). I shaped the invoice management and bookkeeping experiences that drove stickiness and plan upgrades. Lead project: Supplier Invoices, letting users centralize, pay, and reconcile supplier documents in one flow.",
    },
    {
      company: "Kyso",
      href: "https://kyso.io",
      badges: [],
      location: "Remote",
      title: "Founding Product Designer",
      logoUrl: "/kyso.png",
      start: "October 2020",
      end: "October 2021",
      description:
        "Kyso is a collaborative knowledge hub for data-science teams. Redesigned the MVP UI, built the design system from scratch, planned a one-year research-backed roadmap, and shipped collaboration features bridging technical and non-technical users.",
    },
    {
      company: "Kantox",
      href: "https://kantox.com",
      badges: [],
      location: "Barcelona, Spain",
      title: "UX/UI Designer",
      logoUrl: "/kantox.png",
      start: "July 2019",
      end: "October 2020",
      description:
        "Designed user flows for Kantox's B2B currency-management platform, simplifying FX hedging and automation dashboards for finance teams.",
    },
  ],
  education: [
    {
      school: "Ironhack",
      href: "https://www.ironhack.com",
      degree: "UX/UI Design",
      logoUrl: "/ironhack.png",
      start: "2019",
      end: "2019",
    },
    {
      school: "Università degli Studi di Padova",
      href: "https://www.unipd.it",
      degree: "B.S. Communication Sciences",
      logoUrl: "/unipd.png",
      start: "2006",
      end: "2011",
    },
    {
      school: "The Hague University of Applied Sciences",
      href: "https://www.thuas.com",
      degree: "Exchange Semester",
      logoUrl: "/hhs.png",
      start: "2008",
      end: "2008",
    },
  ],
  music: {
    onRepeat: [
      { trackId: "67WC3ZMEQDCvIEVIC0u2Gv", artist: "Dennis Brown", track: "Love Has Found Its Way" },
      { trackId: "0SQKjRQ1vaYEaMOtRzvbiO", artist: "Charlie Jeer", track: "Sun Is Gone" },
      { trackId: "3ELZG2YLGrwCVesooFyF4e", artist: "Gotts Street Park", track: "Everything" },
      { trackId: "4aYQmVzzYIB5mgFqCl2hpQ", artist: "TOPS", track: "Anything" },
      { trackId: "1SIXMGcsAeA6sNxaY1EG3O", artist: "Nu Genea", track: "Tienaté" },
    ],
    sessions: [
      {
        videoId: "p6kPU5kYupo",
        title: "Back to You",
        description: "Stripped-back acoustic session recorded in Bangkok.",
      },
      {
        videoId: "0KIjXQ0yW70",
        title: "Like Water",
        description: "My first concert as a singer in Bangkok.",
      },
      {
        videoId: "-pTNysiHEoU",
        title: "Around You",
        description: "Live duet, the soul-pop vibes I keep coming back to.",
      },
      {
        videoId: "aCreChBBtOo",
        title: "Why Not Me",
        description: "An intimate rooftop performance.",
      },
    ],
  },
  talks: [
    {
      videoId: "avA3YEFOb5k",
      title: "Product management for EU fintech companies",
      description:
        "With Giulio Caggiano (Kantox, Qonto, Moss) on how product gets built inside European fintech.",
    },
    {
      videoId: "nphgCpbSKBQ",
      title: "UX design at Revolut, Glovo, and teaching",
      description:
        "A conversation about design careers, craft, and moving between product teams.",
    },
    {
      videoId: "hOSvgLmK2xQ",
      title: "UX writing with Melanie Alves",
      description:
        "How words carry the experience, and what that looks like day to day at Qonto.",
    },
    {
      videoId: "nmzilQWQ-z0",
      title: "How to prevent and manage burnout at work",
      description: "JKPO Podcast episode on sustainable pace in product teams.",
    },
  ],
  projects: [
    {
      title: "Intelligent Scheduling",
      hidden: false,
      slug: "intelligent-scheduling",
      href: "/case-studies/intelligent-scheduling",
      dates: "2025",
      active: true,
      summary:
        "How Nory moved restaurant groups off habit-based rotas and onto staffing that follows forecasted demand, with labour cost visible while the week is still changeable.",
      description:
        "An AI scheduling workflow for hospitality, where the system generates shifts from forecasted demand and the manager reviews, adjusts and publishes. The beta helped sign Nory's largest enterprise customer, with **£5M+** in projected labour savings, with a median of **1.5 minutes** to publish a schedule against **11.6** for everyone else.",
      technologies: [
        "Product Design",
        "UX Research",
        "AI / Forecasting",
        "Workforce Management",
        "Mobile",
        "Data Viz",
      ],
      links: [
        {
          type: "Case Study",
          href: "/case-studies/intelligent-scheduling",
          icon: <Icons.globe className="size-3" />,
        },
      ],
      image: "/nory-scheduling-cover.png",
      video: "",
    },
    {
      title: "Supplier Invoices",
      hidden: false,
      slug: "qonto-supplier-invoices",
      href: "/case-studies/qonto-supplier-invoices",
      dates: "2022",
      active: true,
      summary:
        "Giving supplier invoices a home inside Qonto, so a document no longer had to wait for a payment to exist before the product could do anything useful with it.",
      description:
        "End-to-end invoice management for SMEs inside Qonto. Bulk import from email, Drive or Dropbox, OCR extraction, auto-matching to transactions, and one-click SEPA payment. **500 organisations** marked an invoice as paid in month one, driving **52 plan upgrades** from Basic to Smart+.",
      technologies: [
        "Product Design",
        "UX Research",
        "Fintech",
        "Bookkeeping",
        "Automation",
        "User Testing",
      ],
      links: [
        {
          type: "Case Study",
          href: "/case-studies/qonto-supplier-invoices",
          icon: <Icons.globe className="size-3" />,
        },
      ],
      image: "/qonto-cover.png",
      video: "",
    },
    {
      title: "Nory Pay",
      hidden: true,
      slug: "people-for-payroll",
      href: "/case-studies/people-for-payroll",
      dates: "2024",
      active: true,
      summary:
        "Closing the loop between scheduled hours and what staff actually cost, once pensions, insurance and real payments are counted.",
      description:
        "Embedded payroll automation for hospitality operators. Closed the loop between scheduled hours, actual payments, pensions and insurance, turning the blind spot behind 'actual labour cost' into something managers could see and act on.",
      technologies: [
        "Product Design",
        "Payroll",
        "Compliance",
        "Systems Design",
      ],
      links: [],
      image: "/nory-pay-cover.png",
      video: "",
    },
    {
      title: "Panluma",
      hidden: true,
      slug: "panluma",
      href: "/case-studies/panluma",
      dates: "2026",
      active: true,
      summary:
        "Live experiments in instructing, understanding and correcting AI systems that can take action, built as working prototypes rather than mockups.",
      description:
        "A set of interactive experiments on how we instruct, understand, and collaborate with AI systems that can take action. Built as live coded prototypes rather than mockups.",
      technologies: [
        "Next.js",
        "Typescript",
        "Tailwind CSS",
        "Framer Motion",
        "AI UX",
        "Prototyping",
      ],
      links: [
        {
          type: "Website",
          href: "/case-studies/panluma",
          icon: <Icons.globe className="size-3" />,
        },
      ],
      image: "",
      video: "",
    },
  ],
} as const;
