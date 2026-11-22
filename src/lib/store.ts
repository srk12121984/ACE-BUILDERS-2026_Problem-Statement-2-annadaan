import { useEffect, useState } from "react";
import { SEED } from "../data/seed";
import { checkHandoverCode, transition, type HistoryEntry, type Role, type Status } from "./lifecycle";
import { nextOffer } from "./matching";
import { consumeBy, filterCandidates, type Listing, type Receiver, type Storage } from "./rules";

export type AppListing = {
  id: string;
  donorName: string;
  donorId: string;
  zone: string;
  quantity: number;
  storage: Storage;
  preparedAt: string;
  pickupBy: string;
  allergens: string[];
  etaMinutes: number;
  status: Status;
  history: HistoryEntry[];
  offeredTo: string[];
  claimedBy?: string;
  deliveredKg?: number;
  offerReason?: string | null;
  noMatchReason?: string;
  assignedVolunteer?: string;
};

export type DemoState = { listings: AppListing[] };

export const VOLUNTEERS = ["Volunteer 01", "Volunteer 02", "Volunteer 03"];

const NO_MATCH_REASON =
  "No eligible receiver yet: no registered receiver within 8 km with enough capacity and no allergen conflict";

export type PostInput = {
  id: string;
  donorName: string;
  donorId: string;
  zone: string;
  quantity: number;
  storage: Storage;
  preparedAt: string;
  pickupBy: string;
  allergens: string[];
  etaMinutes: number;
};

type Result = { state: DemoState; error?: string; message?: string };
type ActionReply = { error?: string; message?: string } | null;

const KEY = "annadaan-demo-v1";
const LIVE: Status[] = ["Posted", "Offered", "Claimed", "Collected"];

export function seedState(): DemoState {
  const listings: AppListing[] = SEED.expiredListings.map((l) => ({
    id: l.id,
    donorName: l.donorName,
    donorId: SEED.caterers.find((c) => c.name === l.donorName)?.id ?? "unknown",
    zone: l.zone,
    quantity: l.quantity,
    storage: l.storage,
    preparedAt: l.preparedAt.toISOString(),
    pickupBy: l.pickupBy.toISOString(),
    allergens: l.allergens,
    etaMinutes: l.etaMinutes,
    status: "Expired",
    history: [],
    offeredTo: [],
  }));
  return { listings };
}

export function loadState(): DemoState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DemoState;
      if (Array.isArray(parsed?.listings)) return parsed;
    }
  } catch {
    // storage unavailable or corrupt: fall back to seed data
  }
  return seedState();
}

export function saveState(state: DemoState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // storage unavailable: state stays in memory only
  }
}

export function resetState(): DemoState {
  const s = seedState();
  saveState(s);
  return s;
}

export function toListing(l: AppListing): Listing {
  return {
    id: l.id,
    quantity: l.quantity,
    storage: l.storage,
    preparedAt: new Date(l.preparedAt),
    pickupBy: new Date(l.pickupBy),
    zone: l.zone,
    allergens: l.allergens,
    etaMinutes: l.etaMinutes,
  };
}

export function toReceivers(): Receiver[] {
  return SEED.receivers.map((r) => ({ ...r }));
}

function replaceListing(state: DemoState, updated: AppListing): DemoState {
  return { listings: state.listings.map((l) => (l.id === updated.id ? updated : l)) };
}

function moveTo(
  l: AppListing,
  to: Status,
  role: Role,
  now: Date,
  extra: Partial<AppListing> = {},
): AppListing {
  return { ...transition(l, to, role, now), ...extra };
}

// Applies one status change; on any throw the state is returned unchanged with the error message.
function step(state: DemoState, listingId: string, change: (l: AppListing) => AppListing): Result {
  const l = state.listings.find((x) => x.id === listingId);
  if (!l) return { state, error: "Listing not found." };
  try {
    return { state: replaceListing(state, change(l)) };
  } catch (e) {
    return { state, error: e instanceof Error ? e.message : String(e) };
  }
}

function find(state: DemoState, listingId: string): AppListing | undefined {
  return state.listings.find((x) => x.id === listingId);
}

// Offers a Posted listing to the best candidate not yet offered to. Otherwise keeps it Posted with a reason.
export function autoOffer(state: DemoState, listingId: string, now: Date): DemoState {
  const l = find(state, listingId);
  if (!l || l.status !== "Posted") return state;
  const candidates = filterCandidates(toListing(l), toReceivers(), now);
  const top = candidates.find((c) => !l.offeredTo.includes(c.receiverId));
  if (!top) {
    return replaceListing(state, { ...l, offerReason: null, noMatchReason: NO_MATCH_REASON });
  }
  try {
    const next = moveTo(l, "Offered", "System", now, {
      offeredTo: [...l.offeredTo, top.receiverId],
      offerReason: top.reason,
      noMatchReason: undefined,
    });
    return replaceListing(state, next);
  } catch {
    return state;
  }
}

export function postListing(state: DemoState, input: PostInput, now: Date): Result {
  const listing: AppListing = { ...input, status: "Posted", history: [], offeredTo: [] };
  const next: DemoState = { listings: [...state.listings, listing] };
  return { state: autoOffer(next, input.id, now) };
}

export function offer(state: DemoState, listingId: string, now: Date): Result {
  const l = find(state, listingId);
  if (!l) return { state, error: "Listing not found." };
  const candidate = nextOffer(toListing(l), toReceivers(), now, l.offeredTo);
  if (!candidate) return { state, error: "No matching receiver right now" };
  if (l.status === "Offered") return { state, message: candidate.reason };
  return step(state, listingId, (x) => moveTo(x, "Offered", "System", now));
}

export function decline(state: DemoState, listingId: string, receiverId: string, now: Date): Result {
  const r = step(state, listingId, (x) =>
    moveTo(x, "Posted", "Receiver", now, {
      offeredTo: x.offeredTo.includes(receiverId) ? x.offeredTo : [...x.offeredTo, receiverId],
    }),
  );
  if (r.error) return r;
  return { state: autoOffer(r.state, listingId, now) };
}

// Stable volunteer pick: sum of the listing id's char codes, modulo the volunteer count.
function volunteerFor(listingId: string): string {
  let sum = 0;
  for (let i = 0; i < listingId.length; i++) sum += listingId.charCodeAt(i);
  return VOLUNTEERS[sum % VOLUNTEERS.length];
}

export function claim(state: DemoState, listingId: string, receiverId: string, now: Date): Result {
  return step(state, listingId, (x) =>
    moveTo(x, "Claimed", "Receiver", now, { claimedBy: receiverId, assignedVolunteer: volunteerFor(x.id) }),
  );
}

export function collect(state: DemoState, listingId: string, enteredCode: string, now: Date): Result {
  if (!checkHandoverCode(listingId, enteredCode)) {
    return { state, error: "Handover code does not match." };
  }
  return step(state, listingId, (x) => moveTo(x, "Collected", "Volunteer", now));
}

export function deliver(state: DemoState, listingId: string, kg: number, now: Date): Result {
  if (!(Number.isFinite(kg) && kg > 0)) return { state, error: "Enter the kg received." };
  return step(state, listingId, (x) => moveTo(x, "Delivered", "Receiver", now, { deliveredKg: kg }));
}

export function cancel(state: DemoState, listingId: string, role: Role, now: Date): Result {
  return step(state, listingId, (x) => moveTo(x, "Cancelled", role, now));
}

export function expireDue(state: DemoState, now: Date): DemoState {
  let s = state;
  for (const l of state.listings) {
    if (!LIVE.includes(l.status)) continue;
    const deadline = consumeBy(new Date(l.preparedAt), l.storage, new Date(l.pickupBy));
    if (deadline.getTime() <= now.getTime()) {
      s = step(s, l.id, (x) => moveTo(x, "Expired", "System", now)).state;
    }
  }
  return s;
}

export function useDemoStore() {
  const [state, setState] = useState<DemoState>(() => loadState());
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    const id = setInterval(() => {
      const t = new Date();
      setNow(t);
      setState((s) => expireDue(s, t));
    }, 30000);
    return () => clearInterval(id);
  }, []);

  function run(r: Result): ActionReply {
    setState(r.state);
    return { error: r.error, message: r.message };
  }

  return {
    state,
    now,
    post: (input: PostInput): ActionReply => run(postListing(state, input, new Date())),
    offer: (id: string): ActionReply => run(offer(state, id, new Date())),
    decline: (id: string, receiverId: string): ActionReply => run(decline(state, id, receiverId, new Date())),
    claim: (id: string, receiverId: string): ActionReply => run(claim(state, id, receiverId, new Date())),
    collect: (id: string, code: string): ActionReply => run(collect(state, id, code, new Date())),
    deliver: (id: string, kg: number): ActionReply => run(deliver(state, id, kg, new Date())),
    cancel: (id: string, role: Role): ActionReply => run(cancel(state, id, role, new Date())),
    reset: (): ActionReply => {
      setState(resetState());
      return null;
    },
  };
}
