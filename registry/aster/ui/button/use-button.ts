"use client";

import { usePress } from "@/registry/aster/hooks/use-press";

type Handler<E> = ((event: E) => void) | undefined;

function chain<E>(ours: Handler<E>, theirs: Handler<E>) {
  return (event: E) => {
    ours?.(event);
    theirs?.(event);
  };
}

export interface UseButtonOptions {
  disabled?: boolean;
  onPointerDown?: React.PointerEventHandler<HTMLButtonElement>;
  onPointerUp?: React.PointerEventHandler<HTMLButtonElement>;
  onPointerLeave?: React.PointerEventHandler<HTMLButtonElement>;
  onPointerCancel?: React.PointerEventHandler<HTMLButtonElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLButtonElement>;
  onKeyUp?: React.KeyboardEventHandler<HTMLButtonElement>;
  onBlur?: React.FocusEventHandler<HTMLButtonElement>;
}

/**
 * Behavior layer for Button: owns interaction state and semantics, renders
 * nothing. Future concerns (loading, async feedback) land here without
 * touching the visual component.
 */
export function useButton(options: UseButtonOptions = {}) {
  const { disabled = false, ...consumer } = options;
  const { pressed, pressProps } = usePress<HTMLButtonElement>({ disabled });

  return {
    pressed,
    buttonProps: {
      type: "button" as const,
      disabled,
      "data-pressed": pressed ? "" : undefined,
      onPointerDown: chain(pressProps.onPointerDown, consumer.onPointerDown),
      onPointerUp: chain(pressProps.onPointerUp, consumer.onPointerUp),
      onPointerLeave: chain(pressProps.onPointerLeave, consumer.onPointerLeave),
      onPointerCancel: chain(
        pressProps.onPointerCancel,
        consumer.onPointerCancel,
      ),
      onKeyDown: chain(pressProps.onKeyDown, consumer.onKeyDown),
      onKeyUp: chain(pressProps.onKeyUp, consumer.onKeyUp),
      onBlur: chain(pressProps.onBlur, consumer.onBlur),
    },
  };
}
