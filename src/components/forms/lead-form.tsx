"use client";

import { useActionState } from "react";
import { saveLeadAction } from "@/actions/crm";
import { FormMessage } from "@/components/ui/form-message";
import { LEAD_SOURCES, LEAD_STATUSES, SERVICES } from "@/lib/constants";
import { toDateTimeLocal } from "@/lib/format";
import { initialActionState } from "@/lib/validation";
import type { Lead } from "@/types/database";

function ErrorText({ messages }: { messages?: string[] }) {
  return messages?.map((message) => <small className="field-error" key={message}>{message}</small>);
}

export function LeadForm({ lead }: { lead?: Lead }) {
  const [state, action, pending] = useActionState(saveLeadAction, initialActionState);

  return (
    <form action={action} className="entity-form">
      {lead ? <input type="hidden" name="id" value={lead.id} /> : null}

      <section className="form-section">
        <header>
          <span>01</span>
          <div><h2>Identitas lead</h2><p>Data utama untuk mengenali calon client.</p></div>
        </header>
        <div className="form-grid form-grid-2">
          <div className="field">
            <label htmlFor="name">Nama lead</label>
            <input id="name" name="name" defaultValue={lead?.name} placeholder="Nama calon client" required />
            <ErrorText messages={state.errors?.name} />
          </div>
          <div className="field">
            <label htmlFor="company_name">Perusahaan / bisnis</label>
            <input id="company_name" name="company_name" defaultValue={lead?.company_name ?? ""} placeholder="Nama perusahaan" />
          </div>
          <div className="field">
            <label htmlFor="location">Lokasi</label>
            <input id="location" name="location" defaultValue={lead?.location ?? ""} placeholder="Kota atau area" />
          </div>
          <div className="field">
            <label htmlFor="source">Sumber lead</label>
            <select id="source" name="source" defaultValue={lead?.source ?? "direct_outreach"}>
              {LEAD_SOURCES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </div>
        </div>
      </section>

      <section className="form-section">
        <header>
          <span>02</span>
          <div><h2>Kontak</h2><p>Kanal yang tersedia untuk tindak lanjut.</p></div>
        </header>
        <div className="form-grid form-grid-2">
          <div className="field"><label htmlFor="phone">Telepon</label><input id="phone" name="phone" type="tel" defaultValue={lead?.phone ?? ""} placeholder="Nomor telepon" /></div>
          <div className="field"><label htmlFor="whatsapp">WhatsApp</label><input id="whatsapp" name="whatsapp" type="tel" defaultValue={lead?.whatsapp ?? ""} placeholder="Nomor WhatsApp" /></div>
          <div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" defaultValue={lead?.email ?? ""} placeholder="email@example.com" /><ErrorText messages={state.errors?.email} /></div>
          <div className="field"><label htmlFor="instagram">Instagram</label><input id="instagram" name="instagram" defaultValue={lead?.instagram ?? ""} placeholder="@username" /></div>
          <div className="field field-span"><label htmlFor="website">Website</label><input id="website" name="website" type="url" defaultValue={lead?.website ?? ""} placeholder="https://example.com" /><ErrorText messages={state.errors?.website} /></div>
        </div>
      </section>

      <section className="form-section">
        <header>
          <span>03</span>
          <div><h2>Informasi sales</h2><p>Scope, nilai peluang, dan posisi pipeline.</p></div>
        </header>
        <div className="form-grid form-grid-2">
          <div className="field">
            <label htmlFor="service_interest">Layanan diminati</label>
            <select id="service_interest" name="service_interest" defaultValue={lead?.service_interest ?? SERVICES[0]}>
              {SERVICES.map((service) => <option key={service} value={service}>{service}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="status">Status pipeline</label>
            <select id="status" name="status" defaultValue={lead?.status ?? "new"}>
              {LEAD_STATUSES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </div>
          <div className="field"><label htmlFor="budget_min">Budget minimum</label><input id="budget_min" name="budget_min" type="number" min="0" step="50000" defaultValue={lead?.budget_min ?? ""} placeholder="0" /></div>
          <div className="field"><label htmlFor="budget_max">Budget maksimum</label><input id="budget_max" name="budget_max" type="number" min="0" step="50000" defaultValue={lead?.budget_max ?? ""} placeholder="0" /><ErrorText messages={state.errors?.budget_max} /></div>
          <div className="field field-span"><label htmlFor="estimated_value">Estimasi nilai deal</label><input id="estimated_value" name="estimated_value" type="number" min="0" step="50000" defaultValue={lead?.estimated_value ?? ""} placeholder="0" /></div>
          <div className="field"><label htmlFor="last_contact_at">Kontak terakhir</label><input id="last_contact_at" name="last_contact_at" type="datetime-local" defaultValue={toDateTimeLocal(lead?.last_contact_at)} /></div>
          <div className="field"><label htmlFor="next_follow_up_at">Follow-up berikutnya</label><input id="next_follow_up_at" name="next_follow_up_at" type="datetime-local" defaultValue={toDateTimeLocal(lead?.next_follow_up_at)} /></div>
          <div className="field field-span"><label htmlFor="notes">Catatan</label><textarea id="notes" name="notes" rows={5} defaultValue={lead?.notes ?? ""} placeholder="Kebutuhan, konteks komunikasi, atau informasi penting lain." /></div>
        </div>
      </section>

      <div className="form-actions">
        <FormMessage state={state} />
        <button className="button button-primary" type="submit" disabled={pending}>
          {pending ? "Menyimpan..." : lead ? "Simpan perubahan" : "Buat lead"}
        </button>
      </div>
    </form>
  );
}

