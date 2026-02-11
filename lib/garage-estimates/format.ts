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
  value.split(/\r?\n/).map((line) => line.trimEnd());

export const fromAddressLines = (addressLines: string[]): string =>
  addressLines.join("\n");
