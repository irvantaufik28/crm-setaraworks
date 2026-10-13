import type { Metadata } from "next";
import { LEAD_SOURCES, SERVICES, sourceLabel } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import { getDashboardData } from "@/lib/crm/queries";

export const metadata: Metadata = { title: "Reports" };

export default async function ReportsPage() {
  const data = await getDashboardData();
  const conversion = data.metrics.total ? (data.metrics.won / data.metrics.total) * 100 : 0;
  const sourceRows = LEAD_SOURCES.map(({ value }) => {
    const leads = data.leads.filter((lead) => lead.source === value);
    const won = leads.filter((lead) => lead.status === "won").length;
    return { source: value, count: leads.length, won, conversion: leads.length ? (won / leads.length) * 100 : 0 };
  }).filter((row) => row.count > 0);
  const serviceRows = SERVICES.map((service) => ({ service, count: data.leads.filter((lead) => lead.service_interest === service).length })).filter((row) => row.count > 0).sort((a, b) => b.count - a.count);
  const maxService = Math.max(...serviceRows.map((row) => row.count), 1);

  return (
    <div className="page-shell"><header className="page-header"><div><p className="section-index">Sales reports</p><h1>Apa yang menghasilkan peluang?</h1><p>Lihat konversi, sumber lead, dan layanan yang paling sering diminati berdasarkan data aktual.</p></div></header>
      <section className="report-lead"><div><span>Conversion rate</span><strong>{conversion.toLocaleString("id-ID", { maximumFractionDigits: 1 })}%</strong><p>{data.metrics.won} dari {data.metrics.total} lead berstatus menang.</p></div><dl><div><dt>Pipeline aktif</dt><dd>{formatCurrency(data.metrics.pipelineValue)}</dd></div><div><dt>Nilai menang</dt><dd>{formatCurrency(data.metrics.wonValue)}</dd></div><div><dt>Menang / Kalah</dt><dd>{data.metrics.won} / {data.metrics.lost}</dd></div></dl></section>
      <div className="report-grid"><section className="panel"><header className="panel-header"><div><p className="section-index">Channel</p><h2>Performa sumber lead</h2></div></header>{sourceRows.length ? <div className="data-table-wrap"><table><thead><tr><th>Sumber</th><th>Lead</th><th>Menang</th><th>Konversi</th></tr></thead><tbody>{sourceRows.map((row) => <tr key={row.source}><td>{sourceLabel(row.source)}</td><td>{row.count}</td><td>{row.won}</td><td>{row.conversion.toLocaleString("id-ID", { maximumFractionDigits: 1 })}%</td></tr>)}</tbody></table></div> : <p className="muted-copy">Belum ada data sumber lead untuk dianalisis.</p>}</section>
      <section className="panel"><header className="panel-header"><div><p className="section-index">Demand</p><h2>Minat layanan</h2></div></header>{serviceRows.length ? <div className="service-bars">{serviceRows.map((row) => <div key={row.service}><div><span>{row.service}</span><strong>{row.count}</strong></div><div className="bar-track"><span style={{ width: `${(row.count / maxService) * 100}%` }} /></div></div>)}</div> : <p className="muted-copy">Belum ada data layanan untuk dianalisis.</p>}</section></div>
    </div>
  );
}

