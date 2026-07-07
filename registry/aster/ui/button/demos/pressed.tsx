"use client";

import { Button } from "@/registry/aster/ui/button/button";

export default function PressedDemo() {
  return (
    <div className="flex flex-col items-center gap-4">
      <Button size="lg">Press and hold me</Button>
      <p className="max-w-xs text-center text-xs text-muted-foreground">
        Hold, then drag off before releasing - the press cancels instead of
        firing. Space behaves the same from the keyboard.
      </p>
      <Button disabled>Disabled</Button>
    </div>
  );
}
