"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DecimalInput } from "@/components/garage-estimates/decimal-input";
import { Input } from "@/components/ui/input";
import { calculateLineItem } from "@/lib/garage-estimates/calculations";
import { formatCurrency } from "@/lib/garage-estimates/format";
import { LineItem, LineItemValidationErrors, VatRate } from "@/lib/garage-estimates/types";

interface LineItemsTableProps {
  lineItems: LineItem[];
  lineItemErrors: Record<string, LineItemValidationErrors>;
  onAddLineItem: () => void;
  onRemoveLineItem: (id: string) => void;
  onMoveLineItem: (id: string, direction: "up" | "down") => void;
  onChangeLineItem: (id: string, patch: Partial<LineItem>) => void;
  onClampLineItem: (id: string) => void;
}

const parseNumber = (value: string): number => {
  if (value.trim() === "") {
    return 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export function LineItemsTable({
  lineItems,
  lineItemErrors,
  onAddLineItem,
  onRemoveLineItem,
  onMoveLineItem,
  onChangeLineItem,
  onClampLineItem,
}: LineItemsTableProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Items</h2>
        <Button type="button" onClick={onAddLineItem} className="gap-2" aria-label="Add items">
          <Plus className="h-4 w-4" />
          Add Items
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-[980px] w-full border-collapse text-sm">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th scope="col" className="border-b border-slate-200 px-3 py-3 text-left font-medium">
                Description
              </th>
              <th scope="col" className="border-b border-slate-200 px-3 py-3 text-left font-medium">
                Qty
              </th>
              <th scope="col" className="border-b border-slate-200 px-3 py-3 text-left font-medium">
                Rate
              </th>
              <th scope="col" className="border-b border-slate-200 px-3 py-3 text-left font-medium">
                Discount
              </th>
              <th scope="col" className="border-b border-slate-200 px-3 py-3 text-left font-medium">
                VAT rate
              </th>
              <th scope="col" className="border-b border-slate-200 px-3 py-3 text-right font-medium">
                Amount
              </th>
              <th scope="col" className="border-b border-slate-200 px-3 py-3 text-right font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((lineItem, index) => {
              const computed = calculateLineItem(lineItem);
              const errors = lineItemErrors[lineItem.id] ?? {};
              const hasError = Boolean(errors.qty || errors.rate || errors.discountValue);

              return (
                <tr key={lineItem.id} className="align-top even:bg-slate-50/50">
                  <td className="border-b border-slate-200 px-3 py-3">
                    <label htmlFor={`description-${lineItem.id}`} className="sr-only">
                      Description
                    </label>
                    <textarea
                      id={`description-${lineItem.id}`}
                      value={lineItem.description}
                      onChange={(event) =>
                        onChangeLineItem(lineItem.id, { description: event.target.value })
                      }
                      onBlur={() => onClampLineItem(lineItem.id)}
                      rows={3}
                      placeholder="Describe labour, parts, diagnostics..."
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                    />
                    {hasError ? (
                      <p className="mt-2 text-xs text-red-600">
                        {errors.qty || errors.rate || errors.discountValue}
                      </p>
                    ) : null}
                  </td>

                  <td className="border-b border-slate-200 px-3 py-3">
                    <label htmlFor={`qty-${lineItem.id}`} className="sr-only">
                      Quantity
                    </label>
                    <Input
                      id={`qty-${lineItem.id}`}
                      type="number"
                      min={0}
                      step={1}
                      value={lineItem.qty}
                      onChange={(event) =>
                        onChangeLineItem(lineItem.id, { qty: parseNumber(event.target.value) })
                      }
                      onBlur={() => onClampLineItem(lineItem.id)}
                      aria-invalid={Boolean(errors.qty)}
                      className="h-10 min-w-[88px]"
                    />
                    {errors.qty ? <p className="mt-1 text-xs text-red-600">{errors.qty}</p> : null}
                  </td>

                  <td className="border-b border-slate-200 px-3 py-3">
                    <label htmlFor={`rate-${lineItem.id}`} className="sr-only">
                      Rate
                    </label>
                    <DecimalInput
                      id={`rate-${lineItem.id}`}
                      value={lineItem.rate}
                      onChange={(rate) => onChangeLineItem(lineItem.id, { rate })}
                      onBlur={() => onClampLineItem(lineItem.id)}
                      aria-invalid={Boolean(errors.rate)}
                      className="h-10 min-w-[120px] rounded-md border border-slate-300 bg-white text-slate-900 shadow-sm focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                    />
                    {errors.rate ? <p className="mt-1 text-xs text-red-600">{errors.rate}</p> : null}
                  </td>

                  <td className="border-b border-slate-200 px-3 py-3">
                    <div className="space-y-2">
                      <label htmlFor={`discount-type-${lineItem.id}`} className="sr-only">
                        Discount type
                      </label>
                      <select
                        id={`discount-type-${lineItem.id}`}
                        value={lineItem.discountType}
                        onChange={(event) =>
                          onChangeLineItem(lineItem.id, {
                            discountType: event.target.value as LineItem["discountType"],
                          })
                        }
                        onBlur={() => onClampLineItem(lineItem.id)}
                        className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                        aria-label="Discount type"
                      >
                        <option value="none">None</option>
                        <option value="percent">Percent (%)</option>
                        <option value="fixed">Fixed (£)</option>
                      </select>

                      <label htmlFor={`discount-value-${lineItem.id}`} className="sr-only">
                        Discount value
                      </label>
                      <DecimalInput
                        id={`discount-value-${lineItem.id}`}
                        value={lineItem.discountValue}
                        onChange={(discountValue) =>
                          onChangeLineItem(lineItem.id, { discountValue })
                        }
                        onBlur={() => onClampLineItem(lineItem.id)}
                        aria-invalid={Boolean(errors.discountValue)}
                        aria-label="Discount value"
                        className="h-10 min-w-[120px] rounded-md border border-slate-300 bg-white text-slate-900 shadow-sm focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                      />
                    </div>
                    {errors.discountValue ? (
                      <p className="mt-1 text-xs text-red-600">{errors.discountValue}</p>
                    ) : null}
                  </td>

                  <td className="border-b border-slate-200 px-3 py-3">
                    <label htmlFor={`vat-${lineItem.id}`} className="sr-only">
                      VAT rate
                    </label>
                    <select
                      id={`vat-${lineItem.id}`}
                      value={lineItem.vatRate}
                      onChange={(event) =>
                        onChangeLineItem(lineItem.id, {
                          vatRate: Number(event.target.value) as VatRate,
                        })
                      }
                      onBlur={() => onClampLineItem(lineItem.id)}
                      className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                    >
                      <option value={0}>0%</option>
                      <option value={5}>5%</option>
                      <option value={20}>20%</option>
                    </select>
                  </td>

                  <td className="border-b border-slate-200 px-3 py-3 text-right font-medium text-slate-900">
                    {formatCurrency(computed.net)}
                  </td>

                  <td className="border-b border-slate-200 px-3 py-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => onMoveLineItem(lineItem.id, "up")}
                        disabled={index === 0}
                        aria-label={`Move line ${index + 1} up`}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => onMoveLineItem(lineItem.id, "down")}
                        disabled={index === lineItems.length - 1}
                        aria-label={`Move line ${index + 1} down`}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => onRemoveLineItem(lineItem.id)}
                        disabled={lineItems.length <= 1}
                        aria-label={`Remove line ${index + 1}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
