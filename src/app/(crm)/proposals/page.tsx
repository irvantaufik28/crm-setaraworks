import type { Metadata } from "next";
import Link from "next/link";
import { ProposalForm } from "@/components/forms/proposal-form";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCurrency, formatDate } from "@/lib/format";
import { getAllActiveLeads, getProposals } from "@/lib/crm/queries";

export const metadata: Metadata = { title: "Proposals" };

export default async function ProposalsPage() {
  const [proposals, leads] = await Promise.all([getProposals(), getAllActiveLeads()]);
  return <div className="page-shell"><header className="page-header"><div><p className="section-index">Proposal register</p><h1>Proposal dan negosiasi</h1><p>Simpan nilai, masa berlaku, status, dan tautan dokumen proposal.</p></div></header><section className="panel create-panel"><header className="panel-header"><div><p className="section-index">Catat dokumen</p><h2>Proposal baru</h2></div></header><ProposalForm leads={leads} /></section><section className="panel"><header className="panel-header"><div><p className="section-index">{proposals.length} proposal</p><h2>Riwayat proposal</h2></div></header>{proposals.length ? <div className="data-table-wrap"><table><thead><tr><th>Proposal</th><th>Lead</th><th>Status</th><th>Nilai</th><th>Dikirim</th><th>Berlaku sampai</th><th>Dokumen</th></tr></thead><tbody>{proposals.map((proposal) => <tr key={proposal.id}><td><Link href={`/proposals/${proposal.id}`}><strong>{proposal.title}</strong><small>{proposal.proposal_number || "Tanpa nomor"}</small></Link></td><td><Link href={`/leads/${proposal.lead_id}`}>{proposal.leads?.name ?? "Lead"}</Link></td><td><StatusBadge status={proposal.status} /></td><td>{formatCurrency(proposal.value)}</td><td>{formatDate(proposal.sent_at)}</td><td>{formatDate(proposal.valid_until)}</td><td>{proposal.file_url ? <a href={proposal.file_url} target="_blank" rel="noreferrer">Buka file</a> : "Belum ada"}</td></tr>)}</tbody></table></div> : <EmptyState title="Belum ada proposal" description="Catat proposal pertama saat dokumen disiapkan atau dikirim ke lead." />}</section></div>;
}

