import { useState, type FormEvent } from "react";
import { SEED } from "../data/seed";
import {
  consumeBy,
  isDonorVerified,
  isUnrescuable,
  type Storage,
} from "../lib/rules";
import { validateDonorInput } from "../lib/validation";
import { draftToFormValues, toLocalInput, type AiFilled } from "../lib/aiFill";
import type { IntakeResult } from "../lib/intake";

export type ListingDraft = {
  id: string;
  donorName: string;
  zone: string;
  storage: Storage;
  quantity: number;
  preparedAt: Date;
  pickupBy: Date;
  allergens: string[];
};

type Props = { onPost: (listing: ListingDraft) => void };

type AiInfo = { missing: string[]; injected: boolean; allergensUnknown: boolean };

const field = { display: "flex", flexDirection: "column" as const, gap: 4, marginBottom: 12 };
const input = { padding: 8, borderRadius: 6, border: "1px solid #2E2A26", fontFamily: "inherit" };
const aiTag = { fontSize: 12, color: "#B45309" };
const AI_UNAVAILABLE = "AI unavailable — please fill the form";


export default function DonorForm({ onPost }: Props) {
  const [catererId, setCatererId] = useState(SEED.caterers[0].id);
  const [storage, setStorage] = useState<Storage>("room");
  const [quantity, setQuantity] = useState("5");
  const [preparedAt, setPreparedAt] = useState(() => toLocalInput(new Date()));
  const [pickupBy, setPickupBy] = useState("");
  const [allergenText, setAllergenText] = useState("");
  const [message, setMessage] = useState("");
  const [aiText, setAiText] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [aiNote, setAiNote] = useState("");
  const [aiFilled, setAiFilled] = useState<AiFilled>({});
  const [aiInfo, setAiInfo] = useState<AiInfo | null>(null);
  const [possibleAllergens, setPossibleAllergens] = useState<string[]>([]);

  const caterer = SEED.caterers.find((c) => c.id === catererId);
  const verified = caterer ? isDonorVerified(caterer, new Date()) : false;

  // Removes the AI-filled label once the donor edits that field.
  function dropAi(key: keyof AiFilled) {
    setAiFilled((p) => ({ ...p, [key]: false }));
  }

  // AI only fills the form; it never posts. The caterer is left as the donor chose it.
  async function fillWithAi() {
    setAiBusy(true);
    setAiNote("");
    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: aiText }),
      });
      const data = (await res.json()) as IntakeResult;
      if (!res.ok || !data.ok) {
        setAiNote(AI_UNAVAILABLE);
        return;
      }
      const v = draftToFormValues(data.draft);
      if (v.quantity !== undefined) setQuantity(v.quantity);
      if (v.storage !== undefined) setStorage(v.storage);
      if (v.pickupBy !== undefined) setPickupBy(v.pickupBy);
      if (v.preparedAt !== undefined) setPreparedAt(v.preparedAt);
      if (v.allergens !== undefined) setAllergenText(v.allergens);
      setAiFilled((p) => ({ ...p, ...v.aiFilled }));
      setAiInfo({
        missing: v.missing,
        injected: data.draft.injectionDetected,
        allergensUnknown: data.draft.allergens === null,
      });
      setPossibleAllergens(data.possibleAllergens ?? []);
      setMessage("");
    } catch {
      setAiNote(AI_UNAVAILABLE);
    } finally {
      setAiBusy(false);
    }
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!caterer) return;
    const now = new Date();
    if (!isDonorVerified(caterer, now)) {
      setMessage("Posting blocked: this caterer's FSSAI licence is missing, unknown or expired.");
      return;
    }
    const prepared = new Date(preparedAt);
    const pickup = new Date(pickupBy);
    const error = validateDonorInput({ quantity: Number(quantity), preparedAt: prepared, pickupBy: pickup }, now);
    if (error) {
      setMessage(error);
      return;
    }
    const deadline = consumeBy(prepared, storage, pickup);
    if (isUnrescuable(deadline, now)) {
      setMessage("Listing cannot be rescued: consume-by deadline is under 30 minutes away.");
      return;
    }
    onPost({
      id: `listing-${now.getTime()}-${Math.random().toString(36).slice(2, 7)}`,
      donorName: caterer.name,
      zone: caterer.zone,
      storage,
      quantity: Number(quantity),
      preparedAt: prepared,
      pickupBy: pickup,
      allergens: allergenText
        .split(",")
        .map((a) => a.trim())
        .filter((a) => a !== ""),
    });
    setMessage("Listing posted.");
  }

  return (
    <>
      <div style={{ background: "#FFFFFF", borderRadius: 10, padding: 16, marginBottom: 12 }}>
        <div style={field}>
          <label htmlFor="aiText">Describe your surplus</label>
          <textarea
            id="aiText"
            rows={3}
            maxLength={2000}
            style={input}
            value={aiText}
            onChange={(e) => setAiText(e.target.value)}
          />
        </div>
        <button
          type="button"
          disabled={aiBusy}
          onClick={fillWithAi}
          style={{ background: "#F28C28", color: "#FFFFFF", border: "none", borderRadius: 999, padding: "8px 18px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
        >
          {aiBusy ? "Reading your description…" : "Fill with AI"}
        </button>
        {aiNote && <p style={{ marginTop: 12 }}>{aiNote}</p>}
        {aiInfo && aiInfo.missing.length > 0 && (
          <p style={{ marginTop: 12 }}>Not found in your description: {aiInfo.missing.join(", ")}</p>
        )}
        {aiInfo?.injected && <p style={{ marginTop: 12 }}>Some text in your description was ignored.</p>}
      </div>

      <form onSubmit={handleSubmit} style={{ background: "#FFFFFF", borderRadius: 10, padding: 16, marginBottom: 20 }}>
        <h2 style={{ margin: "0 0 12px", color: "#18181B" }}>Post surplus food</h2>

        <div style={field}>
          <label htmlFor="caterer">Caterer</label>
          <select
            id="caterer"
            style={input}
            value={catererId}
            onChange={(e) => {
              setCatererId(e.target.value);
              setMessage("");
            }}
          >
            {SEED.caterers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.zone})
              </option>
            ))}
          </select>
          {verified && (
            <span style={{ alignSelf: "flex-start", background: "#3FAE63", color: "#FFFFFF", borderRadius: 999, padding: "2px 10px", fontSize: 13 }}>
              FSSAI-verified donor
            </span>
          )}
        </div>

        <div style={field}>
          <label htmlFor="storage">Storage</label>
          <select
            id="storage"
            style={input}
            value={storage}
            onChange={(e) => {
              setStorage(e.target.value as Storage);
              dropAi("storage");
              setMessage("");
            }}
          >
            <option value="room">Room</option>
            <option value="hot">Hot</option>
            <option value="chilled">Chilled</option>
          </select>
          {aiFilled.storage && <span style={aiTag}>AI-filled — check</span>}
        </div>

        <div style={field}>
          <label htmlFor="preparedAt">Prepared at</label>
          <input
            id="preparedAt"
            type="datetime-local"
            required
            style={input}
            value={preparedAt}
            onChange={(e) => {
              setPreparedAt(e.target.value);
              dropAi("preparedAt");
              setMessage("");
            }}
          />
          {aiFilled.preparedAt && <span style={aiTag}>AI-filled — check</span>}
        </div>

        <div style={field}>
          <label htmlFor="quantity">Quantity (kg)</label>
          <input
            id="quantity"
            type="number"
            min="0.5"
            step="0.5"
            required
            style={input}
            value={quantity}
            onChange={(e) => {
              setQuantity(e.target.value);
              dropAi("quantity");
              setMessage("");
            }}
          />
          {aiFilled.quantity && <span style={aiTag}>AI-filled — check</span>}
        </div>

        <div style={field}>
          <label htmlFor="pickupBy">Pickup by</label>
          <input
            id="pickupBy"
            type="datetime-local"
            required
            style={input}
            value={pickupBy}
            onChange={(e) => {
              setPickupBy(e.target.value);
              dropAi("pickupBy");
              setMessage("");
            }}
          />
          {aiFilled.pickupBy && <span style={aiTag}>AI-filled — check</span>}
        </div>

        <div style={field}>
          <label htmlFor="allergens">Allergens (comma-separated, empty = unknown)</label>
          <input
            id="allergens"
            type="text"
            style={input}
            value={allergenText}
            onChange={(e) => {
              setAllergenText(e.target.value);
              dropAi("allergens");
              setMessage("");
            }}
          />
          {aiFilled.allergens && <span style={aiTag}>AI-filled — check</span>}
          {aiInfo?.allergensUnknown && allergenText === "" && (
            <span style={aiTag}>Allergens: unknown — ask donor</span>
          )}
          {possibleAllergens.map((name) => (
            <span key={name} style={aiTag}>
              {name}: Possible allergen — confirm with donor
            </span>
          ))}
        </div>

        <button type="submit" style={{ background: "#F28C28", color: "#FFFFFF", border: "none", borderRadius: 999, padding: "8px 18px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
          Post listing
        </button>

        {message && <p style={{ marginTop: 12 }}>{message}</p>}
      </form>
    </>
  );
}
