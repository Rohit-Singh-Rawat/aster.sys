import { plannedSystems } from "@/lib/planned-systems";
import { getComponentIndex, getSystemIndex } from "@/lib/registry-loader";
import { GITHUB_URL, SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

/**
 * llms.txt (https://llmstxt.org): a Markdown map of the site for AI agents.
 * Generated from the registry so it can never drift from what actually
 * ships. Aimed at agents installing aster primitives via the shadcn CLI.
 */
export function GET() {
  const systems = getSystemIndex();
  const components = getComponentIndex();

  const lines = [
    "# aster",
    "",
    "> aster is a library of interaction systems: accessible React",
    "> primitives engineered for motion, accessibility, and feel, distributed",
    "> via the shadcn registry. Systems are the full engineering lifecycle —",
    "> research and reasoning included. Components are pragmatic builds on a",
    "> temporary primitive, ready to copy in now. Both are easy to copy —",
    "> interaction isn't.",
    "",
    "Install any primitive into a shadcn-compatible React project:",
    "",
    "```",
    "bunx shadcn@latest add @aster/<name>",
    "```",
    "",
    `Registry item JSON lives at ${SITE_URL}/r/<name>.json. Primitives ship`,
    "as source (TypeScript + Tailwind CSS), not as an npm package — you own",
    "the code after install.",
    "",
    "## Systems",
    "",
    ...systems.map(
      (entry) =>
        `- [${entry.title}](${SITE_URL}/systems/${entry.slug}): ${entry.description}`,
    ),
    "",
    "## Planned systems",
    "",
    ...plannedSystems.map((entry) => `- ${entry.title}: on the roadmap`),
    "",
    "## Components",
    "",
    ...components.map(
      (entry) =>
        `- [${entry.title}](${SITE_URL}/components/${entry.slug}): ${entry.description}`,
    ),
    "",
    "## Source",
    "",
    `- [GitHub repository](${GITHUB_URL}): source code, issues, contributions`,
    `- [Systems index](${SITE_URL}/systems): all systems with live previews`,
    `- [Components index](${SITE_URL}/components): all components with live previews`,
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
