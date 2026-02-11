import { clampLineItemValues, clampShippingValue } from "./calculations";
import { createDefaultDraft, createDefaultLineItem } from "./constants";
import {
  ClientDetails,
  CompanyProfile,
  DiscountType,
  DocumentType,
  GarageEstimateDraft,
  LineItem,
  VehicleDetails,
  VatRate,
} from "./types";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const toStringValue = (value: unknown, fallback = ""): string =>
  typeof value === "string" ? value : fallback;

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
};

const toNumberValue = (value: unknown, fallback = 0): number => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
};

const toDocumentType = (value: unknown): DocumentType =>
  value === "Invoice" ? "Invoice" : "Estimate";

const toDiscountType = (value: unknown): DiscountType => {
  if (value === "percent" || value === "fixed" || value === "none") {
    return value;
  }

  return "none";
};

const toVatRate = (value: unknown): VatRate => {
  if (value === 0 || value === 5 || value === 20) {
    return value;
  }

  return 20;
};

/** Accepts dd-mm-yyyy (1–2 digit d/m) or legacy yyyy-mm-dd; returns dd-mm-yyyy */
const toIssueDate = (value: unknown, fallback: string): string => {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  const ddmmyyyyMatch = trimmed.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (ddmmyyyyMatch) {
    const [, d, m, y] = ddmmyyyyMatch;
    return `${d.padStart(2, "0")}-${m.padStart(2, "0")}-${y}`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [y, m, d] = trimmed.split("-");
    return `${d}-${m}-${y}`;
  }
  return fallback;
};

const normalizeCompanyProfile = (
  value: unknown,
  fallback: CompanyProfile
): CompanyProfile => {
  if (!isRecord(value)) {
    return fallback;
  }

  return {
    name: toStringValue(value.name, fallback.name),
    addressLines: toStringArray(value.addressLines),
    phone: toStringValue(value.phone, fallback.phone),
    email: toStringValue(value.email, fallback.email),
    vatNumber: toStringValue(value.vatNumber, ""),
    logoDataUrl: toStringValue(value.logoDataUrl, ""),
  };
};

const normalizeClientDetails = (
  value: unknown,
  fallback: ClientDetails
): ClientDetails => {
  if (!isRecord(value)) {
    return fallback;
  }

  return {
    name: toStringValue(value.name, fallback.name),
    addressLines: toStringArray(value.addressLines),
    contactNumber: toStringValue(value.contactNumber, fallback.contactNumber),
    email: toStringValue(value.email, fallback.email),
    additionalDetails: toStringValue(value.additionalDetails, ""),
  };
};

const normalizeVehicleDetails = (
  value: unknown,
  fallback: VehicleDetails
): VehicleDetails => {
  if (!isRecord(value)) {
    return fallback;
  }

  return {
    makeModel: toStringValue(value.makeModel, fallback.makeModel),
    registration: toStringValue(value.registration, fallback.registration),
    mileage: toStringValue(value.mileage, ""),
  };
};

const normalizeLineItem = (value: unknown): LineItem => {
  const defaultLine = createDefaultLineItem();

  if (!isRecord(value)) {
    return defaultLine;
  }

  return clampLineItemValues({
    id: toStringValue(value.id, defaultLine.id),
    description: toStringValue(value.description, defaultLine.description),
    qty: toNumberValue(value.qty, defaultLine.qty),
    rate: toNumberValue(value.rate, defaultLine.rate),
    discountType: toDiscountType(value.discountType),
    discountValue: toNumberValue(value.discountValue, defaultLine.discountValue),
    vatRate: toVatRate(value.vatRate),
  });
};

export const normalizeGarageDraft = (input: unknown): GarageEstimateDraft => {
  const fallback = createDefaultDraft();
  if (!isRecord(input)) {
    return fallback;
  }

  const lineItemsRaw = Array.isArray(input.lineItems)
    ? input.lineItems.map(normalizeLineItem)
    : [];

  return {
    companyProfile: normalizeCompanyProfile(input.companyProfile, fallback.companyProfile),
    clientDetails: normalizeClientDetails(input.clientDetails, fallback.clientDetails),
    vehicleDetails: normalizeVehicleDetails(input.vehicleDetails, fallback.vehicleDetails),
    documentMeta: {
      docType: toDocumentType(isRecord(input.documentMeta) ? input.documentMeta.docType : null),
      docNumberPrefix: toStringValue(
        isRecord(input.documentMeta) ? input.documentMeta.docNumberPrefix : null,
        fallback.documentMeta.docNumberPrefix
      ),
      docNumber: Math.max(
        1,
        Math.floor(
          toNumberValue(
            isRecord(input.documentMeta) ? input.documentMeta.docNumber : null,
            fallback.documentMeta.docNumber
          )
        )
      ),
      reference: toStringValue(
        isRecord(input.documentMeta) ? input.documentMeta.reference : null,
        fallback.documentMeta.reference
      ),
      issueDate: toIssueDate(
        isRecord(input.documentMeta) ? input.documentMeta.issueDate : null,
        fallback.documentMeta.issueDate
      ),
      currency: "GBP",
    },
    lineItems: lineItemsRaw.length > 0 ? lineItemsRaw : [createDefaultLineItem()],
    charges: {
      shipping: clampShippingValue(
        toNumberValue(
          isRecord(input.charges) ? input.charges.shipping : null,
          fallback.charges.shipping
        )
      ),
    },
    notesTerms: toStringValue(input.notesTerms, fallback.notesTerms),
    includeDocumentMeta:
      typeof input.includeDocumentMeta === "boolean"
        ? input.includeDocumentMeta
        : fallback.includeDocumentMeta,
  };
};

export const parseDraftJson = (jsonString: string): GarageEstimateDraft => {
  const parsed = JSON.parse(jsonString) as unknown;
  return normalizeGarageDraft(parsed);
};
