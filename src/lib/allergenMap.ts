// Deterministic dish-keyword to allergen rule. Pure: no I/O, no model calls.
export const ALLERGEN_KEYWORDS: Record<string, string[]> = {
  milk: [
    "paneer",
    "kheer",
    "khoa",
    "khoya",
    "chhena",
    "chena",
    "chhena poda",
    "rasgulla",
    "rasmalai",
    "rabri",
    "malai",
    "dahi",
    "curd",
    "raita",
    "lassi",
    "ghee",
    "butter",
    "cream",
    "kulfi",
    "payesh",
    "payasa",
  ],
  nuts: ["kheer", "halwa", "ladoo", "laddu", "biryani", "korma", "barfi", "pulao"],
  gluten: ["puri", "roti", "paratha", "naan", "chapati", "suji", "semolina", "upma", "bread"],
};

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// One case-insensitive, whole-word matcher per keyword, grouped by allergen name.
const MATCHERS: [string, RegExp[]][] = Object.entries(ALLERGEN_KEYWORDS).map(([allergen, words]) => [
  allergen,
  words.map((word) => new RegExp(`(?<![a-z])${escapeRegex(word)}(?![a-z])`, "i")),
]);

// Returns the allergen names whose keywords appear in the text, in fixed group order, unique.
export function mapAllergens(text: string): string[] {
  return MATCHERS.filter(([, regexes]) => regexes.some((re) => re.test(text))).map(([allergen]) => allergen);
}

// Union of AI-stated allergens and mapped allergens. Never drops an AI allergen.
// possible = mapped allergens the AI did not already state.
export function unionAllergens(
  aiAllergens: string[] | null,
  mapped: string[],
): { allergens: string[]; possible: string[] } {
  const fromAi: string[] = [];
  for (const raw of aiAllergens ?? []) {
    const name = raw.trim().toLowerCase();
    if (name !== "" && !fromAi.includes(name)) fromAi.push(name);
  }
  const possible = [...new Set(mapped)].filter((name) => !fromAi.includes(name));
  return { allergens: [...fromAi, ...possible], possible };
}
