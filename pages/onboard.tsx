import { useState } from "react";
import { supabaseBrowser } from "../lib/supabase-browser";

type Kid = { name: string; birthday?: string; notes?: string };

export default function Onboard() {
  const supabase = supabaseBrowser();
  const [kids, setKids] = useState<Kid[]>([{ name: "", birthday: "", notes: "" }]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const addRow = () => setKids(k => [...k, { name: "", birthday: "", notes: "" }]);
  const update = (i: number, field: keyof Kid, val: string) =>
    setKids(k => k.map((row, idx) => (idx === i ? { ...row, [field]: val } : row)));
  const remove = (i: number) => setKids(k => k.filter((_, idx) => idx !== i));

  const submit = async () => {
    setSaving(true); setError(null);
    try {
      const { data: { user }, error: uerr } = await supabase.auth.getUser();
      if (uerr || !user) throw new Error("Please sign in again.");

      const payload = kids
        .map(k => ({ name: k.name.trim(), birthday: k.birthday || null, notes: k.notes?.trim() || null }))
        .filter(k => k.name.length > 0);

      if (payload.length === 0) throw new Error("Add at least one child name.");

      const { error: derr } = await supabase
        .from("children")
        .insert(payload.map(k => ({ ...k, user_id: user.id })));

      if (derr) throw derr;

      window.location.href = "/app";
    } catch (e: any) {
      setError(e.message ?? "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <h1>sayso</h1>
      <p>Almost there! Add your kid(s). You can edit these later.</p>

      {kids.map((k, i) => (
        <div key={i} style={{ display:"grid", gridTemplateColumns:"2fr 1fr 2fr auto", gap: 8, marginBottom: 8 }}>
          <input
            placeholder="Kid's name (required)"
            value={k.name}
            onChange={e => update(i, "name", e.target.value)}
            required
          />
          <input
            type="date"
            value={k.birthday || ""}
            onChange={e => update(i, "birthday", e.target.value)}
          />
          <input
            placeholder="Notes (optional)"
            value={k.notes || ""}
            onChange={e => update(i, "notes", e.target.value)}
          />
          <button type="button" onClick={() => remove(i)} aria-label="Remove">✕</button>
        </div>
      ))}

      <div style={{ display:"flex", gap: 8, marginTop: 12 }}>
        <button type="button" onClick={addRow}>+ Add another child</button>
        <button type="button" onClick={submit} disabled={saving}>
          {saving ? "Saving…" : "Save & Continue"}
        </button>
      </div>

      {error && <p style={{ color: "crimson", marginTop: 12 }}>{error}</p>}
    </main>
  );
}

// Prevent build-time prerender failures on env access
export async function getServerSideProps() { return { props: {} }; }
