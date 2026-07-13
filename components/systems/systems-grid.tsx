import type { ReactNode } from "react";
import { ButtonBlueprint } from "@/components/blueprints/button-blueprint";
import { CheckboxBlueprint } from "@/components/blueprints/checkbox-blueprint";
import { DialogBlueprint } from "@/components/blueprints/dialog-blueprint";
import { FaderBlueprint } from "@/components/blueprints/fader-blueprint";
import { InputBlueprint } from "@/components/blueprints/input-blueprint";
import { RadioBlueprint } from "@/components/blueprints/radio-blueprint";
import { SelectBlueprint } from "@/components/blueprints/select-blueprint";
import { SliderBlueprint } from "@/components/blueprints/slider-blueprint";
import { SwitchBlueprint } from "@/components/blueprints/switch-blueprint";
import { TooltipBlueprint } from "@/components/blueprints/tooltip-blueprint";
import { SystemCard } from "@/components/systems/system-card";

const blueprints: Record<string, ReactNode> = {
  button: <ButtonBlueprint />,
  select: <SelectBlueprint />,
  dialog: <DialogBlueprint />,
  checkbox: <CheckboxBlueprint />,
  switch: <SwitchBlueprint />,
  tooltip: <TooltipBlueprint />,
  radio: <RadioBlueprint />,
  // The real, deferred form-slider primitive (planned, /systems only) —
  // generic track + round-thumb wireframe, matching a plain range input.
  slider: <SliderBlueprint />,
  // The Fader component (/components) — its own wireframe: label + value
  // live inside the track, a thin bar rides the fill's edge. Deliberately
  // NOT the SliderBlueprint above; the two are different controls.
  fader: <FaderBlueprint />,
  input: <InputBlueprint />,
};

export interface SystemEntry {
  slug: string;
  title: string;
}

export function SystemsGrid({
  built,
  planned,
  basePath = "/systems",
}: {
  built: SystemEntry[];
  planned: SystemEntry[];
  /** Route prefix for built entries — /systems or /components share this grid's card styling. */
  basePath?: string;
}) {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {built.map((entry) => (
        <SystemCard
          key={entry.slug}
          title={entry.title}
          href={`${basePath}/${entry.slug}`}
          blueprint={
            blueprints[entry.slug] || (
              <div className="w-full h-full border border-dashed border-border rounded-lg" />
            )
          }
        />
      ))}
      {planned.map((entry) => (
        <SystemCard
          key={entry.slug}
          title={entry.title}
          blueprint={
            blueprints[entry.slug] || (
              <div className="w-full h-full border border-dashed border-border rounded-lg opacity-50" />
            )
          }
        />
      ))}
    </div>
  );
}
