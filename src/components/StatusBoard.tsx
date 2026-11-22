import type { AppListing } from "../lib/store";
import { consumeBy } from "../lib/rules";
import type { Status } from "../lib/lifecycle";

type Props = {
  listings: AppListing[];
  now: Date;
};

const CHIP_BG: Record<Status, string> = {
  Posted: "#F28C28",
  Offered: "#F28C28",
  Claimed: "#3FAE63",
  Collected: "#3FAE63",
  Delivered: "#2E2A26",
  Expired: "#8A8580",
  Cancelled: "#8A8580",
};

function countdown(l: AppListing, now: Date): string {
  const deadline = consumeBy(new Date(l.preparedAt), l.storage, new Date(l.pickupBy));
  if (now.getTime() >= deadline.getTime()) return "Expired";
  const ms = deadline.getTime() - now.getTime();
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return `${h} h ${m} min left`;
}

export default function StatusBoard({ listings, now }: Props) {
  const cell = { padding: "6px 8px", borderBottom: "1px solid #F5F1EA", textAlign: "left" as const };

  return (
    <div style={{ marginTop: 16 }}>
      <h2 style={{ margin: "0 0 8px", fontSize: 18 }}>Status board</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", background: "#FFFFFF", borderRadius: 8 }}>
        <thead>
          <tr>
            <th style={cell}>Donor</th>
            <th style={cell}>Zone</th>
            <th style={cell}>Quantity</th>
            <th style={cell}>Status</th>
            <th style={cell}>Countdown</th>
          </tr>
        </thead>
        <tbody>
          {listings.map((l) => (
            <tr key={l.id}>
              <td style={cell}>{l.donorName}</td>
              <td style={cell}>{l.zone}</td>
              <td style={cell}>{l.quantity} kg</td>
              <td style={cell}>
                <span
                  style={{
                    background: CHIP_BG[l.status],
                    color: "#FFFFFF",
                    borderRadius: 999,
                    padding: "2px 8px",
                    fontSize: 12,
                  }}
                >
                  {l.status}
                </span>
              </td>
              <td style={cell}>{countdown(l, now)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
