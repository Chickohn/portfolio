"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Number input that allows clearing and typing freely (no spinner arrows).
 * Keeps display as string while focused so the user can delete the last character;
 * commits the parsed number on blur.
 */
interface DecimalInputProps extends Omit<React.ComponentProps<"input">, "value" | "onChange" | "type"> {
  value: number;
  onChange: (value: number) => void;
  onBlur?: () => void;
}

function formatDisplayValue(value: number): string {
  if (!Number.isFinite(value)) return "";
  if (value === 0) return "";
  return String(value);
}

function allowDecimalString(next: string): string {
  const trimmed = next.trim();
  if (trimmed === "" || trimmed === ".") {
    return trimmed;
  }
  const match = trimmed.match(/^\d*\.?\d*$/);
  return match ? match[0] : "";
}

export const DecimalInput = React.forwardRef<HTMLInputElement, DecimalInputProps>(
  ({ value, onChange, onBlur, className, id, ...props }, ref) => {
    const [focused, setFocused] = React.useState(false);
    const [display, setDisplay] = React.useState("");
    const inputRef = React.useRef<HTMLInputElement | null>(null);

    const commit = React.useCallback(() => {
      const parsed = display.trim() === "" || display === "." ? 0 : Number(display);
      const num = Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
      onChange(num);
      setDisplay("");
      setFocused(false);
    }, [display, onChange]);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(true);
      setDisplay(formatDisplayValue(value) || (value === 0 ? "" : String(value)));
      props.onFocus?.(e);
    };

    const handleBlur = () => {
      commit();
      onBlur?.();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = allowDecimalString(e.target.value);
      setDisplay(next);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        (e.target as HTMLInputElement).blur();
      }
      props.onKeyDown?.(e);
    };


    const mergedRef = (el: HTMLInputElement | null) => {
      inputRef.current = el;
      if (typeof ref === "function") {
        ref(el);
      } else if (ref) {
        ref.current = el;
      }
    };

    const displayValue = focused ? display : (value === 0 ? "" : String(value));

    return (
      <input
        {...props}
        ref={mergedRef}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        id={id}
        value={displayValue}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors",
          "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
          className
        )}
      />
    );
  }
);
DecimalInput.displayName = "DecimalInput";
