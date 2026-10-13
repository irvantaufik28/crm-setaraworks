import type { Metadata } from "next";
import Link from "next/link";
import { endOfDay, startOfDay } from "date-fns";
import { completeFollowUpAction } from "@/actions/crm";
import { FollowUpForm } from "@/components/forms/follow-up-form";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate } from "@/lib/format";
import { getAllActiveLeads, getFollowUps } from "@/lib/crm/queries";

export const metadata: Metadata = { title: "Follow-ups" };

export default async function FollowUpsPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const [{ view }, followUps, leads] = await Promise.all([searchParams, getFollowUps(), getAllActiveLeads()]);
  const now = new Date();
  const todayStart = startOfDay(now).toISOString();
  const todayEnd = endOfDay(now).toISOString();
  const shown = followUps.filter((item) => {
    if (view === "overdue") return item.status === "pending" && item.scheduled_at < todayStart;
    if (view === "today") return item.status === "pending" && item.scheduled_at >= todayStart && item.scheduled_at <= todayEnd;
    if (view === "upcoming") return item.status === "pending" && item.scheduled_at > todayEnd;
    return true;
  });

  return (
    <div className="page-shell">
      <header className="page-header"><div><p className="section-index">Follow-up desk</p><h1>Tindak lanjut yang tidak terlewat</h1><p>Jadwalkan kontak berikutnya dan selesaikan tugas dari satu tempat.</p></div></header>
      <section className="panel create-panel"><header className="panel-header"><div><p className="section-index">Buat jadwal</p><h2>Follow-up baru</h2></div></header><FollowUpForm leads={leads} /></section>
      <nav className="view-tabs" aria-label="Filter follow-up"><Link className={!view ? "active" : ""} href="/follow-ups">Semua</Link><Link className={view === "overdue" ? "active" : ""} href="/follow-ups?view=overdue">Terlewat</Link><Link className={view === "today" ? "active" : ""} href="/follow-ups?view=today">Hari ini</Link><Link className={view === "upcoming" ? "active" : ""} href="/follow-ups?view=upcoming">Berikutnya</Link></nav>
      <section className="panel"><header className="panel-header"><div><p className="section-index">{shown.length} jadwal</p><h2>Daftar follow-up</h2></div></header>{shown.length ? <div className="record-list followup-records">{shown.map((item) => <article key={item.id}><div><Link href={`/leads/${item.lead_id}`}><strong>{item.leads?.name ?? "Lead"}</strong></Link><small>{item.leads?.company_name || item.type.replaceAll("_", " ")}</small></div><div><StatusBadge status={item.status} /><strong>{formatDate(item.scheduled_at, true)}</strong></div><p>{item.note || "Tidak ada catatan tambahan."}</p>{item.status === "pending" ? <form action={completeFollowUpAction}><input type="hidden" name="id" value={item.id} /><input type="hidden" name="lead_id" value={item.lead_id} /><button className="button button-secondary" type="submit">Tandai selesai</button></form> : null}</article>)}</div> : <EmptyState title="Tidak ada follow-up pada tampilan ini" description="Pilih tampilan lain atau jadwalkan follow-up baru di atas." />}</section>
    </div>
  );
}

