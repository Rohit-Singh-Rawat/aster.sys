"use client";

import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import React, { useEffect, useState } from "react";

/**
 * Animated blueprint that replays the Figma design process and then morphs
 * into the real implementation, cycling through interaction states.
 *
 * Phases (2.5s each):
 * 0: Empty (Reset)
 * 1: Selection Frame
 * 2: Radius Rounding
 * 3: Dimension Lines
 * 4: Padding Guides
 * 5: Solidify (Morph to real button, lines fade)
 * 6: Hover State
 * 7: Press State
 * 8: Loading State
 * 9: Disabled State
 * 10: Fade Out (Reset loop)
 */
const MONO = "var(--font-mono)";
const EMIL_EASE = [0.32, 0.72, 0, 1] as const;

function BlueprintSVG() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase((p) => (p + 1) % 11);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const pSelect = phase >= 1 && phase < 6;
  const pDims = phase >= 2 && phase < 6;
  const pPad = phase >= 3 && phase < 6;
  const pRadius = phase >= 4 && phase < 11;
  const pSolid = phase >= 5 && phase < 11;
  const pHideLines = phase >= 6 && phase < 11;

  const pHover = phase === 7;
  const pPress = phase === 8;
  const pLoading = phase === 9;
  const pDisabled = phase === 10;

  const buttonScale = pPress ? 0.97 : pHover ? 1.02 : 1;
  const buttonOpacity = pDisabled ? 0.5 : 1;

  const stateLabel = pDisabled
    ? "disabled"
    : pLoading
      ? "loading"
      : pPress
        ? "press"
        : pHover
          ? "hover"
          : pSolid
            ? "idle"
            : "designing";

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 280 160"
      width={280}
      height={160}
      fill="none"
      className="text-foreground/80 overflow-visible absolute pointer-events-none"
      style={{ left: -66, top: -60 }}
    >
      <motion.g
        animate={{ opacity: pHideLines ? 0 : 1 }}
        transition={{ duration: 0.8, ease: EMIL_EASE }}
      >
        <motion.g
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: pSelect ? 1 : 0, scale: pSelect ? 1 : 0.95 }}
          style={{ transformOrigin: "140px 80px" }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
        >
          <rect
            x={65}
            y={59}
            width={150}
            height={42}
            stroke="var(--accent)"
            strokeWidth={0.75}
            opacity={0.55}
            fill="none"
          />
          {(
            [
              [65, 59],
              [215, 59],
              [65, 101],
              [215, 101],
            ] as const
          ).map(([cx, cy]) => (
            <rect
              key={`${cx}-${cy}`}
              x={cx - 1.5}
              y={cy - 1.5}
              width={3}
              height={3}
              fill="var(--background)"
              stroke="var(--accent)"
              strokeWidth={1}
              opacity={0.8}
            />
          ))}
        </motion.g>

        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: pDims ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <line
            x1={66}
            y1={111}
            x2={66}
            y2={117}
            stroke="currentColor"
            strokeWidth={0.75}
            opacity={0.35}
          />
          <line
            x1={214}
            y1={111}
            x2={214}
            y2={117}
            stroke="currentColor"
            strokeWidth={0.75}
            opacity={0.35}
          />
          <motion.line
            y1={114}
            y2={114}
            stroke="currentColor"
            strokeWidth={0.75}
            opacity={0.35}
            animate={{ x1: pDims ? 66 : 140, x2: pDims ? 214 : 140 }}
            transition={{ type: "spring", stiffness: 150, damping: 20 }}
          />
          <text
            x={140}
            y={127}
            textAnchor="middle"
            fontSize={7}
            fontFamily={MONO}
            fill="currentColor"
            opacity={0.5}
          >
            <MotionCounter to={148} active={pDims} />
          </text>

          <line
            x1={49}
            y1={60}
            x2={55}
            y2={60}
            stroke="currentColor"
            strokeWidth={0.75}
            opacity={0.35}
          />
          <line
            x1={49}
            y1={100}
            x2={55}
            y2={100}
            stroke="currentColor"
            strokeWidth={0.75}
            opacity={0.35}
          />
          <motion.line
            x1={52}
            x2={52}
            stroke="currentColor"
            strokeWidth={0.75}
            opacity={0.35}
            animate={{ y1: pDims ? 60 : 80, y2: pDims ? 100 : 80 }}
            transition={{ type: "spring", stiffness: 150, damping: 20 }}
          />
          <text
            x={44}
            y={83}
            textAnchor="end"
            fontSize={7}
            fontFamily={MONO}
            fill="currentColor"
            opacity={0.5}
          >
            <MotionCounter to={40} active={pDims} />
          </text>
        </motion.g>

        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: pPad ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <defs>
            <clipPath id="clip-hero-pad">
              <rect x={66} y={60} width={148} height={40} rx={20} />
            </clipPath>
          </defs>
          <g
            clipPath="url(#clip-hero-pad)"
            stroke="var(--accent)"
            strokeWidth={0.75}
            strokeDasharray="2 2"
            opacity={0.5}
          >
            <line x1={66} y1={70} x2={214} y2={70} />
            <line x1={66} y1={90} x2={214} y2={90} />
            <line x1={86} y1={60} x2={86} y2={100} />
            <line x1={194} y1={60} x2={194} y2={100} />
          </g>
          <g
            fontSize={7}
            fontFamily={MONO}
            fill="currentColor"
            textAnchor="middle"
            opacity={0.5}
          >
            <text x={76} y={82.5}>
              20
            </text>
            <text x={204} y={82.5}>
              20
            </text>
            <text x={140} y={67}>
              10
            </text>
            <text x={140} y={98}>
              10
            </text>
          </g>
        </motion.g>

        <motion.text
          x={74}
          y={54}
          initial={{ opacity: 0 }}
          fontSize={7}
          fontFamily={MONO}
          fill="var(--accent)"
          fontWeight={500}
          animate={{ opacity: pRadius ? 0.7 : 0, y: pRadius ? 54 : 58 }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
        >
          r20
        </motion.text>
      </motion.g>

      <motion.g
        animate={{ scale: buttonScale, opacity: buttonOpacity }}
        style={{ transformOrigin: "140px 80px" }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <motion.rect
          initial={{ x: 66, width: 148, rx: 0 }}
          y={60}
          height={40}
          animate={{
            x: pLoading ? 56 : 66,
            width: pLoading ? 168 : 148,
            rx: pRadius ? 20 : 0,
            opacity: pSolid ? 0 : 1,
          }}
          fill="transparent"
          stroke="currentColor"
          transition={{ duration: 0.6, ease: EMIL_EASE }}
          strokeWidth={1.25}
        />

        <motion.rect
          initial={{ x: 66, width: 148, rx: 0, opacity: 0 }}
          y={60}
          height={40}
          animate={{
            x: pLoading ? 56 : 66,
            width: pLoading ? 168 : 148,
            rx: pRadius ? 20 : 0,
            opacity: pSolid ? 1 : 0,
          }}
          fill="var(--foreground)"
          transition={{ duration: 0.6, ease: EMIL_EASE }}
        />

        <motion.text
          initial={{ x: 140 }}
          y={89}
          textAnchor="middle"
          fontSize={28}
          fontWeight={500}
          fontFamily="var(--font-sans)"
          animate={{
            x: pLoading ? 150 : 140,
            opacity: pSolid ? 0 : 1,
          }}
          fill="currentColor"
          transition={{ duration: 0.6, ease: EMIL_EASE }}
        >
          systems
        </motion.text>

        <motion.text
          initial={{ x: 140, opacity: 0 }}
          y={89}
          textAnchor="middle"
          fontSize={28}
          fontWeight={500}
          fontFamily="var(--font-sans)"
          animate={{
            x: pLoading ? 150 : 140,
            opacity: pSolid ? 1 : 0,
          }}
          fill="var(--background)"
          transition={{ duration: 0.6, ease: EMIL_EASE }}
        >
          systems
        </motion.text>

        <AnimatePresence>
          {pLoading && (
            <motion.g
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
              style={{ transformOrigin: "88px 80px" }}
            >
              <circle
                cx={88}
                cy={80}
                r={6}
                stroke="var(--background)"
                strokeWidth={2}
                strokeDasharray="16 16"
                fill="none"
                opacity={0.8}
              >
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 88 80"
                  to="360 88 80"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </circle>
            </motion.g>
          )}
        </AnimatePresence>
        {/* sibling of the spinner's AnimatePresence — nesting one inside
            another couples the label's presence tracking to the spinner's */}
        <AnimatePresence mode="wait">
          <motion.text
            key={stateLabel}
            x={140}
            y={46}
            textAnchor="middle"
            fontSize={10}
            fontFamily={MONO}
            fill="currentColor"
            className="opacity-60"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
          >
            {stateLabel}
          </motion.text>
        </AnimatePresence>
      </motion.g>
    </svg>
  );
}

export function HeroBlueprint() {
  const skip = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [easterEgg, setEasterEgg] = useState(false);
  const [eeScale, setEeScale] = useState(3);

  useEffect(() => {
    setMounted(true);
    setEeScale(window.innerWidth < 640 ? 2.2 : 3.5);
    const handleResize = () => setEeScale(window.innerWidth < 640 ? 2.2 : 3.5);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!easterEgg) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setEasterEgg(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [easterEgg]);

  if (mounted && skip) {
    return <span>systems</span>;
  }

  return (
    <>
      {/* backdrop and blown-up blueprint share one AnimatePresence so closing
          animates out (fade + layoutId morph back) instead of hard-cutting */}
      <AnimatePresence>
        {easterEgg && (
          <motion.div
            key="ee-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-md"
            onClick={() => setEasterEgg(false)}
          />
        )}
        {easterEgg && (
          <motion.div
            key="ee-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <motion.div
              layoutId="hero-blueprint"
              className="relative cursor-pointer pointer-events-auto"
              style={{ width: 148, height: 40 }}
              animate={{ scale: eeScale }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              onClick={() => setEasterEgg(false)}
            >
              <BlueprintSVG />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <span className="inline sm:hidden">systems</span>
      <span className="hidden sm:inline-flex relative items-center justify-center w-[148px] h-[40px] align-middle select-none z-10 mx-1">
        {/* the animated svg is aria-hidden | keep the word in the accessible name */}
        <span className="sr-only">systems</span>
        {!easterEgg && (
          <motion.div
            layoutId="hero-blueprint"
            title="Double click me!"
            onDoubleClick={() => setEasterEgg(true)}
            className="absolute inset-0 cursor-pointer"
            style={{ width: 148, height: 40 }}
          >
            <BlueprintSVG />
          </motion.div>
        )}
      </span>
    </>
  );
}

function MotionCounter({ to, active }: { to: number; active: boolean }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);

  React.useEffect(() => {
    const target = active ? to : 0;
    const controls = animate(count, target, { duration: 0.6, ease: "easeOut" });
    return () => controls.stop();
  }, [active, to, count]);

  return <motion.tspan>{rounded}</motion.tspan>;
}
