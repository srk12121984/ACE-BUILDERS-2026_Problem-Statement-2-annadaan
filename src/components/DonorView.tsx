import DonorForm, { type ListingDraft } from "./DonorForm";
import { SEED } from "../data/seed";
import { handoverCode } from "../lib/lifecycle";
import type { AppListing, PostInput } from "../lib/store";

type Result = { error?: string; message?: string } | null;

type Props = {
  listings: AppListing[];
  now: Date;
  onPost: (input: PostInput) => Result;
};

// DonorForm emits a ListingDraft (Date fields, no donorId/ETA); the store expects a PostInput.
function toPostInput(d: ListingDraft): PostInput {
  const caterer = SEED.caterers.find((c) => c.name === d.donorName);
  return {
    id: d.id,
    donorName: d.donorName,
    donorId: caterer?.id ?? "unknown",
    zone: d.zone,
    quantity: d.quantity,
    storage: d.storage,
    preparedAt: d.preparedAt.toISOString(),
    pickupBy: d.pickupBy.toISOString(),
    allergens: d.allergens,
    etaMinutes: 30, // placeholder: the donor form does not collect an ETA
  };
}

export default function DonorView({ listings, onPost }: Props) {
  return (
    <div>
      <section style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["1 Post", "2 Match", "3 Deliver"].map((step) => (
          <div
            key={step}
            style={{
              flex: 1,
              background: "#FDEBD6",
              color: "#2E2A26",
              borderRadius: 8,
              padding: "8px 12px",
              fontWeight: 600,
              textAlign: "center",
            }}
          >
            {step}
          </div>
        ))}
      </section>
      <DonorForm onPost={(d) => { onPost(toPostInput(d)); }} />
      <section style={{ background: "#FFFFFF", borderRadius: 10, padding: 16 }}>
        <h2 style={{ margin: "0 0 12px", color: "#18181B" }}>Your listings</h2>
        {listings.length === 0 && <p>No listings yet.</p>}
        {listings.map((l) => (
          <div key={l.id} style={{ borderBottom: "1px solid #F5F1EA", padding: "8px 0" }}>
            <p style={{ margin: "0 0 4px", fontWeight: 600 }}>
              {l.donorName} · {l.quantity} kg · {l.status}
            </p>
            {(l.status === "Claimed" || l.status === "Collected") && (
              <p style={{ margin: 0 }}>Handover code for the volunteer: {handoverCode(l.id)}</p>
            )}
            {l.status === "Posted" && l.noMatchReason && (
              <p style={{ margin: "4px 0 0" }}>{l.noMatchReason}</p>
            )}
            {l.status === "Offered" && l.offerReason && (
              <p style={{ margin: "4px 0 0" }}>Offered to a receiver: {l.offerReason}</p>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
