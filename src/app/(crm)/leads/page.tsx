import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { LEAD_SOURCES, LEAD_STATUSES, SERVICES, sourceLabel } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/format";
import { getLeads, type LeadFilters } from "@/lib/crm/queries";

export const metadata: Metadata = { title: "Leads" };

function pageHref(filters: LeadFilters, page: number) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => { if (value && key !== "page") params.set(key, value); });
  params.set("page", String(page));
  return `/leads?${params.toString()}`;
}

export default async function LeadsPage({ searchParams }: { searchParams: Promise<LeadFilters & { archived?: string }> }) {
  const filters = await searchParams;
  const data = await getLeads(filters);
  const filtered = Boolean(filters.query || filters.status || filters.source || filters.service);

  return (
    <div className="page-shell">
      <header className="page-header"><div><p className="section-index">Lead database</p><h1>Semua peluang penjualan</h1><p>Cari, filter, dan tentukan tindakan berikutnya untuk setiap lead.</p></div><Link className="button button-primary" href="/leads/new">Tambah lead</Link></header>
      {filters.archived ? <p className="notice-success" role="status">Lead berhasil diarsipkan.</p> : null}

      <section className="filter-panel" aria-label="Filter lead">
        <form method="get">
          <div className="field search-field"><label htmlFor="query">Cari lead</label><input id="query" name="query" defaultValue={filters.query} placeholder="Nama, perusahaan, email, atau telepon" /></div>
          <div className="field"><label htmlFor="status">Status</label><select id="status" name="status" defaultValue={filters.status ?? ""}><option value="">Semua status</option>{LEAD_STATUSES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>
          <div className="field"><label htmlFor="source">Sumber</label><select id="source" name="source" defaultValue={filters.source ?? ""}><option value="">Semua sumber</option>{LEAD_SOURCES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>
          <div className="field"><label htmlFor="service">Layanan</label><select id="service" name="service" defaultValue={filters.service ?? ""}><option value="">Semua layanan</option>{SERVICES.map((service) => <option key={service}>{service}</option>)}</select></div>
          <div className="field"><label htmlFor="sort">Urutkan</label><select id="sort" name="sort" defaultValue={filters.sort ?? "created"}><option value="created">Terbaru</option><option value="follow_up">Follow-up terdekat</option></select></div>
          <button className="button button-secondary" type="submit">Terapkan</button>
          {filtered ? <Link className="button button-quiet" href="/leads">Reset</Link> : null}
        </form>
      </section>

      <section className="panel">
        <header className="panel-header"><div><p className="section-index">{data.count} hasil</p><h2>Daftar lead</h2></div><small>Halaman {data.page} dari {data.pages}</small></header>
        {data.leads.length ? (
          <><div className="data-table-wrap"><table><thead><tr><th>Lead</th><th>Sumber</th><th>Layanan</th><th>Status</th><th>Estimasi</th><th>Follow-up</th></tr></thead><tbody>{data.leads.map((lead) => <tr key={lead.id}><td><Link href={`/leads/${lead.id}`}><strong>{lead.name}</strong><small>{lead.company_name || lead.email || "Kontak belum lengkap"}</small></Link></td><td>{sourceLabel(lead.source)}</td><td>{lead.service_interest}</td><td><StatusBadge status={lead.status} /></td><td>{formatCurrency(lead.estimated_value)}</td><td>{formatDate(lead.next_follow_up_at, true)}</td></tr>)}</tbody></table></div>
          <nav className="pagination" aria-label="Pagination lead"><Link className={data.page <= 1 ? "disabled" : ""} aria-disabled={data.page <= 1} href={pageHref(filters, Math.max(1, data.page - 1))}>Sebelumnya</Link><span>{data.page} / {data.pages}</span><Link className={data.page >= data.pages ? "disabled" : ""} aria-disabled={data.page >= data.pages} href={pageHref(filters, Math.min(data.pages, data.page + 1))}>Berikutnya</Link></nav></>
        ) : <EmptyState title={filtered ? "Tidak ada lead yang cocok" : "Belum ada lead"} description={filtered ? "Ubah atau reset filter untuk melihat hasil lain." : "Tambahkan lead pertama untuk memulai pipeline penjualan."} action={filtered ? { href: "/leads", label: "Reset filter" } : { href: "/leads/new", label: "Tambah lead pertama" }} />}
      </section>
    </div>
  );
}

