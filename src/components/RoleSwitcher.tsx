export type Role = "Donor" | "Receiver" | "Volunteer" | "Sponsor";

const ROLES: Role[] = ["Donor", "Receiver", "Volunteer", "Sponsor"];

type Props = { role: Role; onChange: (role: Role) => void };

export default function RoleSwitcher({ role, onChange }: Props) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {ROLES.map((r) => {
        const selected = r === role;
        return (
          <button
            key={r}
            type="button"
            onClick={() => onChange(r)}
            aria-pressed={selected}
            style={{
              padding: "6px 14px",
              borderRadius: 999,
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              fontWeight: 600,
              background: selected ? "#F28C28" : "#F5F1EA",
              color: selected ? "#FFFFFF" : "#2E2A26",
            }}
          >
            {r}
          </button>
        );
      })}
    </div>
  );
}
