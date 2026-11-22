import type { AppListing } from "../lib/store";
import { KG_PER_MEAL, impactTotals } from "../lib/impact";

type Props = {
  listings: AppListing[];
};

export default function SponsorView({ listings }: Props) {
  const { kg, meals, deliveries } = impactTotals(listings);

  return (
    <div style={{ marginTop: 16 }}>
      <h2 style={{ margin: "0 0 8px", fontSize: 18 }}>Sponsor impact</h2>
      <div style={{ display: "grid", gap: 6, marginBottom: 12 }}>
        <p style={{ margin: 0, fontWeight: 600 }}>Food waste avoided: {kg} kg</p>
        <p style={{ margin: 0, fontWeight: 600 }}>Meals saved: {meals}</p>
        <p style={{ margin: 0, fontWeight: 600 }}>Number of deliveries: {deliveries}</p>
      </div>

      <div style={{ border: "1px solid #F5F1EA", borderRadius: 8, padding: 12, background: "#FFFFFF", marginBottom: 12 }}>
        <h3 style={{ margin: "0 0 6px", fontSize: 15 }}>Assumptions</h3>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>{KG_PER_MEAL} kg of food per meal</li>
          <li>Only delivered quantities are counted.</li>
          <li>Expired and cancelled listings are never counted.</li>
          <li>CO2e will be added once a cited emission factor is chosen.</li>
        </ul>
      </div>

      <div style={{ border: "1px solid #F5F1EA", borderLeft: "4px solid #3FAE63", borderRadius: 8, padding: 12, background: "#F5F1EA" }}>
        <h3 style={{ margin: "0 0 6px", fontSize: 15 }}>Why Annadaan pays for itself</h3>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>Free for NGOs and receivers.</li>
          <li>Branded impact reports for caterers.</li>
          <li>Zone sponsorship and dashboards for CSR sponsors.</li>
        </ul>
      </div>
    </div>
  );
}
