import { GarageEstimateDraft } from "./types";

const gbpFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatCurrency = (value: number): string => {
  const safeValue = Number.isFinite(value) ? value : 0;
  return gbpFormatter.format(safeValue);
};

const sanitizeFilenamePart = (value: string): string =>
  value
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-_]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

export const buildPdfFilename = (draft: GarageEstimateDraft): string => {
  const docType = sanitizeFilenamePart(draft.documentMeta.docType) || "estimate";
  const docNumberPrefix = sanitizeFilenamePart(draft.documentMeta.docNumberPrefix) || "doc";
  const docNumber = Math.max(1, Math.floor(draft.documentMeta.docNumber || 1));

  const clientOrReg =
    sanitizeFilenamePart(draft.clientDetails.name) ||
    sanitizeFilenamePart(draft.vehicleDetails.registration) ||
    "customer";

  return `${docType}-${docNumberPrefix}${docNumber}-${clientOrReg}.pdf`;
};

export const toAddressLines = (value: string): string[] =>
  value.split(/\r?\n/);

export const fromAddressLines = (addressLines: string[]): string =>
  addressLines.join("\n");

/** Format date as dd-mm-yyyy for display and storage */
export const formatDateToDDMMYYYY = (date: Date): string => {
  const d = date.getDate();
  const m = date.getMonth() + 1;
  const y = date.getFullYear();
  return `${String(d).padStart(2, "0")}-${String(m).padStart(2, "0")}-${y}`;
};

/** Today in dd-mm-yyyy */
export const getTodayDDMMYYYY = (): string => formatDateToDDMMYYYY(new Date());

/** Valid dd-mm-yyyy string (e.g. 31-12-2025) */
export const DDMMYYYY_REGEX = /^\d{1,2}-\d{1,2}-\d{4}$/;

export const isValidDDMMYYYY = (value: string): boolean => {
  if (!DDMMYYYY_REGEX.test(value)) return false;
  const [d, m, y] = value.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return (
    date.getFullYear() === y &&
    date.getMonth() === m - 1 &&
    date.getDate() === d
  );
};

/** Normalize dd-mm-yyyy to zero-padded (e.g. 1-1-2025 -> 01-01-2025). Returns same if invalid. */
export const normalizeDDMMYYYY = (value: string): string => {
  if (!isValidDDMMYYYY(value)) return value;
  const [d, m, y] = value.split("-").map(Number);
  return `${String(d).padStart(2, "0")}-${String(m).padStart(2, "0")}-${y}`;
};

const parseDDMMYYYY = (value: string): Date | null => {
  if (!isValidDDMMYYYY(value)) {
    return null;
  }

  const [d, m, y] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
};

/** Parse dd-mm-yyyy to Date, or null */
export const dateFromDDMMYYYY = parseDDMMYYYY;

/** Compare two dd-mm-yyyy strings; negative if a < b */
export const compareDDMMYYYY = (a: string, b: string): number => {
  const dateA = parseDDMMYYYY(a);
  const dateB = parseDDMMYYYY(b);
  if (!dateA || !dateB) {
    return 0;
  }
  return dateA.getTime() - dateB.getTime();
};

/** Try to normalize common date inputs to dd-mm-yyyy; returns "" if empty or unparseable */
export const normalizeOptionalDate = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  if (isValidDDMMYYYY(trimmed)) {
    return normalizeDDMMYYYY(trimmed);
  }

  const dashed = trimmed.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (dashed) {
    const [, d, m, y] = dashed;
    const candidate = `${d.padStart(2, "0")}-${m.padStart(2, "0")}-${y}`;
    if (isValidDDMMYYYY(candidate)) {
      return candidate;
    }
  }

  const slashed = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashed) {
    const [, d, m, y] = slashed;
    const candidate = `${d.padStart(2, "0")}-${m.padStart(2, "0")}-${y}`;
    if (isValidDDMMYYYY(candidate)) {
      return candidate;
    }
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [y, m, d] = trimmed.split("-");
    const candidate = `${d}-${m}-${y}`;
    if (isValidDDMMYYYY(candidate)) {
      return normalizeDDMMYYYY(candidate);
    }
  }

  return "";
};

/** Format dd-mm-yyyy as "15 June 2026" for PDF display */
export const formatDateLong = (value: string): string => {
  const date = parseDDMMYYYY(value);
  if (!date) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

/** Day name from dd-mm-yyyy, e.g. "Monday" */
export const getDayNameFromDDMMYYYY = (value: string): string => {
  const date = parseDDMMYYYY(value);
  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat("en-GB", { weekday: "long" }).format(date);
};

/** Add days to a dd-mm-yyyy date string */
export const addDaysToDDMMYYYY = (value: string, days: number): string => {
  const date = parseDDMMYYYY(value);
  if (!date) {
    return value;
  }

  date.setDate(date.getDate() + days);
  return formatDateToDDMMYYYY(date);
};
