// Synthetic demo data only: no real addresses, people or licences.
import type { Listing, Receiver } from "../lib/rules";

export type Zone =
  | "Patia"
  | "Chandrasekharpur"
  | "Saheed Nagar"
  | "Nayapalli"
  | "Jaydev Vihar"
  | "Khandagiri"
  | "Old Town"
  | "Rasulgarh";

export type ZoneArea = { id: string; name: Zone };

export const ZONES: ZoneArea[] = [
  { id: "patia", name: "Patia" },
  { id: "chandrasekharpur", name: "Chandrasekharpur" },
  { id: "saheed-nagar", name: "Saheed Nagar" },
  { id: "nayapalli", name: "Nayapalli" },
  { id: "jaydev-vihar", name: "Jaydev Vihar" },
  { id: "khandagiri", name: "Khandagiri" },
  { id: "old-town", name: "Old Town" },
  { id: "rasulgarh", name: "Rasulgarh" },
];

export type Caterer = { id: string; name: string; zone: Zone; licence?: string };

// caterer-02 has an expired licence (FAKE-0002); caterer-15 has no licence.
export const CATERERS: Caterer[] = [
  { id: "caterer-01", name: "Demo Caterer 01", zone: "Patia", licence: "FAKE-0001" },
  { id: "caterer-02", name: "Demo Caterer 02", zone: "Chandrasekharpur", licence: "FAKE-0002" },
  { id: "caterer-03", name: "Demo Caterer 03", zone: "Saheed Nagar", licence: "FAKE-0003" },
  { id: "caterer-04", name: "Demo Caterer 04", zone: "Nayapalli", licence: "FAKE-0001" },
  { id: "caterer-05", name: "Demo Caterer 05", zone: "Jaydev Vihar", licence: "FAKE-0003" },
  { id: "caterer-06", name: "Demo Caterer 06", zone: "Khandagiri", licence: "FAKE-0001" },
  { id: "caterer-07", name: "Demo Caterer 07", zone: "Old Town", licence: "FAKE-0003" },
  { id: "caterer-08", name: "Demo Caterer 08", zone: "Patia", licence: "FAKE-0001" },
  { id: "caterer-09", name: "Demo Caterer 09", zone: "Chandrasekharpur", licence: "FAKE-0003" },
  { id: "caterer-10", name: "Demo Caterer 10", zone: "Saheed Nagar", licence: "FAKE-0001" },
  { id: "caterer-11", name: "Demo Caterer 11", zone: "Nayapalli", licence: "FAKE-0003" },
  { id: "caterer-12", name: "Demo Caterer 12", zone: "Rasulgarh", licence: "FAKE-0001" },
  { id: "caterer-13", name: "Demo Caterer 13", zone: "Khandagiri", licence: "FAKE-0003" },
  { id: "caterer-14", name: "Demo Caterer 14", zone: "Patia", licence: "FAKE-0001" },
  { id: "caterer-15", name: "Demo Caterer 15", zone: "Jaydev Vihar" },
];

export type SeedReceiver = Receiver & { name: string };

export const RECEIVERS: SeedReceiver[] = [
  { id: "receiver-01", name: "Demo Shelter 01", zone: "Patia", registered: true, needKg: 6, avoidAllergens: [] },
  { id: "receiver-02", name: "Demo Shelter 02", zone: "Chandrasekharpur", registered: true, needKg: 12, avoidAllergens: ["peanut"] },
  { id: "receiver-03", name: "Demo Shelter 03", zone: "Patia", registered: true, needKg: 9, avoidAllergens: ["dairy"] },
  { id: "receiver-04", name: "Demo Shelter 04", zone: "Saheed Nagar", registered: true, needKg: 20, avoidAllergens: [] },
  { id: "receiver-05", name: "Demo Shelter 05", zone: "Nayapalli", registered: true, needKg: 5, avoidAllergens: [] },
  { id: "receiver-06", name: "Demo Shelter 06", zone: "Jaydev Vihar", registered: true, needKg: 18, avoidAllergens: ["peanut"] },
  { id: "receiver-07", name: "Demo Shelter 07", zone: "Saheed Nagar", registered: true, needKg: 7, avoidAllergens: [] },
  { id: "receiver-08", name: "Demo Shelter 08", zone: "Khandagiri", registered: true, needKg: 10, avoidAllergens: ["dairy"] },
  { id: "receiver-09", name: "Demo Shelter 09", zone: "Old Town", registered: true, needKg: 4, avoidAllergens: [] },
  { id: "receiver-10", name: "Demo Shelter 10", zone: "Rasulgarh", registered: true, needKg: 16, avoidAllergens: [] },
  { id: "receiver-11", name: "Demo Shelter 11", zone: "Chandrasekharpur", registered: true, needKg: 20, avoidAllergens: [] },
  { id: "receiver-12", name: "Demo Shelter 12", zone: "Patia", registered: true, needKg: 11, avoidAllergens: [] },
  { id: "receiver-13", name: "Demo Shelter 13", zone: "Nayapalli", registered: true, needKg: 13, avoidAllergens: ["dairy"] },
  { id: "receiver-14", name: "Demo Shelter 14", zone: "Jaydev Vihar", registered: true, needKg: 6, avoidAllergens: [] },
  { id: "receiver-15", name: "Demo Shelter 15", zone: "Khandagiri", registered: true, needKg: 20, avoidAllergens: [] },
  { id: "receiver-16", name: "Demo Shelter 16", zone: "Old Town", registered: true, needKg: 9, avoidAllergens: ["peanut"] },
  { id: "receiver-17", name: "Demo Shelter 17", zone: "Patia", registered: true, needKg: 20, avoidAllergens: [] },
  { id: "receiver-18", name: "Demo Shelter 18", zone: "Saheed Nagar", registered: true, needKg: 5, avoidAllergens: [] },
  { id: "receiver-19", name: "Demo Shelter 19", zone: "Rasulgarh", registered: true, needKg: 7, avoidAllergens: [] },
  { id: "receiver-20", name: "Demo Shelter 20", zone: "Chandrasekharpur", registered: true, needKg: 17, avoidAllergens: ["dairy"] },
  { id: "receiver-21", name: "Demo Shelter 21", zone: "Nayapalli", registered: true, needKg: 10, avoidAllergens: [] },
  { id: "receiver-22", name: "Demo Shelter 22", zone: "Old Town", registered: true, needKg: 12, avoidAllergens: [] },
  { id: "receiver-23", name: "Demo Shelter 23", zone: "Patia", registered: false, needKg: 4, avoidAllergens: [] },
  { id: "receiver-24", name: "Demo Shelter 24", zone: "Jaydev Vihar", registered: false, needKg: 8, avoidAllergens: ["peanut"] },
  { id: "receiver-25", name: "Demo Shelter 25", zone: "Khandagiri", registered: false, needKg: 19, avoidAllergens: [] },
];

export type SeedListing = Listing & { donorName: string };

// Fixed reference: both listings are past their pickup window on 2026-01-01.
export const EXPIRED_LISTINGS: SeedListing[] = [
  {
    id: "expired-01",
    donorName: "Demo Caterer 03",
    zone: "Saheed Nagar",
    quantity: 12,
    storage: "room",
    preparedAt: new Date("2026-01-01T06:00:00Z"),
    pickupBy: new Date("2026-01-01T07:00:00Z"),
    allergens: ["dairy"],
    etaMinutes: 25,
  },
  {
    id: "expired-02",
    donorName: "Demo Caterer 09",
    zone: "Chandrasekharpur",
    quantity: 8,
    storage: "chilled",
    preparedAt: new Date("2026-01-01T02:00:00Z"),
    pickupBy: new Date("2026-01-01T04:00:00Z"),
    allergens: [],
    etaMinutes: 40,
  },
];

export const SEED = {
  zones: ZONES,
  caterers: CATERERS,
  receivers: RECEIVERS,
  expiredListings: EXPIRED_LISTINGS,
};
