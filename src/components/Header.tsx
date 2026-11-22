import RoleSwitcher, { type Role } from "./RoleSwitcher";

type Props = { role: Role; onChange: (role: Role) => void };

export default function Header({ role, onChange }: Props) {
  return (
    <header style={{ background: "#2E2A26", color: "#F5F1EA", padding: "16px 24px" }}>
      <img src="/Annadaan-logo.png" alt="Annadaan" height={48} />
      <p style={{ margin: "8px 0 12px" }}>Feed people, not landfills.</p>
      <RoleSwitcher role={role} onChange={onChange} />
    </header>
  );
}
