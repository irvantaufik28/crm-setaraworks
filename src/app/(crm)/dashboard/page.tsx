import type { Metadata } from "next";
import Link from "next/link";
import { completeFollowUpAction } from "@/actions/crm";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { LEAD_STATUSES } from "@/lib/constants";
import { formatCurrency, formatDate, formatRelativeDate } from "@/lib/format";
import { getDashboardData } from "@/lib/crm/queries";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const data = await getDashboardData();
  const pipelineMax = Math.max(...LEAD_STATUSES.map(({ value }) => data.leads.filter((lead) => lead.status === value).length), 1);

  return (
    <div className="page-shell dashboard-page">
      <header className="page-header dashboard-header">
        <div><p className="section-index">Sales overview</p><h1>Apa yang perlu ditindaklanjuti hari ini?</h1><p>Prioritas kerja, posisi pipeline, dan nilai peluang dalam satu tampilan.</p></div>
        <Link className="button button-primary" href="/leads/new">Tambah lead</Link>
      </header>

      <section className="priority-strip" aria-label="Prioritas follow-up">
        <Link href="/follow-ups?view=overdue"><span>Terlewat</span><strong>{data.overdueFollowUps.length}</strong><small>follow-up perlu perhatian</small></Link>
        <Link href="/follow-ups?view=today"><span>Hari ini</span><strong>{data.todayFollowUps.length}</strong><small>follow-up terjadwal</small></Link>
        <div><span>Pipeline aktif</span><strong>{formatCurrency(data.metrics.pipelineValue)}</strong><small>{data.metrics.active} peluang berjalan</small></div>
      </section>

      <div className="dashboard-grid">
        <section className="panel followup-panel">
          <header className="panel-header"><div><p className="section-index">Prioritas 01</p><h2>Follow-up terdekat</h2></div><Link href="/follow-ups">Lihat semua</Link></header>
          {data.followUps.length ? (
            <div className="task-list">
              {[...data.overdueFollowUps, ...data.todayFollowUps, ...data.upcomingFollowUps].slice(0, 7).map((item) => (
                <article key={item.id} className={item.scheduled_at < new Date().toISOString() ? "task-overdue" : ""}>
                  <div className="task-date"><strong>{formatDate(item.scheduled_at, true)}</strong><small>{item.type.replaceAll("_", " ")}</small></div>
                  <div><Link href={`/leads/${item.lead_id}`}><strong>{item.leads?.name ?? "Lead"}</strong></Link><p>{item.note || item.leads?.company_name || "Tidak ada catatan tambahan."}</p></div>
                  <form action={completeFollowUpAction}><input type="hidden" name="id" value={item.id} /><input type="hidden" name="lead_id" value={item.lead_id} /><button className="button button-quiet" type="submit">Tandai selesai</button></form>
                </article>
              ))}
            </div>
          ) : <EmptyState title="Tidak ada follow-up pending" description="Semua tindak lanjut sudah selesai. Jadwalkan follow-up dari halaman lead." action={{ href: "/leads", label: "Buka daftar lead" }} />}
        </section>

        <section className="panel pipeline-overview">
          <header className="panel-header"><div><p className="section-index">Prioritas 02</p><h2>Pipeline</h2></div><Link href="/pipeline">Buka kanban</Link></header>
          <div className="pipeline-bars">
            {LEAD_STATUSES.map(({ value, label }) => {
              const count = data.leads.filter((lead) => lead.status === value).length;
              return <div key={value}><div><span>{label}</span><strong>{count}</strong></div><div className="bar-track"><span style={{ width: `${(count / pipelineMax) * 100}%` }} /></div></div>;
            })}
          </div>
        </section>
      </div>

      <section className="metric-band" aria-label="Ringkasan performa">
        <div><span>Total leads</span><strong>{data.metrics.total}</strong></div>
        <div><span>Lead aktif</span><strong>{data.metrics.active}</strong></div>
        <div><span>Proposal terkirim</span><strong>{data.metrics.proposals}</strong></div>
        <div><span>Negosiasi</span><strong>{data.metrics.negotiation}</strong></div>
        <div><span>Menang</span><strong>{data.metrics.won}</strong></div>
        <div><span>Nilai menang</span><strong>{formatCurrency(data.metrics.wonValue)}</strong></div>
      </section>

      <section className="panel recent-leads">
        <header className="panel-header"><div><p className="section-index">Aktivitas terbaru</p><h2>Lead terbaru</h2></div><Link href="/leads">Kelola leads</Link></header>
        {data.recentLeads.length ? (
          <div className="data-table-wrap"><table><thead><tr><th>Lead</th><th>Layanan</th><th>Status</th><th>Estimasi</th><th>Dibuat</th></tr></thead><tbody>{data.recentLeads.map((lead) => <tr key={lead.id}><td><Link href={`/leads/${lead.id}`}><strong>{lead.name}</strong><small>{lead.company_name || "Tanpa nama bisnis"}</small></Link></td><td>{lead.service_interest}</td><td><StatusBadge status={lead.status} /></td><td>{formatCurrency(lead.estimated_value)}</td><td>{formatRelativeDate(lead.created_at)}</td></tr>)}</tbody></table></div>
        ) : <EmptyState title="Belum ada lead" description="Tambahkan calon client pertama agar pipeline dan follow-up mulai terisi." action={{ href: "/leads/new", label: "Tambah lead pertama" }} />}
      </section>
    </div>
  );
}

