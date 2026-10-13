"use client";

import { useActionState, useState } from "react";
import { closeLeadAction } from "@/actions/crm";
import { FormMessage } from "@/components/ui/form-message";
import { LOST_REASONS } from "@/lib/constants";
import { initialActionState } from "@/lib/validation";

export function CloseLeadForm({ leadId }: { leadId: string }) {
  const [outcome, setOutcome] = useState<"won" | "lost">("won");
  const [state, action, pending] = useActionState(closeLeadAction, initialActionState);
  return (
    <form action={action} className="compact-form">
      <input type="hidden" name="id" value={leadId} />
      <div className="segmented" aria-label="Hasil lead">
        <label><input type="radio" name="outcome" value="won" checked={outcome === "won"} onChange={() => setOutcome("won")} /> Menang</label>
        <label><input type="radio" name="outcome" value="lost" checked={outcome === "lost"} onChange={() => setOutcome("lost")} /> Kalah</label>
      </div>
      {outcome === "won" ? (
        <div className="form-grid form-grid-2">
          <div className="field"><label htmlFor="final_value">Nilai final</label><input id="final_value" name="final_value" type="number" min="0" step="50000" required /></div>
          <div className="field"><label htmlFor="closed_at">Tanggal close</label><input id="closed_at" name="closed_at" type="date" required /></div>
          <div className="field field-span"><label htmlFor="project_name">Nama project</label><input id="project_name" name="project_name" required /></div>
          <div className="field field-span"><label htmlFor="deal_notes">Catatan</label><textarea id="deal_notes" name="notes" rows={2} /></div>
        </div>
      ) : (
        <div className="field"><label htmlFor="lost_reason">Alasan kalah</label><select id="lost_reason" name="lost_reason" required><option value="">Pilih alasan</option>{LOST_REASONS.map((reason) => <option key={reason}>{reason}</option>)}</select></div>
      )}
      <div className="inline-submit"><FormMessage state={state} /><button className="button button-secondary" type="submit" disabled={pending}>{pending ? "Menyimpan..." : "Simpan hasil"}</button></div>
    </form>
  );
}

