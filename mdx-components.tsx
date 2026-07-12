import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from "react";
import { MdxCodeBlock } from "@/components/docs/mdx-code-block";
import { slugifyHeading } from "@/lib/slugify";
import { HeadingAnchor } from "@/components/docs/heading-anchor";

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

import { TypeDisplay } from "@/components/docs/type-display";

function PropsTable({ rows }: { rows: PropRow[] }) {
  return (
    <div className="mb-8 overflow-hidden rounded-lg border border-border bg-background">
      <div className="overflow-x-auto">
        <table className="mdx-props-table w-full border-spacing-0 text-sm text-left">
          <thead>
            <tr className="border-b border-border">
              <th className="bg-muted/50 py-3 px-4 font-medium text-muted-foreground whitespace-nowrap">Prop</th>
              <th className="bg-muted/50 py-3 px-4 font-medium text-muted-foreground whitespace-nowrap">Type</th>
              <th className="bg-muted/50 py-3 px-4 font-medium text-muted-foreground whitespace-nowrap">Default</th>
              <th className="bg-muted/50 py-3 px-4 font-medium text-muted-foreground w-full">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => {
              const isRequired = row.name.endsWith("*");
              const cleanName = isRequired ? row.name.slice(0, -1) : row.name;
              return (
                <tr key={row.name} className="align-top">
                  <td className="py-4 px-4 font-mono text-xs text-foreground whitespace-nowrap">
                    {cleanName}
                    {isRequired && <span className="text-destructive">*</span>}
                  </td>
                  <td className="py-4 px-4 align-middle">
                    <TypeDisplay type={row.type} />
                  </td>
                  <td className="py-4 px-4 font-mono text-xs text-muted-foreground whitespace-nowrap">
                    {row.defaultValue ?? "—"}
                  </td>
                  <td className="py-4 px-4 text-muted-foreground text-sm leading-relaxed">
                    {row.description}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export const mdxComponents = {
  h1: (props: ComponentPropsWithoutRef<"h1">) => (
    <h1
      className="mt-10 mb-6 scroll-mt-24 text-3xl font-medium tracking-tight text-foreground sm:text-4xl first:mt-0"
      {...props}
    />
  ),
  h2: (props: ComponentPropsWithoutRef<"h2">) => {
    const id = headingId(props.children);
    return (
      <h2
        id={id}
        className="group relative w-fit mt-10 mb-4 scroll-mt-24 text-xl font-medium tracking-tight text-foreground first:mt-0"
        {...props}
      >
        <HeadingAnchor id={id} />
        {props.children}
      </h2>
    );
  },
  h3: (props: ComponentPropsWithoutRef<"h3">) => {
    const id = headingId(props.children);
    return (
      <h3
        id={id}
        className="group relative w-fit mt-8 mb-4 scroll-mt-24 text-lg font-medium tracking-tight text-foreground first:mt-0"
        {...props}
      >
        <HeadingAnchor id={id} />
        {props.children}
      </h3>
    );
  },
  h4: (props: ComponentPropsWithoutRef<"h4">) => (
    <h4
      className="mt-6 mb-2 scroll-mt-24 text-base font-medium tracking-tight text-foreground first:mt-0"
      {...props}
    />
  ),
  h5: (props: ComponentPropsWithoutRef<"h5">) => (
    <h5
      className="mt-6 mb-2 scroll-mt-24 text-base font-medium tracking-tight text-foreground"
      {...props}
    />
  ),
  h6: (props: ComponentPropsWithoutRef<"h6">) => (
    <h6
      className="mt-6 mb-2 scroll-mt-24 text-base font-medium tracking-tight text-foreground/80"
      {...props}
    />
  ),
  p: (props: ComponentPropsWithoutRef<"p">) => (
    <p
      className="mb-4 text-pretty text-base leading-relaxed text-foreground/80"
      {...props}
    />
  ),
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul
      className="mb-4 ml-6 list-disc space-y-2 text-base text-foreground/80 marker:text-foreground/50"
      {...props}
    />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol
      className="mb-4 ml-6 list-decimal space-y-2 text-base text-foreground/80 marker:text-foreground/50"
      {...props}
    />
  ),
  li: (props: ComponentPropsWithoutRef<"li">) => (
    <li className="leading-relaxed" {...props} />
  ),
  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      className="mt-6 mb-4 border-l-2 border-border pl-6 italic text-base text-foreground/80"
      {...props}
    />
  ),
  a: (props: ComponentPropsWithoutRef<"a">) => (
    <a
      className="font-medium underline underline-offset-4 decoration-muted-foreground/40 hover:decoration-foreground transition-colors"
      {...props}
    />
  ),
  strong: (props: ComponentPropsWithoutRef<"strong">) => (
    <strong className="font-medium text-foreground" {...props} />
  ),
  hr: (props: ComponentPropsWithoutRef<"hr">) => (
    <hr className="my-8 border-border" {...props} />
  ),
  table: (props: ComponentPropsWithoutRef<"table">) => (
    <div className="my-4 w-full overflow-y-auto">
      <table className="w-full text-sm" {...props} />
    </div>
  ),
  tr: (props: ComponentPropsWithoutRef<"tr">) => (
    <tr className="border-b border-border/50" {...props} />
  ),
  th: (props: ComponentPropsWithoutRef<"th">) => (
    <th
      className="border-b border-border py-3 pl-4 pr-4 text-left font-medium text-foreground"
      {...props}
    />
  ),
  td: (props: ComponentPropsWithoutRef<"td">) => (
    <td
      className="border-b border-border/50 py-3 pl-4 pr-4 align-top text-muted-foreground"
      {...props}
    />
  ),
  code: (props: ComponentPropsWithoutRef<"code">) => (
    <code
      className="rounded bg-muted/60 px-1.5 py-0.5 font-mono text-[0.85em] text-foreground"
      {...props}
    />
  ),
  pre: (props: ComponentPropsWithoutRef<"pre">) => {
    const child = props.children as ReactElement<{
      className?: string;
      children?: ReactNode;
    }>;
    const className = child?.props?.className ?? "";
    const language = /language-(\w+)/.exec(className)?.[1];
    const code =
      typeof child?.props?.children === "string"
        ? child.props.children
        : String(child?.props?.children ?? "");
    return <MdxCodeBlock code={code} language={language} />;
  },
  Kbd,
  PropsTable,
};
