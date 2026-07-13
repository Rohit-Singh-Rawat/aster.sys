"use client";

import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "hugeicons-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import type { PaginationEntry } from "@/lib/registry-loader";

export function PageFooter({
  previous,
  next,
}: {
  previous?: PaginationEntry | null;
  next?: PaginationEntry | null;
}) {
  const [voted, setVoted] = useState<"up" | "down" | null>(null);

  // Emil Kowalski style spring transition for press and layout interactions
  const springTransition = {
    type: "spring",
    bounce: 0,
    duration: 0.3,
  } as const;

  return (
    <div className="mt-16 flex flex-col gap-8 border-t border-border py-8">
      {/* Feedback Section */}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-foreground/80 font-medium">
          Did you like the content?
        </span>
        <div className="flex items-center gap-2">
          <motion.button
            onClick={() => {
              setVoted("up");
              console.log("Analytics track: feedback_submitted", {
                path: window.location.pathname,
                vote: "up",
              });
            }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            className={`flex items-center overflow-hidden gap-2 rounded-[8px] border px-3 py-1.5 transition-colors duration-300 outline-none focus-ring ${
              voted === "up"
                ? "bg-green-500/10 border-green-500/30 text-green-600"
                : "border-border hover:bg-muted text-foreground/80"
            }`}
          >
            <div className="flex items-center gap-2">
              <ThumbsUpIcon className="size-4 shrink-0" />
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={voted === "up" ? "thanks" : "good"}
                  initial={{ opacity: 0, filter: "blur(4px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(4px)" }}
                  transition={{ duration: 0.3 }}
                  className="inline-block whitespace-nowrap"
                >
                  {voted === "up" ? "Thanks!" : "Good"}
                </motion.span>
              </AnimatePresence>
            </div>
          </motion.button>

          <motion.button
            onClick={() => {
              setVoted("down");
              console.log("Analytics track: feedback_submitted", {
                path: window.location.pathname,
                vote: "down",
              });
            }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            className={`flex items-center overflow-hidden gap-2 rounded-[8px] border px-3 py-1.5 transition-colors duration-300 outline-none focus-ring ${
              voted === "down"
                ? "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-500"
                : "border-border hover:bg-muted text-foreground/80"
            }`}
          >
            <div className="flex items-center gap-2">
              <ThumbsDownIcon className="size-4 shrink-0" />
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={voted === "down" ? "noted" : "bad"}
                  initial={{ opacity: 0, filter: "blur(4px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(4px)" }}
                  transition={{ duration: 0.3 }}
                  className="inline-block whitespace-nowrap"
                >
                  {voted === "down" ? "Noted." : "Bad"}
                </motion.span>
              </AnimatePresence>
            </div>
          </motion.button>
        </div>
      </div>

      {/* Pager Section */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {previous ? (
          <motion.div
            whileTap={{ scale: 0.97 }}
            transition={springTransition}
            className="group relative mr-auto w-fit flex h-full items-center rounded-xl bg-muted/40 px-4 py-3 transition-colors hover:bg-muted/80 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-background"
          >
            <div className="flex items-center gap-2 text-muted-foreground transition-colors group-hover:text-foreground">
              <ArrowLeft01Icon className="size-4 transition-transform duration-[250ms] ease-out group-hover:-translate-x-1" />
              <Link
                href={`/${previous.layer}s/${previous.slug}`}
                className="text-sm font-medium outline-none after:absolute after:inset-0 rounded-sm"
              >
                {previous.title}
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="mr-auto" />
        )}

        {next && (
          <motion.div
            whileTap={{ scale: 0.97 }}
            transition={springTransition}
            className="group relative ml-auto w-fit flex h-full items-center justify-end rounded-xl bg-muted/40 px-4 py-3 transition-colors hover:bg-muted/80 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-background"
          >
            <div className="flex items-center gap-2 text-muted-foreground transition-colors group-hover:text-foreground">
              <Link
                href={`/${next.layer}s/${next.slug}`}
                className="text-sm font-medium outline-none after:absolute after:inset-0 rounded-sm"
              >
                {next.title}
              </Link>
              <ArrowRight01Icon className="size-4 transition-transform duration-[250ms] ease-out group-hover:translate-x-1" />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
