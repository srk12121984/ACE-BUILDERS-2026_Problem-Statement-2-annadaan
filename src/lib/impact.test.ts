import { describe, it, expect } from "vitest";
import { impactTotals } from "./impact";

describe("impactTotals", () => {
  it("counts only Delivered listings", () => {
    const totals = impactTotals([
      { status: "Delivered", deliveredKg: 4 },
      { status: "Delivered", deliveredKg: 6 },
      { status: "Expired", deliveredKg: 20 },
      { status: "Cancelled", deliveredKg: 9 },
      { status: "Posted" },
    ]);
    expect(totals.kg).toBe(10);
    expect(totals.deliveries).toBe(2);
    expect(totals.meals).toBe(25);
  });
});
