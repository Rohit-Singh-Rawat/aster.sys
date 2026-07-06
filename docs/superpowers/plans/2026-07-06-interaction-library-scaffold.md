# Interaction Library Scaffold Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the interaction-primitives library: shadcn registry pipeline, docs system, site shell, shared interaction/motion layer, and a reference Button primitive — proven end-to-end by installing Button into a scratch project via the shadcn CLI.

**Architecture:** Single Next.js 16 app. Installable library code lives only under `registry/rsr/{lib,hooks,ui}` (this exact shape is required — the shadcn CLI rewrites `@/registry/<ns>/<bucket>/…` imports to consumer aliases on install). Site code (`app/`, `lib/`, `components/`) renders docs by reading `registry.json` + source files + MDX from the filesystem at build time.

**Tech Stack:** Next.js 16.2.10 (App Router, React Compiler), React 19.2.4, Tailwind CSS 4, Bun, Biome, next-themes, next-mdx-remote/rsc, prism-react-renderer, class-variance-authority, motion, @base-ui/react, shadcn CLI 4.x.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-06-interaction-library-scaffold-design.md`.
- Brand (updated mid-execution by the owner, supersedes `@rsr` placeholder): name **aster**, registry namespace `@aster`, logo component `components/logo/logo.tsx` (owner-provided; black fill — call sites add `dark:invert`). Tasks 1–7 were built as `@rsr`; Task 7.5 performs the rename.
- Fonts: Satoshi (owner-provided OTFs in `public/font/satoshi/`) via `next/font/local` as `--font-sans`; Geist Mono stays as `--font-mono`.
- Theme default is **light** (owner's minimal references + black-on-light logo); dark stays supported via the toggle.
- UI stays minimal: generous whitespace, soft muted surfaces, small uppercase mono labels, no heavy chrome.
- Tagline (exact copy): `Components are easy to copy. Interaction isn't.`
- After Task 7.5, no source file outside `docs/`, `.superpowers/`, and git history may contain the string `rsr`.
- `registry/**` must NEVER import from `app/`, `lib/`, `components/`, or `mdx-components.tsx`. Site code may import from `registry/**` freely.
- Cross-item imports inside `registry/**` use the `@/registry/rsr/<bucket>/<file>` form (never relative across items; relative imports only within one item's folder).
- All motion values come from tokens: JS from `registry/rsr/lib/motion-tokens.ts`, CSS from `--motion-*` variables. No magic numbers/curves in components.
- Package manager is **bun**; repo already has `bun.lock`. Shell examples are Git Bash (Windows).
- Next.js 16: route `params` is a `Promise` — always `await` it. Verified against bundled docs in `node_modules/next/dist/docs/`.
- This pass has no test framework (per spec). Verification = `bun run build`, `bun run lint`, `bun run registry:build`, manual route checks, and the Task 10 end-to-end install.
- Commit after every task. Do not push.

## File Map (who owns what)

| Path | Role |
|---|---|
| `registry/rsr/lib/cn.ts` | class merge utility (installable) |
| `registry/rsr/lib/motion-tokens.ts` | motion system source of truth (installable) |
| `registry/rsr/hooks/use-press.ts` | press interaction system (installable) |
| `registry/rsr/ui/button/button.tsx` | Button surface (installable) |
| `registry/rsr/ui/button/use-button.ts` | Button behavior hook (installable) |
| `registry/rsr/ui/button/demos/*.tsx` | demos (docs-only, NOT in registry.json) |
| `registry.json` | shadcn manifest; also the docs index source of truth |
| `scripts/validate-registry.ts` | manifest ⇄ filesystem drift check |
| `content/primitives/button.mdx` | narrative docs (interaction spec, a11y, motion, API) |
| `lib/registry-loader.ts` | site-only fs loader: registry.json + source + demos + MDX |
| `lib/demos.tsx` | slug → live demo component map |
| `mdx-components.tsx` | MDX element styling + PropsTable + Kbd |
| `components/theme-provider.tsx`, `components/theme-toggle.tsx`, `components/logo/logo.tsx` (owner-provided) | site chrome |
| `components/docs/{code-block,demo-frame,source-tabs,install-command}.tsx` | docs UI |
| `app/(site)/page.tsx` | landing |
| `app/(docs)/layout.tsx`, `app/(docs)/primitives/page.tsx`, `app/(docs)/primitives/[slug]/page.tsx` | docs routes |

---

### Task 1: Dependencies, scripts, and repo config

**Files:**
- Modify: `package.json` (via bun commands + one script edit)
- Create: `components.json`
- Modify: `.gitignore`

**Interfaces:**
- Produces: installed packages `@base-ui/react`, `motion`, `class-variance-authority`, `clsx`, `tailwind-merge`, `next-mdx-remote`, `next-themes`, `prism-react-renderer`, devDep `shadcn`; script `registry:build`.

- [ ] **Step 1: Install dependencies**

```bash
cd "/c/Users/ROHIT SINGH RAWAT/OneDrive/Desktop/rsrCrafts/ui"
bun add @base-ui/react motion class-variance-authority clsx tailwind-merge next-mdx-remote next-themes prism-react-renderer
bun add -d shadcn
```

Expected: both commands exit 0; `package.json` lists all packages.

- [ ] **Step 2: Add the registry:build script**

In `package.json` `scripts`, add (keep existing scripts untouched):

```json
"registry:build": "bun scripts/validate-registry.ts && shadcn build"
```

(The validate script arrives in Task 5; the script line is inert until then — that's fine, it is not run before Task 5.)

- [ ] **Step 3: Create `components.json`**

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks",
    "utils": "@/registry/rsr/lib/cn"
  }
}
```

- [ ] **Step 4: Ignore generated registry output**

Append to `.gitignore`:

```
# generated registry output (bun run registry:build)
/public/r/
```

- [ ] **Step 5: Verify build still passes**

```bash
bun run build
```

Expected: `next build` completes with no errors.

- [ ] **Step 6: Commit**

```bash
git add package.json bun.lock components.json .gitignore
git commit -m "chore: add library dependencies, registry build script, shadcn config"
```

---

### Task 2: Theme tokens and root layout

**Files:**
- Modify: `app/globals.css` (full replacement below)
- Modify: `app/layout.tsx` (full replacement below)
- Create: `components/theme-provider.tsx`

**Interfaces:**
- Produces: CSS variables `--background --foreground --muted --muted-foreground --border --accent --accent-from --accent-to`, Tailwind colors `background foreground muted muted-foreground border accent`, motion vars `--motion-dur-instant/fast/base/slow`, `--motion-ease-out/in-out`; `<ThemeProvider>` wrapping the app with class-based dark mode, default dark.
- Consumes: nothing.

- [ ] **Step 1: Replace `app/globals.css`**

```css
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

:root {
  --background: oklch(0.985 0 0);
  --foreground: oklch(0.205 0 0);
  --muted: oklch(0.94 0 0);
  --muted-foreground: oklch(0.52 0 0);
  --border: oklch(0.88 0 0);
  /* Accent: "light moving across glass" — used only for wordmark, active states, focus rings */
  --accent: oklch(0.62 0.11 265);
  --accent-from: oklch(0.72 0.12 250);
  --accent-to: oklch(0.78 0.1 320);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.93 0 0);
  --muted: oklch(0.21 0 0);
  --muted-foreground: oklch(0.62 0 0);
  --border: oklch(0.27 0 0);
  --accent: oklch(0.75 0.12 265);
  --accent-from: oklch(0.78 0.12 250);
  --accent-to: oklch(0.82 0.1 320);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-border: var(--border);
  --color-accent: var(--accent);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);

  /* Motion system — must mirror registry/rsr/lib/motion-tokens.ts */
  --motion-dur-instant: 50ms;
  --motion-dur-fast: 120ms;
  --motion-dur-base: 200ms;
  --motion-dur-slow: 320ms;
  --motion-ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --motion-ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans), system-ui, sans-serif;
}
```

- [ ] **Step 2: Create `components/theme-provider.tsx`**

```tsx
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider(
  props: React.ComponentProps<typeof NextThemesProvider>,
) {
  return <NextThemesProvider {...props} />;
}
```

- [ ] **Step 3: Replace `app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "rsr/ui — interaction systems",
  description:
    "Components are easy to copy. Interaction isn't. Primitives engineered as interaction systems.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Verify**

```bash
bun run build && bun run lint
```

Expected: both exit 0. (Biome may flag formatting — run `bun run format` and re-check if so.)

- [ ] **Step 5: Commit**

```bash
git add app/globals.css app/layout.tsx components/theme-provider.tsx
git commit -m "feat: monochrome theme tokens, motion variables, dark-first theming"
```

---

### Task 3: Shared systems — cn, motion tokens, use-press

**Files:**
- Create: `registry/rsr/lib/cn.ts`
- Create: `registry/rsr/lib/motion-tokens.ts`
- Create: `registry/rsr/hooks/use-press.ts`

**Interfaces:**
- Produces:
  - `cn(...inputs: ClassValue[]): string`
  - `durations: { instant: "50ms"; fast: "120ms"; base: "200ms"; slow: "320ms" }`, `easings: { out: string; inOut: string }`, `springs: { press; settle }`
  - `usePress<T extends HTMLElement = HTMLElement>(options?: { disabled?: boolean }): { pressed: boolean; pressProps: PressProps<T> }` where `PressProps<T>` has `onPointerDown/onPointerUp/onPointerLeave/onPointerCancel/onKeyDown/onKeyUp` React handlers typed for element `T`.
- Consumes: nothing (leaf layer).

- [ ] **Step 1: Create `registry/rsr/lib/cn.ts`**

```ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 2: Create `registry/rsr/lib/motion-tokens.ts`**

```ts
/**
 * Motion tokens — the single source of motion truth for JS animations.
 * The CSS counterparts (--motion-* variables in the app stylesheet, shipped
 * to consumers via this item's cssVars) must mirror these values exactly.
 */
export const durations = {
  instant: "50ms",
  fast: "120ms",
  base: "200ms",
  slow: "320ms",
} as const;

export const easings = {
  out: "cubic-bezier(0.22, 1, 0.36, 1)",
  inOut: "cubic-bezier(0.65, 0, 0.35, 1)",
} as const;

/** Spring presets for motion/react animations. */
export const springs = {
  press: { type: "spring", stiffness: 700, damping: 32, mass: 1 },
  settle: { type: "spring", stiffness: 260, damping: 26, mass: 1 },
} as const;
```

- [ ] **Step 3: Create `registry/rsr/hooks/use-press.ts`**

```ts
"use client";

import { useCallback, useState } from "react";

export interface UsePressOptions {
  /** Mirrors the element's disabled state; disables all press tracking. */
  disabled?: boolean;
}

export interface PressProps<T extends HTMLElement = HTMLElement> {
  onPointerDown: React.PointerEventHandler<T>;
  onPointerUp: React.PointerEventHandler<T>;
  onPointerLeave: React.PointerEventHandler<T>;
  onPointerCancel: React.PointerEventHandler<T>;
  onKeyDown: React.KeyboardEventHandler<T>;
  onKeyUp: React.KeyboardEventHandler<T>;
}

export interface UsePressResult<T extends HTMLElement = HTMLElement> {
  /** True while actively pressed: pointer down inside, or Space/Enter held. */
  pressed: boolean;
  /** Spread onto the target element. */
  pressProps: PressProps<T>;
}

/**
 * Press interaction system: tracks an active press across pointer and
 * keyboard with cancel semantics — dragging off the element or a cancelled
 * pointer ends the press without activation. Activation itself stays native
 * (click), so there is no double-fire risk.
 */
export function usePress<T extends HTMLElement = HTMLElement>(
  options: UsePressOptions = {},
): UsePressResult<T> {
  const { disabled = false } = options;
  const [pressed, setPressed] = useState(false);

  const end = useCallback(() => {
    setPressed(false);
  }, []);

  const onPointerDown: React.PointerEventHandler<T> = useCallback(
    (event) => {
      if (disabled || !event.isPrimary || event.button !== 0) return;
      setPressed(true);
    },
    [disabled],
  );

  const onKeyDown: React.KeyboardEventHandler<T> = useCallback(
    (event) => {
      if (disabled) return;
      if (event.key === " " || event.key === "Enter") setPressed(true);
    },
    [disabled],
  );

  return {
    pressed: disabled ? false : pressed,
    pressProps: {
      onPointerDown,
      onPointerUp: end,
      onPointerLeave: end,
      onPointerCancel: end,
      onKeyDown,
      onKeyUp: end,
    },
  };
}
```

- [ ] **Step 4: Verify types compile**

```bash
bun run build
```

Expected: exit 0. (Files aren't imported yet; this catches syntax/type errors only.)

- [ ] **Step 5: Commit**

```bash
git add registry/
git commit -m "feat: shared systems — cn, motion tokens, use-press interaction hook"
```

---

### Task 4: Button system

**Files:**
- Create: `registry/rsr/ui/button/use-button.ts`
- Create: `registry/rsr/ui/button/button.tsx`
- Create: `registry/rsr/ui/button/demos/basic.tsx`
- Create: `registry/rsr/ui/button/demos/pressed.tsx`

**Interfaces:**
- Consumes: `usePress` from `@/registry/rsr/hooks/use-press`, `cn` from `@/registry/rsr/lib/cn`.
- Produces:
  - `useButton(options?: UseButtonOptions): { pressed: boolean; buttonProps: ... }`
  - `Button` component with props `variant?: "solid" | "outline" | "ghost"`, `size?: "sm" | "md" | "lg"`, plus all native button props. States exposed as `data-pressed` attribute + `:focus-visible` + `disabled`.
  - Demos default-export components named `BasicDemo`, `PressedDemo`.

- [ ] **Step 1: Create `registry/rsr/ui/button/use-button.ts`**

```ts
"use client";

import { usePress } from "@/registry/rsr/hooks/use-press";

type Handler<E> = ((event: E) => void) | undefined;

function chain<E>(ours: Handler<E>, theirs: Handler<E>) {
  return (event: E) => {
    ours?.(event);
    theirs?.(event);
  };
}

export interface UseButtonOptions {
  disabled?: boolean;
  onPointerDown?: React.PointerEventHandler<HTMLButtonElement>;
  onPointerUp?: React.PointerEventHandler<HTMLButtonElement>;
  onPointerLeave?: React.PointerEventHandler<HTMLButtonElement>;
  onPointerCancel?: React.PointerEventHandler<HTMLButtonElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLButtonElement>;
  onKeyUp?: React.KeyboardEventHandler<HTMLButtonElement>;
}

/**
 * Behavior layer for Button: owns interaction state and semantics, renders
 * nothing. Future concerns (loading, async feedback) land here without
 * touching the visual component.
 */
export function useButton(options: UseButtonOptions = {}) {
  const { disabled = false, ...consumer } = options;
  const { pressed, pressProps } = usePress<HTMLButtonElement>({ disabled });

  return {
    pressed,
    buttonProps: {
      type: "button" as const,
      disabled,
      "data-pressed": pressed ? "" : undefined,
      onPointerDown: chain(pressProps.onPointerDown, consumer.onPointerDown),
      onPointerUp: chain(pressProps.onPointerUp, consumer.onPointerUp),
      onPointerLeave: chain(pressProps.onPointerLeave, consumer.onPointerLeave),
      onPointerCancel: chain(pressProps.onPointerCancel, consumer.onPointerCancel),
      onKeyDown: chain(pressProps.onKeyDown, consumer.onKeyDown),
      onKeyUp: chain(pressProps.onKeyUp, consumer.onKeyUp),
    },
  };
}
```

- [ ] **Step 2: Create `registry/rsr/ui/button/button.tsx`**

```tsx
"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/registry/rsr/lib/cn";
import { useButton } from "./use-button";

const buttonVariants = cva(
  [
    "inline-flex select-none items-center justify-center gap-2 rounded-lg font-medium",
    "outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    // Press physics: compression is immediate on the way down, eased on release.
    "transition-[transform,background-color,color,border-color] duration-(--motion-dur-fast) ease-(--motion-ease-out)",
    "data-pressed:scale-[0.97] data-pressed:duration-(--motion-dur-instant)",
    "disabled:pointer-events-none disabled:opacity-45",
    "motion-reduce:transition-none motion-reduce:data-pressed:scale-100",
  ],
  {
    variants: {
      variant: {
        solid: "bg-foreground text-background hover:bg-foreground/85",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-foreground/5",
        ghost: "bg-transparent text-foreground hover:bg-foreground/5",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "solid",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({
  className,
  variant,
  size,
  disabled,
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  onPointerCancel,
  onKeyDown,
  onKeyUp,
  ...rest
}: ButtonProps) {
  const { buttonProps } = useButton({
    disabled: disabled ?? false,
    onPointerDown,
    onPointerUp,
    onPointerLeave,
    onPointerCancel,
    onKeyDown,
    onKeyUp,
  });

  return (
    <button
      {...buttonProps}
      {...rest}
      className={cn(buttonVariants({ variant, size }), className)}
    />
  );
}
```

Note: `{...rest}` after `{...buttonProps}` lets consumers override `type` (e.g. `type="submit"`); the six press handlers are extracted from `rest` above, so they merge via `chain` instead of clobbering.

- [ ] **Step 3: Create `registry/rsr/ui/button/demos/basic.tsx`**

```tsx
"use client";

import { Button } from "@/registry/rsr/ui/button/button";

export default function BasicDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Button>Continue</Button>
      <Button variant="outline">Cancel</Button>
      <Button variant="ghost">Skip</Button>
    </div>
  );
}
```

- [ ] **Step 4: Create `registry/rsr/ui/button/demos/pressed.tsx`**

```tsx
"use client";

import { Button } from "@/registry/rsr/ui/button/button";

export default function PressedDemo() {
  return (
    <div className="flex flex-col items-center gap-4">
      <Button size="lg">Press and hold me</Button>
      <p className="max-w-xs text-center text-xs text-muted-foreground">
        Hold, then drag off before releasing — the press cancels instead of
        firing. Space behaves the same from the keyboard.
      </p>
      <Button disabled>Disabled</Button>
    </div>
  );
}
```

- [ ] **Step 5: Verify + commit**

```bash
bun run build && bun run lint
git add registry/rsr/ui/
git commit -m "feat: Button system — surface, behavior hook, demos"
```

Expected: build and lint exit 0.

---

### Task 5: registry.json, validation script, build pipeline

**Files:**
- Create: `registry.json`
- Create: `scripts/validate-registry.ts`

**Interfaces:**
- Consumes: all files from Tasks 3–4.
- Produces: `registry.json` items named `cn`, `motion-tokens`, `use-press`, `button` (docs loader in Task 6 reads these exact names/fields); working `bun run registry:build` emitting `public/r/{name}.json`.

- [ ] **Step 1: Create `registry.json`**

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry.json",
  "name": "@rsr",
  "homepage": "http://localhost:3000",
  "items": [
    {
      "name": "cn",
      "type": "registry:lib",
      "title": "cn",
      "description": "Class name merge utility (clsx + tailwind-merge).",
      "dependencies": ["clsx", "tailwind-merge"],
      "files": [
        {
          "path": "registry/rsr/lib/cn.ts",
          "type": "registry:lib",
          "target": "@lib/cn.ts"
        }
      ]
    },
    {
      "name": "motion-tokens",
      "type": "registry:lib",
      "title": "Motion Tokens",
      "description": "Named durations, easings, and spring presets — the motion system's source of truth.",
      "files": [
        {
          "path": "registry/rsr/lib/motion-tokens.ts",
          "type": "registry:lib",
          "target": "@lib/motion-tokens.ts"
        }
      ],
      "cssVars": {
        "theme": {
          "motion-dur-instant": "50ms",
          "motion-dur-fast": "120ms",
          "motion-dur-base": "200ms",
          "motion-dur-slow": "320ms",
          "motion-ease-out": "cubic-bezier(0.22, 1, 0.36, 1)",
          "motion-ease-in-out": "cubic-bezier(0.65, 0, 0.35, 1)"
        }
      }
    },
    {
      "name": "use-press",
      "type": "registry:hook",
      "title": "usePress",
      "description": "Press interaction system: pointer and keyboard press with cancel semantics.",
      "files": [
        {
          "path": "registry/rsr/hooks/use-press.ts",
          "type": "registry:hook",
          "target": "@hooks/use-press.ts"
        }
      ]
    },
    {
      "name": "button",
      "type": "registry:ui",
      "title": "Button",
      "description": "A button engineered as an interaction system — press physics, keyboard parity, motion tokens.",
      "categories": ["actions"],
      "dependencies": ["class-variance-authority"],
      "registryDependencies": ["@rsr/cn", "@rsr/motion-tokens", "@rsr/use-press"],
      "files": [
        {
          "path": "registry/rsr/ui/button/button.tsx",
          "type": "registry:ui",
          "target": "@ui/button/button.tsx"
        },
        {
          "path": "registry/rsr/ui/button/use-button.ts",
          "type": "registry:ui",
          "target": "@ui/button/use-button.ts"
        }
      ]
    }
  ]
}
```

- [ ] **Step 2: Create `scripts/validate-registry.ts`**

```ts
/**
 * Fails the registry build on manifest ⇄ filesystem drift:
 *  - every file listed in registry.json must exist
 *  - every primitive folder under registry/rsr/ui must have a manifest item
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const registry = JSON.parse(
  fs.readFileSync(path.join(ROOT, "registry.json"), "utf-8"),
) as {
  items: { name: string; files?: { path: string }[] }[];
};

const errors: string[] = [];

for (const item of registry.items) {
  for (const file of item.files ?? []) {
    if (!fs.existsSync(path.join(ROOT, file.path))) {
      errors.push(`Item "${item.name}": missing file ${file.path}`);
    }
  }
}

const uiDir = path.join(ROOT, "registry", "rsr", "ui");
const itemNames = new Set(registry.items.map((item) => item.name));
if (fs.existsSync(uiDir)) {
  for (const folder of fs.readdirSync(uiDir)) {
    if (!itemNames.has(folder)) {
      errors.push(`Folder registry/rsr/ui/${folder} has no registry.json item`);
    }
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
```

- [ ] **Step 3: Run the pipeline**

```bash
bun run registry:build
ls public/r
```

Expected: `Registry OK: 4 items validated.`, then shadcn build output; `ls` shows `button.json cn.json motion-tokens.json use-press.json` (plus possibly `registry.json`/index — extra files are fine).

- [ ] **Step 4: Inspect button.json for correctness**

```bash
grep -o '"registryDependencies":[^]]*]' public/r/button.json
grep -c '"content"' public/r/button.json
```

Expected: registryDependencies lists the three `@rsr/*` items; content count ≥ 2 (both source files embedded).

- [ ] **Step 5: Commit**

```bash
git add registry.json scripts/validate-registry.ts
git commit -m "feat: shadcn registry manifest, drift validation, build pipeline"
```

---

### Task 6: Registry loader, demo map, MDX components

**Files:**
- Create: `lib/registry-loader.ts`
- Create: `lib/demos.tsx`
- Create: `mdx-components.tsx`

**Interfaces:**
- Consumes: `registry.json` item shape from Task 5; demo files from Task 4.
- Produces (Tasks 7–8 rely on these exact signatures):
  - `getPrimitiveIndex(): PrimitiveIndexEntry[]` — `{ slug, title, description, category? }` for every `registry:ui` item
  - `getPrimitiveSlugs(): string[]`
  - `getPrimitive(slug: string): Promise<PrimitiveDoc | null>` — adds `files: { name, code }[]`, `demos: { name, code }[]`, `body?: React.ReactElement`
  - `demoRegistry: Record<string, { name: string; Component: React.ComponentType }[]>`
  - `mdxComponents` object including styled `h2 h3 p ul li code` plus `PropsTable` and `Kbd`

- [ ] **Step 1: Create `lib/registry-loader.ts`**

```ts
import fs from "node:fs";
import path from "node:path";
import { compileMDX } from "next-mdx-remote/rsc";
import { mdxComponents } from "@/mdx-components";

const ROOT = process.cwd();
const REGISTRY_JSON = path.join(ROOT, "registry.json");
const UI_DIR = path.join(ROOT, "registry", "rsr", "ui");
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
  body?: React.ReactElement;
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
        }))
    : [];

  if (demos.length === 0 && process.env.NODE_ENV !== "production") {
    console.warn(`[registry-loader] primitive "${slug}" has no demos`);
  }

  let body: React.ReactElement | undefined;
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
```

- [ ] **Step 2: Create `lib/demos.tsx`**

```tsx
import type { ComponentType } from "react";
import BasicDemo from "@/registry/rsr/ui/button/demos/basic";
import PressedDemo from "@/registry/rsr/ui/button/demos/pressed";

/**
 * Live demo components per primitive slug. Code strings come from the
 * loader; this map provides the rendered instances. Order here is the
 * display order; names must match the demo file names.
 */
export const demoRegistry: Record<
  string,
  { name: string; Component: ComponentType }[]
> = {
  button: [
    { name: "basic", Component: BasicDemo },
    { name: "pressed", Component: PressedDemo },
  ],
};
```

- [ ] **Step 3: Create `mdx-components.tsx`** (repo root, next to `registry.json`)

```tsx
import type { ComponentPropsWithoutRef, ReactNode } from "react";

function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs">
      {children}
    </kbd>
  );
}

interface PropRow {
  name: string;
  type: string;
  defaultValue?: string;
  description: string;
}

function PropsTable({ rows }: { rows: PropRow[] }) {
  return (
    <div className="mb-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="py-2 pr-4 font-medium">Prop</th>
            <th className="py-2 pr-4 font-medium">Type</th>
            <th className="py-2 pr-4 font-medium">Default</th>
            <th className="py-2 font-medium">Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} className="border-b border-border/50 align-top">
              <td className="py-2 pr-4 font-mono text-xs">{row.name}</td>
              <td className="py-2 pr-4 font-mono text-xs text-muted-foreground">
                {row.type}
              </td>
              <td className="py-2 pr-4 font-mono text-xs text-muted-foreground">
                {row.defaultValue ?? "—"}
              </td>
              <td className="py-2 text-muted-foreground">{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const mdxComponents = {
  h2: (props: ComponentPropsWithoutRef<"h2">) => (
    <h2
      className="mt-10 mb-3 text-xl font-semibold tracking-tight text-foreground"
      {...props}
    />
  ),
  h3: (props: ComponentPropsWithoutRef<"h3">) => (
    <h3 className="mt-6 mb-2 text-base font-semibold text-foreground" {...props} />
  ),
  p: (props: ComponentPropsWithoutRef<"p">) => (
    <p className="mb-4 max-w-prose leading-relaxed text-muted-foreground" {...props} />
  ),
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul
      className="mb-4 list-disc space-y-1 pl-5 text-muted-foreground"
      {...props}
    />
  ),
  li: (props: ComponentPropsWithoutRef<"li">) => (
    <li className="leading-relaxed" {...props} />
  ),
  code: (props: ComponentPropsWithoutRef<"code">) => (
    <code
      className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em] text-foreground"
      {...props}
    />
  ),
  Kbd,
  PropsTable,
};
```

- [ ] **Step 4: Verify + commit**

```bash
bun run build && bun run lint
git add lib/ mdx-components.tsx
git commit -m "feat: registry loader, demo map, MDX components"
```

Expected: build and lint exit 0.

---

### Task 7: Docs UI components

**Files:**
- Create: `components/docs/code-block.tsx`
- Create: `components/docs/demo-frame.tsx`
- Create: `components/docs/source-tabs.tsx`
- Create: `components/docs/install-command.tsx`
- Create: `components/theme-toggle.tsx`

**Interfaces:**
- Consumes: nothing from earlier tasks (pure UI; `SourceFile` shape `{ name: string; code: string }` is re-declared locally to keep these components portable).
- Produces: `CodeBlock({ code, language? })`, `DemoFrame({ name, code, children })`, `SourceTabs({ files })`, `InstallCommand({ name })`, `ThemeToggle()` — Task 8 imports all of these.

- [ ] **Step 1: Create `components/docs/code-block.tsx`**

```tsx
"use client";

import { Highlight, themes } from "prism-react-renderer";

export function CodeBlock({
  code,
  language = "tsx",
}: {
  code: string;
  language?: string;
}) {
  return (
    <Highlight theme={themes.oneDark} code={code.trimEnd()} language={language}>
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre
          className={`${className} max-h-96 overflow-auto rounded-lg border border-border p-4 text-[13px] leading-relaxed`}
          style={{ ...style, backgroundColor: "var(--muted)" }}
        >
          {tokens.map((line, lineIndex) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: lines are positional
            <div key={lineIndex} {...getLineProps({ line })}>
              {line.map((token, tokenIndex) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: tokens are positional
                <span key={tokenIndex} {...getTokenProps({ token })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );
}
```

- [ ] **Step 2: Create `components/docs/demo-frame.tsx`**

```tsx
"use client";

import { useState, type ReactNode } from "react";
import { CodeBlock } from "./code-block";

export function DemoFrame({
  name,
  code,
  children,
}: {
  name: string;
  code: string;
  children: ReactNode;
}) {
  const [showCode, setShowCode] = useState(false);
  return (
    <section className="overflow-hidden rounded-xl border border-border">
      <header className="flex items-center justify-between border-b border-border px-4 py-2">
        <span className="font-mono text-xs text-muted-foreground">{name}</span>
        {code.length > 0 && (
          <button
            type="button"
            onClick={() => setShowCode((value) => !value)}
            className="text-xs text-muted-foreground transition-colors duration-(--motion-dur-fast) hover:text-foreground"
          >
            {showCode ? "Preview" : "Code"}
          </button>
        )}
      </header>
      {showCode ? (
        <div className="p-2">
          <CodeBlock code={code} />
        </div>
      ) : (
        <div className="flex min-h-40 items-center justify-center p-8">
          {children}
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 3: Create `components/docs/source-tabs.tsx`**

```tsx
"use client";

import { useState } from "react";
import { CodeBlock } from "./code-block";

interface SourceFile {
  name: string;
  code: string;
}

export function SourceTabs({ files }: { files: SourceFile[] }) {
  const [active, setActive] = useState(0);
  if (files.length === 0) return null;
  const activeFile = files[Math.min(active, files.length - 1)];

  return (
    <div className="flex flex-col gap-2">
      <div role="tablist" aria-label="Source files" className="flex flex-wrap gap-1">
        {files.map((file, index) => (
          <button
            key={file.name}
            role="tab"
            type="button"
            aria-selected={index === active}
            onClick={() => setActive(index)}
            className={`rounded-md px-3 py-1.5 font-mono text-xs transition-colors duration-(--motion-dur-fast) ${
              index === active
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {file.name}
          </button>
        ))}
      </div>
      <CodeBlock code={activeFile.code} />
    </div>
  );
}
```

- [ ] **Step 4: Create `components/docs/install-command.tsx`**

```tsx
"use client";

import { useState } from "react";

export function InstallCommand({ name }: { name: string }) {
  const command = `bunx shadcn@latest add @rsr/${name}`;
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex items-center gap-3 self-start rounded-lg border border-border bg-muted px-3 py-2 font-mono text-xs">
      <span>{command}</span>
      <button
        type="button"
        aria-label="Copy install command"
        onClick={async () => {
          await navigator.clipboard.writeText(command);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="text-muted-foreground transition-colors duration-(--motion-dur-fast) hover:text-foreground"
      >
        {copied ? "copied" : "copy"}
      </button>
    </div>
  );
}
```

- [ ] **Step 5: Create `components/theme-toggle.tsx`**

```tsx
"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div aria-hidden className="h-8 w-8" />;

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-xs text-muted-foreground transition-colors duration-(--motion-dur-fast) hover:text-foreground"
    >
      {resolvedTheme === "dark" ? "☾" : "☀"}
    </button>
  );
}
```

- [ ] **Step 6: Verify + commit**

```bash
bun run build && bun run lint
git add components/
git commit -m "feat: docs UI — code block, demo frame, source tabs, install command, theme toggle"
```

Expected: build and lint exit 0.

---

### Task 7.5: Rebrand to aster — rename, logo assets, Satoshi, light-first

Added mid-execution: the owner named the library **aster**, provided a logo
(`components/logo/logo.tsx`, untracked) and Satoshi OTFs (`public/font/satoshi/`,
untracked), supplied minimal light-first UI references, and asked that Satoshi be used.

**Files:**
- Commit as-is (owner-provided, untracked): `components/logo/logo.tsx`, `public/font/satoshi/*.otf`
- Rename: `registry/rsr/` → `registry/aster/` (git mv)
- Modify: `registry.json`, `components.json`, `scripts/validate-registry.ts`,
  `lib/registry-loader.ts`, `lib/demos.tsx`,
  `registry/aster/ui/button/{button.tsx,use-button.ts}`,
  `registry/aster/ui/button/demos/{basic.tsx,pressed.tsx}`,
  `components/docs/install-command.tsx`, `app/layout.tsx`, `app/globals.css`
- Leave alone: `app/page.tsx` (owner's logo experiment; Task 9 replaces it)

**Interfaces:**
- Consumes: everything Tasks 1–7 built under the `rsr` name.
- Produces: identical APIs under `@aster`; `--font-satoshi` variable feeding
  `--font-sans`; ThemeProvider `defaultTheme="light"`; install command
  `bunx shadcn@latest add @aster/${name}`.

- [ ] **Step 1: Commit the owner's assets unchanged**

```bash
git add components/logo/ public/font/
git commit -m "feat: add aster logo and Satoshi font assets"
```

- [ ] **Step 2: Rename the registry namespace folder**

```bash
git mv registry/rsr registry/aster
```

- [ ] **Step 3: Replace every `rsr` reference in source**

In each file below, replace the string `rsr` with `aster` (they contain no other
occurrences of those letters — verify with grep afterwards):

- `registry.json` — `"name": "@aster"`, all `"path": "registry/aster/..."`, and
  `"registryDependencies": ["@aster/cn", "@aster/motion-tokens", "@aster/use-press"]`
- `components.json` — `"utils": "@/registry/aster/lib/cn"`
- `scripts/validate-registry.ts` — `path.join(ROOT, "registry", "aster", "ui")` and the
  error-message template string `registry/aster/ui/`
- `lib/registry-loader.ts` — `UI_DIR` join `"registry", "aster", "ui"`
- `lib/demos.tsx` — both demo imports `@/registry/aster/ui/button/demos/...`
- `registry/aster/ui/button/button.tsx` — `import { cn } from "@/registry/aster/lib/cn"`
- `registry/aster/ui/button/use-button.ts` — `import { usePress } from "@/registry/aster/hooks/use-press"`
- `registry/aster/ui/button/demos/basic.tsx` and `demos/pressed.tsx` —
  `import { Button } from "@/registry/aster/ui/button/button"`
- `components/docs/install-command.tsx` — `` const command = `bunx shadcn@latest add @aster/${name}` ``

Then verify no source references remain:

```bash
grep -rn "rsr" --include="*.ts" --include="*.tsx" --include="*.json" --include="*.css" . \
  | grep -v node_modules | grep -v ".next" | grep -v "docs/" | grep -v ".superpowers"
```

Expected: no output.

- [ ] **Step 4: Replace `app/layout.tsx`** (Satoshi + light default + aster metadata)

```tsx
import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const satoshi = localFont({
  src: [
    {
      path: "../public/font/satoshi/Satoshi-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/font/satoshi/Satoshi-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/font/satoshi/Satoshi-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-satoshi",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "aster — interaction systems",
  description:
    "Components are easy to copy. Interaction isn't. Primitives engineered as interaction systems.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${satoshi.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Point `--font-sans` at Satoshi in `app/globals.css`**

In the `@theme inline` block, change:

```css
  --font-sans: var(--font-satoshi);
  --font-mono: var(--font-geist-mono);
```

(replacing the previous `--font-sans: var(--font-geist-sans);` line; add the
`--font-mono` line if not present, keeping any existing font mappings consistent).

- [ ] **Step 6: Verify the full pipeline and commit**

```bash
bun run build && bun run lint && bun run registry:build
git add -A -- ':!app/page.tsx'
git commit -m "feat: rebrand to aster — namespace rename, Satoshi font, light-first theme"
```

Expected: all three commands exit 0; `Registry OK: 4 items validated.`; `public/r/`
contains `button.json` whose registryDependencies read `@aster/...`.

---

### Task 8: Docs routes and Button MDX content

**Files:**
- Create: `app/(docs)/layout.tsx`
- Create: `app/(docs)/primitives/page.tsx`
- Create: `app/(docs)/primitives/[slug]/page.tsx`
- Create: `content/primitives/button.mdx`

**Interfaces:**
- Consumes: `getPrimitiveIndex/getPrimitiveSlugs/getPrimitive` (Task 6), `demoRegistry` (Task 6), all Task 7 components.
- Produces: routes `/primitives` and `/primitives/button`.

- [ ] **Step 1: Create `app/(docs)/layout.tsx`**

```tsx
import Link from "next/link";
import { Logo } from "@/components/logo/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { getPrimitiveIndex } from "@/lib/registry-loader";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const primitives = getPrimitiveIndex();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6">
      <header className="flex items-center justify-between py-5">
        <Link href="/" aria-label="aster home" className="flex items-center">
          <Logo className="h-6 w-auto dark:invert" />
        </Link>
        <ThemeToggle />
      </header>
      <div className="flex flex-1 gap-10 py-10">
        <aside className="hidden w-44 shrink-0 md:block">
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Primitives
          </p>
          <nav className="flex flex-col gap-1">
            {primitives.map((primitive) => (
              <Link
                key={primitive.slug}
                href={`/primitives/${primitive.slug}`}
                className="rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors duration-(--motion-dur-fast) hover:text-foreground"
              >
                {primitive.title}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `app/(docs)/primitives/page.tsx`**

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { getPrimitiveIndex } from "@/lib/registry-loader";

export const metadata: Metadata = {
  title: "Primitives — aster",
};

export default function PrimitivesPage() {
  const primitives = getPrimitiveIndex();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-semibold tracking-tight">Primitives</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {primitives.map((primitive) => (
          <Link
            key={primitive.slug}
            href={`/primitives/${primitive.slug}`}
            className="rounded-xl border border-border p-5 transition-colors duration-(--motion-dur-fast) hover:bg-muted/50"
          >
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              {primitive.category ?? "primitive"}
            </p>
            <h2 className="mt-2 text-lg font-semibold">{primitive.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {primitive.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create `app/(docs)/primitives/[slug]/page.tsx`**

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DemoFrame } from "@/components/docs/demo-frame";
import { InstallCommand } from "@/components/docs/install-command";
import { SourceTabs } from "@/components/docs/source-tabs";
import { demoRegistry } from "@/lib/demos";
import { getPrimitive, getPrimitiveSlugs } from "@/lib/registry-loader";

export function generateStaticParams() {
  return getPrimitiveSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const primitive = await getPrimitive(slug);
  if (!primitive) return { title: "Not found — aster" };
  return {
    title: `${primitive.title} — aster`,
    description: primitive.description,
  };
}

export default async function PrimitivePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const primitive = await getPrimitive(slug);
  if (!primitive) notFound();

  const demos = demoRegistry[slug] ?? [];

  return (
    <article className="flex flex-col gap-10 pb-24">
      <header className="flex flex-col gap-3">
        {primitive.category && (
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {primitive.category}
          </p>
        )}
        <h1 className="text-3xl font-semibold tracking-tight">
          {primitive.title}
        </h1>
        <p className="max-w-prose text-muted-foreground">
          {primitive.description}
        </p>
        <InstallCommand name={primitive.slug} />
      </header>

      {demos.map((demo) => {
        const source = primitive.demos.find((file) => file.name === demo.name);
        return (
          <DemoFrame key={demo.name} name={demo.name} code={source?.code ?? ""}>
            <demo.Component />
          </DemoFrame>
        );
      })}

      {primitive.body && <div>{primitive.body}</div>}

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold tracking-tight">Source</h2>
        <SourceTabs files={primitive.files} />
      </section>
    </article>
  );
}
```

- [ ] **Step 4: Create `content/primitives/button.mdx`**

```mdx
---
title: Button
---

## Interaction spec

A press begins on pointer-down, not on click. While pressed, the surface
compresses (`data-pressed`); releasing inside fires the action, dragging off
before release cancels it — matching native platform button physics.

- Pointer down inside → pressed
- Drag off while pressed → cancelled, no action
- Pointer up inside → action fires (native click)
- <Kbd>Space</Kbd> held → pressed; released → action fires
- <Kbd>Enter</Kbd> → action fires immediately on key down

Interruption is free: state is attribute-driven, so a cancelled press
transitions back through CSS mid-animation without JavaScript cleanup.

## Accessibility

- Native `button` semantics — no ARIA re-implementation.
- <Kbd>Tab</Kbd> focuses; the focus ring appears only for keyboard focus
  (`:focus-visible`), never on pointer press.
- `disabled` uses the native attribute: unfocusable and announced as
  unavailable by screen readers.

## Motion

Press compression runs at `--motion-dur-instant` on the way down — response
must feel immediate — and `--motion-dur-fast` on release. Every value comes
from the motion tokens; nothing is hard-coded. Users with
`prefers-reduced-motion` get state changes with no transform animation.

## API

### Button

<PropsTable
  rows={[
    {
      name: "variant",
      type: '"solid" | "outline" | "ghost"',
      defaultValue: '"solid"',
      description: "Visual style of the button surface.",
    },
    {
      name: "size",
      type: '"sm" | "md" | "lg"',
      defaultValue: '"md"',
      description: "Height and padding scale.",
    },
    {
      name: "disabled",
      type: "boolean",
      defaultValue: "false",
      description: "Disables interaction and press tracking.",
    },
  ]}
/>

All other native button props are forwarded, and event handlers compose with
the press system instead of replacing it.
```

- [ ] **Step 5: Verify routes render**

```bash
bun run build
```

Expected: build succeeds and the route list includes `/primitives` and `/primitives/[slug]` (with `button` prerendered via generateStaticParams).

```bash
bun run dev &
DEV_PID=$!
sleep 8
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/primitives
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/primitives/button
kill $DEV_PID
```

Expected: both `200`.

- [ ] **Step 6: Commit**

```bash
git add "app/(docs)" content/
git commit -m "feat: docs routes — primitives index, primitive doc page, Button MDX"
```

---

### Task 9: Landing page (minimal, aster-branded)

**Files:**
- Create: `app/(site)/page.tsx`
- Delete: `app/page.tsx`

**Interfaces:**
- Consumes: theme tokens from Task 2, `Logo` from `components/logo/logo.tsx`,
  `ThemeToggle` from Task 7.
- Produces: route `/`.

Design intent (owner's references: minimal, light, generous whitespace): a slim
header with the logo and theme toggle, a centered hero with the large logo, the
tagline, and one pill CTA. Nothing else.

- [ ] **Step 1: Create `app/(site)/page.tsx` and remove the old page**

```tsx
import Link from "next/link";
import { Logo } from "@/components/logo/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between px-8 py-6">
        <Link href="/" aria-label="aster home" className="flex items-center">
          <Logo className="h-6 w-auto dark:invert" />
        </Link>
        <ThemeToggle />
      </header>
      <main className="flex flex-1 flex-col items-center justify-center gap-10 px-6 pb-24 text-center">
        <Logo className="h-24 w-auto dark:invert sm:h-32" />
        <p className="max-w-md text-balance text-muted-foreground">
          Components are easy to copy. Interaction isn&apos;t. Every primitive
          engineered as a system — motion, accessibility, and feel treated as
          first-class.
        </p>
        <Link
          href="/primitives"
          className="rounded-full bg-foreground px-6 py-2.5 font-medium text-background text-sm transition-colors duration-(--motion-dur-fast) hover:bg-foreground/85"
        >
          Explore primitives
        </Link>
      </main>
    </div>
  );
}
```

```bash
git rm app/page.tsx
```

(This deletes the owner's logo-experiment version of `app/page.tsx`; the experiment's
purpose — showing the logo — is fulfilled by this page.)

- [ ] **Step 2: Verify + commit**

```bash
bun run build && bun run lint
git add "app/(site)" app/page.tsx
git commit -m "feat: minimal aster landing page"
```

Expected: build lists `/` from the `(site)` group; no route conflict.

---

### Task 10: End-to-end registry install verification

**Files:** none in this repo (scratch project in a temp dir).

**Interfaces:**
- Consumes: running dev server serving `public/r/*.json`; everything from Tasks 1–9.

- [ ] **Step 1: Rebuild registry output and start the dev server**

```bash
cd "/c/Users/ROHIT SINGH RAWAT/OneDrive/Desktop/rsrCrafts/ui"
bun run registry:build
bun run dev &
DEV_PID=$!
sleep 8
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/r/button.json
```

Expected: `200`.

- [ ] **Step 2: Create a scratch Next.js app**

```bash
SCRATCH=$(mktemp -d)
cd "$SCRATCH"
bunx create-next-app@latest e2e --ts --tailwind --no-eslint --app --no-src-dir --import-alias "@/*" --use-bun
cd e2e
```

Expected: scaffold completes without prompts. (If create-next-app still prompts for a new flag, accept defaults.)

- [ ] **Step 3: Init shadcn and map the @rsr registry**

```bash
bunx shadcn@latest init -y -b neutral
bun -e "const fs=require('fs');const c=JSON.parse(fs.readFileSync('components.json','utf8'));c.registries={'@aster':'http://localhost:3000/r/{name}.json'};fs.writeFileSync('components.json',JSON.stringify(c,null,2));"
```

Expected: `components.json` exists and contains the `registries` mapping. (If the
init flags differ in the installed CLI version, run `bunx shadcn@latest init` and
accept defaults — check `bunx shadcn@latest init --help` first.)

- [ ] **Step 4: Install Button from the local registry**

```bash
bunx shadcn@latest add @aster/button -y
```

Expected: CLI resolves `@aster/button` plus its three registry dependencies and writes files.

- [ ] **Step 5: Verify installed files, rewritten imports, and css vars**

```bash
test -f components/ui/button/button.tsx && echo OK-button
test -f components/ui/button/use-button.ts && echo OK-use-button
test -f hooks/use-press.ts && echo OK-use-press
test -f lib/motion-tokens.ts && echo OK-tokens
test -f lib/cn.ts && echo OK-cn
grep -n "@/hooks/use-press" components/ui/button/use-button.ts
grep -n "@/lib/cn" components/ui/button/button.tsx
grep -n "motion-dur-fast" app/globals.css
```

Expected: five `OK-*` lines; both greps hit (imports rewritten from `@/registry/rsr/...` to consumer aliases); globals.css contains the motion vars from cssVars.

**If imports are NOT rewritten** (still `@/registry/aster/...`): this is a failure to fix, not skip. Fix by changing the source imports in `registry/aster/ui/button/*` and re-testing; if the CLI version's rewriter needs different path shapes, consult `bunx shadcn@latest build --help` and the registry docs at https://ui.shadcn.com/docs/registry — then update the Global Constraints note in this plan and the spec to match reality.

- [ ] **Step 6: Prove the scratch app compiles with the installed system**

Replace the scratch app's `app/page.tsx` with:

```tsx
import { Button } from "@/components/ui/button/button";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <Button>It works</Button>
    </main>
  );
}
```

```bash
bun run build
```

Expected: scratch build exits 0.

- [ ] **Step 7: Clean up and final verification in the main repo**

```bash
cd "/c/Users/ROHIT SINGH RAWAT/OneDrive/Desktop/rsrCrafts/ui"
kill %1
rm -rf "$SCRATCH"
bun run build && bun run lint && bun run registry:build
```

Expected: all exit 0.

- [ ] **Step 8: Commit any fixes made during E2E**

```bash
git status --short
# if anything changed:
git add -A && git commit -m "fix: adjustments from end-to-end registry install verification"
```

---

## Post-plan notes for the executor

- Manual feel-check before calling it done: open `http://localhost:3000` (logo renders, light theme default, Satoshi loads), visit `/primitives/button`, hold-press the demo button and drag off (press should cancel), toggle the theme (logo inverts).
- Deferred by spec — do NOT add: real name/wordmark, async Button states, more primitives, search, playground, OG images, analytics, tests, CI.
