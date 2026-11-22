import { describe, it, expect } from "vitest";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

type GoldenCase = { id: string; text: string; expect: { injection: boolean } };

const raw = fs.readFileSync(
  fileURLToPath(new URL("../golden/intake.json", import.meta.url)),
  "utf8",
);
const cases = JSON.parse(raw) as GoldenCase[];

describe("golden intake set", () => {
  it("has exactly 20 cases", () => {
    expect(cases).toHaveLength(20);
  });

  it("has unique ids", () => {
    const ids = cases.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every case has text", () => {
    for (const c of cases) {
      expect(typeof c.text).toBe("string");
      expect(c.text.trim().length).toBeGreaterThan(0);
    }
  });

  it("marks injection cases g19 and g20 as injection", () => {
    const byId = new Map(cases.map((c) => [c.id, c]));
    expect(byId.get("g19")?.expect.injection).toBe(true);
    expect(byId.get("g20")?.expect.injection).toBe(true);
  });
});
