import { describe, it, expect } from "vitest";
import { seedState, postListing, decline, claim, collect, deliver, type AppListing, type DemoState } from "./store";
import { handoverCode } from "./lifecycle";
import { impactTotals } from "./impact";

const now = new Date("2026-01-01T10:00:00Z");

function getListing(state: DemoState, id: string): AppListing {
  const found = state.listings.find((l) => l.id === id);
  if (!found) throw new Error(`missing listing ${id}`);
  return found;
}

describe("store end-to-end (pure functions)", () => {
  it("auto-offers a 10 kg listing and runs it through decline, claim, collect and deliver", () => {
    const id = "e2e-1";
    let s = postListing(
      seedState(),
      {
        id,
        donorName: "Demo Caterer 01",
        donorId: "caterer-01",
        zone: "Patia",
        quantity: 10,
        storage: "chilled",
        preparedAt: now.toISOString(),
        pickupBy: "2026-01-01T13:00:00Z",
        allergens: [],
        etaMinutes: 20,
      },
      now,
    ).state;

    // a. auto-offered on post
    let l = getListing(s, id);
    expect(l.status).toBe("Offered");
    expect(l.offeredTo).toHaveLength(1);
    expect(l.offerReason).toBeTruthy();
    const firstId = l.offeredTo[0];

    // b. decline moves to the next receiver
    s = decline(s, id, firstId, now).state;
    l = getListing(s, id);
    expect(l.status).toBe("Offered");
    expect(l.offeredTo).toHaveLength(2);
    const secondId = l.offeredTo[1];
    expect(secondId).not.toBe(firstId);

    // c. claim by the currently offered receiver
    s = claim(s, id, secondId, now).state;
    l = getListing(s, id);
    expect(l.status).toBe("Claimed");
    expect(l.assignedVolunteer).toBeTruthy();

    // d. wrong handover code is rejected and status is unchanged
    const wrong = collect(s, id, "wrong", now);
    expect(wrong.error).toBe("Handover code does not match.");
    s = wrong.state;
    expect(getListing(s, id).status).toBe("Claimed");

    // e. correct handover code collects
    s = collect(s, id, handoverCode(id), now).state;
    expect(getListing(s, id).status).toBe("Collected");

    // f. delivery records kg
    s = deliver(s, id, 10, now).state;
    l = getListing(s, id);
    expect(l.status).toBe("Delivered");
    expect(l.deliveredKg).toBe(10);

    // g. impact totals
    const totals = impactTotals(s.listings);
    expect(totals.kg).toBe(10);
    expect(totals.meals).toBe(25);
  });

  it("40 kg dairy listing ends either Offered with a reason or Posted with a no-match reason, never neither", () => {
    const s = postListing(
      seedState(),
      {
        id: "e2e-2",
        donorName: "Demo Caterer 01",
        donorId: "caterer-01",
        zone: "Patia",
        quantity: 40,
        storage: "chilled",
        preparedAt: now.toISOString(),
        pickupBy: "2026-01-01T13:00:00Z",
        allergens: ["dairy"],
        etaMinutes: 20,
      },
      now,
    ).state;

    const l = getListing(s, "e2e-2");
    const offered = l.status === "Offered" && !!l.offerReason;
    const posted = l.status === "Posted" && !!l.noMatchReason;
    expect(offered !== posted).toBe(true);
  });
});
