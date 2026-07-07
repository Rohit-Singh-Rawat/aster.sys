import fs from "node:fs";
import path from "node:path";
import type { ReactElement } from "react";
import { compileMDX } from "next-mdx-remote/rsc";
import { mdxComponents } from "@/mdx-components";

const ROOT = process.cwd();
const REGISTRY_JSON = path.join(ROOT, "registry.json");
const UI_DIR = path.join(ROOT, "registry", "aster", "ui");
const CONTENT_DIR = path.join(ROOT, "content", "primitives");

interface RegistryFile {
  path: string;
  type: string;
  target?: string;
}

interface RegistryItem {
  name: string;
  type: string;
  title: string;
  description: string;
  categories?: string[];
  files: RegistryFile[];
}

export interface SourceFile {
  name: string;
  code: string;
  language?: string;
}

export interface PrimitiveIndexEntry {
  slug: string;
  title: string;
  description: string;
  category?: string;
}

export interface PrimitiveDoc extends PrimitiveIndexEntry {
  files: SourceFile[];
  demos: SourceFile[];
  body?: ReactElement;
}

function readRegistry(): RegistryItem[] {
  const raw = fs.readFileSync(REGISTRY_JSON, "utf-8");
  return (JSON.parse(raw).items ?? []) as RegistryItem[];
}

/** Primitives = registry items of type "registry:ui" (systems with doc pages). */
export function getPrimitiveIndex(): PrimitiveIndexEntry[] {
  return readRegistry()
    .filter((item) => item.type === "registry:ui")
    .map((item) => ({
      slug: item.name,
      title: item.title,
      description: item.description,
      category: item.categories?.[0],
    }));
}

export function getPrimitiveSlugs(): string[] {
  return getPrimitiveIndex().map((entry) => entry.slug);
}

export async function getPrimitive(slug: string): Promise<PrimitiveDoc | null> {
  const item = readRegistry().find(
    (candidate) => candidate.type === "registry:ui" && candidate.name === slug,
  );
  if (!item) return null;

  const files: SourceFile[] = item.files
    .filter((file) => fs.existsSync(path.join(ROOT, file.path)))
    .map((file) => ({
      name: path.basename(file.path),
      code: fs.readFileSync(path.join(ROOT, file.path), "utf-8"),
      language: path.extname(file.path).slice(1) || "tsx",
    }));

  const demosDir = path.join(UI_DIR, slug, "demos");
  const demos: SourceFile[] = fs.existsSync(demosDir)
    ? fs
        .readdirSync(demosDir)
        .filter((file) => file.endsWith(".tsx"))
        .sort()
        .map((file) => ({
          name: file.replace(/\.tsx$/, ""),
          code: fs.readFileSync(path.join(demosDir, file), "utf-8"),
          language: "tsx",
        }))
    : [];

  if (demos.length === 0 && process.env.NODE_ENV !== "production") {
    console.warn(`[registry-loader] primitive "${slug}" has no demos`);
  }

  let body: ReactElement | undefined;
  const mdxPath = path.join(CONTENT_DIR, `${slug}.mdx`);
  if (fs.existsSync(mdxPath)) {
    const compiled = await compileMDX({
      source: fs.readFileSync(mdxPath, "utf-8"),
      components: mdxComponents,
      // blockJS: next-mdx-remote v6 strips JSX attribute expressions by
      // default (secure-by-default for untrusted remote MDX). Our MDX is
      // first-party content in this repo, so expressions are safe.
      options: { parseFrontmatter: true, blockJS: false },
    });
    body = compiled.content;
  }

  return {
    slug,
    title: item.title,
    description: item.description,
    category: item.categories?.[0],
    files,
    demos,
    body,
  };
}
