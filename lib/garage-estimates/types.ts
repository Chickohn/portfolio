export type DocumentType = "Estimate" | "Invoice";

export type DocumentPreset = "garage" | "contractor" | "custom";

export interface SectionToggles {
  vehicle: boolean;
  workPeriod: boolean;
  workedDays: boolean;
  paymentDetails: boolean;
  shipping: boolean;
  lineItemDiscount: boolean;
  lineItemVat: boolean;
}

export interface CompanyProfile {
  name: string;
  tagline?: string;
  addressLines: string[];
  phone: string;
  email: string;
  vatNumber?: string;
  logoDataUrl?: string;
}

export interface ClientDetails {
  name: string;
  addressLines: string[];
  contactNumber: string;
  email: string;
  additionalDetails?: string;
}

export interface VehicleDetails {
  makeModel: string;
  registration: string;
  mileage?: string;
}

export interface WorkPeriod {
  startDate: string;
  endDate: string;
  summaryLine: string;
}

export interface WorkedDayEntry {
  id: string;
  date: string;
  dayName: string;
  days: number;
  rate: number;
}

export interface PaymentDetails {
  title: string;
  lines: string[];
}

export interface CustomSection {
  id: string;
  title: string;
  lines: string[];
  enabled: boolean;
}

export interface DocumentMeta {
  docType: DocumentType;
  docNumberPrefix: string;
  docNumber: number;
  reference: string;
  issueDate: string;
  dueDate: string;
  currency: "GBP";
}

export type DiscountType = "none" | "percent" | "fixed";
export type VatRate = 0 | 5 | 20;

export interface LineItem {
  id: string;
  description: string;
  qty: number;
  rate: number;
  discountType: DiscountType;
  discountValue: number;
  vatRate: VatRate;
}

export interface Charges {
  shipping: number;
}

export interface GarageEstimateDraft {
  preset: DocumentPreset;
  sectionToggles: SectionToggles;
  companyProfile: CompanyProfile;
  clientDetails: ClientDetails;
  vehicleDetails: VehicleDetails;
  workPeriod: WorkPeriod;
  workedDays: WorkedDayEntry[];
  paymentDetails: PaymentDetails;
  customSections: CustomSection[];
  documentMeta: DocumentMeta;
  /** When false, document meta section is greyed out and omitted from PDF */
  includeDocumentMeta: boolean;
  /** When false, shipping is excluded from totals and omitted from PDF */
  includeShipping: boolean;
  /** Show "Not VAT registered" on PDF instead of a VAT amount */
  vatNotRegistered: boolean;
  lineItems: LineItem[];
  charges: Charges;
  notesTerms: string;
}

export interface LineComputation {
  base: number;
  discount: number;
  net: number;
  vat: number;
  gross: number;
}

export interface TotalsComputation {
  subtotal: number;
  vatTotal: number;
  shipping: number;
  total: number;
}

export interface LineItemValidationErrors {
  qty?: string;
  rate?: string;
  discountValue?: string;
}
