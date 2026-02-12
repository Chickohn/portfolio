export type DocumentType = "Estimate" | "Invoice";

export interface CompanyProfile {
  name: string;
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

export interface DocumentMeta {
  docType: DocumentType;
  docNumberPrefix: string;
  docNumber: number;
  reference: string;
  issueDate: string;
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
  companyProfile: CompanyProfile;
  clientDetails: ClientDetails;
  vehicleDetails: VehicleDetails;
  documentMeta: DocumentMeta;
  /** When false, document meta section is greyed out and omitted from PDF */
  includeDocumentMeta: boolean;
  /** When false, shipping is excluded from totals and omitted from PDF */
  includeShipping: boolean;
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
