"use client";

import { useActionState } from "react";
import { addFollowUpAction } from "@/actions/crm";
import { FormMessage } from "@/components/ui/form-message";
import { ACTIVITY_TYPES } from "@/lib/constants";
import { initialActionState } from "@/lib/validation";
import type { Lead } from "@/types/database";

export function FollowUpForm({ leads, leadId }: { leads: Lead[]; leadId?: string }) {
  const [state, action, pending] = useActionState(addFollowUpAction, initialActionState);
  return (
    <form action={action} className="compact-form">
      <div className="form-grid form-grid-2">
        <div className="field">
          <label htmlFor="follow_lead">Lead</label>
          <select id="follow_lead" name="lead_id" defaultValue={leadId ?? ""} required>
            <option value="" disabled>Pilih lead</option>
            {leads.map((lead) => <option key={lead.id} value={lead.id}>{lead.name}{lead.company_name ? ` · ${lead.company_name}` : ""}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="follow_type">Jenis follow-up</label>
          <select id="follow_type" name="type" defaultValue="whatsapp">
            {ACTIVITY_TYPES.filter((item) => !["status_change", "note"].includes(item.value)).map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="scheduled_at">Jadwal</label>
          <input id="scheduled_at" name="scheduled_at" type="datetime-local" required />
        </div>
        <div className="field">
          <label htmlFor="follow_note">Catatan</label>
          <input id="follow_note" name="note" placeholder="Tujuan atau materi follow-up" />
        </div>
      </div>
      <div className="inline-submit"><FormMessage state={state} /><button className="button button-primary" type="submit" disabled={pending}>{pending ? "Menjadwalkan..." : "Jadwalkan follow-up"}</button></div>
    </form>
  );
}

