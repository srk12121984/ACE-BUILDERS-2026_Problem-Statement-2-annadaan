import HandlingCard from "./HandlingCard";
import type { Storage } from "../lib/rules";

type Props = {
  listing: {
    id: string;
    donorName: string;
    zone: string;
    quantity: number;
    storage: Storage;
    preparedAt: Date;
    pickupBy: Date;
    allergens: string[];
  };
  now: Date;
};

export default function ListingCard({ listing, now }: Props) {
  return (
    <article style={{ background: "#FFFFFF", borderRadius: 10, padding: 16, marginBottom: 12 }}>
      <h3 style={{ margin: "0 0 4px", color: "#18181B" }}>{listing.donorName}</h3>
      <p style={{ margin: "0 0 4px" }}>
        Zone {listing.zone} · {listing.quantity} kg
      </p>
      <HandlingCard listing={listing} now={now} />
    </article>
  );
}
