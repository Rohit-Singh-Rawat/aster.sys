"use client";

import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useTransform,
  useVelocity,
} from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/registry/aster/lib/cn";
import { springs } from "@/registry/aster/lib/motion-tokens";

export interface TocEntry {
  id: string;
  label: string;
  level?: number;
}

interface Point {
  x: number;
  y: number;
}

// How far the travel path bows outward (toward negative x) at its
// midpoint, scaled by how far the dot is going — a short hop to the next
// row barely curves, a long jump sweeps out further before curling back in.
function curveOffset(distance: number): number {
  return Math.min(4 + distance * 0.08, 14);
}

function quadraticBezier(
  p0: number,
  control: number,
  p1: number,
  t: number,
): number {
  const inv = 1 - t;
  return inv * inv * p0 + 2 * inv * t * control + t * t * p1;
}

export function OnThisPage({ entries }: { entries: TocEntry[] }) {
  const [active, setActive] = useState(entries[0]?.id);
  const reduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const slotRefs = useRef(new Map<string, HTMLSpanElement>());
  const activeRef = useRef(active);
  activeRef.current = active;

  // A click picks its target immediately; the observer would otherwise
  // fight it while the click's own scroll is still in flight (it reports
  // whatever heading passes through its tracked band mid-scroll), and the
  // clicked heading isn't guaranteed to land inside that band at rest
  // either — scroll-mt-24 (96px) sits right at the observer's own
  // threshold, so whether it "sees" the target is close to a coin flip.
  // Suppressed until the click's scroll settles (scrollend, with a timeout
  // fallback for the case where the target was already on screen and no
  // scroll — hence no scrollend — ever fires).
  const suppressObserverRef = useRef(false);
  const suppressTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleTocClick = (id: string) => {
    suppressObserverRef.current = true;
    setActive(id);
    clearTimeout(suppressTimeoutRef.current);
    suppressTimeoutRef.current = setTimeout(() => {
      suppressObserverRef.current = false;
    }, 1000);
  };

  useEffect(() => {
    const clearSuppression = () => {
      suppressObserverRef.current = false;
      clearTimeout(suppressTimeoutRef.current);
    };
    window.addEventListener("scrollend", clearSuppression);
    return () => window.removeEventListener("scrollend", clearSuppression);
  }, []);

  // The dot travels along a quadratic-bezier arc from `from` to `to`, driven
  // by a single 0→1 progress value — a curved path is just this one motion
  // value's worth of spring physics instead of two independent x/y springs.
  const from = useRef<Point>({ x: 0, y: 0 });
  const to = useRef<Point>({ x: 0, y: 0 });
  const t = useMotionValue(0);

  const x = useTransform(t, (progress) => {
    const p0 = from.current;
    const p1 = to.current;
    const bow = curveOffset(Math.hypot(p1.x - p0.x, p1.y - p0.y));
    const control = (p0.x + p1.x) / 2 - bow;
    return quadraticBezier(p0.x, control, p1.x, progress);
  });
  const y = useTransform(t, (progress) => {
    const p0 = from.current;
    const p1 = to.current;
    return quadraticBezier(p0.y, (p0.y + p1.y) / 2, p1.y, progress);
  });

  const vx = useVelocity(x);
  const vy = useVelocity(y);
  const speed = useTransform([vx, vy], ([latestVx, latestVy]) =>
    Math.hypot(latestVx as number, latestVy as number),
  );

  // Tuned for the short pixel distances a sidebar dot actually travels
  // (roughly 24-300px), not carousel-scale velocities.
  const scaleX = useTransform(vx, [-900, 0, 900], [1.35, 1, 1.35]);
  const scaleY = useTransform(vy, [-900, 0, 900], [1.35, 1, 1.35]);
  const blur = useTransform(speed, [0, 900], [0, 1.2]);
  const filter = useMotionTemplate`blur(${blur}px)`;

  const moveDotTo = (id: string | undefined, animated: boolean) => {
    const slot = id ? slotRefs.current.get(id) : undefined;
    if (!slot) return;
    const target = { x: slot.offsetLeft, y: slot.offsetTop };
    if (animated && !reduceMotion) {
      from.current = { x: x.get(), y: y.get() };
      to.current = target;
      t.jump(0);
      animate(t, 1, springs.bounce);
    } else {
      from.current = target;
      to.current = target;
      t.jump(1);
    }
  };

  // Place the dot instantly on mount — no fly-in from (0, 0).
  // biome-ignore lint/correctness/useExhaustiveDependencies: mount-only; moveDotTo reads refs and motion values, never render values
  useLayoutEffect(() => {
    moveDotTo(active, false);
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: moveDotTo reads refs and motion values, never render values
  useEffect(() => {
    moveDotTo(active, true);
  }, [active]);

  // Row positions shift on reflow (resize, font load) — resnap without animating.
  // Mount-only and reads activeRef (not `active`) deliberately: ResizeObserver
  // fires an initial callback synchronously on observe(), so tearing this
  // down and recreating it on every active change would jump-cancel the
  // spring that just started in the effect above.
  // biome-ignore lint/correctness/useExhaustiveDependencies: see comment above
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(() =>
      moveDotTo(activeRef.current, false),
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (observed) => {
        if (suppressObserverRef.current) return;
        const intersecting = observed.filter((entry) => entry.isIntersecting);
        if (intersecting.length > 0) {
          intersecting.sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
          );
          setActive(intersecting[0].target.id);
        }
      },
      { rootMargin: "-15% 0px -75% 0px" },
    );
    for (const { id } of entries) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [entries]);

  if (entries.length === 0) return null;

  return (
    <div ref={containerRef} className="relative">
      <p className="mb-4 text-sm font-medium text-muted-foreground">
        On This Page
      </p>
      <motion.span
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 flex h-3 w-3 items-center justify-center"
        style={{ x, y }}
      >
        <motion.span
          className="size-1.5 rounded-full bg-foreground"
          style={{ scaleX, scaleY, filter }}
        />
      </motion.span>
      <ul className="flex flex-col gap-1">
        {entries.map((entry) => {
          const isSub = (entry.level ?? 1) === 2;
          const isActive = active === entry.id;
          return (
            <li key={entry.id}>
              <a
                href={`#${entry.id}`}
                onClick={() => handleTocClick(entry.id)}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "flex items-center gap-2 text-sm outline-none transition-colors duration-(--motion-dur-fast) focus-ring",
                  isSub ? "pl-4" : "",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  ref={(el) => {
                    if (!el) return;
                    slotRefs.current.set(entry.id, el);
                    return () => {
                      slotRefs.current.delete(entry.id);
                    };
                  }}
                  className="h-3 w-3 shrink-0"
                />
                {entry.label}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
