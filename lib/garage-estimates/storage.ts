import { GARAGE_DRAFT_STORAGE_KEY } from "./constants";
import { normalizeGarageDraft } from "./draft";
import { GarageEstimateDraft } from "./types";

export const loadDraftFromStorage = (): GarageEstimateDraft | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(GARAGE_DRAFT_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    return normalizeGarageDraft(JSON.parse(raw));
  } catch {
    return null;
  }
};

export const saveDraftToStorage = (draft: GarageEstimateDraft): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      GARAGE_DRAFT_STORAGE_KEY,
      JSON.stringify(draft)
    );
  } catch {
    // Ignore storage write failures (private mode, quota, etc.)
  }
};

export const clearDraftFromStorage = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(GARAGE_DRAFT_STORAGE_KEY);
  } catch {
    // Ignore storage cleanup failures.
  }
};
