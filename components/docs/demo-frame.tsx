"use client";

import { type ReactNode, useState, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CodeBlock } from "./code-block-lazy";

export function DemoFrame({
  name,
  code,
  children,
}: {
  name: string;
  code: string;
  children: ReactNode;
}) {
  const [showCode, setShowCode] = useState(false);
  const codeBlockId = useId();

  return (
    <section className="relative overflow-hidden rounded-xl bg-muted/30">
      {code.length > 0 && (
        <motion.button
          type="button"
          onClick={() => setShowCode((value) => !value)}
          aria-expanded={showCode}
          aria-controls={codeBlockId}
          aria-label={showCode ? `Hide ${name} code` : `Show ${name} code`}
          className="absolute top-3 right-5 z-10 inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground outline-none transition-all duration-200 hover:bg-muted hover:text-foreground active:scale-[0.97] motion-reduce:transform-none focus-visible:ring-2"
          whileHover="hover"
          initial={false}
          animate={showCode ? "hover" : "rest"}
        >
          <motion.svg
            aria-hidden="true"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ overflow: "visible" }}
          >
            <motion.polyline
              points="8 6 2 12 8 18"
              variants={{ rest: { x: 0 }, hover: { x: -3 } }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            />
            <motion.polyline
              points="16 18 22 12 16 6"
              variants={{ rest: { x: 0 }, hover: { x: 3 } }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            />
          </motion.svg>
        </motion.button>
      )}
      
      <div className="relative min-h-[350px] w-full" id={codeBlockId}>
        <AnimatePresence mode="popLayout" initial={false}>
          {showCode ? (
            <motion.div
              key="code"
              initial={{ opacity: 0, filter: "blur(4px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(4px)" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="w-full bg-muted"
            >
              <CodeBlock code={code} />
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0, filter: "blur(4px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(4px)" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="flex min-h-[350px] w-full items-center justify-center p-4"
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
