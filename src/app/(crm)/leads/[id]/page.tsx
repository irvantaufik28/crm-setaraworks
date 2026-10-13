import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { archiveLeadAction, completeFollowUpAction } from "@/actions/crm";
import { ActivityForm } from "@/components/forms/activity-form";
import { CloseLeadForm } from "@/components/forms/close-lead-form";
import { FollowUpForm } from "@/components/forms/follow-up-form";
import { ProposalForm } from "@/components/forms/proposal-form";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { ACTIVITY_TYPES, sourceLabel } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/format";
import { getLead } from "@/lib/crm/queries";

export const metadata: Metadata = { title: "Detail Lead" };

const activityLabel = (type: string) => ACTIVITY_TYPES.find((item) => item.value === type)?.label ?? type;

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getLead(id);
  if (!data) notFound();
  const { lead, activities, proposals, followUps } = data;

  return (
    <div className="page-shell lead-detail-page">
      <header className="page-header lead-detail-header">
        <div><p className="section-index">Lead detail</p><div className="title-with-status"><h1>{lead.name}</h1><StatusBadge status={lead.status} /></div><p>{lead.company_name || "Bisnis belum dicatat"} · {lead.service_interest}</p></div>
        <div className="header-actions"><Link className="button button-secondary" href={`/leads/${id}/edit`}>Edit lead</Link><form action={archiveLeadAction}><input type="hidden" name="id" value={id} /><button className="button button-danger-quiet" type="submit">Arsipkan</button></form></div>
      </header>

      <section className="lead-brief" aria-label="Ringkasan lead">
        <div><span>Estimasi nilai</span><strong>{formatCurrency(lead.estimated_value)}</strong></div>
        <div><span>Follow-up berikutnya</span><strong>{formatDate(lead.next_follow_up_at, true)}</strong></div>
        <div><span>Sumber</span><strong>{sourceLabel(lead.source)}</strong></div>
        <div><span>Kontak terakhir</span><strong>{formatDate(lead.last_contact_at, true)}</strong></div>
      </section>

      <div className="lead-detail-grid">
        <div className="detail-main">
          <section className="panel">
            <header className="panel-header"><div><p className="section-index">Riwayat komunikasi</p><h2>Activity timeline</h2></div></header>
            <ActivityForm leadId={id} />
            {activities.length ? <ol className="timeline">{activities.map((activity) => <li key={activity.id}><div><strong>{activityLabel(activity.type)}</strong><time dateTime={activity.activity_at}>{formatDate(activity.activity_at, true)}</time></div><p>{activity.note}</p></li>)}</ol> : <EmptyState title="Belum ada aktivitas" description="Catat kontak pertama, meeting, atau catatan penting agar histori lead tersimpan." />}
          </section>

          <section className="panel">
            <header className="panel-header"><div><p className="section-index">Dokumen sales</p><h2>Proposal</h2></div></header>
            <details className="inline-disclosure"><summary>Catat proposal baru</summary><ProposalForm leads={[lead]} leadId={id} /></details>
            {proposals.length ? <div className="record-list">{proposals.map((proposal) => <article key={proposal.id}><div><strong>{proposal.title}</strong><small>{proposal.proposal_number || "Tanpa nomor proposal"}</small></div><div><StatusBadge status={proposal.status} /><strong>{formatCurrency(proposal.value)}</strong></div>{proposal.file_url ? <a href={proposal.file_url} target="_blank" rel="noreferrer">Buka file proposal</a> : null}</article>)}</div> : <EmptyState title="Belum ada proposal" description="Catat metadata proposal saat dokumen siap atau telah dikirim." />}
          </section>
        </div>

        <aside className="detail-aside">
          <section className="panel detail-card"><header><p className="section-index">Kontak</p><h2>Informasi lead</h2></header><dl className="detail-list"><div><dt>Email</dt><dd>{lead.email ? <a href={`mailto:${lead.email}`}>{lead.email}</a> : "Belum diisi"}</dd></div><div><dt>Telepon</dt><dd>{lead.phone ? <a href={`tel:${lead.phone}`}>{lead.phone}</a> : "Belum diisi"}</dd></div><div><dt>WhatsApp</dt><dd>{lead.whatsapp || "Belum diisi"}</dd></div><div><dt>Instagram</dt><dd>{lead.instagram || "Belum diisi"}</dd></div><div><dt>Website</dt><dd>{lead.website ? <a href={lead.website} target="_blank" rel="noreferrer">Buka website</a> : "Belum diisi"}</dd></div><div><dt>Lokasi</dt><dd>{lead.location || "Belum diisi"}</dd></div><div><dt>Rentang budget</dt><dd>{formatCurrency(lead.budget_min)} sampai {formatCurrency(lead.budget_max)}</dd></div></dl>{lead.notes ? <div className="lead-notes"><strong>Catatan</strong><p>{lead.notes}</p></div> : null}</section>

          <section className="panel detail-card"><header><p className="section-index">Tindakan berikutnya</p><h2>Follow-up</h2></header><details className="inline-disclosure"><summary>Jadwalkan follow-up</summary><FollowUpForm leads={[lead]} leadId={id} /></details>{followUps.length ? <div className="mini-list">{followUps.slice(0, 5).map((item) => <article key={item.id}><div><StatusBadge status={item.status} /><strong>{formatDate(item.scheduled_at, true)}</strong><p>{item.note || activityLabel(item.type)}</p></div>{item.status === "pending" ? <form action={completeFollowUpAction}><input type="hidden" name="id" value={item.id} /><input type="hidden" name="lead_id" value={id} /><button className="button button-quiet" type="submit">Selesai</button></form> : null}</article>)}</div> : <p className="muted-copy">Belum ada follow-up terjadwal.</p>}</section>

          {lead.status !== "won" && lead.status !== "lost" ? <section className="panel detail-card"><header><p className="section-index">Close lead</p><h2>Hasil akhir</h2></header><CloseLeadForm leadId={id} /></section> : null}
        </aside>
      </div>
    </div>
  );
}

