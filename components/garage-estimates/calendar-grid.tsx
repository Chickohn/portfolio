"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  compareDDMMYYYY,
  dateFromDDMMYYYY,
  formatDateLong,
  formatDateToDDMMYYYY,
  isValidDDMMYYYY,
} from "@/lib/garage-estimates/format";
import { cn } from "@/lib/utils";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const getMonthMatrix = (year: number, month: number): Array<Date | null> => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const cells: Array<Date | null> = [];

  for (let index = 0; index < startOffset; index += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    cells.push(new Date(year, month, day));
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
};

const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const isDateInRange = (date: Date, start: string, end: string): boolean => {
  if (!isValidDDMMYYYY(start) || !isValidDDMMYYYY(end)) {
    return false;
  }

  const value = formatDateToDDMMYYYY(date);
  return compareDDMMYYYY(value, start) >= 0 && compareDDMMYYYY(value, end) <= 0;
};

const getInitialView = (anchorDate?: string) => {
  const parsed = anchorDate ? dateFromDDMMYYYY(anchorDate) : null;
  if (parsed) {
    return { year: parsed.getFullYear(), month: parsed.getMonth() };
  }

  const today = new Date();
  return { year: today.getFullYear(), month: today.getMonth() };
};

interface CalendarGridProps {
  selectedDate?: string;
  rangeStart?: string;
  rangeEnd?: string;
  onDayClick: (date: Date) => void;
  anchorDate?: string;
  compact?: boolean;
}

export function CalendarGrid({
  selectedDate,
  rangeStart,
  rangeEnd,
  onDayClick,
  anchorDate,
  compact = false,
}: CalendarGridProps) {
  const initialView = useMemo(
    () => getInitialView(anchorDate || selectedDate || rangeStart),
    [anchorDate, selectedDate, rangeStart]
  );

  const [viewYear, setViewYear] = useState(initialView.year);
  const [viewMonth, setViewMonth] = useState(initialView.month);

  useEffect(() => {
    const nextView = getInitialView(anchorDate || selectedDate || rangeStart);
    setViewYear(nextView.year);
    setViewMonth(nextView.month);
  }, [anchorDate, selectedDate, rangeStart]);

  const monthLabel = new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
  }).format(new Date(viewYear, viewMonth, 1));

  const cells = useMemo(
    () => getMonthMatrix(viewYear, viewMonth),
    [viewYear, viewMonth]
  );

  const goToPreviousMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((year) => year - 1);
      return;
    }

    setViewMonth((month) => month - 1);
  };

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((year) => year + 1);
      return;
    }

    setViewMonth((month) => month + 1);
  };

  const daySize = compact ? "h-8 text-xs" : "h-9 text-sm";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={goToPreviousMonth}
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <p className={cn("font-medium text-slate-900", compact ? "text-xs" : "text-sm")}>
          {monthLabel}
        </p>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={goToNextMonth}
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div
        className={cn(
          "grid grid-cols-7 gap-1 text-center font-medium text-slate-500",
          compact ? "text-[10px]" : "text-xs"
        )}
      >
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="py-1">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className={compact ? "h-8" : "h-9"} aria-hidden="true" />;
          }

          const value = formatDateToDDMMYYYY(date);
          const isSelected = value === selectedDate;
          const isStart = value === rangeStart;
          const isEnd = value === rangeEnd;
          const inRange =
            rangeStart && rangeEnd ? isDateInRange(date, rangeStart, rangeEnd) : false;
          const isToday = isSameDay(date, new Date());

          return (
            <button
              key={value}
              type="button"
              onClick={() => onDayClick(date)}
              className={cn(
                daySize,
                "rounded-md transition",
                inRange && !isStart && !isEnd && "bg-blue-100 text-blue-900",
                (isSelected || isStart || isEnd) &&
                  "bg-blue-600 font-semibold text-white hover:bg-blue-700",
                !inRange && !isSelected && !isStart && !isEnd && "text-slate-800 hover:bg-slate-100",
                isToday && !isSelected && !isStart && !isEnd && "ring-1 ring-slate-300"
              )}
              aria-label={formatDateLong(value)}
              aria-pressed={isSelected || isStart || isEnd}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
