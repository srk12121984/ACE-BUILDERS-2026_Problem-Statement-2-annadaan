import { useState } from "react";
import { consumeBy } from "../lib/rules";
import { toListing, type AppListing } from "../lib/store";
import HandlingCard from "./HandlingCard";

type Result = { error?: string; message?: string } | null;
type Collect = (id: string, code: string) => Result;

type Props = {
  listings: AppListing[];
  now: Date;
  actions: { collect: Collect };
};

const panel = { background: "#FFFFFF", borderRadius: 10, padding: 16, marginBottom: 16 };
const input = { padding: 8, borderRadius: 6, border: "1px solid #2E2A26", fontFamily: "inherit", marginRight: 8 };
const button = {
  background: "#F28C28",
  color: "#FFFFFF",
  border: "none",
  borderRadius: 999,
  padding: "6px 14px",
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "inherit",
};

function PickupRow({ listing: l, now, collect }: { listing: AppListing; now: Date; collect: Collect }) {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<Result>(null);
  const view = toListing(l);
  const deadline = consumeBy(view.preparedAt, view.storage, view.pickupBy);
  const mins = Math.floor((deadline.getTime() - now.getTime()) / 60_000);
  const countdown = mins <= 0 ? "Expired" : `${mins} min left`;

  function confirm() {
    const r = collect(l.id, code);
    setResult(r);
    if (!r?.error) setCode("");
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <p style={{ margin: "0 0 4px", fontWeight: 600 }}>
        {l.zone} · {l.quantity} kg · {countdown}
      </p>
      <p style={{ margin: "0 0 4px" }}>Assigned to: {l.assignedVolunteer ?? "Unassigned"}</p>
      <HandlingCard listing={view} now={now} />
      <div style={{ marginTop: 8 }}>
        <input
          type="text"
          maxLength={4}
          aria-label="4-digit handover code"
          placeholder="4-digit handover code"
          style={input}
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button style={button} onClick={confirm}>
          Confirm pickup
        </button>
      </div>
      {result?.error && <p style={{ color: "#B3261E", margin: "8px 0 0" }}>{result.error}</p>}
    </div>
  );
}

export default function VolunteerView({ listings, now, actions }: Props) {
  const assigned = listings.filter((l) => l.status === "Claimed");
  return (
    <section style={panel}>
      <h2 style={{ margin: "0 0 12px", color: "#18181B" }}>Assigned pickups</h2>
      {assigned.length === 0 && <p>No pickups assigned.</p>}
      {assigned.map((l) => (
        <PickupRow key={l.id} listing={l} now={now} collect={actions.collect} />
      ))}
    </section>
  );
}
