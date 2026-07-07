import { plannedSystems } from "@/lib/planned-systems";
import { getPrimitiveIndex } from "@/lib/registry-loader";
import { GITHUB_URL, SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

/**
 * llms.txt (https://llmstxt.org): a Markdown map of the site for AI agents.
 * Generated from the registry so it can never drift from what actually
 * ships. Aimed at agents installing aster systems via the shadcn CLI.
 */
export function GET() {
  const built = getPrimitiveIndex();

  const lines = [
    "# aster",
    "",
    "> aster is a component library of interaction systems: accessible React",
    "> primitives engineered for motion, accessibility, and feel, distributed",
    "> via the shadcn registry. Components are easy to copy — interaction",
    "> isn't.",
    "",
    "Install any system into a shadcn-compatible React project:",
    "",
    "```",
    "bunx shadcn@latest add @aster/<name>",
    "```",
    "",
    `Registry item JSON lives at ${SITE_URL}/r/<name>.json. Systems ship as`,
    "source (TypeScript + Tailwind CSS), not as an npm package — you own the",
    "code after install.",
    "",
    "## Systems",
    "",
    ...built.map(
      (entry) =>
        `- [${entry.title}](${SITE_URL}/systems/${entry.slug}): ${entry.description}`,
    ),
    "",
    "## Planned systems",
    "",
    ...plannedSystems.map((entry) => `- ${entry.title}: on the roadmap`),
    "",
    "## Source",
    "",
    `- [GitHub repository](${GITHUB_URL}): source code, issues, contributions`,
    `- [Systems index](${SITE_URL}/systems): all systems with live previews`,
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
