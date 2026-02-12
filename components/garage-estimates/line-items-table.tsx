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
  onClearAllLineItems: () => void;
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
  onClearAllLineItems,
  onRemoveLineItem,
  onMoveLineItem,
  onChangeLineItem,
  onClampLineItem,
}: LineItemsTableProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Items</h2>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClearAllLineItems}
            className="min-h-0 min-w-0 text-sm font-medium text-red-600 underline-offset-2 hover:text-red-700 hover:underline"
          >
            Clear
          </button>
          <Button
            type="button"
            onClick={onAddLineItem}
            className="h-10 min-h-0 gap-2 px-5"
            aria-label="Add items"
          >
            <Plus className="h-4 w-4" />
            Add Items
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 xl:overflow-visible">
        <table className="min-w-[860px] w-full table-fixed border-collapse text-sm lg:min-w-0">
          <colgroup>
            <col style={{ width: "35%" }} />
            <col style={{ width: "7%" }} />
            <col style={{ width: "11%" }} />
            <col style={{ width: "18%" }} />
            <col style={{ width: "8%" }} />
            <col style={{ width: "11%" }} />
            <col style={{ width: "10%" }} />
          </colgroup>
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th scope="col" className="border-b border-slate-200 px-3 py-3 text-left font-medium">
                Description
              </th>
              <th scope="col" className="border-b border-slate-200 px-2 py-3 text-center font-medium">
                Qty
              </th>
              <th scope="col" className="border-b border-slate-200 px-2 py-3 text-left font-medium">
                Rate
              </th>
              <th scope="col" className="border-b border-slate-200 px-2 py-3 text-left font-medium">
                Discount
              </th>
              <th scope="col" className="border-b border-slate-200 px-2 py-3 text-center font-medium">
                VAT
              </th>
              <th scope="col" className="border-b border-slate-200 px-3 py-3 text-right font-medium">
                Amount
              </th>
              <th scope="col" className="border-b border-slate-200 px-2 py-3 text-center font-medium">
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
                <tr key={lineItem.id} className="even:bg-slate-50/50">
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
                      rows={2}
                      placeholder="Describe labour, parts, diagnostics..."
                      className="w-full resize-none rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                    />
                    {hasError ? (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.qty || errors.rate || errors.discountValue}
                      </p>
                    ) : null}
                  </td>

                  <td className="border-b border-slate-200 px-2 py-3 align-middle">
                    <div className="flex justify-center">
                      <Input
                        id={`qty-${lineItem.id}`}
                        type="number"
                        min={0}
                        step={1}
                        value={lineItem.qty}
                        onChange={(event) =>
                          onChangeLineItem(lineItem.id, { qty: Math.floor(parseNumber(event.target.value)) })
                        }
                        onBlur={() => onClampLineItem(lineItem.id)}
                        aria-invalid={Boolean(errors.qty)}
                        aria-label="Quantity"
                        className="h-10 w-full max-w-[4rem] text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                    {errors.qty ? <p className="mt-1 text-xs text-center text-red-600">{errors.qty}</p> : null}
                  </td>

                  <td className="border-b border-slate-200 px-2 py-3 align-middle">
                    <DecimalInput
                      id={`rate-${lineItem.id}`}
                      value={lineItem.rate}
                      onChange={(rate) => onChangeLineItem(lineItem.id, { rate })}
                      onBlur={() => onClampLineItem(lineItem.id)}
                      aria-invalid={Boolean(errors.rate)}
                      aria-label="Rate"
                      placeholder="0.00"
                      className="h-10 w-full rounded-md border border-slate-300 bg-white text-slate-900 shadow-sm focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                    />
                    {errors.rate ? <p className="mt-1 text-xs text-red-600">{errors.rate}</p> : null}
                  </td>

                  <td className="border-b border-slate-200 px-2 py-3 align-middle">
                    <div className="space-y-1.5">
                      <select
                        id={`discount-type-${lineItem.id}`}
                        value={lineItem.discountType}
                        onChange={(event) =>
                          onChangeLineItem(lineItem.id, {
                            discountType: event.target.value as LineItem["discountType"],
                          })
                        }
                        onBlur={() => onClampLineItem(lineItem.id)}
                        className="h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                        aria-label="Discount type"
                      >
                        <option value="none">None</option>
                        <option value="percent">%</option>
                        <option value="fixed">£</option>
                      </select>
                      <DecimalInput
                        id={`discount-value-${lineItem.id}`}
                        value={lineItem.discountValue}
                        onChange={(discountValue) =>
                          onChangeLineItem(lineItem.id, { discountValue })
                        }
                        onBlur={() => onClampLineItem(lineItem.id)}
                        aria-invalid={Boolean(errors.discountValue)}
                        aria-label="Discount value"
                        placeholder="0.00"
                        className="h-9 w-full rounded-md border border-slate-300 bg-white text-slate-900 shadow-sm focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                      />
                    </div>
                    {errors.discountValue ? (
                      <p className="mt-1 text-xs text-red-600">{errors.discountValue}</p>
                    ) : null}
                  </td>

                  <td className="border-b border-slate-200 px-2 py-3 align-middle">
                    <div className="flex justify-center">
                      <select
                        id={`vat-${lineItem.id}`}
                        value={lineItem.vatRate}
                        onChange={(event) =>
                          onChangeLineItem(lineItem.id, {
                            vatRate: Number(event.target.value) as VatRate,
                          })
                        }
                        onBlur={() => onClampLineItem(lineItem.id)}
                        aria-label="VAT rate"
                        className="h-10 w-full rounded-md border border-slate-300 bg-white px-2 text-center text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                      >
                        <option value={0}>0%</option>
                        <option value={5}>5%</option>
                        <option value={20}>20%</option>
                      </select>
                    </div>
                  </td>

                  <td className="border-b border-slate-200 px-3 py-3 align-middle text-right font-medium tabular-nums text-slate-900 whitespace-nowrap">
                    {formatCurrency(computed.net)}
                  </td>

                  <td className="border-b border-slate-200 px-2 py-3 align-middle">
                    <div className="flex justify-center">
                      <div className="inline-flex overflow-hidden rounded-md border border-slate-300 bg-white shadow-sm">
                        <div className="flex flex-col border-r border-slate-200">
                          <button
                            type="button"
                            onClick={() => onMoveLineItem(lineItem.id, "up")}
                            disabled={index === 0}
                            aria-label={`Move line ${index + 1} up`}
                            className="flex h-7 w-9 min-h-0 min-w-0 items-center justify-center border-b border-slate-200 p-0 text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:text-slate-300 disabled:cursor-not-allowed"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onMoveLineItem(lineItem.id, "down")}
                            disabled={index === lineItems.length - 1}
                            aria-label={`Move line ${index + 1} down`}
                            className="flex h-7 w-9 min-h-0 min-w-0 items-center justify-center p-0 text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:text-slate-300 disabled:cursor-not-allowed"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemoveLineItem(lineItem.id)}
                          aria-label={`Remove line ${index + 1}`}
                          className="flex h-14 w-9 min-h-0 min-w-0 items-center justify-center p-0 text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
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
