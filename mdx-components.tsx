import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { slugifyHeading } from "@/lib/slugify";

function headingId(children: ReactNode): string | undefined {
  return typeof children === "string" ? slugifyHeading(children) : undefined;
}

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
                {row.defaultValue ?? "-"}
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
      id={headingId(props.children)}
      className="mt-10 mb-3 scroll-mt-24 text-xl font-medium tracking-tight text-foreground"
      {...props}
    />
  ),
  h3: (props: ComponentPropsWithoutRef<"h3">) => (
    <h3
      className="mt-6 mb-2 text-base font-medium text-foreground"
      {...props}
    />
  ),
  p: (props: ComponentPropsWithoutRef<"p">) => (
    <p
      className="mb-4 max-w-prose text-pretty leading-relaxed text-muted-foreground"
      {...props}
    />
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
