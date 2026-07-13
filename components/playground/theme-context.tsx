"use client";

import { createContext, type ReactNode, useContext, useState } from "react";

type ThemeContextType = {
  accent: string;
  setAccent: (val: string) => void;
  tone: "neutral" | "accent";
  setTone: (val: "neutral" | "accent") => void;
  size: "sm" | "md" | "lg";
  setSize: (val: "sm" | "md" | "lg") => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function PlaygroundThemeProvider({
  children,
  defaultAccent = "oklch(0.5 0.1 260)",
  defaultTone = "neutral",
  defaultSize = "md",
}: {
  children: ReactNode;
  defaultAccent?: string;
  defaultTone?: "neutral" | "accent";
  defaultSize?: "sm" | "md" | "lg";
}) {
  const [accent, setAccent] = useState(defaultAccent);
  const [tone, setTone] = useState<"neutral" | "accent">(defaultTone);
  const [size, setSize] = useState<"sm" | "md" | "lg">(defaultSize);

  return (
    <ThemeContext.Provider
      value={{ accent, setAccent, tone, setTone, size, setSize }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
