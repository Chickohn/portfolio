import { clampLineItemValues, clampShippingValue } from "./calculations";
import {
  createCustomSectionId,
  createDefaultDraft,
  createDefaultLineItem,
  createWorkedDayId,
} from "./constants";
import { normalizeOptionalDate } from "./format";
import {
  ClientDetails,
  CompanyProfile,
  CustomSection,
  DiscountType,
  DocumentPreset,
  DocumentType,
  GarageEstimateDraft,
  LineItem,
  PaymentDetails,
  SectionToggles,
  VehicleDetails,
  VatRate,
  WorkedDayEntry,
  WorkPeriod,
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

const toBooleanValue = (value: unknown, fallback: boolean): boolean =>
  typeof value === "boolean" ? value : fallback;

const toDocumentType = (value: unknown): DocumentType =>
  value === "Invoice" ? "Invoice" : "Estimate";

const toDocumentPreset = (value: unknown): DocumentPreset => {
  if (value === "contractor" || value === "custom" || value === "garage") {
    return value;
  }

  return "garage";
};

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
    tagline: toStringValue(value.tagline, fallback.tagline ?? ""),
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

const normalizeWorkPeriod = (value: unknown, fallback: WorkPeriod): WorkPeriod => {
  if (!isRecord(value)) {
    return fallback;
  }

  return {
    startDate: normalizeOptionalDate(toStringValue(value.startDate, "")),
    endDate: normalizeOptionalDate(toStringValue(value.endDate, "")),
    summaryLine: toStringValue(value.summaryLine, fallback.summaryLine),
  };
};

const normalizeWorkedDay = (value: unknown): WorkedDayEntry => {
  const fallback: WorkedDayEntry = {
    id: createWorkedDayId(),
    date: "",
    dayName: "",
    days: 1,
    rate: 0,
  };

  if (!isRecord(value)) {
    return fallback;
  }

  return {
    id: toStringValue(value.id, fallback.id),
    date: normalizeOptionalDate(toStringValue(value.date, "")),
    dayName: toStringValue(value.dayName, ""),
    days: Math.max(0, toNumberValue(value.days, 1)),
    rate: Math.max(0, toNumberValue(value.rate, 0)),
  };
};

const normalizePaymentDetails = (
  value: unknown,
  fallback: PaymentDetails
): PaymentDetails => {
  if (!isRecord(value)) {
    return fallback;
  }

  const lines = toStringArray(value.lines);

  return {
    title: toStringValue(value.title, fallback.title),
    lines: lines.length > 0 ? lines : fallback.lines,
  };
};

const normalizeCustomSection = (value: unknown): CustomSection => {
  const fallback: CustomSection = {
    id: createCustomSectionId(),
    title: "Additional details",
    lines: [""],
    enabled: true,
  };

  if (!isRecord(value)) {
    return fallback;
  }

  const lines = toStringArray(value.lines);

  return {
    id: toStringValue(value.id, fallback.id),
    title: toStringValue(value.title, fallback.title),
    lines: lines.length > 0 ? lines : [""],
    enabled: toBooleanValue(value.enabled, true),
  };
};

const normalizeSectionToggles = (
  value: unknown,
  fallback: SectionToggles
): SectionToggles => {
  if (!isRecord(value)) {
    return fallback;
  }

  return {
    vehicle: toBooleanValue(value.vehicle, fallback.vehicle),
    workPeriod: toBooleanValue(value.workPeriod, fallback.workPeriod),
    workedDays: toBooleanValue(value.workedDays, fallback.workedDays),
    paymentDetails: toBooleanValue(value.paymentDetails, fallback.paymentDetails),
    shipping: toBooleanValue(value.shipping, fallback.shipping),
    lineItemDiscount: toBooleanValue(value.lineItemDiscount, fallback.lineItemDiscount),
    lineItemVat: toBooleanValue(value.lineItemVat, fallback.lineItemVat),
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

  const workedDaysRaw = Array.isArray(input.workedDays)
    ? input.workedDays.map(normalizeWorkedDay)
    : [];

  const customSectionsRaw = Array.isArray(input.customSections)
    ? input.customSections.map(normalizeCustomSection)
    : [];

  const preset = toDocumentPreset(input.preset);
  const sectionToggles = normalizeSectionToggles(
    input.sectionToggles,
    fallback.sectionToggles
  );

  return {
    preset,
    sectionToggles,
    companyProfile: normalizeCompanyProfile(input.companyProfile, fallback.companyProfile),
    clientDetails: normalizeClientDetails(input.clientDetails, fallback.clientDetails),
    vehicleDetails: normalizeVehicleDetails(input.vehicleDetails, fallback.vehicleDetails),
    workPeriod: normalizeWorkPeriod(input.workPeriod, fallback.workPeriod),
    workedDays: workedDaysRaw,
    paymentDetails: normalizePaymentDetails(input.paymentDetails, fallback.paymentDetails),
    customSections: customSectionsRaw,
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
      issueDate:
        normalizeOptionalDate(
          toStringValue(
            isRecord(input.documentMeta) ? input.documentMeta.issueDate : null,
            fallback.documentMeta.issueDate
          )
        ) || fallback.documentMeta.issueDate,
      dueDate: normalizeOptionalDate(
        toStringValue(
          isRecord(input.documentMeta) ? input.documentMeta.dueDate : null,
          ""
        )
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
    includeDocumentMeta: toBooleanValue(input.includeDocumentMeta, fallback.includeDocumentMeta),
    includeShipping: toBooleanValue(input.includeShipping, fallback.includeShipping),
    vatNotRegistered: toBooleanValue(input.vatNotRegistered, fallback.vatNotRegistered),
  };
};

export const parseDraftJson = (jsonString: string): GarageEstimateDraft => {
  const parsed = JSON.parse(jsonString) as unknown;
  return normalizeGarageDraft(parsed);
};
