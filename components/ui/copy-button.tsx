"use client";

import { Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion } from "motion/react";
import * as React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/registry/aster/lib/cn";
import CopyIcon from "../icons/copy";

interface CopyButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value"> {
  value: string | (() => string | Promise<string>);
  className?: string;
}

export function CopyButton({ value, className, ...props }: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);
  const copyTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  React.useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  const handleCopy = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    try {
      const text = typeof value === "function" ? await value() : value;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger
        onClick={handleCopy}
        aria-label={copied ? "Copied" : "Copy"}
        className={cn(
          "inline-flex size-8 items-center justify-center rounded-md text-muted-foreground outline-none transition-all duration-(--motion-dur-fast) hover:bg-muted hover:text-foreground active:scale-[0.97] focus-ring group",
          className,
        )}
        {...props}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {copied ? (
            <motion.div
              key="tick"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, filter: "blur(4px)" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex items-center justify-center"
            >
              <HugeiconsIcon
                icon={Tick02Icon}
                className="size-[15px] stroke-[1.5]"
              />
            </motion.div>
          ) : (
            <motion.div
              key="copy"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, filter: "blur(4px)" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex items-center justify-center"
            >
              <CopyIcon className="size-[15px] stroke-[1.5] group-hover:text-foreground" />
            </motion.div>
          )}
        </AnimatePresence>
      </TooltipTrigger>
      <TooltipContent>Copy code</TooltipContent>
    </Tooltip>
  );
}
