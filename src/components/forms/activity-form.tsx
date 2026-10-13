"use client";

import { useActionState } from "react";
import { addActivityAction } from "@/actions/crm";
import { FormMessage } from "@/components/ui/form-message";
import { ACTIVITY_TYPES } from "@/lib/constants";
import { initialActionState } from "@/lib/validation";

export function ActivityForm({ leadId }: { leadId: string }) {
  const [state, action, pending] = useActionState(addActivityAction, initialActionState);
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());

  return (
    <form action={action} className="compact-form">
      <input type="hidden" name="lead_id" value={leadId} />
      <div className="form-grid form-grid-2">
        <div className="field">
          <label htmlFor="activity_type">Jenis aktivitas</label>
          <select id="activity_type" name="type" defaultValue="note">
            {ACTIVITY_TYPES.filter((item) => item.value !== "status_change").map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="activity_at">Waktu aktivitas</label>
          <input id="activity_at" name="activity_at" type="datetime-local" defaultValue={now.toISOString().slice(0, 16)} required />
        </div>
        <div className="field field-span">
          <label htmlFor="activity_note">Catatan</label>
          <textarea id="activity_note" name="note" rows={3} placeholder="Apa yang dibahas atau dilakukan?" required />
        </div>
      </div>
      <div className="inline-submit"><FormMessage state={state} /><button className="button button-secondary" type="submit" disabled={pending}>{pending ? "Mencatat..." : "Catat aktivitas"}</button></div>
    </form>
  );
}

