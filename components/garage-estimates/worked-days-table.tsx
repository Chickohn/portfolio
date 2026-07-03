"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DecimalInput } from "@/components/garage-estimates/decimal-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createWorkedDayId } from "@/lib/garage-estimates/constants";
import {
  formatCurrency,
  getDayNameFromDDMMYYYY,
  isValidDDMMYYYY,
  normalizeDDMMYYYY,
} from "@/lib/garage-estimates/format";
import { WorkedDayEntry } from "@/lib/garage-estimates/types";

interface WorkedDaysTableProps {
  workedDays: WorkedDayEntry[];
  onChange: (workedDays: WorkedDayEntry[]) => void;
}

export function WorkedDaysTable({ workedDays, onChange }: WorkedDaysTableProps) {
  const updateEntry = (id: string, patch: Partial<WorkedDayEntry>) => {
    onChange(
      workedDays.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry))
    );
  };

  const addEntry = () => {
    onChange([
      ...workedDays,
      {
        id: createWorkedDayId(),
        date: "",
        dayName: "",
        days: 1,
        rate: 0,
      },
    ]);
  };

  const removeEntry = (id: string) => {
    onChange(workedDays.filter((entry) => entry.id !== id));
  };

  const moveEntry = (id: string, direction: "up" | "down") => {
    const index = workedDays.findIndex((entry) => entry.id === id);
    if (index === -1) {
      return;
    }

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= workedDays.length) {
      return;
    }

    const reordered = [...workedDays];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    onChange(reordered);
  };

  const totalDays = workedDays.reduce((sum, entry) => sum + entry.days, 0);
  const totalAmount = workedDays.reduce(
    (sum, entry) => sum + entry.days * entry.rate,
    0
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Worked days</h3>
          <p className="text-sm text-slate-500">
            Optional schedule breakdown shown on the PDF.
          </p>
        </div>
        <Button type="button" onClick={addEntry} className="h-9 gap-2 px-4">
          <Plus className="h-4 w-4" />
          Add day
        </Button>
      </div>

      {workedDays.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
          No worked days added yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-[720px] w-full border-collapse text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="border-b border-slate-200 px-3 py-3 text-left font-medium">
                  Date
                </th>
                <th className="border-b border-slate-200 px-3 py-3 text-left font-medium">
                  Day
                </th>
                <th className="border-b border-slate-200 px-3 py-3 text-left font-medium">
                  Days
                </th>
                <th className="border-b border-slate-200 px-3 py-3 text-left font-medium">
                  Rate
                </th>
                <th className="border-b border-slate-200 px-3 py-3 text-right font-medium">
                  Amount
                </th>
                <th className="border-b border-slate-200 px-2 py-3 text-center font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {workedDays.map((entry, index) => (
                <tr key={entry.id} className="even:bg-slate-50/50">
                  <td className="border-b border-slate-200 px-3 py-3">
                    <Input
                      value={entry.date}
                      onChange={(event) => {
                        const date = event.target.value;
                        updateEntry(entry.id, {
                          date,
                          dayName: isValidDDMMYYYY(date)
                            ? getDayNameFromDDMMYYYY(date)
                            : entry.dayName,
                        });
                      }}
                      onBlur={() => {
                        if (isValidDDMMYYYY(entry.date)) {
                          updateEntry(entry.id, {
                            date: normalizeDDMMYYYY(entry.date),
                            dayName: getDayNameFromDDMMYYYY(entry.date),
                          });
                        }
                      }}
                      placeholder="dd-mm-yyyy"
                      className="h-9"
                    />
                  </td>
                  <td className="border-b border-slate-200 px-3 py-3">
                    <Input
                      value={entry.dayName}
                      onChange={(event) =>
                        updateEntry(entry.id, { dayName: event.target.value })
                      }
                      placeholder="Monday"
                      className="h-9"
                    />
                  </td>
                  <td className="border-b border-slate-200 px-3 py-3">
                    <Input
                      type="number"
                      min={0}
                      step={0.5}
                      value={entry.days}
                      onChange={(event) =>
                        updateEntry(entry.id, {
                          days: Math.max(0, Number(event.target.value) || 0),
                        })
                      }
                      className="h-9 w-20"
                    />
                  </td>
                  <td className="border-b border-slate-200 px-3 py-3">
                    <DecimalInput
                      value={entry.rate}
                      onChange={(rate) => updateEntry(entry.id, { rate })}
                      className="h-9"
                    />
                  </td>
                  <td className="border-b border-slate-200 px-3 py-3 text-right font-medium tabular-nums">
                    {formatCurrency(entry.days * entry.rate)}
                  </td>
                  <td className="border-b border-slate-200 px-2 py-3">
                    <div className="flex justify-center">
                      <div className="inline-flex overflow-hidden rounded-md border border-slate-300 bg-white shadow-sm">
                        <div className="flex flex-col border-r border-slate-200">
                          <button
                            type="button"
                            onClick={() => moveEntry(entry.id, "up")}
                            disabled={index === 0}
                            className="flex h-7 w-8 items-center justify-center border-b border-slate-200 text-slate-700 hover:bg-slate-50 disabled:text-slate-300"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveEntry(entry.id, "down")}
                            disabled={index === workedDays.length - 1}
                            className="flex h-7 w-8 items-center justify-center text-slate-700 hover:bg-slate-50 disabled:text-slate-300"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeEntry(entry.id)}
                          className="flex h-14 w-8 items-center justify-center text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-wrap gap-6 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
        <div>
          <Label className="text-slate-500">Total days</Label>
          <p className="font-semibold text-slate-900">{totalDays}</p>
        </div>
        <div>
          <Label className="text-slate-500">Schedule total</Label>
          <p className="font-semibold text-slate-900">{formatCurrency(totalAmount)}</p>
        </div>
      </div>
    </div>
  );
}
