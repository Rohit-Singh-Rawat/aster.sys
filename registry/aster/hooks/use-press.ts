"use client";

import { useCallback, useEffect, useState } from "react";

export interface UsePressOptions {
  /** Mirrors the element's disabled state; disables all press tracking. */
  disabled?: boolean;
}

export interface PressProps<T extends HTMLElement = HTMLElement> {
  onPointerDown: React.PointerEventHandler<T>;
  onPointerUp: React.PointerEventHandler<T>;
  onPointerLeave: React.PointerEventHandler<T>;
  onPointerCancel: React.PointerEventHandler<T>;
  onKeyDown: React.KeyboardEventHandler<T>;
  onKeyUp: React.KeyboardEventHandler<T>;
}

export interface UsePressResult<T extends HTMLElement = HTMLElement> {
  /** True while actively pressed: pointer down inside, or Space/Enter held. */
  pressed: boolean;
  /** Spread onto the target element. */
  pressProps: PressProps<T>;
}

/**
 * Press interaction system: tracks an active press across pointer and
 * keyboard with cancel semantics — dragging off the element or a cancelled
 * pointer ends the press without activation. Activation itself stays native
 * (click), so there is no double-fire risk.
 */
export function usePress<T extends HTMLElement = HTMLElement>(
  options: UsePressOptions = {},
): UsePressResult<T> {
  const { disabled = false } = options;
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    if (disabled) setPressed(false);
  }, [disabled]);


  const end = useCallback(() => {
    setPressed(false);
  }, []);

  const onPointerDown: React.PointerEventHandler<T> = useCallback(
    (event) => {
      if (disabled || !event.isPrimary || event.button !== 0) return;
      setPressed(true);
    },
    [disabled],
  );

  const onKeyDown: React.KeyboardEventHandler<T> = useCallback(
    (event) => {
      if (disabled) return;
      if (event.key === " " || event.key === "Enter") setPressed(true);
    },
    [disabled],
  );

  const onKeyUp: React.KeyboardEventHandler<T> = useCallback(
    (event) => {
      if (disabled) return;
      if (event.key === " " || event.key === "Enter") end();
    },
    [disabled, end],
  );

  return {
    pressed: disabled ? false : pressed,
    pressProps: {
      onPointerDown,
      onPointerUp: end,
      onPointerLeave: end,
      onPointerCancel: end,
      onKeyDown,
      onKeyUp,
    },
  };
}
