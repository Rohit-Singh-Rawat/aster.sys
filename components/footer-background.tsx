"use client";

import type React from "react";
import { useEffect, useState } from "react";

const GRADIENTS = [
  // Deep Space (Original)
  { g1: "#10162d", g2: "#373144", g3: "#4e546e" },
  // Crimson Ember
  { g1: "#1a0b0e", g2: "#4a101e", g3: "#8c1c31" },
  // Midnight Forest
  { g1: "#0a120e", g2: "#113622", g3: "#1e5c3a" },
  // Royal Ocean
  { g1: "#090e17", g2: "#112b4d", g3: "#1c4e85" },
  // Burnt Obsidian
  { g1: "#14100c", g2: "#3d2314", g3: "#753f1f" },
  // Amethyst Void
  { g1: "#0f0a14", g2: "#2d1747", g3: "#532885" },

  // -- NEW GRADIENTS --
  // Sunrise Chrome (Vibrant / Lighter Orange)
  { g1: "#1c1936", g2: "#985959", g3: "#e28a5c" },
  // Cyber Neon (Bright Pink/Purple)
  { g1: "#080b14", g2: "#2f1b4a", g3: "#a62886" },
  // Frosted Glaze (Lighter Icy Blue)
  { g1: "#141b21", g2: "#345260", g3: "#6a9cbd" },
  // Emerald Glow (Bright Neon Green)
  { g1: "#06120b", g2: "#164f33", g3: "#2bcc71" },
  // Soft Lavender (Lighter Soft Purple)
  { g1: "#13101c", g2: "#3a315e", g3: "#7b6bbf" },
];

export function FooterBackground() {
  const [gradient, setGradient] = useState(GRADIENTS[0]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const randomGradient =
      GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)];
    setGradient(randomGradient);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      // Sync the body background color to match the top of the gradient
      // for smooth rubber-band scrolling on macOS/iOS
      document.body.style.backgroundColor = gradient.g1;
    }
  }, [gradient, mounted]);

  return (
    <>
      <style suppressHydrationWarning>{`
        :root {
          --footer-g1: ${gradient.g1};
          --footer-g2: ${gradient.g2};
          --footer-g3: ${gradient.g3};
        }
      `}</style>
      <div
        className="fixed inset-0 -z-20 pointer-events-none transition-all duration-(--motion-dur-ambient) ease-(--motion-ease-in-out)"
        style={
          {
            opacity: mounted ? 1 : 0, // fade in to hide the initial jump if it changes
            "--footer-g1": gradient.g1,
            "--footer-g2": gradient.g2,
            "--footer-g3": gradient.g3,
            background:
              "linear-gradient(180deg, var(--footer-g1) 20%, var(--footer-g2) 55%, var(--footer-g3) 100%)",
          } as React.CSSProperties
        }
      />
    </>
  );
}
