import { describe, it, expect } from "vitest";
import {
  DISCLAIMER,
  containsBannedClaims,
  isDonorVerified,
  consumeBy,
  isUnrescuable,
  filterCandidates,
  type Listing,
  type Receiver,
} from "./rules";

const now = new Date("2026-01-01T10:00:00Z");
const preparedAt = new Date("2026-01-01T09:50:00Z");
const pickupBy = new Date("2026-01-01T12:00:00Z");

function makeListing(overrides: Partial<Listing> = {}): Listing {
  return {
    id: "L1",
    quantity: 10,
    storage: "room",
    preparedAt,
    pickupBy,
    zone: "Patia",
    allergens: ["peanut"],
    etaMinutes: 20,
    ...overrides,
  };
}

function makeReceiver(overrides: Partial<Receiver> = {}): Receiver {
  return {
    id: "R1",
    registered: true,
    zone: "Saheed Nagar",
    needKg: 8,
    avoidAllergens: [],
    ...overrides,
  };
}

describe("DISCLAIMER", () => {
  it("equals the required text", () => {
    expect(DISCLAIMER).toBe("Not certified safe — follow handling guidance.");
  });
});

describe("containsBannedClaims", () => {
  it("flags banned claims case-insensitively", () => {
    expect(containsBannedClaims("This is CERTIFIED SAFE food")).toBe(true);
    expect(containsBannedClaims("gives a tax benefit")).toBe(true);
  });

  it("passes ordinary text", () => {
    expect(containsBannedClaims("fresh rice")).toBe(false);
  });

  it("does not flag the exact disclaimer text", () => {
    expect(containsBannedClaims(DISCLAIMER)).toBe(false);
  });

  it("flags banned wording outside the disclaimer", () => {
    expect(containsBannedClaims("this food is certified safe")).toBe(true);
  });
});

describe("isDonorVerified", () => {
  it("accepts a valid, unexpired seed licence", () => {
    expect(isDonorVerified({ id: "d1", licence: "FAKE-0001" }, new Date("2026-01-01"))).toBe(true);
  });

  it("rejects a donor with no licence", () => {
    expect(isDonorVerified({ id: "d1", licence: null }, new Date("2026-01-01"))).toBe(false);
  });

  it("rejects an unknown licence number", () => {
    expect(isDonorVerified({ id: "d1", licence: "FAKE-9999" }, new Date("2026-01-01"))).toBe(false);
  });

  it("rejects an expired licence", () => {
    expect(isDonorVerified({ id: "d1", licence: "FAKE-0002" }, new Date("2026-01-01"))).toBe(false);
  });
});

describe("consumeBy", () => {
  it("returns the storage limit when it is earlier than pickupBy", () => {
    const result = consumeBy(preparedAt, "room", new Date("2026-01-01T12:00:00Z"));
    expect(result.toISOString()).toBe("2026-01-01T11:50:00.000Z");
  });

  it("returns pickupBy when it is earlier than the storage limit", () => {
    const result = consumeBy(preparedAt, "chilled", new Date("2026-01-01T12:00:00Z"));
    expect(result.toISOString()).toBe("2026-01-01T12:00:00.000Z");
  });
});

describe("isUnrescuable", () => {
  it("is true when the deadline is 10 minutes away", () => {
    const deadline = new Date(now.getTime() + 10 * 60 * 1000);
    expect(isUnrescuable(deadline, now)).toBe(true);
  });

  it("is false when the deadline is 2 hours away", () => {
    const deadline = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    expect(isUnrescuable(deadline, now)).toBe(false);
  });
});

describe("filterCandidates", () => {
  it("excludes an unregistered receiver", () => {
    const result = filterCandidates(makeListing(), [makeReceiver({ registered: false })], now);
    expect(result).toEqual([]);
  });

  it("excludes a receiver in Rasulgarh (distance 9 km from Patia)", () => {
    const result = filterCandidates(makeListing(), [makeReceiver({ zone: "Rasulgarh" })], now);
    expect(result).toEqual([]);
  });

  it("excludes a receiver that avoids a listed allergen", () => {
    const result = filterCandidates(
      makeListing(),
      [makeReceiver({ avoidAllergens: ["peanut"] })],
      now,
    );
    expect(result).toEqual([]);
  });

  it("yields no matches when an allergen is empty", () => {
    const result = filterCandidates(makeListing({ allergens: [""] }), [makeReceiver()], now);
    expect(result).toEqual([]);
  });

  it("excludes a receiver needing under 50% of the quantity", () => {
    const result = filterCandidates(makeListing(), [makeReceiver({ needKg: 4 })], now);
    expect(result).toEqual([]);
  });

  it("returns a fine receiver with a reason containing 'km'", () => {
    const result = filterCandidates(makeListing(), [makeReceiver({ needKg: 8 })], now);
    expect(result).toHaveLength(1);
    expect(result[0].receiverId).toBe("R1");
    expect(result[0].reason.length).toBeGreaterThan(0);
    expect(result[0].reason).toContain("km");
  });

  it("sorts survivors by score descending", () => {
    const result = filterCandidates(
      makeListing(),
      [
        makeReceiver({ id: "R8", needKg: 8 }),
        makeReceiver({ id: "R10", needKg: 10 }),
      ],
      now,
    );
    expect(result).toHaveLength(2);
    expect(result[0].score).toBeGreaterThanOrEqual(result[1].score);
  });
});
