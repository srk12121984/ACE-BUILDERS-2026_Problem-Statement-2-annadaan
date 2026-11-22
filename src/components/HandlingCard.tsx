import { DISCLAIMER, consumeBy, containsBannedClaims, type Storage } from "../lib/rules";

type Props = {
  listing: { storage: Storage; preparedAt: Date; pickupBy: Date; allergens: string[] };
  now: Date;
};

const STORAGE_LABEL: Record<Storage, string> = {
  room: "Room temperature",
  hot: "Hot holding",
  chilled: "Chilled",
};

function hhmm(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function countdown(deadline: Date, now: Date): string {
  const ms = deadline.getTime() - now.getTime();
  if (now.getTime() >= deadline.getTime()) return "Expired";
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return `${h} h ${m} min left`;
}

// Withhold any user-influenced line that trips the banned-claim check.
function safe(text: string): string {
  return containsBannedClaims(text) ? "Text withheld: contains banned wording." : text;
}

export default function HandlingCard({ listing, now }: Props) {
  const deadline = consumeBy(listing.preparedAt, listing.storage, listing.pickupBy);
  const allergenText =
    listing.allergens.length === 0
      ? "Allergens: unknown — ask donor"
      : `Allergens: ${listing.allergens.join(", ")}`;

  return (
    <div style={{ border: "1px solid #F5F1EA", borderLeft: "4px solid #F28C28", background: "#FDEBD6", borderRadius: 8, padding: 12, marginTop: 8 }}>
      <p style={{ margin: "0 0 4px" }}>{safe(STORAGE_LABEL[listing.storage])}</p>
      <p style={{ margin: "0 0 4px" }}>{safe(`Consume by ${hhmm(deadline)}`)}</p>
      <p style={{ margin: "0 0 4px", fontWeight: 600 }}>{safe(countdown(deadline, now))}</p>
      <p style={{ margin: "0 0 8px" }}>{safe(allergenText)}</p>
      <div style={{ background: "#F5F1EA", color: "#18181B", padding: "6px 8px", borderRadius: 4 }}>
        {DISCLAIMER}
      </div>
    </div>
  );
}
