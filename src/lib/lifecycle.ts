export type Status = "Posted" | "Offered" | "Claimed" | "Collected" | "Delivered" | "Expired" | "Cancelled";

export type Role = "Donor" | "Receiver" | "Volunteer" | "Sponsor" | "System";

export type HistoryEntry = { at: string; role: Role; from: Status; to: Status };

const ALLOWED: Record<Status, Status[]> = {
  Posted: ["Offered", "Cancelled", "Expired"],
  Offered: ["Posted", "Claimed", "Cancelled", "Expired"],
  Claimed: ["Collected", "Cancelled", "Expired"],
  Collected: ["Delivered", "Cancelled", "Expired"],
  Delivered: [],
  Expired: [],
  Cancelled: [],
};

export function canTransition(from: Status, to: Status): boolean {
  return ALLOWED[from].includes(to);
}

export type Stateful = { status: Status; history: HistoryEntry[] };

export function transition<T extends Stateful>(listing: T, to: Status, role: Role, now: Date): T {
  if (!canTransition(listing.status, to)) {
    throw new Error(`Invalid step: ${listing.status} to ${to}`);
  }
  return {
    ...listing,
    status: to,
    history: [...listing.history, { at: now.toISOString(), role, from: listing.status, to }],
  };
}

// Sum of each character code multiplied by its 1-based position, mod 10000, zero-padded to 4 digits.
export function handoverCode(listingId: string): string {
  let sum = 0;
  for (let i = 0; i < listingId.length; i++) {
    sum += listingId.charCodeAt(i) * (i + 1);
  }
  return String(sum % 10000).padStart(4, "0");
}

export function checkHandoverCode(listingId: string, entered: string): boolean {
  return entered.trim() === handoverCode(listingId);
}
