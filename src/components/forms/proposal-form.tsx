"use client";

import { useActionState } from "react";
import { addProposalAction } from "@/actions/crm";
import { FormMessage } from "@/components/ui/form-message";
import { PROPOSAL_STATUSES } from "@/lib/constants";
import { initialActionState } from "@/lib/validation";
import type { Lead } from "@/types/database";

export function ProposalForm({ leads, leadId }: { leads: Lead[]; leadId?: string }) {
  const [state, action, pending] = useActionState(addProposalAction, initialActionState);
  return (
    <form action={action} className="compact-form">
      <div className="form-grid form-grid-2">
        <div className="field"><label htmlFor="proposal_lead">Lead</label><select id="proposal_lead" name="lead_id" defaultValue={leadId ?? ""} required><option value="" disabled>Pilih lead</option>{leads.map((lead) => <option key={lead.id} value={lead.id}>{lead.name}{lead.company_name ? ` · ${lead.company_name}` : ""}</option>)}</select></div>
        <div className="field"><label htmlFor="proposal_number">Nomor proposal</label><input id="proposal_number" name="proposal_number" placeholder="Opsional" /></div>
        <div className="field field-span"><label htmlFor="proposal_title">Judul</label><input id="proposal_title" name="title" placeholder="Contoh: Website booking dan pembayaran" required /></div>
        <div className="field"><label htmlFor="proposal_value">Nilai proposal</label><input id="proposal_value" name="value" type="number" min="1" step="50000" required /></div>
        <div className="field"><label htmlFor="proposal_status">Status</label><select id="proposal_status" name="status" defaultValue="draft">{PROPOSAL_STATUSES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>
        <div className="field"><label htmlFor="sent_at">Tanggal kirim</label><input id="sent_at" name="sent_at" type="date" /></div>
        <div className="field"><label htmlFor="valid_until">Berlaku sampai</label><input id="valid_until" name="valid_until" type="date" /></div>
        <div className="field field-span"><label htmlFor="file_url">URL file proposal</label><input id="file_url" name="file_url" type="url" placeholder="https://..." /></div>
        <div className="field field-span"><label htmlFor="proposal_notes">Catatan</label><textarea id="proposal_notes" name="notes" rows={3} placeholder="Scope atau catatan negosiasi." /></div>
      </div>
      <div className="inline-submit"><FormMessage state={state} /><button className="button button-primary" type="submit" disabled={pending}>{pending ? "Menyimpan..." : "Simpan proposal"}</button></div>
    </form>
  );
}

