"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/logo/logo";

export function Footer() {
  const [height, setHeight] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        setHeight(entries[0].contentRect.height);
      });
      resizeObserver.observe(ref.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

  return (
    <div
      id="site-footer-wrapper"
      style={{ height: height ? `${height}px` : "auto" }}
      className="relative w-full pointer-events-none"
    >
      <div
        ref={ref}
        className="fixed bottom-0 left-0 w-full z-0 pointer-events-auto pb-[env(safe-area-inset-bottom)]"
      >
        <footer
          id="site-footer"
          className="w-full pb-16 pt-4 sm:pt-24 sm:pb-32 text-white"
        >
          <div className="mx-auto w-full max-w-2xl px-8">
            <div className="text-center flex flex-col items-center gap-1">
              <Logo className="h-8 w-auto mb-4 opacity-90 invert brightness-0" />
              {/* Motion/accessibility/feel become links again once their docs pages exist */}
              <p className="text-sm leading-relaxed max-w-sm text-balance text-white/70">
                Every primitive engineered as a system. Motion, accessibility,
                and feel treated as first-class.
              </p>
              <div className="flex items-center justify-center flex-wrap gap-2 mt-6 text-sm text-white/80">
                <Link
                  className="cursor-pointer px-3 py-1 rounded-sm italic bg-white/10 outline-none transition-colors duration-(--motion-dur-base) hover:bg-white/20 hover:text-white focus-visible:ring-2 focus-visible:ring-white/60"
                  href="/systems"
                >
                  Explore systems
                </Link>
                <a
                  className="cursor-pointer px-3 py-1 rounded-sm italic bg-white/10 outline-none transition-colors duration-(--motion-dur-base) hover:bg-white/20 hover:text-white focus-visible:ring-2 focus-visible:ring-white/60"
                  href="https://github.com/Rohit-Singh-Rawat/aster.sys"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
                <a
                  className="cursor-pointer px-3 py-1 rounded-sm italic bg-white/10 outline-none transition-colors duration-(--motion-dur-base) hover:bg-white/20 hover:text-white focus-visible:ring-2 focus-visible:ring-white/60"
                  href="https://x.com/Spacing_Whale"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Twitter
                </a>
              </div>
              <p className="text-sm italic pt-12 text-white/50">
                © {new Date().getFullYear()} aster. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
