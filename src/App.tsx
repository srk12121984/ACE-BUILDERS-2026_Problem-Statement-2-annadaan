import { useState } from "react";
import Header from "./components/Header";
import type { Role } from "./components/RoleSwitcher";
import DonorView from "./components/DonorView";
import ReceiverView from "./components/ReceiverView";
import VolunteerView from "./components/VolunteerView";
import SponsorView from "./components/SponsorView";
import StatusBoard from "./components/StatusBoard";
import ResetButton from "./components/ResetButton";
import { useDemoStore } from "./lib/store";

type Reply = { error?: string; message?: string } | null;

export default function App() {
  const [role, setRole] = useState<Role>("Donor");
  const [notice, setNotice] = useState("");
  const store = useDemoStore();

  // Shows the last action's error or message at the top of the active role section.
  function track(r: Reply): Reply {
    setNotice(r?.error ?? r?.message ?? "");
    return r;
  }

  function changeRole(next: Role) {
    setRole(next);
    setNotice("");
  }

  const receiverActions = {
    offer: (id: string) => track(store.offer(id)),
    decline: (id: string, receiverId: string) => track(store.decline(id, receiverId)),
    claim: (id: string, receiverId: string) => track(store.claim(id, receiverId)),
    deliver: (id: string, kg: number) => track(store.deliver(id, kg)),
  };

  return (
    <div style={{ fontFamily: "Poppins, sans-serif", background: "#F5F1EA", color: "#2E2A26", minHeight: "100vh" }}>
      <Header role={role} onChange={changeRole} />
      <div style={{ background: "#FDEBD6", color: "#2E2A26", padding: "8px 24px" }}>
        Demo mode — all data is synthetic.
      </div>
      <main style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
        <ResetButton onReset={store.reset} />
        <StatusBoard listings={store.state.listings} now={store.now} />

        {notice && <p style={{ background: "#FFFFFF", borderRadius: 8, padding: 12 }}>{notice}</p>}

        {role === "Donor" && (
          <DonorView listings={store.state.listings} now={store.now} onPost={(input) => track(store.post(input))} />
        )}
        {role === "Receiver" && (
          <ReceiverView
            listings={store.state.listings}
            now={store.now}
            actions={receiverActions}
          />
        )}
        {role === "Volunteer" && (
          <VolunteerView
            listings={store.state.listings}
            now={store.now}
            actions={{ collect: (id, code) => track(store.collect(id, code)) }}
          />
        )}
        {role === "Sponsor" && <SponsorView listings={store.state.listings} />}
      </main>
    </div>
  );
}
