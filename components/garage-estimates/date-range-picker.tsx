"use client";

import { CalendarGrid } from "@/components/garage-estimates/calendar-grid";
import {
  compareDDMMYYYY,
  formatDateLong,
  formatDateToDDMMYYYY,
} from "@/lib/garage-estimates/format";

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onChange: (range: { startDate: string; endDate: string }) => void;
}

export function DateRangePicker({ startDate, endDate, onChange }: DateRangePickerProps) {
  const handleDayClick = (date: Date) => {
    const clicked = formatDateToDDMMYYYY(date);

    if (!startDate || (startDate && endDate)) {
      onChange({ startDate: clicked, endDate: "" });
      return;
    }

    if (compareDDMMYYYY(clicked, startDate) < 0) {
      onChange({ startDate: clicked, endDate: startDate });
      return;
    }

    onChange({ startDate, endDate: clicked });
  };

  const rangeLabel =
    startDate && endDate
      ? `${formatDateLong(startDate)} to ${formatDateLong(endDate)}`
      : startDate
        ? `${formatDateLong(startDate)} — click end date`
        : "Click a start date, then an end date";

  return (
    <div className="space-y-3">
      <CalendarGrid
        rangeStart={startDate}
        rangeEnd={endDate}
        anchorDate={startDate || endDate}
        onDayClick={handleDayClick}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
        <span className="text-slate-700">{rangeLabel}</span>
        {startDate || endDate ? (
          <button
            type="button"
            onClick={() => onChange({ startDate: "", endDate: "" })}
            className="text-sm font-medium text-red-600 hover:text-red-700"
          >
            Clear dates
          </button>
        ) : null}
      </div>
    </div>
  );
}
