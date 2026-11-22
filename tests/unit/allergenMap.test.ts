import { describe, it, expect } from "vitest";
import { mapAllergens, unionAllergens } from "../../src/lib/allergenMap";

describe("mapAllergens", () => {
  it("maps milk keywords", () => {
    expect(mapAllergens("paneer butter masala")).toContain("milk");
    expect(mapAllergens("chhena poda")).toContain("milk");
    expect(mapAllergens("dahi")).toContain("milk");
  });

  it("maps nuts keywords", () => {
    expect(mapAllergens("kheer")).toContain("nuts");
    expect(mapAllergens("biryani")).toContain("nuts");
    expect(mapAllergens("ladoo")).toContain("nuts");
  });

  it("maps gluten keywords", () => {
    expect(mapAllergens("puri")).toContain("gluten");
    expect(mapAllergens("naan")).toContain("gluten");
    expect(mapAllergens("upma")).toContain("gluten");
  });

  it("matches whole words only", () => {
    expect(mapAllergens("purification")).not.toContain("gluten");
  });

  it("is case-insensitive", () => {
    expect(mapAllergens("PANEER")).toContain("milk");
  });

  it("returns an empty list when nothing matches", () => {
    expect(mapAllergens("dalma rice")).toEqual([]);
  });
});

describe("unionAllergens", () => {
  it("keeps AI allergens and reports mapped-only ones as possible", () => {
    const result = unionAllergens(["peanut"], ["milk"]);
    expect(result.allergens).toEqual(expect.arrayContaining(["peanut", "milk"]));
    expect(result.possible).toEqual(["milk"]);
  });

  it("keeps an AI allergen when nothing is mapped", () => {
    expect(unionAllergens(["milk"], []).allergens).toContain("milk");
  });

  it("returns an empty allergens list when both sides are empty", () => {
    expect(unionAllergens(null, []).allergens).toEqual([]);
  });
});
