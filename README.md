This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Testing

Two Vitest projects (see `vitest.config.mts`):

- **unit** — jsdom; logic, ARIA, keyboard, press semantics. `bun run test:unit`
- **browser** — real Chromium via Playwright; drag physics, springs, geometry. `bun run test:browser` (first run: `bunx playwright install chromium`)

`bun run test` runs both. `bun run check` is the full gate: registry
validation → Biome → TypeScript → tests. CI runs it on every push and PR.

Adding a component? Colocate `<name>.test.tsx` beside the source and call
`describeAsterConformance` from `test/conformance.tsx` — the registry build
fails if a `registry:ui` item ships without tests. Layout- or motion-real
tests go in `<name>.browser.test.tsx`. Philosophy:
`docs/03-templates/testing-template.md`.
