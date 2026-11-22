import { describe, it, expect } from "vitest";
import { clockToday, draftToFormValues, statedKg } from "../../src/lib/aiFill";
import { clockInText, groundDraft, normalizeClock, validateDraft, type ParsedDraft } from "../../src/lib/intake";

// 19:30 local time on Nov 22, 2026
const NOW = new Date(2026, 10, 22, 19, 30);

const base: ParsedDraft = {
  items: [],
  totalKg: null,
  preparedAt: null,
  pickupBy: null,
  storage: null,
  allergens: null,
  missing: [],
  injectionDetected: false,
};

describe("times: clock only, date decided in code", () => {
  it("drops any date the model adds and keeps only HH:MM", () => {
    expect(normalizeClock("2024-05-23T22:30:00")).toBe("22:30");
    expect(normalizeClock("21:30")).toBe("21:30");
    expect(normalizeClock("tonight")).toBeNull();
    expect(normalizeClock("25:00")).toBeNull();
  });

  it("validateDraft turns a dated value into a clock time", () => {
    const raw = { ...base, pickupBy: "2024-05-23T22:30:00" };
    expect(validateDraft(raw)?.pickupBy).toBe("22:30");
  });

  it("matches 12-hour donor wording and rejects the wrong am/pm", () => {
    expect(clockInText("23:00", "pickup by 11 pm")).toBe(true);
    expect(clockInText("11:00", "pickup by 11 pm")).toBe(false);
    expect(clockInText("21:30", "ready at 9:30 pm")).toBe(true);
    expect(clockInText("22:30", "pickup before 10:30 pm")).toBe(true);
    expect(clockInText("20:00", "50 plates rice")).toBe(false);
  });

  it("groundDraft drops a time the donor never wrote", () => {
    const { draft } = groundDraft({ ...base, pickupBy: "20:00" }, "50 plates rice");
    expect(draft.pickupBy).toBeNull();
    expect(draft.missing).toContain("pickupBy");
  });

  it("puts the clock time on today's date", () => {
    const d = clockToday("23:00", NOW);
    expect([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes()]).toEqual([2026, 10, 22, 23, 0]);
  });

  it("fills a future pickup time and a past prepared time for today", () => {
    const v = draftToFormValues({ ...base, preparedAt: "18:30", pickupBy: "23:00" }, NOW);
    expect(v.preparedAt).toBe("2026-11-22T18:30");
    expect(v.pickupBy).toBe("2026-11-22T23:00");
  });

  it("leaves a pickup time that has already passed empty and says why", () => {
    const v = draftToFormValues({ ...base, pickupBy: "18:00" }, NOW);
    expect(v.pickupBy).toBe("");
    expect(v.missing.join(" ")).toMatch(/already passed/);
  });

  it("leaves a prepared time later than now empty and says why", () => {
    const v = draftToFormValues({ ...base, preparedAt: "21:30" }, NOW);
    expect(v.preparedAt).toBe("");
    expect(v.missing.join(" ")).toMatch(/later than now/);
  });
});

describe("each AI fill resets the form", () => {
  it("returns empty values for everything the draft does not state", () => {
    const v = draftToFormValues({ ...base, items: [{ name: "rice", quantity: 20, unit: "kg" }], totalKg: 20 }, NOW);
    expect(v).toMatchObject({ quantity: "20", storage: "", preparedAt: "", pickupBy: "", allergens: "" });
    expect(v.aiFilled).toEqual({ quantity: true });
  });

  it("never carries allergens over when the new draft has none", () => {
    const v = draftToFormValues({ ...base, allergens: null }, NOW);
    expect(v.allergens).toBe("");
    expect(v.aiFilled.allergens).toBeUndefined();
  });
});

describe("quantity: no default, no unit conversion", () => {
  it("leaves quantity empty and asks for kg when only plates or litres are given", () => {
    const draft: ParsedDraft = {
      ...base,
      items: [
        { name: "chicken biryani", quantity: 40, unit: "plate" },
        { name: "kheer", quantity: 5, unit: "litre" },
      ],
    };
    const v = draftToFormValues(draft, NOW);
    expect(v.quantity).toBe("");
    expect(v.missing.join(" ")).toMatch(/total kg/);
  });

  it("sums items only when every item is stated in kg", () => {
    expect(statedKg({ ...base, items: [{ name: "dalma", quantity: 8, unit: "kg" }, { name: "rice", quantity: 12, unit: "kg" }] })).toBe(20);
    expect(statedKg({ ...base, items: [{ name: "dalma", quantity: 8, unit: "kg" }, { name: "paneer", quantity: 2, unit: null }] })).toBeNull();
  });
});
