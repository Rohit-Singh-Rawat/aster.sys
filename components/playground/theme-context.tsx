"use client";

import React, {
  createContext,
  type ReactNode,
  useContext,
  useState,
} from "react";

type ThemeContextType = {
  accent: string;
  setAccent: (val: string) => void;
  tone: "neutral" | "accent";
  setTone: (val: "neutral" | "accent") => void;
  size: "sm" | "md" | "lg";
  setSize: (val: "sm" | "md" | "lg") => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [accent, setAccent] = useState("oklch(0.5 0.15 245)"); // Dark Sky Blue Default
  const [tone, setTone] = useState<"neutral" | "accent">("neutral");
  const [size, setSize] = useState<"sm" | "md" | "lg">("sm");

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
