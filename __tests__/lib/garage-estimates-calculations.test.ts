import {
  calculateLineItem,
  calculateTotals,
  clampLineItemValues,
  validateLineItem,
} from "@/lib/garage-estimates/calculations";
import { LineItem } from "@/lib/garage-estimates/types";

const createLineItem = (overrides: Partial<LineItem> = {}): LineItem => ({
  id: "line-1",
  description: "Oil and filter",
  qty: 1,
  rate: 100,
  discountType: "none",
  discountValue: 0,
  vatRate: 20,
  ...overrides,
});

describe("garage estimate calculations", () => {
  it("calculates line totals with percent discount", () => {
    const item = createLineItem({ qty: 2, rate: 50, discountType: "percent", discountValue: 10 });
    const result = calculateLineItem(item);

    expect(result.base).toBe(100);
    expect(result.discount).toBe(10);
    expect(result.net).toBe(90);
    expect(result.vat).toBe(18);
    expect(result.gross).toBe(108);
  });

  it("clamps fixed discount to base amount", () => {
    const item = createLineItem({ qty: 1, rate: 40, discountType: "fixed", discountValue: 100 });
    const normalized = clampLineItemValues(item);

    expect(normalized.discountValue).toBe(40);

    const result = calculateLineItem(item);
    expect(result.net).toBe(0);
    expect(result.vat).toBe(0);
  });

  it("clamps negative values", () => {
    const item = createLineItem({ qty: -3, rate: -12, discountValue: -1 });
    const normalized = clampLineItemValues(item);

    expect(normalized.qty).toBe(0);
    expect(normalized.rate).toBe(0);
    expect(normalized.discountValue).toBe(0);
  });

  it("computes totals with shipping", () => {
    const items = [
      createLineItem({ id: "one", qty: 1, rate: 100, vatRate: 20 }),
      createLineItem({ id: "two", qty: 2, rate: 50, vatRate: 5 }),
    ];

    const totals = calculateTotals(items, 10);

    expect(totals.subtotal).toBe(200);
    expect(totals.vatTotal).toBe(25);
    expect(totals.shipping).toBe(10);
    expect(totals.total).toBe(235);
  });

  it("returns inline errors for invalid discount ranges", () => {
    const percentErrors = validateLineItem(
      createLineItem({ discountType: "percent", discountValue: 120 })
    );
    expect(percentErrors.discountValue).toContain("between 0 and 100");

    const fixedErrors = validateLineItem(
      createLineItem({ rate: 80, discountType: "fixed", discountValue: 90 })
    );
    expect(fixedErrors.discountValue).toContain("cannot exceed");
  });
});
