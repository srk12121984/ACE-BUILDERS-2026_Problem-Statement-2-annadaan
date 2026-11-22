import type { ParsedDraft } from "./intake";
import type { Storage } from "./rules";

export type AiFilled = {
  quantity?: boolean;
  storage?: boolean;
  pickupBy?: boolean;
  preparedAt?: boolean;
  allergens?: boolean;
};

// Only fields the draft actually states are set; anything else stays undefined.
export type FormValues = {
  quantity?: string;
  storage?: Storage;
  pickupBy?: string;
  preparedAt?: string;
  allergens?: string;
  aiFilled: AiFilled;
  missing: string[];
};

// Formats a Date as the local 'YYYY-MM-DDTHH:mm' string a datetime-local input expects.
export function toLocalInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Maps a validated AI draft onto form values. Never invents a value the draft did not give.
export function draftToFormValues(draft: ParsedDraft): FormValues {
  const aiFilled: AiFilled = {};
  const out: FormValues = { aiFilled, missing: [...draft.missing] };
  if (draft.totalKg !== null) {
    out.quantity = String(draft.totalKg);
    aiFilled.quantity = true;
  }
  if (draft.storage !== null) {
    out.storage = draft.storage;
    aiFilled.storage = true;
  }
  if (draft.pickupBy !== null) {
    out.pickupBy = toLocalInput(new Date(draft.pickupBy));
    aiFilled.pickupBy = true;
  }
  if (draft.preparedAt !== null) {
    out.preparedAt = toLocalInput(new Date(draft.preparedAt));
    aiFilled.preparedAt = true;
  }
  if (draft.allergens !== null) {
    out.allergens = draft.allergens.join(", ");
    aiFilled.allergens = true;
  }
  return out;
}
