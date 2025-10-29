import { useState } from "react";
import { supabaseBrowser } from "../lib/supabase-browser";

type Kid = { name: string; birthday?: string; notes?: string };

export default function Onboard() {
  const supabase = supabaseBrowser();
  const [phone, setPhone] = useState("");
  const [kids, setKids] = useState<Kid[]>([{ name: "", birthday: "", notes: "" }]);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const addRow = () => setKids(k => [...k, { name: "", birthday: "", notes: "" }]);
  const remove = (i: number) => setKids(k => k.filter((_, idx) => idx !== i));
  const update = (i: number, field: keyof Kid, val: string) =>
    setKids(k => k.map((row, idx) => (idx === i ? { ...row, [field]: val } : row)));

  const submit = async () => {
    setSaving(true); setErr(null);
    try {
      const { data: { user }, error: uerr } = await supabase.auth.getUser();
      if (uerr || !user) throw new Error("Please sign in again.");

      // 1) Upsert the owning family row for this user
      const email = user.email!;
      const { data: fam, error: ferr } = await supabase
        .from("families")
        .upsert(
          { email, phone: phone.trim(), auth_user_id: user.id },
          { onConflict: "auth_user_id" }
        )
        .select("id")
        .single();
      if (ferr) throw ferr;

      const familyId = fam.id as string;

      // 2) Insert children (ignore blanks)
      const payload = kids
        .map(k => ({
          family_id: familyId,
          name: k.name.trim(),
          birthday: k.birthday || null,
          notes: k.notes?.trim() || null
        }))
        .filter(k => k.name.length > 0);

      if (payload.length === 0) throw new Error("Add at least one child name.");

      const { error: cerr } = await supabase.from("children").insert(payload);
      if (cerr) throw cerr;

      window.location.href = "/app"; // your dashboard
    } catch (e: any) {
      setErr(e.message ?? "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-3xl font-playfair text-[#6B4E31]">sayso</h1>
      <p className="mt-2 text-[#6B4E31]">Almost there! Add your kid(s). You can edit later.</p>

      <div className="mt-6 rounded-2xl bg-[#FFF8F0] p-5 shadow">
        <label className="block text-sm font-medium text-[#6B4E31]">Parent Phone</label>
        <input
          className="mt-1 w-full rounded-xl border p-2"
          placeholder="e.g. 4805551234"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <div className="mt-4 space-y-3">
          {kids.map((k, i) => (
            <div key={i} className="grid grid-cols-[2fr_1fr_2fr_auto] gap-2">
              <input
                className="rounded-xl border p-2"
                placeholder="Child's name (required)"
                value={k.name}
                onChange={(e) => update(i, "name", e.target.value)}
              />
              <input
                type="date"
                className="rounded-xl border p-2"
                value={k.birthday || ""}
                onChange={(e) => update(i, "birthday", e.target.value)}
              />
              <input
                className="rounded-xl border p-2"
                placeholder="Notes (optional)"
                value={k.notes || ""}
                onChange={(e) => update(i, "notes", e.target.value)}
              />
              <button type="button" onClick={() => remove(i)} className="rounded-xl border px-3">✕</button>
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-3">
          <button type="button" onClick={addRow} className="rounded-xl border px-4 py-2">+ Add another child</button>
          <button type="button" onClick={submit} disabled={saving} className="rounded-xl bg-[#E63946] px-4 py-2 text-white shadow">
            {saving ? "Saving…" : "Save & Continue"}
          </button>
        </div>

        {err && <p className="mt-3 text-sm text-red-600">{err}</p>}
      </div>

      <p className="mt-3 text-xs text-neutral-500">We’ll text you 3×/week. Reply to save a quote instantly.</p>
    </main>
  );
}

// keep SSR so Next doesn't try to prerender at build
export async function getServerSideProps() { return { props: {} }; }
