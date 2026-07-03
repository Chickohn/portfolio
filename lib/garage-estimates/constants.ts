import { addDaysToDDMMYYYY, formatDateToDDMMYYYY } from "./format";
import {
  DocumentPreset,
  GarageEstimateDraft,
  LineItem,
  SectionToggles,
} from "./types";

export const GARAGE_DRAFT_STORAGE_KEY = "garageEstimatesDraft:v2";

export const createLineItemId = (): string => {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `line-${Math.random().toString(36).slice(2, 10)}`;
};

export const createWorkedDayId = (): string => {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `day-${Math.random().toString(36).slice(2, 10)}`;
};

export const createCustomSectionId = (): string => {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `section-${Math.random().toString(36).slice(2, 10)}`;
};

export const DEFAULT_SECTION_TOGGLES: SectionToggles = {
  vehicle: true,
  workPeriod: false,
  workedDays: false,
  paymentDetails: false,
  shipping: true,
  lineItemDiscount: true,
  lineItemVat: true,
};

export const CONTRACTOR_SECTION_TOGGLES: SectionToggles = {
  vehicle: false,
  workPeriod: true,
  workedDays: true,
  paymentDetails: true,
  shipping: false,
  lineItemDiscount: false,
  lineItemVat: false,
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

export const createContractorLineItem = (): LineItem => ({
  id: createLineItemId(),
  description: "Contractor services",
  qty: 1,
  rate: 0,
  discountType: "none",
  discountValue: 0,
  vatRate: 0,
});

const createGarageDefaults = (): GarageEstimateDraft => {
  const issueDate = formatDateToDDMMYYYY(new Date());

  return {
    preset: "garage",
    sectionToggles: { ...DEFAULT_SECTION_TOGGLES },
    companyProfile: {
      name: "Browns Road Garage",
      tagline: "",
      addressLines: ["71-75 Browns Road", "Surbiton"],
      phone: "020 ...",
      email: "service@company.co.uk",
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
    workPeriod: {
      startDate: "",
      endDate: "",
      summaryLine: "",
    },
    workedDays: [],
    paymentDetails: {
      title: "Payment details",
      lines: [
        "Please pay by bank transfer.",
        "Account name:",
        "Sort code:",
        "Account number:",
        "Reference:",
      ],
    },
    customSections: [],
    documentMeta: {
      docType: "Estimate",
      docNumberPrefix: "",
      docNumber: 1001,
      reference: "",
      issueDate,
      dueDate: "",
      currency: "GBP",
    },
    includeDocumentMeta: true,
    includeShipping: true,
    vatNotRegistered: false,
    lineItems: [createDefaultLineItem()],
    charges: {
      shipping: 0,
    },
    notesTerms: "Estimate valid for 14 days. Parts are subject to availability.",
  };
};

const createContractorDefaults = (): GarageEstimateDraft => {
  const issueDate = formatDateToDDMMYYYY(new Date());
  const dueDate = addDaysToDDMMYYYY(issueDate, 14);

  return {
    preset: "contractor",
    sectionToggles: { ...CONTRACTOR_SECTION_TOGGLES },
    companyProfile: {
      name: "Freddie Kohn",
      tagline: "Self-employed contractor",
      addressLines: [],
      phone: "",
      email: "",
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
    workPeriod: {
      startDate: "",
      endDate: "",
      summaryLine: "Daily rate:",
    },
    workedDays: [],
    paymentDetails: {
      title: "Payment details",
      lines: [
        "Please pay by bank transfer.",
        "Account name: Freddie Kohn",
        "Sort code:",
        "Account number:",
        "Reference:",
      ],
    },
    customSections: [],
    documentMeta: {
      docType: "Invoice",
      docNumberPrefix: "FK-",
      docNumber: 1,
      reference: "",
      issueDate,
      dueDate,
      currency: "GBP",
    },
    includeDocumentMeta: true,
    includeShipping: false,
    vatNotRegistered: true,
    lineItems: [createContractorLineItem()],
    charges: {
      shipping: 0,
    },
    notesTerms: "",
  };
};

export const createDefaultDraft = (): GarageEstimateDraft => createGarageDefaults();

export const createPresetDraft = (preset: DocumentPreset): GarageEstimateDraft => {
  if (preset === "contractor") {
    return createContractorDefaults();
  }

  if (preset === "garage") {
    return createGarageDefaults();
  }

  return {
    ...createGarageDefaults(),
    preset: "custom",
    sectionToggles: { ...DEFAULT_SECTION_TOGGLES },
  };
};

export const applyPresetToggles = (
  draft: GarageEstimateDraft,
  preset: DocumentPreset
): GarageEstimateDraft => {
  if (preset === "contractor") {
    return {
      ...draft,
      preset,
      sectionToggles: { ...CONTRACTOR_SECTION_TOGGLES },
      includeShipping: false,
      vatNotRegistered: true,
      documentMeta: {
        ...draft.documentMeta,
        docType: "Invoice",
      },
      lineItems:
        draft.lineItems.length === 1 && !draft.lineItems[0]?.description.trim()
          ? [createContractorLineItem()]
          : draft.lineItems.map((item) => ({
              ...item,
              discountType: "none",
              discountValue: 0,
              vatRate: 0,
            })),
    };
  }

  if (preset === "garage") {
    return {
      ...draft,
      preset,
      sectionToggles: { ...DEFAULT_SECTION_TOGGLES },
      includeShipping: true,
      vatNotRegistered: false,
    };
  }

  return {
    ...draft,
    preset: "custom",
  };
};
