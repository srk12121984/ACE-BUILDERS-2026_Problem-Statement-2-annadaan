import { useState } from "react";
import { SEED } from "../data/seed";
import { toListing, type AppListing } from "../lib/store";
import HandlingCard from "./HandlingCard";

type Result = { error?: string; message?: string } | null;

type Props = {
  listings: AppListing[];
  now: Date;
  actions: {
    offer(id: string): Result;
    decline(id: string, receiverId: string): Result;
    claim(id: string, receiverId: string): Result;
    deliver(id: string, kg: number): Result;
  };
};

const panel = { background: "#FFFFFF", borderRadius: 10, padding: 16, marginBottom: 16 };
const input = { padding: 8, borderRadius: 6, border: "1px solid #2E2A26", fontFamily: "inherit", width: 120 };
const button = {
  background: "#F28C28",
  color: "#FFFFFF",
  border: "none",
  borderRadius: 999,
  padding: "6px 14px",
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "inherit",
  marginRight: 8,
};

function Feedback({ result }: { result?: Result }) {
  if (!result) return null;
  if (result.error) return <p style={{ color: "#B3261E", margin: "8px 0 0" }}>{result.error}</p>;
  if (result.message) return <p style={{ margin: "8px 0 0" }}>{result.message}</p>;
  return null;
}

const registeredReceivers = SEED.receivers.filter((r) => r.registered);

// Default viewer: the receiver holding the first Offered listing's current offer, else the first registered receiver.
function defaultReceiverId(listings: AppListing[]): string {
  const held = listings.find((l) => l.status === "Offered" && l.offeredTo.length > 0);
  return held ? held.offeredTo[held.offeredTo.length - 1] : registeredReceivers[0].id;
}

export default function ReceiverView({ listings, now, actions }: Props) {
  const [results, setResults] = useState<Record<string, Result>>({});
  const [kgInput, setKgInput] = useState<Record<string, string>>({});
  const [viewerId, setViewerId] = useState<string>(() => defaultReceiverId(listings));

  function run(id: string, r: Result) {
    setResults((prev) => ({ ...prev, [id]: r }));
  }

  const offers = listings.filter(
    (l) => l.status === "Offered" && l.offeredTo.length > 0 && l.offeredTo[l.offeredTo.length - 1] === viewerId,
  );
  const awaitingDelivery = listings.filter((l) => l.status === "Collected" || l.status === "Claimed");

  return (
    <div>
      <section style={panel}>
        <label style={{ display: "block", marginBottom: 12 }}>
          Viewing as{" "}
          <select
            aria-label="Viewing as"
            value={viewerId}
            onChange={(e) => setViewerId(e.target.value)}
            style={{ padding: 6, borderRadius: 6, border: "1px solid #2E2A26", fontFamily: "inherit" }}
          >
            {registeredReceivers.map((r) => (
              <option key={r.id} value={r.id}>
                {`${r.name} · ${r.zone}`}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section style={panel}>
        <h2 style={{ margin: "0 0 12px", color: "#18181B" }}>Offers for you</h2>
        {offers.length === 0 && <p>No offers for this receiver right now.</p>}
        {offers.map((l) => {
          const listing = toListing(l);
          return (
            <div key={l.id} style={{ marginBottom: 16 }}>
              <p style={{ margin: "0 0 4px", fontWeight: 600 }}>
                {l.donorName} · {l.zone} · {l.quantity} kg
              </p>
              <p style={{ margin: "0 0 4px" }}>{l.offerReason ? `Why you: ${l.offerReason}` : "Offered to you"}</p>
              <HandlingCard listing={listing} now={now} />
              <button style={button} onClick={() => run(l.id, actions.claim(l.id, viewerId))}>
                Accept
              </button>
              <button style={button} onClick={() => run(l.id, actions.decline(l.id, viewerId))}>
                Decline
              </button>
              <Feedback result={results[l.id]} />
            </div>
          );
        })}
      </section>

      <section style={panel}>
        <h2 style={{ margin: "0 0 12px", color: "#18181B" }}>Claimed — confirm delivery</h2>
        {awaitingDelivery.length === 0 && <p>Nothing awaiting delivery.</p>}
        {awaitingDelivery.map((l) => (
          <div key={l.id} style={{ marginBottom: 16 }}>
            <p style={{ margin: "0 0 4px", fontWeight: 600 }}>
              {l.donorName} · {l.zone} · {l.quantity} kg · {l.status}
            </p>
            {l.status === "Collected" && (
              <div>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  aria-label="kg received"
                  style={input}
                  value={kgInput[l.id] ?? ""}
                  onChange={(e) => setKgInput((prev) => ({ ...prev, [l.id]: e.target.value }))}
                />{" "}
                <button style={button} onClick={() => run(l.id, actions.deliver(l.id, Number(kgInput[l.id])))}>
                  Confirm delivery
                </button>
              </div>
            )}
            <Feedback result={results[l.id]} />
          </div>
        ))}
      </section>
    </div>
  );
}
