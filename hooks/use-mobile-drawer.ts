import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function useMobileDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar on route change
  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname isn't read in the body, but it's the trigger — removing it would stop this effect from re-running on navigation
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport for accessibility attributes (inert)
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Robust Scroll Lock: Prevents layout shift from scrollbar disappearing
  useEffect(() => {
    if (!isOpen || !isMobile) return;

    const originalOverflow = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, isMobile]);

  // Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) setIsOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return { isOpen, setIsOpen, isMobile };
}
