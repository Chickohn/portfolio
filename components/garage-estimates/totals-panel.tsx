"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/garage-estimates/format";
import { TotalsComputation } from "@/lib/garage-estimates/types";

interface TotalsPanelProps {
  totals: TotalsComputation;
  shipping: number;
  shippingError?: string;
  onShippingChange: (value: number) => void;
  onShippingBlur: () => void;
}

const parseNumber = (value: string): number => {
  if (value.trim() === "") {
    return 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export function TotalsPanel({
  totals,
  shipping,
  shippingError,
  onShippingChange,
  onShippingBlur,
}: TotalsPanelProps) {
  return (
    <aside className="rounded-xl border border-slate-200 bg-white p-5 text-slate-900 shadow-sm lg:sticky lg:top-24">
      <h2 className="text-lg font-semibold">Totals</h2>
      <p className="mt-1 text-sm text-slate-500">
        Shipping is treated as non-VAT.
      </p>

      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Subtotal</span>
          <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">VAT total</span>
          <span className="font-medium">{formatCurrency(totals.vatTotal)}</span>
        </div>

        <div className="space-y-2 pt-1">
          <Label htmlFor="shipping">Shipping</Label>
          <Input
            id="shipping"
            type="number"
            min={0}
            step="0.01"
            value={shipping}
            onChange={(event) => onShippingChange(parseNumber(event.target.value))}
            onBlur={onShippingBlur}
            aria-invalid={Boolean(shippingError)}
            className="h-10"
          />
          {shippingError ? <p className="text-xs text-red-600">{shippingError}</p> : null}
        </div>

        <div className="border-t border-slate-200 pt-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Grand total</span>
            <span className="text-lg font-bold tracking-tight">
              {formatCurrency(totals.total)}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
