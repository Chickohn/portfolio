"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CalendarDays } from "lucide-react";
import { CalendarGrid } from "@/components/garage-estimates/calendar-grid";
import { formatDateLong, formatDateToDDMMYYYY } from "@/lib/garage-estimates/format";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  allowClear?: boolean;
  disabled?: boolean;
  compact?: boolean;
  placeholder?: string;
  id?: string;
}

export function DatePicker({
  value,
  onChange,
  allowClear = false,
  disabled = false,
  compact = false,
  placeholder = "Select date",
  id,
}: DatePickerProps) {
  const fallbackId = useId();
  const fieldId = id ?? fallbackId;
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  const handleDayClick = (date: Date) => {
    onChange(formatDateToDDMMYYYY(date));
    if (compact) {
      setOpen(false);
    }
  };

  const displayLabel = value ? formatDateLong(value) : placeholder;

  if (disabled) {
    return (
      <div
        id={fieldId}
        className="rounded-md border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500"
      >
        {displayLabel}
      </div>
    );
  }

  if (compact) {
    return (
      <div ref={containerRef} className="relative">
        <button
          id={fieldId}
          type="button"
          onClick={() => setOpen((previous) => !previous)}
          className={cn(
            "flex w-full items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-left text-sm shadow-sm transition hover:border-slate-400",
            !value && "text-slate-500"
          )}
        >
          <CalendarDays className="h-4 w-4 shrink-0 text-slate-500" />
          <span className="truncate">{displayLabel}</span>
        </button>

        {open ? (
          <div className="absolute left-0 top-full z-20 mt-1 w-[min(100vw-2rem,18rem)] rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
            <CalendarGrid
              selectedDate={value}
              anchorDate={value}
              onDayClick={handleDayClick}
              compact
            />
            {allowClear && value ? (
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
                className="mt-2 text-xs font-medium text-red-600 hover:text-red-700"
              >
                Clear date
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <CalendarGrid selectedDate={value} anchorDate={value} onDayClick={handleDayClick} />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
        <span className="text-slate-700">{displayLabel}</span>
        {allowClear && value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-sm font-medium text-red-600 hover:text-red-700"
          >
            Clear date
          </button>
        ) : null}
      </div>
    </div>
  );
}
