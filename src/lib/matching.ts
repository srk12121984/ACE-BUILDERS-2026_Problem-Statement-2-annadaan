import { filterCandidates, type Candidate, type Listing, type Receiver } from "./rules";

export function nextOffer(
  listing: Listing,
  receivers: Receiver[],
  now: Date,
  declinedIds: string[],
): Candidate | null {
  return filterCandidates(listing, receivers, now).find((c) => !declinedIds.includes(c.receiverId)) ?? null;
}
