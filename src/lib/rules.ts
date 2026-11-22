export const DISCLAIMER = "Not certified safe — follow handling guidance.";

const BANNED_CLAIMS = [
  "certified safe",
  "safe to eat",
  "guaranteed fresh",
  "tax benefit",
  "tax deduction",
  "80g",
  "legal protection",
];

export function containsBannedClaims(text: string): boolean {
  // Remove the exact disclaimer first so its own wording is not flagged.
  const lower = text.split(DISCLAIMER).join("").toLowerCase();
  return BANNED_CLAIMS.some((claim) => lower.includes(claim));
}

export type Licence = { number: string; expiresOn: string }; // ISO date 'YYYY-MM-DD'

export type Donor = { id: string; licence?: string | null };

// Synthetic demo data — not real FSSAI licences.
export const SEED_LICENCES: Record<string, Licence> = {
  "FAKE-0001": { number: "FAKE-0001", expiresOn: "2099-12-31" },
  "FAKE-0002": { number: "FAKE-0002", expiresOn: "2020-01-01" },
  "FAKE-0003": { number: "FAKE-0003", expiresOn: "2099-12-31" },
};

export function isDonorVerified(donor: Donor, today: Date): boolean {
  if (!donor.licence) return false;
  const licence = SEED_LICENCES[donor.licence];
  if (!licence) return false;
  const todayIso = today.toISOString().slice(0, 10);
  if (licence.expiresOn < todayIso) return false;
  return true;
}

export type Storage = "room" | "hot" | "chilled";

// DEMO VALUES — not food-safety guidance; to be replaced with cited FSSAI guidance
export const STORAGE_LIMITS_HOURS: Record<Storage, number> = {
  room: 2,
  hot: 4,
  chilled: 12,
};

export function consumeBy(preparedAt: Date, storage: Storage, pickupBy: Date): Date {
  const limit = preparedAt.getTime() + STORAGE_LIMITS_HOURS[storage] * 60 * 60 * 1000;
  return new Date(Math.min(pickupBy.getTime(), limit));
}

export function isUnrescuable(deadline: Date, now: Date): boolean {
  return deadline.getTime() - now.getTime() < 30 * 60 * 1000;
}

export type Listing = {
  id: string;
  quantity: number;
  storage: Storage;
  preparedAt: Date;
  pickupBy: Date;
  zone: string;
  allergens: string[];
  etaMinutes: number;
};

export type Receiver = {
  id: string;
  registered: boolean;
  zone: string;
  needKg: number;
  avoidAllergens: string[];
};

// Placeholder distances — not surveyed
export const ZONE_DISTANCE_KM: Record<string, Record<string, number>> = {
  Patia: { Patia: 0, Chandrasekharpur: 4, "Saheed Nagar": 6, Nayapalli: 5, "Jaydev Vihar": 5, Khandagiri: 7, "Old Town": 4, Rasulgarh: 9 },
  Chandrasekharpur: { Patia: 4, Chandrasekharpur: 0, "Saheed Nagar": 5, Nayapalli: 4, "Jaydev Vihar": 3, Khandagiri: 9, "Old Town": 6, Rasulgarh: 10 },
  "Saheed Nagar": { Patia: 6, Chandrasekharpur: 5, "Saheed Nagar": 0, Nayapalli: 3, "Jaydev Vihar": 4, Khandagiri: 8, "Old Town": 3, Rasulgarh: 8 },
  Nayapalli: { Patia: 5, Chandrasekharpur: 4, "Saheed Nagar": 3, Nayapalli: 0, "Jaydev Vihar": 2, Khandagiri: 7, "Old Town": 4, Rasulgarh: 9 },
  "Jaydev Vihar": { Patia: 5, Chandrasekharpur: 3, "Saheed Nagar": 4, Nayapalli: 2, "Jaydev Vihar": 0, Khandagiri: 6, "Old Town": 5, Rasulgarh: 8 },
  Khandagiri: { Patia: 7, Chandrasekharpur: 9, "Saheed Nagar": 8, Nayapalli: 7, "Jaydev Vihar": 6, Khandagiri: 0, "Old Town": 6, Rasulgarh: 3 },
  "Old Town": { Patia: 4, Chandrasekharpur: 6, "Saheed Nagar": 3, Nayapalli: 4, "Jaydev Vihar": 5, Khandagiri: 6, "Old Town": 0, Rasulgarh: 7 },
  Rasulgarh: { Patia: 9, Chandrasekharpur: 10, "Saheed Nagar": 8, Nayapalli: 9, "Jaydev Vihar": 8, Khandagiri: 3, "Old Town": 7, Rasulgarh: 0 },
};

export const DEFAULT_RADIUS_KM = 8;

export type Candidate = { receiverId: string; score: number; reason: string };

const MS_PER_MINUTE = 60 * 1000;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;

export function filterCandidates(listing: Listing, receivers: Receiver[], now: Date): Candidate[] {
  const deadline = consumeBy(listing.preparedAt, listing.storage, listing.pickupBy);
  const finishMs = now.getTime() + listing.etaMinutes * MS_PER_MINUTE + 15 * MS_PER_MINUTE;

  const survivors: Candidate[] = [];

  for (const receiver of receivers) {
    // (a) must be registered
    if (!receiver.registered) continue;

    // (b) must be within radius
    const distance = ZONE_DISTANCE_KM[listing.zone]?.[receiver.zone];
    if (distance === undefined || distance > DEFAULT_RADIUS_KM) continue;

    // (c) must need at least half the quantity
    if (receiver.needKg < listing.quantity * 0.5) continue;

    // (d) unknown or empty allergens are never treated as safe
    if (listing.allergens.some((a) => a === "" || a === "unknown")) continue;

    // (e) receiver must not avoid any listed allergen
    if (listing.allergens.some((a) => receiver.avoidAllergens.includes(a))) continue;

    // (f) must be deliverable before the consume-by deadline
    if (finishMs > deadline.getTime()) continue;

    const slackHours = Math.min((deadline.getTime() - finishMs) / MS_PER_HOUR, 10);
    const closeness = Math.max(0, 8 - distance);
    const need = Math.min(receiver.needKg / listing.quantity, 1) * 5;
    const score = slackHours + closeness + need;
    const reason = `Zone ${receiver.zone}, ${distance} km, ${receiver.needKg} kg needed, ${slackHours.toFixed(1)} h slack`;

    survivors.push({ receiverId: receiver.id, score, reason });
  }

  return survivors.sort((a, b) => b.score - a.score);
}
