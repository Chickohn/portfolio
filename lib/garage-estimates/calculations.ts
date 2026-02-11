import {
  DiscountType,
  LineComputation,
  LineItem,
  LineItemValidationErrors,
  TotalsComputation,
  VatRate,
} from "./types";

const isFiniteNumber = (value: number): boolean => Number.isFinite(value);

const toNonNegative = (value: number): number => {
  if (!isFiniteNumber(value)) {
    return 0;
  }

  return Math.max(0, value);
};

const clamp = (value: number, min: number, max: number): number => {
  if (!isFiniteNumber(value)) {
    return min;
  }

  return Math.min(Math.max(value, min), max);
};

const toVatRate = (value: number): VatRate => {
  if (value === 0 || value === 5 || value === 20) {
    return value;
  }

  return 20;
};

const toDiscountType = (value: string): DiscountType => {
  if (value === "none" || value === "percent" || value === "fixed") {
    return value;
  }

  return "none";
};

export const clampLineItemValues = (lineItem: LineItem): LineItem => {
  const qty = toNonNegative(lineItem.qty);
  const rate = toNonNegative(lineItem.rate);
  const base = qty * rate;
  const discountType = toDiscountType(lineItem.discountType);

  let discountValue = toNonNegative(lineItem.discountValue);
  if (discountType === "percent") {
    discountValue = clamp(discountValue, 0, 100);
  } else if (discountType === "fixed") {
    discountValue = clamp(discountValue, 0, base);
  } else {
    discountValue = 0;
  }

  return {
    ...lineItem,
    qty,
    rate,
    discountType,
    discountValue,
    vatRate: toVatRate(lineItem.vatRate),
  };
};

export const calculateLineItem = (lineItem: LineItem): LineComputation => {
  const normalized = clampLineItemValues(lineItem);
  const base = normalized.qty * normalized.rate;

  let discount = 0;
  if (normalized.discountType === "percent") {
    discount = base * (normalized.discountValue / 100);
  }

  if (normalized.discountType === "fixed") {
    discount = normalized.discountValue;
  }

  const net = Math.max(0, base - discount);
  const vat = net * (normalized.vatRate / 100);
  const gross = net + vat;

  return {
    base,
    discount,
    net,
    vat,
    gross,
  };
};

export const calculateTotals = (
  lineItems: LineItem[],
  shippingRaw: number
): TotalsComputation => {
  const shipping = toNonNegative(shippingRaw);

  const totals = lineItems.reduce(
    (acc, lineItem) => {
      const computed = calculateLineItem(lineItem);
      acc.subtotal += computed.net;
      acc.vatTotal += computed.vat;
      return acc;
    },
    { subtotal: 0, vatTotal: 0 }
  );

  const total = totals.subtotal + totals.vatTotal + shipping;

  return {
    subtotal: totals.subtotal,
    vatTotal: totals.vatTotal,
    shipping,
    total,
  };
};

export const validateLineItem = (
  lineItem: LineItem
): LineItemValidationErrors => {
  const errors: LineItemValidationErrors = {};

  if (!isFiniteNumber(lineItem.qty) || lineItem.qty < 0) {
    errors.qty = "Quantity cannot be negative.";
  }

  if (!isFiniteNumber(lineItem.rate) || lineItem.rate < 0) {
    errors.rate = "Rate cannot be negative.";
  }

  const qty = toNonNegative(lineItem.qty);
  const rate = toNonNegative(lineItem.rate);
  const base = qty * rate;

  if (!isFiniteNumber(lineItem.discountValue) || lineItem.discountValue < 0) {
    errors.discountValue = "Discount cannot be negative.";
  }

  if (
    lineItem.discountType === "percent" &&
    (lineItem.discountValue < 0 || lineItem.discountValue > 100)
  ) {
    errors.discountValue = "Percent discount must be between 0 and 100.";
  }

  if (
    lineItem.discountType === "fixed" &&
    (lineItem.discountValue < 0 || lineItem.discountValue > base)
  ) {
    errors.discountValue = "Fixed discount cannot exceed the line base amount.";
  }

  return errors;
};

export const clampShippingValue = (shipping: number): number =>
  toNonNegative(shipping);
