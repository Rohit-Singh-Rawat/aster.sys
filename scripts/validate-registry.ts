/**
 * Fails the registry build on manifest ⇄ filesystem drift:
 *  - every file listed in registry.json must exist
 *  - every primitive folder under registry/aster/ui must have a manifest item
 *  - every registry:ui item must have a colocated *.test.ts(x) file
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const registry = JSON.parse(
  fs.readFileSync(path.join(ROOT, "registry.json"), "utf-8"),
) as {
  items: { name: string; type: string; files?: { path: string }[] }[];
};

const errors: string[] = [];

for (const item of registry.items) {
  for (const file of item.files ?? []) {
    if (!fs.existsSync(path.join(ROOT, file.path))) {
      errors.push(`Item "${item.name}": missing file ${file.path}`);
    }
  }
}

const uiDir = path.join(ROOT, "registry", "aster", "ui");
const itemNames = new Set(registry.items.map((item) => item.name));
if (fs.existsSync(uiDir)) {
  for (const folder of fs.readdirSync(uiDir)) {
    if (!itemNames.has(folder)) {
      errors.push(
        `Folder registry/aster/ui/${folder} has no registry.json item`,
      );
    }
  }
}

// Testing is structural: every registry:ui item must ship colocated tests
// (docs/03-templates/testing-template.md — an untested primitive is not
// production-ready, and this check makes that impossible to forget).
for (const item of registry.items) {
  if (item.type !== "registry:ui") continue;
  const itemDir = path.join(uiDir, item.name);
  if (!fs.existsSync(itemDir)) continue; // missing-folder drift is reported above
  const hasTest = fs
    .readdirSync(itemDir)
    .some((file) => /\.test\.(ts|tsx)$/.test(file));
  if (!hasTest) {
    errors.push(
      `Item "${item.name}": no colocated *.test.ts(x) in registry/aster/ui/${item.name}`,
    );
  }
}

if (errors.length > 0) {
  console.error("Registry validation failed:");
  for (const error of errors) {
    console.error(`  - ${error}`);
  }
  process.exit(1);
}

console.log(`Registry OK: ${registry.items.length} items validated.`);
