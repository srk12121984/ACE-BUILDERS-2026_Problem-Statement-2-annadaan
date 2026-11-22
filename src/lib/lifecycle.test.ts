import { describe, it, expect } from "vitest";
import { canTransition, transition, handoverCode, checkHandoverCode, type Stateful } from "./lifecycle";

function makeListing(): Stateful & { id: string } {
  return { id: "L1", status: "Posted", history: [] };
}

describe("canTransition", () => {
  it("rejects Posted to Claimed", () => {
    expect(canTransition("Posted", "Claimed")).toBe(false);
  });

  it("allows Posted to Offered", () => {
    expect(canTransition("Posted", "Offered")).toBe(true);
  });
});

describe("transition", () => {
  it("throws for Posted to Delivered", () => {
    expect(() => transition(makeListing(), "Delivered", "System", new Date("2026-01-01T10:00:00Z"))).toThrow();
  });

  it("completes the happy path with four history entries", () => {
    const now = new Date("2026-01-01T10:00:00Z");
    let listing = makeListing();
    listing = transition(listing, "Offered", "Donor", now);
    listing = transition(listing, "Claimed", "Receiver", now);
    listing = transition(listing, "Collected", "Volunteer", now);
    listing = transition(listing, "Delivered", "Volunteer", now);

    expect(listing.status).toBe("Delivered");
    expect(listing.history).toHaveLength(4);
    expect(listing.history[0]).toMatchObject({ role: "Donor", from: "Posted", to: "Offered" });
    expect(listing.history[3]).toMatchObject({ role: "Volunteer", from: "Collected", to: "Delivered" });
    expect(listing.history[3].at).toBe(now.toISOString());
  });

  it("treats Expired as terminal", () => {
    const expired = { id: "L1", status: "Expired" as const, history: [] };
    expect(() => transition(expired, "Posted", "System", new Date())).toThrow();
  });

  it("treats Cancelled as terminal", () => {
    const cancelled = { id: "L1", status: "Cancelled" as const, history: [] };
    expect(() => transition(cancelled, "Posted", "System", new Date())).toThrow();
  });
});

describe("handoverCode", () => {
  it("returns four digits", () => {
    expect(handoverCode("L1")).toMatch(/^\d{4}$/);
    expect(handoverCode("expired-01")).toMatch(/^\d{4}$/);
  });
});

describe("checkHandoverCode", () => {
  it("accepts the matching code", () => {
    expect(checkHandoverCode("L1", handoverCode("L1"))).toBe(true);
  });

  it("rejects a wrong code", () => {
    expect(checkHandoverCode("L1", "wrong")).toBe(false);
  });
});
