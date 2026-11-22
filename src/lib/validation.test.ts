import { describe, it, expect } from "vitest";
import { validateDonorInput } from "./validation";

const now = new Date("2026-01-01T10:00:00Z");

const valid = {
  quantity: 10,
  preparedAt: new Date("2026-01-01T09:50:00Z"),
  pickupBy: new Date("2026-01-01T12:00:00Z"),
};

describe("validateDonorInput", () => {
  it("rejects zero quantity", () => {
    expect(validateDonorInput({ ...valid, quantity: 0 }, now)).toBe("Quantity must be more than 0 kg.");
  });

  it("rejects a pickup-by in the past", () => {
    expect(validateDonorInput({ ...valid, pickupBy: new Date("2026-01-01T09:00:00Z") }, now)).toBe(
      "Pickup-by must be in the future.",
    );
  });

  it("rejects a prepared-at in the future", () => {
    expect(validateDonorInput({ ...valid, preparedAt: new Date("2026-01-01T11:00:00Z") }, now)).toBe(
      "Prepared-at cannot be in the future.",
    );
  });

  it("accepts valid input", () => {
    expect(validateDonorInput(valid, now)).toBeNull();
  });
});
