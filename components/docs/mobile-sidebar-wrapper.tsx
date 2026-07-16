"use client";

import { motion, type PanInfo, useReducedMotion } from "motion/react";
import Link from "next/link";
import type * as React from "react";
import { Logo } from "@/components/logo/logo";
import { useMobileDrawer } from "@/hooks/use-mobile-drawer";

// iOS-sheet curve (ui-animation / emilkowal-animations): the one duration in
// this codebase exempt from the 300ms UI cap, since drawers get their own budget.
const DRAWER_TRANSITION = { duration: 0.5, ease: [0.32, 0.72, 0, 1] as const };
const DRAG_CONSTRAINTS = { left: 0, right: 256 };

export function MobileSidebarWrapper({
  sidebar,
  children,
}: {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}) {
  const { isOpen, setIsOpen, isMobile } = useMobileDrawer();
  const reducedMotion = useReducedMotion();

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    // Momentum dismissal based on Emil Kowalski guidelines
    if (info.velocity.x < -100 || info.offset.x < -100) {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative flex min-h-dvh w-full overflow-hidden md:overflow-visible md:p-4 md:gap-4">
      {/* Mobile gradient backdrop — always mounted (not toggled by isOpen).
          It used to be `hidden` + `data-[state=open]:block`, but `display`
          can't transition: it popped instantly while the 500ms slide was
          still uncovering it, flashing the near-white page background
          underneath for most of the animation. Being static here costs
          nothing (it's fully covered by the opaque main panel except during
          the reveal) and it's always in place, in sync, for both directions. */}
      <div
        className="absolute inset-0 z-0 md:hidden"
        style={{
          background:
            "linear-gradient(180deg, var(--footer-g1, #10162d) 20%, var(--footer-g2, #373144) 55%, var(--footer-g3, #4e546e) 100%)",
        }}
        aria-hidden="true"
      />

      {/* Unified Sidebar (Sticky on desktop, underneath on mobile) */}
      <aside
        id="docs-sidebar"
        className={`absolute inset-y-0 left-0 z-0 w-64 p-6 text-foreground md:sticky md:top-4 flex h-dvh md:h-[calc(100dvh-2rem)] shrink-0 flex-col gap-6 md:rounded-2xl md:bg-muted/40 md:dark:bg-transparent md:dark:text-inherit max-md:pointer-events-none data-[state=open]:max-md:pointer-events-auto ${
          isMobile ? "dark" : ""
        }`}
        data-state={isOpen ? "open" : "closed"}
        // Proper focus trap inert state
        inert={isMobile && !isOpen ? true : undefined}
        aria-hidden={isMobile && !isOpen}
      >
        <Link
          href="/"
          aria-label="aster home"
          className="flex items-center px-2 pt-1 outline-none focus-ring rounded-sm"
        >
          <Logo className="h-7 w-auto dark:invert" />
        </Link>
        <nav className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden pb-20 px-1.5 -mx-1.5">
          {sidebar}
        </nav>
      </aside>

      {/* Main page content container */}
      <motion.main
        drag={isMobile && isOpen ? "x" : false}
        dragConstraints={DRAG_CONSTRAINTS}
        dragElastic={0.05}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        animate={
          isMobile
            ? {
                x: isOpen ? 256 : 0,
                borderRadius: isOpen ? 24 : 0,
              }
            : {
                x: 0,
                borderRadius: 0,
              }
        }
        transition={reducedMotion ? { duration: 0 } : DRAWER_TRANSITION}
        className={`relative z-10 flex min-h-dvh w-full flex-col bg-background transition-[box-shadow,border-color] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none md:bg-transparent border border-transparent ${
          isMobile && isOpen
            ? "shadow-2xl border-border cursor-grab active:cursor-grabbing"
            : ""
        }`}
      >
        {/* Mobile Header. Not inert while open — it hosts the toggle
            button, which must stay clickable to close the drawer again. */}
        <header className="flex h-14 shrink-0 items-center justify-between px-4 md:hidden">
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-expanded={isOpen}
            aria-controls="docs-sidebar"
            aria-label="Toggle menu"
            className="group/button inline-flex h-8 w-8 items-center justify-center rounded-md outline-none transition-all duration-(--motion-dur-fast) hover:bg-muted/50 active:scale-[0.97] focus-ring"
          >
            <svg
              width="1em"
              height="1em"
              viewBox="0 0 16 16"
              role="img"
              focusable="false"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              className="size-4 opacity-70 transition-opacity group-hover/button:opacity-100"
            >
              <g fill="currentColor">
                <rect
                  x="1.5"
                  y="2.5"
                  width="13"
                  height="11"
                  rx="1.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                {/* SVG inner pill - user requested fully rounded rx="3" and width scaling */}
                <motion.rect
                  x="4"
                  y="5"
                  width="1.5"
                  height="6"
                  rx="0.5"
                  initial={false}
                  animate={{ scaleX: isOpen ? 3.5 / 1.5 : 1 }}
                  transition={
                    reducedMotion ? { duration: 0 } : DRAWER_TRANSITION
                  }
                  style={{ originX: 0 }}
                  className="transition-transform duration-300 ease-out motion-reduce:transition-none group-hover/button:translate-x-[1.5px]"
                ></motion.rect>
              </g>
            </svg>
          </button>

          <Link
            href="/"
            aria-label="aster home"
            inert={isMobile && isOpen ? true : undefined}
            className="absolute left-1/2 flex -translate-x-1/2 items-center rounded-sm outline-none focus-ring"
          >
            <Logo className="h-7 w-auto dark:invert" />
          </Link>

          <div className="w-8" aria-hidden="true" />
        </header>

        {/* Overlay to close drawer by clicking main content. Starts below
            the header (top-14 = header's h-14) so it never covers the
            toggle button — previously inset-0 sat above the header at z-50
            and silently swallowed taps on the hamburger while open. */}
        {isOpen && isMobile && (
          <div
            className="absolute inset-x-0 top-14 bottom-0 z-50 md:hidden"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
        )}

        <div
          inert={isMobile && isOpen ? true : undefined}
          className="min-w-0 flex-1 pb-8 md:pb-0"
        >
          {children}
        </div>
      </motion.main>
    </div>
  );
}
