import type { ComponentType } from "react";
import { DitherStudio } from "./experiments/dither-studio";

export interface Experiment {
  slug: string;
  name: string;
  /** Where the work stands — free-form, honest (e.g. "design discussion", "prototype v2"). */
  stage: string;
  /**
   * The question this experiment exists to answer. An experiment without a
   * question is a demo, and demos don't belong on the workbench.
   */
  question: string;
  /** null while the experiment has no prototype yet — the row renders as pending. */
  Component: ComponentType | null;
}

export const experiments: Experiment[] = [
  {
    slug: "dither-studio",
    name: "Dither Studio",
    stage: "Interactive pixel processing lab built with Fader controls.",
    question:
      "Can one fader carry both value grammars and every sanctioned look (size, tone, border) — and is it ready to leave the playground after the owed device passes?",
    Component: DitherStudio,
  },
];
