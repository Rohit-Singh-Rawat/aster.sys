# aster design system

The protocol for every visual decision in this repo. If a value isn't listed
here, don't invent it — extend this document first, then use the token.
Source of truth for CSS tokens: [`app/globals.css`](app/globals.css) (`@theme`
block). Source of truth for JS motion values:
[`registry/aster/lib/motion-tokens.ts`](registry/aster/lib/motion-tokens.ts).
The two must mirror each other exactly.

## Color

Neutral-first, light-first. One accent hue. All colors are oklch.

| Role | Token / class | Use for |
| --- | --- | --- |
| Background | `bg-background` | Page surface |
| Foreground | `text-foreground` | Primary text, solid buttons |
| Muted | `bg-muted` (+ opacity ramp, below) | Panels, wells, hover surfaces |
| Muted foreground | `text-muted-foreground` | Secondary text, labels |
| Border | `border-border` | Hairlines, input outlines |
| Accent | `text-accent` / `var(--accent)` | Wordmark, blueprint construction (selection frames, padding guides), active states. Never for large surfaces. |
| Ring | `ring-ring` | Focus rings only (`focus-visible:ring-2 focus-visible:ring-ring`) |

**Protocol for new roles** (danger, success, warning…): add only when a
shipped component needs one. Name it semantically (`--danger`, not `--red`),
define light + dark oklch values in `:root`/`.dark`, map it in `@theme`
(`--color-danger`), and keep chroma in the same family as `--accent`
(≤ 0.12). Never hardcode a hex/oklch in a component.

**Sanctioned exceptions:** the footer sits on a fixed dark gradient in both
themes — it uses literal `text-white/*` and `bg-white/*`; the body fallback
`#10162d` equals the default footer gradient's top stop; the landing star icon
uses `amber-400` as a fixed brand glyph color.

## Surface ramp (the repeated "glass" panels)

One material, five opacities of `bg-muted`. Structural surfaces are
borderless; depth comes from the ramp, not shadows or borders.

| Level | Class | Use for |
| --- | --- | --- |
| Well | `bg-muted/10` | Large content wells (doc article) |
| Soft | `bg-muted/20` | Secondary chrome (mobile top bar) |
| Panel | `bg-muted/40` | Primary panels: sidebar, rails, system cards |
| Hover | `bg-muted/60` | Hover state of interactive panels/rows |
| Active | `bg-muted` | Selected/active state (sidebar current item) |

Structural panels are always `rounded-2xl`. Cards pad `p-5`, chrome panels
`p-6`, article wells `p-6 md:p-10`.

## Radius

Fixed scale, by role — never by taste:

| Radius | Class | Role |
| --- | --- | --- |
| Full | `rounded-full` | Pill actions (CTAs), badges, chips |
| 16px | `rounded-2xl` | Structural panels (sidebar, cards, wells) |
| 12px | `rounded-xl` | Framed content inside a panel (demo frames) |
| 8px | `rounded-lg` | Controls: registry Button, code blocks, nav rows |
| 6px | `rounded-md` | Compact controls: icon buttons, tabs, copy |

Concentric rule: a rounded child inside a rounded parent uses
`childRadius = parentRadius − padding` (clamp at `rounded-md`).

## Typography

| Font | Token | Weights | Use |
| --- | --- | --- | --- |
| Satoshi | `font-sans` (`--font-sans`) | 400 / 500 | Everything. **Medium (500) is the maximum UI weight** — no semibold/bold in interface type. The 700 face stays loaded only for `<strong>` in prose. |
| Geist Mono | `font-mono` (`--font-mono`) | 400 | Code, install commands, kickers, blueprint annotations |

Scale (no arbitrary `text-[Npx]` — if a size is missing, add a token):

| Step | Class | Use |
| --- | --- | --- |
| Display | `text-3xl` + `font-medium tracking-tight` (landing hero adds `sm:text-4xl`) | Page h1 |
| Title | `text-xl` + `font-medium tracking-tight` | Section h2 |
| Body | `text-base` + `leading-relaxed` | Prose (`max-w-prose`) |
| UI | `text-sm` | Nav, buttons, table cells |
| Caption | `text-xs` + `font-mono` where technical | Card titles, breadcrumbs, code |
| Micro | `text-2xs` (10px, custom token) | Kickers (`uppercase tracking-widest`), badges |

Details: headings `text-wrap: balance`; body `max-w-prose`; live numbers
`tabular-nums`; inside blueprint SVGs annotation text is 7px Geist Mono via
the shared `DimLabel` — SVG is the only place text under 10px is allowed.

## Spacing

4px base grid (Tailwind default scale). Rhythm in use:

- Page gutter: `p-4` (app frame), `px-6` (content)
- Panel gap: `gap-4`
- Section stack: `gap-10`
- Header stack: `gap-2`/`gap-3`
- Control padding: `px-2 py-1.5` (rows), `px-3 py-1.5` (chips), `px-5/6 py-2/2.5` (CTAs)

Interactive targets are ≥ 24×24 px (WCAG 2.5.8); prefer ~40px for primary.

## Motion

Tokens only — a hardcoded `duration-*`/easing number is a review defect.

| Token | Value | Use |
| --- | --- | --- |
| `--motion-dur-instant` | 50ms | Press-down compression |
| `--motion-dur-fast` | 120ms | Hover color/background, release |
| `--motion-dur-base` | 200ms | Standard UI transitions, chevrons |
| `--motion-dur-slow` | 320ms | Panel movement, staged reveals |
| `--motion-dur-showcase` | 700ms | Site-only: blueprint→implementation morph. Never ships to consumers. |
| `--motion-dur-ambient` | 1000ms | Site-only: footer-gradient / body background crossfade. Never ships. |
| `--motion-ease-out` | cubic-bezier(0.22, 1, 0.36, 1) | Default for everything entering/responding |
| `--motion-ease-in-out` | cubic-bezier(0.65, 0, 0.35, 1) | On-screen morphs and travel |

Rules (Emil Kowalski baseline):

- `transform`/`opacity` (and color for state feedback) only; never layout
  properties; never `transition: all` — list properties explicitly.
- UI animation ≤ 300ms; showcase surfaces (hero, blueprint morph) exempt.
- Interruptible CSS transitions for interactive state; keyframes only for
  one-shot staged sequences (e.g. `bp-check-draw`).
- Press feedback: `scale(0.97)` down at `instant`, release at `fast`.
- Never animate from `scale(0)`; enter from ≥ 0.95.
- Every transform animation carries a `motion-reduce:` fallback that keeps
  opacity/color feedback but drops movement.
- Registry components take JS springs from `springs` in `motion-tokens.ts`
  (`press`, `settle`); site showcase surfaces (hero, footer reveal) may tune
  bespoke springs inline.

## Focus & interaction states

Every interactive element defines, explicitly: hover (one surface-ramp step
or one text-color step), focus (`outline-none focus-visible:ring-2
focus-visible:ring-ring`), press (scale 0.97 where tactile), and disabled
(`opacity-45`, native `disabled` attribute). Keyboard-triggered actions are
never animated.

## Blueprint grammar (/systems)

Shared vocabulary lives in
[`components/blueprints/parts.tsx`](components/blueprints/parts.tsx):
`Blueprint` (fixed 220×140, 1 unit = 1px), `DimH`/`DimV`/`DimLabel`,
`PadGuide`, `Selection`, and the morph constants `BP_MORPH` /
`BP_HIDE_ON_MORPH`. Component ink is `currentColor` on `text-foreground/80`;
construction uses `--accent`; hover morphs the single drawing into the
implementation (fills solidify, hollow text fills, construction fades).
Dimensions drawn must equal the real component's metrics. SVG `id`s must be
unique per component (`bp-hatch-<name>`, `useId` for clips).
