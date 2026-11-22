import { describe, it, expect } from "vitest";
import { nextOffer } from "./matching";
import type { Listing, Receiver } from "./rules";

const now = new Date("2026-01-01T10:00:00Z");

const listing: Listing = {
  id: "L1",
  quantity: 10,
  storage: "chilled",
  preparedAt: new Date("2026-01-01T09:50:00Z"),
  pickupBy: new Date("2026-01-01T12:00:00Z"),
  zone: "Patia",
  allergens: ["wheat"],
  etaMinutes: 20,
};

const receivers: Receiver[] = [
  { id: "R8", registered: true, zone: "Patia", needKg: 8, avoidAllergens: [] },
  { id: "R12", registered: true, zone: "Patia", needKg: 12, avoidAllergens: [] },
];

describe("nextOffer", () => {
  it("returns a candidate when nothing is declined", () => {
    expect(nextOffer(listing, receivers, now, [])).not.toBeNull();
  });

  it("skips a declined receiver and offers the other", () => {
    const first = nextOffer(listing, receivers, now, []);
    expect(first).not.toBeNull();
    const second = nextOffer(listing, receivers, now, [first!.receiverId]);
    const otherId = first!.receiverId === "R8" ? "R12" : "R8";
    expect(second?.receiverId).toBe(otherId);
  });

  it("returns null when every receiver has declined", () => {
    expect(nextOffer(listing, receivers, now, ["R8", "R12"])).toBeNull();
  });
});
