import { formatDateToDDMMYYYY } from "./format";
import { GarageEstimateDraft, LineItem } from "./types";

export const GARAGE_DRAFT_STORAGE_KEY = "garageEstimatesDraft:v1";

export const createLineItemId = (): string => {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `line-${Math.random().toString(36).slice(2, 10)}`;
};

export const createDefaultLineItem = (): LineItem => ({
  id: createLineItemId(),
  description: "",
  qty: 1,
  rate: 0,
  discountType: "none",
  discountValue: 0,
  vatRate: 20,
});

export const createDefaultDraft = (): GarageEstimateDraft => ({
  companyProfile: {
    name: "Northside Garage",
    addressLines: ["15 Station Road", "Kingston upon Thames", "KT1 2AB"],
    phone: "020 0000 0000",
    email: "service@northsidegarage.co.uk",
    vatNumber: "",
    logoDataUrl: "",
  },
  clientDetails: {
    name: "",
    addressLines: [],
    contactNumber: "",
    email: "",
    additionalDetails: "",
  },
  vehicleDetails: {
    makeModel: "",
    registration: "",
    mileage: "",
  },
  documentMeta: {
    docType: "Estimate",
    docNumberPrefix: "",
    docNumber: 1001,
    reference: "",
    issueDate: formatDateToDDMMYYYY(new Date()),
    currency: "GBP",
  },
  includeDocumentMeta: true,
  lineItems: [createDefaultLineItem()],
  charges: {
    shipping: 0,
  },
  notesTerms: "Estimate valid for 14 days. Parts are subject to availability.",
});
