import { allKnowledges } from "content-collections";
import { DATA } from "@/data/resume";
import { publishedCaseStudies } from "@/lib/case-studies";

/** Strips MDX imports and JSX-only lines so the model reads prose, not markup. */
function toPlainMarkdown(source: string) {
  return source
    .split("\n")
    .filter((line) => !/^\s*(import|export)\s/.test(line))
    .join("\n")
    .trim();
}

function profileSection() {
  const work = DATA.work
    .map((job) => `- ${job.title} @ ${job.company} (${job.start} – ${job.end}, ${job.location}): ${job.description}`)
    .join("\n");
  const education = DATA.education
    .map((school) => `- ${school.degree}, ${school.school} (${school.start} – ${school.end})`)
    .join("\n");
  const skills = DATA.skills.map((skill) => skill.name).join(", ");

  return [
    `Name: ${DATA.name}`,
    `Location: ${DATA.location}`,
    `Headline: ${DATA.description}`,
    `Website: ${DATA.url}`,
    `Email: ${DATA.contact.email}`,
    `Summary:\n${DATA.summary}`,
    `Work experience:\n${work}`,
    `Education:\n${education}`,
    `Skills: ${skills}`,
  ].join("\n\n");
}

function caseStudiesSection() {
  return publishedCaseStudies
    .map((study) => `### ${study.title} (/case-studies/${study._meta.path.replace(/\.mdx$/, "")})\n${study.summary}\n\n${toPlainMarkdown(study.content)}`)
    .join("\n\n---\n\n");
}

function notesSection() {
  return allKnowledges
    .map((note) => `### ${note.title ?? note._meta.path}\n${toPlainMarkdown(note.content)}`)
    .join("\n\n---\n\n");
}

const firstName = DATA.name.split(" ")[0];

/** Built once per server instance: everything the site knows, as one prompt. */
export const SYSTEM_PROMPT = `You are the assistant on ${firstName}'s portfolio website. Visitors (often recruiters, hiring managers and designers) ask you about ${DATA.name}: background, work, case studies and process.

Rules:
- Answer only from the knowledge below. If the answer isn't there, say you don't know and suggest emailing ${DATA.contact.email}.
- Refer to ${firstName} in the third person. Never pretend to be ${firstName}.
- Be concise: 2–4 short paragraphs or a short list at most. Use Markdown. Link case studies with their relative URL (e.g. /case-studies/jds) when relevant.
- When the visitor quotes a passage from the page, explain or expand on that passage first.
- Politely decline unrelated tasks (coding help, general trivia, writing essays).

# Profile
${profileSection()}

# Case studies
${caseStudiesSection()}
${allKnowledges.length > 0 ? `\n# Notes\n${notesSection()}` : ""}`;
