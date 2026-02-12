"use client";

import { DecimalInput } from "@/components/garage-estimates/decimal-input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/garage-estimates/format";
import { TotalsComputation } from "@/lib/garage-estimates/types";

interface TotalsPanelProps {
  totals: TotalsComputation;
  shipping: number;
  includeShipping: boolean;
  shippingError?: string;
  onToggleShipping: (value: boolean) => void;
  onShippingChange: (value: number) => void;
  onShippingBlur: () => void;
}

export function TotalsPanel({
  totals,
  shipping,
  includeShipping,
  shippingError,
  onToggleShipping,
  onShippingChange,
  onShippingBlur,
}: TotalsPanelProps) {
  return (
    <aside className="rounded-xl border border-slate-200 bg-white p-5 text-slate-900 shadow-sm xl:sticky xl:top-24">
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
          <div className="flex items-center justify-between">
            <Label htmlFor="shipping">Shipping</Label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={includeShipping}
                onChange={(event) => onToggleShipping(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300"
                aria-label="Include shipping on PDF"
              />
              Include on PDF
            </label>
          </div>
          <DecimalInput
            id="shipping"
            value={shipping}
            onChange={onShippingChange}
            onBlur={onShippingBlur}
            disabled={!includeShipping}
            aria-invalid={Boolean(shippingError)}
            className="h-10 rounded-md border border-slate-300 bg-white text-slate-900 shadow-sm focus:border-slate-500 focus:ring-1 focus:ring-slate-500 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
          />
          {shippingError ? <p className="text-xs text-red-600">{shippingError}</p> : null}
          {!includeShipping ? (
            <p className="text-xs text-slate-500">Shipping is excluded from totals and PDF.</p>
          ) : null}
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
