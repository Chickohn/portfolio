"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { Download, Eye, FileJson, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  calculateTotals,
  clampLineItemValues,
  clampShippingValue,
  validateLineItem,
} from "@/lib/garage-estimates/calculations";
import {
  createDefaultDraft,
  createDefaultLineItem,
} from "@/lib/garage-estimates/constants";
import { normalizeGarageDraft, parseDraftJson } from "@/lib/garage-estimates/draft";
import {
  buildPdfFilename,
  formatDateToDDMMYYYY,
  fromAddressLines,
  getTodayDDMMYYYY,
  isValidDDMMYYYY,
  normalizeDDMMYYYY,
  toAddressLines,
} from "@/lib/garage-estimates/format";
import { generateGaragePdf } from "@/lib/garage-estimates/pdf";
import {
  clearDraftFromStorage,
  loadDraftFromStorage,
  saveDraftToStorage,
} from "@/lib/garage-estimates/storage";
import { GarageEstimateDraft, LineItem } from "@/lib/garage-estimates/types";
import { LineItemsTable } from "./line-items-table";
import { TotalsPanel } from "./totals-panel";

type NoticeType = "success" | "error" | "info";

interface Notice {
  type: NoticeType;
  message: string;
}

const noticeClassNames: Record<NoticeType, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  error: "border-red-200 bg-red-50 text-red-900",
  info: "border-blue-200 bg-blue-50 text-blue-900",
};

const parseNumberInput = (value: string, fallback = 0): number => {
  if (value.trim() === "") {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const downloadBlob = (blob: Blob, filename: string): void => {
  const blobUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = blobUrl;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
};

export function GarageEstimateTool() {
  const [draft, setDraft] = useState<GarageEstimateDraft>(() => createDefaultDraft());
  const [notice, setNotice] = useState<Notice | null>(null);
  const [isPdfBusy, setIsPdfBusy] = useState(false);
  const [showRestoredBanner, setShowRestoredBanner] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  const importInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const restoredDraft = loadDraftFromStorage();
    if (restoredDraft) {
      setDraft(restoredDraft);
      setShowRestoredBanner(true);
    }

    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const timeout = window.setTimeout(() => {
      saveDraftToStorage(draft);
    }, 500);

    return () => window.clearTimeout(timeout);
  }, [draft, isHydrated]);

  const lineItemErrors = useMemo(() => {
    return Object.fromEntries(
      draft.lineItems.map((lineItem) => [lineItem.id, validateLineItem(lineItem)])
    );
  }, [draft.lineItems]);

  const shippingError = draft.charges.shipping < 0 ? "Shipping cannot be negative." : undefined;

  const totals = useMemo(
    () => calculateTotals(draft.lineItems, draft.charges.shipping),
    [draft.lineItems, draft.charges.shipping]
  );

  const validationCount = useMemo(() => {
    const lineErrorCount = Object.values(lineItemErrors).reduce((count, errors) => {
      return count + Object.values(errors).filter(Boolean).length;
    }, 0);

    return lineErrorCount + (shippingError ? 1 : 0);
  }, [lineItemErrors, shippingError]);

  const updateDraft = (updater: (previous: GarageEstimateDraft) => GarageEstimateDraft) => {
    setDraft((previous) => updater(previous));
  };

  const updateCompanyProfile = (
    patch: Partial<GarageEstimateDraft["companyProfile"]>
  ): void => {
    updateDraft((previous) => ({
      ...previous,
      companyProfile: {
        ...previous.companyProfile,
        ...patch,
      },
    }));
  };

  const updateClientDetails = (
    patch: Partial<GarageEstimateDraft["clientDetails"]>
  ): void => {
    updateDraft((previous) => ({
      ...previous,
      clientDetails: {
        ...previous.clientDetails,
        ...patch,
      },
    }));
  };

  const updateVehicleDetails = (
    patch: Partial<GarageEstimateDraft["vehicleDetails"]>
  ): void => {
    updateDraft((previous) => ({
      ...previous,
      vehicleDetails: {
        ...previous.vehicleDetails,
        ...patch,
      },
    }));
  };

  const updateDocumentMeta = (
    patch: Partial<GarageEstimateDraft["documentMeta"]>
  ): void => {
    updateDraft((previous) => ({
      ...previous,
      documentMeta: {
        ...previous.documentMeta,
        ...patch,
      },
    }));
  };

  const onChangeLineItem = (id: string, patch: Partial<LineItem>) => {
    updateDraft((previous) => ({
      ...previous,
      lineItems: previous.lineItems.map((lineItem) =>
        lineItem.id === id ? { ...lineItem, ...patch } : lineItem
      ),
    }));
  };

  const onClampLineItem = (id: string) => {
    updateDraft((previous) => ({
      ...previous,
      lineItems: previous.lineItems.map((lineItem) =>
        lineItem.id === id ? clampLineItemValues(lineItem) : lineItem
      ),
    }));
  };

  const onAddLineItem = () => {
    updateDraft((previous) => ({
      ...previous,
      lineItems: [...previous.lineItems, createDefaultLineItem()],
    }));
  };

  const onRemoveLineItem = (id: string) => {
    updateDraft((previous) => {
      if (previous.lineItems.length <= 1) {
        const [existing] = previous.lineItems;
        if (!existing) {
          return previous;
        }

        const empty = createDefaultLineItem();
        return {
          ...previous,
          lineItems: [
            {
              ...existing,
              description: "",
              qty: empty.qty,
              rate: empty.rate,
              discountType: empty.discountType,
              discountValue: empty.discountValue,
              vatRate: empty.vatRate,
            },
          ],
        };
      }

      return {
        ...previous,
        lineItems: previous.lineItems.filter((lineItem) => lineItem.id !== id),
      };
    });
  };

  const onClearAllLineItems = () => {
    updateDraft((previous) => ({
      ...previous,
      lineItems: [createDefaultLineItem()],
    }));
  };

  const onMoveLineItem = (id: string, direction: "up" | "down") => {
    updateDraft((previous) => {
      const index = previous.lineItems.findIndex((lineItem) => lineItem.id === id);
      if (index === -1) {
        return previous;
      }

      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= previous.lineItems.length) {
        return previous;
      }

      const reordered = [...previous.lineItems];
      const [movedLine] = reordered.splice(index, 1);
      reordered.splice(targetIndex, 0, movedLine);

      return {
        ...previous,
        lineItems: reordered,
      };
    });
  };

  const onClampShipping = () => {
    updateDraft((previous) => ({
      ...previous,
      charges: {
        ...previous.charges,
        shipping: clampShippingValue(previous.charges.shipping),
      },
    }));
  };

  const onLogoFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    event.target.value = "";

    if (!selectedFile) {
      return;
    }

    if (selectedFile.size > 2_500_000) {
      setNotice({
        type: "error",
        message: "Logo file is too large. Please choose an image under 2.5 MB.",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        updateCompanyProfile({ logoDataUrl: reader.result });
        setNotice({
          type: "success",
          message: "Logo loaded. It will be included in the generated PDF.",
        });
      }
    };
    reader.onerror = () => {
      setNotice({
        type: "error",
        message: "Could not read that logo file. Try another image.",
      });
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleClearDraft = () => {
    const confirmed = window.confirm(
      "Clear your current draft and remove the autosaved local copy?"
    );

    if (!confirmed) {
      return;
    }

    setDraft(createDefaultDraft());
    clearDraftFromStorage();
    setShowRestoredBanner(false);
    setNotice({ type: "info", message: "Draft cleared." });
  };

  const handleExportDraft = () => {
    const normalizedDraft = normalizeGarageDraft(draft);
    const payload = JSON.stringify(normalizedDraft, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const today = new Date().toISOString().slice(0, 10);

    downloadBlob(blob, `garage-estimate-draft-${today}.json`);
    setNotice({ type: "success", message: "Draft JSON exported." });
  };

  const handleImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const importedDraft = parseDraftJson(text);
      setDraft(importedDraft);
      setNotice({ type: "success", message: "Draft JSON imported." });
    } catch {
      setNotice({ type: "error", message: "Could not import that JSON file." });
    }
  };

  const handleGeneratePdf = async (mode: "download" | "preview") => {
    setIsPdfBusy(true);

    try {
      const normalizedDraft = normalizeGarageDraft(draft);
      setDraft(normalizedDraft);

      const pdfBytes = await generateGaragePdf(normalizedDraft);
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const filename = buildPdfFilename(normalizedDraft);

      if (mode === "download") {
        downloadBlob(blob, filename);
        setNotice({ type: "success", message: "PDF downloaded." });
      } else {
        const previewUrl = URL.createObjectURL(blob);
        window.open(previewUrl, "_blank", "noopener,noreferrer");
        window.setTimeout(() => URL.revokeObjectURL(previewUrl), 60_000);
        setNotice({ type: "info", message: "PDF opened in a new tab." });
      }
    } catch {
      setNotice({
        type: "error",
        message: "PDF generation failed. Please review inputs and try again.",
      });
    } finally {
      setIsPdfBusy(false);
    }
  };

  return (
    <div className="relative isolate min-h-screen overflow-x-clip pb-16">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-[#06215a] via-[#041742] to-[#030f2d]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.22),transparent_35%),radial-gradient(circle_at_85%_75%,rgba(37,99,235,0.18),transparent_40%)]"
      />
      <div className="mx-auto max-w-[1720px] px-4 py-8 sm:px-6 lg:px-8 2xl:px-10">
        <header className="rounded-2xl border border-slate-700 bg-slate-900/80 p-5 text-slate-100 shadow-sm backdrop-blur-sm">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Garage Estimate / Invoice PDF Generator
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-300 sm:text-base">
            Build professional estimates or invoices with line items, VAT, totals, and
            customer details. Everything runs in your browser with local autosave.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              className="gap-2"
              onClick={handleExportDraft}
            >
              <FileJson className="h-4 w-4" />
              Export Draft JSON
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="gap-2"
              onClick={() => importInputRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
              Import Draft JSON
            </Button>
            <Button
              type="button"
              variant="outline"
              className="gap-2 border-slate-400 bg-slate-800/80 text-slate-100 hover:border-slate-300 hover:bg-slate-700 hover:text-white"
              onClick={handleClearDraft}
            >
              <Trash2 className="h-4 w-4" />
              Clear Draft
            </Button>
            <input
              ref={importInputRef}
              type="file"
              accept="application/json"
              onChange={handleImportFile}
              className="hidden"
              aria-hidden="true"
              tabIndex={-1}
            />
          </div>
        </header>

        {showRestoredBanner ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
            <span>Draft restored from local storage.</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-blue-300 bg-white text-blue-900 hover:bg-blue-100"
              onClick={handleClearDraft}
            >
              Clear
            </Button>
          </div>
        ) : null}

        {notice ? (
          <div className={`mt-4 rounded-lg border px-4 py-3 text-sm ${noticeClassNames[notice.type]}`}>
            {notice.message}
          </div>
        ) : null}

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px] 2xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6 lg:min-h-0">
            <Card className="border-slate-200 bg-white text-slate-900">
              <CardHeader>
                <CardTitle>Company Profile</CardTitle>
                <CardDescription>
                  These details appear in the PDF header.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input
                      id="company-name"
                      value={draft.companyProfile.name}
                      onChange={(event) =>
                        updateCompanyProfile({ name: event.target.value })
                      }
                      placeholder="Garage name"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="company-address">Company Address</Label>
                    <textarea
                      id="company-address"
                      value={fromAddressLines(draft.companyProfile.addressLines)}
                      onChange={(event) =>
                        updateCompanyProfile({
                          addressLines: toAddressLines(event.target.value),
                        })
                      }
                      rows={3}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                      placeholder="One line per row"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company-phone">Phone</Label>
                    <Input
                      id="company-phone"
                      value={draft.companyProfile.phone}
                      onChange={(event) =>
                        updateCompanyProfile({ phone: event.target.value })
                      }
                      placeholder="020..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company-email">Email</Label>
                    <Input
                      id="company-email"
                      type="email"
                      value={draft.companyProfile.email}
                      onChange={(event) =>
                        updateCompanyProfile({ email: event.target.value })
                      }
                      placeholder="service@garage.co.uk"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company-vat">VAT Number (Optional)</Label>
                    <Input
                      id="company-vat"
                      value={draft.companyProfile.vatNumber}
                      onChange={(event) =>
                        updateCompanyProfile({ vatNumber: event.target.value })
                      }
                      placeholder="GB..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company-logo">Logo (Optional)</Label>
                    {draft.companyProfile.logoDataUrl ? (
                      <div className="flex h-10 items-center gap-3 rounded-md border border-slate-300 bg-slate-50/50 px-3">
                        <span className="text-sm text-slate-600">Logo selected</span>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-7 border-slate-300 text-slate-700 hover:bg-slate-100"
                          onClick={() => logoInputRef.current?.click()}
                        >
                          Change logo
                        </Button>
                        <input
                          ref={logoInputRef}
                          id="company-logo"
                          type="file"
                          accept="image/png,image/jpeg,image/jpg"
                          onChange={onLogoFileChange}
                          className="sr-only"
                          aria-hidden="true"
                          tabIndex={-1}
                        />
                      </div>
                    ) : (
                      <Input
                        id="company-logo"
                        type="file"
                        accept="image/png,image/jpeg,image/jpg"
                        onChange={onLogoFileChange}
                        className="file-input-styled h-10 cursor-pointer"
                        ref={logoInputRef}
                      />
                    )}
                  </div>
                </div>

                {draft.companyProfile.logoDataUrl ? (
                  <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/80 p-3 shadow-sm">
                    <Image
                      src={draft.companyProfile.logoDataUrl}
                      alt="Company logo preview"
                      width={48}
                      height={48}
                      className="h-12 w-12 rounded-lg object-cover ring-1 ring-slate-200/60"
                      unoptimized
                    />
                    <div className="flex-1 text-xs text-slate-600">
                      Logo will be embedded in the generated PDF.
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                      onClick={() => updateCompanyProfile({ logoDataUrl: "" })}
                    >
                      Remove
                    </Button>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-slate-200 bg-white text-slate-900">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle>Bill To + Vehicle</CardTitle>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() =>
                      updateDraft((previous) => {
                        const defaults = createDefaultDraft();
                        return {
                          ...previous,
                          clientDetails: defaults.clientDetails,
                          vehicleDetails: defaults.vehicleDetails,
                        };
                      })
                    }
                  >
                    Clear
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="client-name">Client Name</Label>
                    <Input
                      id="client-name"
                      value={draft.clientDetails.name}
                      onChange={(event) =>
                        updateClientDetails({ name: event.target.value })
                      }
                      placeholder="Client full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="client-address">Client Address</Label>
                    <textarea
                      id="client-address"
                      value={fromAddressLines(draft.clientDetails.addressLines)}
                      onChange={(event) =>
                        updateClientDetails({
                          addressLines: toAddressLines(event.target.value),
                        })
                      }
                      rows={3}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                      placeholder="One line per row"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="client-phone">Contact Number</Label>
                      <Input
                        id="client-phone"
                        value={draft.clientDetails.contactNumber}
                        onChange={(event) =>
                          updateClientDetails({ contactNumber: event.target.value })
                        }
                        placeholder="07..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="client-email">Client Email</Label>
                      <Input
                        id="client-email"
                        type="email"
                        value={draft.clientDetails.email}
                        onChange={(event) =>
                          updateClientDetails({ email: event.target.value })
                        }
                        placeholder="client@example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="client-details">Additional Details (Optional)</Label>
                    <textarea
                      id="client-details"
                      value={draft.clientDetails.additionalDetails}
                      onChange={(event) =>
                        updateClientDetails({ additionalDetails: event.target.value })
                      }
                      rows={2}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                      placeholder="PO number, preferred contact window, etc."
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="vehicle-model">Vehicle Make / Model</Label>
                      <Input
                        id="vehicle-model"
                        value={draft.vehicleDetails.makeModel}
                        onChange={(event) =>
                          updateVehicleDetails({ makeModel: event.target.value })
                        }
                        placeholder="Ford Focus"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="vehicle-reg">Registration</Label>
                      <Input
                        id="vehicle-reg"
                        value={draft.vehicleDetails.registration}
                        onChange={(event) =>
                          updateVehicleDetails({
                            registration: event.target.value.toUpperCase(),
                          })
                        }
                        placeholder="AB12 CDE"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vehicle-mileage">Mileage (Optional)</Label>
                    <Input
                      id="vehicle-mileage"
                      value={draft.vehicleDetails.mileage}
                      onChange={(event) =>
                        updateVehicleDetails({ mileage: event.target.value })
                      }
                      placeholder="89,120"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white text-slate-900">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle>Document Meta</CardTitle>
                  <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={draft.includeDocumentMeta}
                      onChange={(e) =>
                        updateDraft((prev) => ({
                          ...prev,
                          includeDocumentMeta: e.target.checked,
                        }))
                      }
                      className="h-4 w-4 rounded border-slate-300"
                      aria-label="Include document meta on PDF"
                    />
                    Include on PDF
                  </label>
                </CardHeader>
                <CardContent
                  className={`space-y-4 transition-opacity ${
                    draft.includeDocumentMeta ? "opacity-100" : "pointer-events-none opacity-50"
                  }`}
                >
                  <div className="space-y-2">
                    <Label htmlFor="doc-type">Document Type</Label>
                    <select
                      id="doc-type"
                      value={draft.documentMeta.docType}
                      onChange={(event) =>
                        updateDocumentMeta({
                          docType: event.target.value as GarageEstimateDraft["documentMeta"]["docType"],
                        })
                      }
                      disabled={!draft.includeDocumentMeta}
                      className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm shadow-sm outline-none transition focus:border-slate-500 focus:ring-1 focus:ring-slate-500 disabled:cursor-not-allowed"
                    >
                      <option value="Estimate">Estimate</option>
                      <option value="Invoice">Invoice</option>
                    </select>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="doc-prefix">Number Prefix</Label>
                      <Input
                        id="doc-prefix"
                        value={draft.documentMeta.docNumberPrefix}
                        onChange={(event) =>
                          updateDocumentMeta({
                            docNumberPrefix: event.target.value.toUpperCase(),
                          })
                        }
                        placeholder="ABC"
                        disabled={!draft.includeDocumentMeta}
                        className="disabled:cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="doc-number">Number</Label>
                      <Input
                        id="doc-number"
                        type="number"
                        min={1}
                        step={1}
                        value={draft.documentMeta.docNumber}
                        onChange={(event) =>
                          updateDocumentMeta({
                            docNumber: parseNumberInput(event.target.value, 1),
                          })
                        }
                        onBlur={() =>
                          updateDocumentMeta({
                            docNumber: Math.max(
                              1,
                              Math.floor(draft.documentMeta.docNumber || 1)
                            ),
                          })
                        }
                        disabled={!draft.includeDocumentMeta}
                        className="disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="issue-date">Issue Date</Label>
                    <Input
                      id="issue-date"
                      type="text"
                      value={draft.documentMeta.issueDate}
                      onChange={(event) =>
                        updateDocumentMeta({ issueDate: event.target.value })
                      }
                      onBlur={() => {
                        const current = draft.documentMeta.issueDate.trim();
                        if (!current) {
                          updateDocumentMeta({ issueDate: getTodayDDMMYYYY() });
                          return;
                        }
                        if (!isValidDDMMYYYY(current)) {
                          updateDocumentMeta({ issueDate: formatDateToDDMMYYYY(new Date()) });
                        } else {
                          updateDocumentMeta({ issueDate: normalizeDDMMYYYY(current) });
                        }
                      }}
                      placeholder="dd-mm-yyyy"
                      disabled={!draft.includeDocumentMeta}
                      className="disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="doc-reference">Reference</Label>
                    <Input
                      id="doc-reference"
                      value={draft.documentMeta.reference}
                      onChange={(event) =>
                        updateDocumentMeta({ reference: event.target.value })
                      }
                      placeholder="MOT + front brakes"
                      disabled={!draft.includeDocumentMeta}
                      className="disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                    Currency is fixed to GBP (£).
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-slate-200 bg-white text-slate-900">
              <CardContent className="pt-6">
                <LineItemsTable
                  lineItems={draft.lineItems}
                  lineItemErrors={lineItemErrors}
                  onAddLineItem={onAddLineItem}
                  onClearAllLineItems={onClearAllLineItems}
                  onRemoveLineItem={onRemoveLineItem}
                  onMoveLineItem={onMoveLineItem}
                  onChangeLineItem={onChangeLineItem}
                  onClampLineItem={onClampLineItem}
                />
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white text-slate-900">
              <CardHeader>
                <CardTitle>Notes / Terms</CardTitle>
                <CardDescription>
                  Included at the bottom of the PDF.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <textarea
                  id="notes-terms"
                  value={draft.notesTerms}
                  onChange={(event) => updateDraft((previous) => ({
                    ...previous,
                    notesTerms: event.target.value,
                  }))}
                  rows={4}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                  placeholder="Estimate valid for 14 days..."
                />
              </CardContent>
            </Card>

            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
              <Button
                type="button"
                className="gap-2"
                onClick={() => handleGeneratePdf("download")}
                disabled={isPdfBusy}
              >
                <Download className="h-4 w-4" />
                {isPdfBusy ? "Generating PDF..." : "Download PDF"}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={() => handleGeneratePdf("preview")}
                disabled={isPdfBusy}
              >
                <Eye className="h-4 w-4" />
                Preview PDF
              </Button>

              <div className="text-sm text-slate-500">
                {validationCount > 0
                  ? `${validationCount} validation warning${validationCount > 1 ? "s" : ""}. Values are clamped on blur/PDF generation.`
                  : "All line values are valid."}
              </div>
            </div>
          </div>

           <div className="lg:sticky lg:top-32 lg:self-start">
            <TotalsPanel
              totals={totals}
              shipping={draft.charges.shipping}
              shippingError={shippingError}
              onShippingChange={(value) =>
                updateDraft((previous) => ({
                  ...previous,
                  charges: {
                    ...previous.charges,
                    shipping: value,
                  },
                }))
              }
              onShippingBlur={onClampShipping}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
