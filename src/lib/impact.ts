import type { Status } from "./lifecycle";

// DEMO VALUE — rough planning figure, not a nutritional measurement.
export const KG_PER_MEAL = 0.4;

export function impactTotals(listings: { status: Status; deliveredKg?: number }[]): {
  kg: number;
  meals: number;
  deliveries: number;
} {
  const delivered = listings.filter((l) => l.status === "Delivered");
  const kg = delivered.reduce((sum, l) => sum + (l.deliveredKg ?? 0), 0);
  return {
    kg,
    meals: Math.round(kg / KG_PER_MEAL),
    deliveries: delivered.length,
  };
}
