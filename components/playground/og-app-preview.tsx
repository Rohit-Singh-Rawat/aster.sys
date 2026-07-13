"use client";

import { useState } from "react";
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
import { Logo } from "@/components/logo/logo";
import { SITE_DESCRIPTION } from "@/lib/site";
import { Canvas, diagonalGrid } from "./og-fader-preview";

export type BlueprintType =
  | "Input"
  | "Dialog"
  | "Button"
  | "Checkbox"
  | "Slider"
  | "Select"
  | "Switch"
  | "Fader"
  | "Tooltip"
  | "Radio";

export type CanvasItem = {
  id: string;
  type: BlueprintType;
  x: number;
  y: number;
  scale: number;
};

const COMPONENT_MAP: Record<BlueprintType, React.ElementType> = {
  Input: InputBlueprint,
  Dialog: DialogBlueprint,
  Button: ButtonBlueprint,
  Checkbox: CheckboxBlueprint,
  Slider: SliderBlueprint,
  Select: SelectBlueprint,
  Switch: SwitchBlueprint,
  Fader: FaderBlueprint,
  Tooltip: TooltipBlueprint,
  Radio: RadioBlueprint,
};

const ALL_TYPES = Object.keys(COMPONENT_MAP) as BlueprintType[];

const INITIAL_ITEMS: CanvasItem[] = [
  {
    id: "1",
    type: "Input",
    x: 920,
    y: -44,
    scale: 1,
  },
  {
    id: "2",
    type: "Dialog",
    x: 720,
    y: -35,
    scale: 1,
  },
  {
    id: "3",
    type: "Button",
    x: 895,
    y: 25,
    scale: 1,
  },
  {
    id: "4",
    type: "Slider",
    x: 1052,
    y: 33,
    scale: 1,
  },
  {
    id: "5",
    type: "Checkbox",
    x: 1007,
    y: 500,
    scale: 1,
  },
  {
    id: "6",
    type: "Select",
    x: 1045,
    y: 394,
    scale: 1,
  },
  {
    id: "7",
    type: "Switch",
    x: 621,
    y: 71,
    scale: 1,
  },
  {
    id: "8",
    type: "Fader",
    x: 1068,
    y: 212,
    scale: 1,
  },
  {
    id: "9",
    type: "Tooltip",
    x: 889,
    y: 127,
    scale: 1,
  },
  {
    id: "10",
    type: "Radio",
    x: 1050,
    y: 118,
    scale: 1,
  },
  {
    id: "11",
    type: "Input",
    x: 1016,
    y: 279,
    scale: 1,
  },
  {
    id: "12",
    type: "Button",
    x: 751,
    y: 67,
    scale: 1,
  },
  {
    id: "13",
    type: "Select",
    x: 726,
    y: 183,
    scale: 1,
  },
  {
    id: "14",
    type: "Slider",
    x: 712,
    y: 526,
    scale: 1,
  },
  {
    id: "15",
    type: "Checkbox",
    x: 862,
    y: 214,
    scale: 1,
  },
  {
    id: "16",
    type: "Switch",
    x: 1076,
    y: -43,
    scale: 1,
  },
  {
    id: "17",
    type: "Fader",
    x: 729,
    y: 431,
    scale: 1,
  },
  {
    id: "18",
    type: "Dialog",
    x: 638,
    y: 313,
    scale: 1,
  },
  {
    id: "fcy1cww",
    type: "Switch",
    x: 871,
    y: 495,
    scale: 1,
  },
  {
    id: "rijlf3n",
    type: "Button",
    x: 911,
    y: 398,
    scale: 1,
  },
  {
    id: "umew7fk",
    type: "Switch",
    x: 1236,
    y: 516,
    scale: 1,
  },
  {
    id: "ndsztz3",
    type: "Radio",
    x: 815,
    y: 312,
    scale: 1,
  },
  {
    id: "sghm9et",
    type: "Radio",
    x: 566,
    y: 171,
    scale: 1,
  },
  {
    id: "ujvhhfq",
    type: "Dialog",
    x: 977,
    y: 588,
    scale: 1,
  },
];

export function AppOgPreview() {
  const [items, setItems] = useState<CanvasItem[]>(INITIAL_ITEMS);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({
    x: 0,
    y: 0,
    itemX: 0,
    itemY: 0,
  });

  const handlePointerDown = (e: React.PointerEvent, item: CanvasItem) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setSelectedId(item.id);
    setDraggingId(item.id);
    setDragStart({ x: e.clientX, y: e.clientY, itemX: item.x, itemY: item.y });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (draggingId === null) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setItems((prev) =>
      prev.map((item) =>
        item.id === draggingId
          ? {
              ...item,
              x: Math.round(dragStart.itemX + dx),
              y: Math.round(dragStart.itemY + dy),
            }
          : item,
      ),
    );
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingId !== null) {
      e.currentTarget.releasePointerCapture(e.pointerId);
      setDraggingId(null);
    }
  };

  const selectedItem = items.find((i) => i.id === selectedId);

  const addNew = () => {
    const newItem: CanvasItem = {
      id: Math.random().toString(36).slice(2, 9),
      type: "Button",
      x: 600,
      y: 300,
      scale: 1,
    };
    setItems((prev) => [...prev, newItem]);
    setSelectedId(newItem.id);
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    setItems((prev) => prev.filter((i) => i.id !== selectedId));
    setSelectedId(null);
  };

  const updateSelected = (updates: Partial<CanvasItem>) => {
    if (!selectedId) return;
    setItems((prev) =>
      prev.map((item) =>
        item.id === selectedId ? { ...item, ...updates } : item,
      ),
    );
  };

  const copyLayout = () => {
    const json = JSON.stringify(items, null, 2);
    navigator.clipboard.writeText(json);
    alert("Layout JSON copied to clipboard! Paste it to the agent.");
  };

  return (
    <div className="relative flex gap-8 items-start w-full max-w-[1500px]">
      <Canvas>
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            display: "flex",
            backgroundImage: `url(${diagonalGrid({ color: "#e2e8f0", opacity: 0.8, scale: 0.5 })})`,
            backgroundRepeat: "repeat",
            WebkitMaskImage:
              "radial-gradient(ellipse at 90% 90%, black 0%, transparent 70%)",
            maskImage:
              "radial-gradient(ellipse at 90% 90%, black 0%, transparent 70%)",
          }}
        />

        {/* Left side text */}
        <div className="absolute top-[140px] left-[80px] flex w-[480px] flex-col z-20 pointer-events-none">
          <Logo className="mb-4 h-[120px] w-auto self-start text-slate-900 -ml-[6px]" />
          <p className="font-sans text-[24px] text-slate-500/80 leading-[1.5]">
            {SITE_DESCRIPTION}
          </p>
        </div>

        {/* Interactive Editor Area */}
        {/* biome-ignore lint/a11y/noStaticElementInteractions: canvas background deselect zone, not a control — clicking empty space clears selection, mirrored by clicking any other item */}
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: no keyboard equivalent needed — this is a click-through deselect area, not an activatable control */}
        <div
          className="absolute inset-0 z-10 text-slate-900 opacity-90"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedId(null);
          }}
        >
          {items.map((item) => {
            const Component = COMPONENT_MAP[item.type];
            const isSelected = item.id === selectedId;

            return (
              <div
                key={item.id}
                onPointerDown={(e) => handlePointerDown(e, item)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className={`absolute cursor-grab active:cursor-grabbing ${
                  isSelected
                    ? "ring-2 ring-blue-500 ring-offset-2 z-50 rounded-xl"
                    : ""
                }`}
                style={{
                  top: item.y,
                  left: item.x,
                  transform: `scale(${item.scale})`,
                  transformOrigin: "center center",
                }}
              >
                <div className="pointer-events-none">
                  <Component />
                </div>
              </div>
            );
          })}
        </div>
      </Canvas>

      {/* Control Panel */}
      <div className="flex flex-col w-[300px] shrink-0 gap-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h3 className="text-lg font-medium tracking-tight mb-1">OG Editor</h3>
          <p className="text-sm text-slate-500">
            Drag components on the canvas to arrange them.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={addNew}
            className="w-full py-2 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            Add Component
          </button>
          <button
            type="button"
            onClick={copyLayout}
            className="w-full py-2 bg-slate-100 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-200 transition-colors"
          >
            Copy Layout JSON
          </button>
        </div>

        <hr className="border-slate-100" />

        {selectedItem ? (
          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-medium text-slate-900">
              Selected Component
            </h4>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="og-editor-type"
                className="text-xs text-slate-500"
              >
                Type
              </label>
              <select
                id="og-editor-type"
                value={selectedItem.type}
                onChange={(e) =>
                  updateSelected({ type: e.target.value as BlueprintType })
                }
                className="w-full border border-slate-200 rounded-md p-2 text-sm bg-slate-50 outline-none focus:ring-1 focus:ring-blue-500"
              >
                {ALL_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="og-editor-scale"
                className="text-xs text-slate-500 flex justify-between"
              >
                Scale <span>{selectedItem.scale.toFixed(2)}x</span>
              </label>
              <input
                id="og-editor-scale"
                type="range"
                min="0.5"
                max="2.5"
                step="0.05"
                value={selectedItem.scale}
                onChange={(e) =>
                  updateSelected({ scale: parseFloat(e.target.value) })
                }
                className="w-full"
              />
            </div>

            <button
              type="button"
              onClick={deleteSelected}
              className="mt-2 w-full py-2 text-red-600 bg-red-50 rounded-md text-sm font-medium hover:bg-red-100 transition-colors"
            >
              Delete Component
            </button>
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-slate-400">
            Click a component on the canvas to edit it.
          </div>
        )}
      </div>
    </div>
  );
}
