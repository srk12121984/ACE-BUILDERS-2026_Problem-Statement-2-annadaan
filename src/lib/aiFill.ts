import type { ParsedDraft } from "./intake.js";
import type { Storage } from "./rules.js";

export type AiFilled = {
  quantity?: boolean;
  storage?: boolean;
  pickupBy?: boolean;
  preparedAt?: boolean;
  allergens?: boolean;
};

// Every AI-fillable field is always set: a value the draft states, or "" so nothing from an earlier
// fill or a form default is left behind. "" means the donor must fill it in.
export type FormValues = {
  quantity: string;
  storage: Storage | "";
  pickupBy: string;
  preparedAt: string;
  allergens: string;
  aiFilled: AiFilled;
  missing: string[];
};

const MISSING_LABELS: Record<string, string> = {
  totalKg: "total kg",
  preparedAt: "prepared time",
  pickupBy: "pickup time",
  storage: "storage",
  allergens: "allergens",
};

const KG_UNITS = new Set(["kg", "kgs", "kilo", "kilos", "kilogram", "kilograms"]);

// Formats a Date as the local 'YYYY-MM-DDTHH:mm' string a datetime-local input expects.
export function toLocalInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Puts an "HH:MM" clock time on today's date (the donor's local day). The model never supplies the date.
export function clockToday(clock: string, now: Date): Date {
  const [h, m] = clock.split(":").map(Number);
  const d = new Date(now);
  d.setHours(h, m, 0, 0);
  return d;
}

// Total kg only from what the donor stated: the stated total, or the sum when every item is given in kg.
export function statedKg(draft: ParsedDraft): number | null {
  if (draft.totalKg !== null) return draft.totalKg;
  if (draft.items.length === 0) return null;
  let sum = 0;
  for (const item of draft.items) {
    const unit = item.unit?.trim().toLowerCase() ?? "";
    if (item.quantity === null || !KG_UNITS.has(unit)) return null;
    sum += item.quantity;
  }
  return sum > 0 ? sum : null;
}

// Maps a validated AI draft onto form values. Never invents a value the draft did not give.
export function draftToFormValues(draft: ParsedDraft, now: Date = new Date()): FormValues {
  const aiFilled: AiFilled = {};
  const missing = new Set<string>();
  const out: FormValues = {
    quantity: "",
    storage: "",
    pickupBy: "",
    preparedAt: "",
    allergens: "",
    aiFilled,
    missing: [],
  };

  const kg = statedKg(draft);
  if (kg !== null) {
    out.quantity = String(kg);
    aiFilled.quantity = true;
  } else {
    missing.add("total kg — please enter the weight");
  }

  if (draft.storage !== null) {
    out.storage = draft.storage;
    aiFilled.storage = true;
  } else {
    missing.add("storage");
  }

  if (draft.preparedAt !== null) {
    const prepared = clockToday(draft.preparedAt, now);
    if (prepared.getTime() <= now.getTime()) {
      out.preparedAt = toLocalInput(prepared);
      aiFilled.preparedAt = true;
    } else {
      missing.add("prepared time (the time given is later than now)");
    }
  } else {
    missing.add("prepared time");
  }

  if (draft.pickupBy !== null) {
    const pickup = clockToday(draft.pickupBy, now);
    if (pickup.getTime() > now.getTime()) {
      out.pickupBy = toLocalInput(pickup);
      aiFilled.pickupBy = true;
    } else {
      missing.add("pickup time (the time given has already passed today)");
    }
  } else {
    missing.add("pickup time");
  }

  if (draft.allergens !== null && draft.allergens.length > 0) {
    out.allergens = draft.allergens.join(", ");
    aiFilled.allergens = true;
  }

  // Item names the model could not ground, reported as-is.
  for (const m of draft.missing) {
    if (m.startsWith("item: ")) missing.add(m);
  }

  out.missing = [...missing].map((m) => MISSING_LABELS[m] ?? m);
  return out;
}
