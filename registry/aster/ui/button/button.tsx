"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/registry/aster/lib/cn";
import { useButton } from "./use-button";

const buttonVariants = cva(
  [
    "inline-flex select-none items-center justify-center gap-2 squircle font-medium",
    "outline-none focus-ring focus-visible:outline-none",
    // Press physics: compression is immediate on the way down, eased on release.
    "transition-[transform,background-color,color,border-color] duration-(--motion-dur-fast) ease-(--motion-ease-out)",
    "data-pressed:scale-[0.97] data-pressed:duration-(--motion-dur-instant)",
    "disabled:pointer-events-none disabled:opacity-45",
    "motion-reduce:transition-none motion-reduce:data-pressed:scale-100",
  ],
  {
    variants: {
      variant: {
        solid: "bg-foreground text-background hover:bg-foreground/85",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-foreground/5",
        ghost: "bg-transparent text-foreground hover:bg-foreground/5",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "solid",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({
  className,
  variant,
  size,
  disabled,
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  onPointerCancel,
  onKeyDown,
  onKeyUp,
  onBlur,
  ...rest
}: ButtonProps) {
  const { buttonProps } = useButton({
    disabled: disabled ?? false,
    onPointerDown,
    onPointerUp,
    onPointerLeave,
    onPointerCancel,
    onKeyDown,
    onKeyUp,
    onBlur,
  });

  return (
    <button
      {...buttonProps}
      {...rest}
      className={cn(buttonVariants({ variant, size }), className)}
    />
  );
}
