/**
 * A soft fade at the edge of a scroll container, so content dissolves
 * under a fixed header/footer instead of being hard-clipped mid-line.
 * Technique studied from the craft reference
 * (components/animate/progessive-blur.tsx), reimplemented as an Aster
 * component: a gradient background fade layered with a backdrop-filter
 * blur, itself masked by a second gradient so the blur strength fades
 * too — not just the color. Purely decorative — `aria-hidden`,
 * `pointer-events-none` — the scroll container underneath carries the
 * real content and real scroll semantics.
 */
export function ScrollFade({
  position = "top",
  height = "2rem",
  blur = "4px",
  background = "var(--background)",
  className,
}: {
  position?: "top" | "bottom";
  height?: string;
  blur?: string;
  /** Must match the surface this sits on top of — the fade blends into it. */
  background?: string;
  className?: string;
}) {
  const isTop = position === "top";
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 z-10 ${className ?? ""}`}
      style={{
        [isTop ? "top" : "bottom"]: 0,
        height,
        background: isTop
          ? `linear-gradient(to top, transparent, ${background})`
          : `linear-gradient(to bottom, transparent, ${background})`,
        // mask-image only reads alpha, not color — the background value
        // here is just a convenient opaque stop, not a visible color.
        maskImage: isTop
          ? `linear-gradient(to bottom, ${background} 50%, transparent)`
          : `linear-gradient(to top, ${background} 50%, transparent)`,
        WebkitBackdropFilter: `blur(${blur})`,
        backdropFilter: `blur(${blur})`,
      }}
    />
  );
}
